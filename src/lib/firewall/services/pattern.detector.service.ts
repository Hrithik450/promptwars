import { NormalizedInput } from "../types/normalizer.types";
import {
  HeuristicEvaluation,
  HeuristicFlag,
  PatternDefinition,
  PatternMatch,
  PatternResult,
  ThreatCategory,
} from "../types/pattern.detector.types";
import { PATTERN_DEFINITIONS } from "../data/patterns.data";

export class PatternDetectorService {
  /**
   * Primary entry point for Layer 1: Regex & Heuristic Pattern Detector.
   * Scans both original and normalized inputs and calculates composite risk scores.
   */
  static detect(
    normalizedInput: NormalizedInput,
    customPatterns?: PatternDefinition[],
  ): PatternResult {
    const patterns = customPatterns || PATTERN_DEFINITIONS;
    const { original, normalized, lowered } = normalizedInput;

    // --- 1A. Pattern Matching across both representations ---
    const matchMap = new Map<string, PatternMatch>();

    for (const def of patterns) {
      // Test against normalized, original, and lowered representations
      const matchNorm = normalized.match(def.pattern);
      const matchOrig = original.match(def.pattern);
      const matchLower = lowered.match(def.pattern);

      const hit = matchNorm || matchOrig || matchLower;
      if (hit) {
        matchMap.set(def.id, {
          patternId: def.id,
          threatLabel: def.category,
          matchedText: hit[0],
          severity: def.severity,
          description: def.description,
        });
      }

      // Also scan inside any decoded payloads (e.g. hidden Base64 strings)
      for (const payload of normalizedInput.decodedPayloads) {
        const payloadHit = payload.match(def.pattern);
        if (payloadHit) {
          matchMap.set(`${def.id}_DECODED`, {
            patternId: `${def.id}_DECODED`,
            threatLabel: def.category,
            matchedText: `Decoded payload match: "${payloadHit[0]}"`,
            severity: def.severity,
            description: `Adversarial pattern discovered inside decoded payload: ${def.description}`,
          });
        }
      }
    }

    // If obfuscation was flagged by Layer 0, record it as a dedicated threat indicator
    if (normalizedInput.flags.includes("OBFUSCATION_DETECTED")) {
      const activeFlags = normalizedInput.flags
        .filter((f) => f !== "OBFUSCATION_DETECTED")
        .join(", ");
      matchMap.set("OBFUSCATION_ATTACK", {
        patternId: "OBFUSCATION_ATTACK",
        threatLabel: "INSTRUCTION_OVERRIDE",
        matchedText: `Obfuscation detected (${activeFlags})`,
        severity: 0.85,
        description: `Adversarial obfuscation technique detected: ${activeFlags}`,
      });
    }

    const matches = Array.from(matchMap.values());

    // --- 1B. Statistical Heuristics Evaluation ---
    const heuristics = this.evaluateHeuristics(original, normalized);

    // --- Risk Score Computation ---
    const layer1RiskScore = this.calculateRiskScore(
      matches,
      heuristics.flags,
    );

    // Identify highest threat category
    let highestThreatCategory: ThreatCategory | null = null;
    let maxSeverity = -1;
    for (const m of matches) {
      if (m.severity > maxSeverity) {
        maxSeverity = m.severity;
        highestThreatCategory = m.threatLabel;
      }
    }

    return {
      matches,
      heuristicFlags: heuristics.flags,
      layer1RiskScore,
      highestThreatCategory,
      metrics: heuristics.metrics,
    };
  }

  /**
   * Evaluates the 5 statistical heuristics against original and normalized inputs:
   * 1. Length > 500 chars
   * 2. Instruction-to-data ratio > 60%
   * 3. Special character density > 15%
   * 4. Newline count > 5
   * 5. Contradictory instructions
   */
  private static evaluateHeuristics(
    original: string,
    normalized: string,
  ): HeuristicEvaluation {
    const flags: HeuristicFlag[] = [];

    // 1. Length check (> 500 chars)
    const length = original.length;
    if (length > 500) {
      flags.push("UNUSUALLY_LONG");
    }

    // 2. Newline count (> 5 newlines)
    const newlineMatches = original.match(/\n/g);
    const newlineCount = newlineMatches ? newlineMatches.length : 0;
    if (newlineCount > 5) {
      flags.push("MULTI_BLOCK_INPUT");
    }

    // 3. Special character density (> 15% non-alphanumeric, excluding spaces)
    const nonSpaceChars = original.replace(/\s/g, "");
    const specialChars = nonSpaceChars.replace(/[a-zA-Z0-9]/g, "");
    const specialCharDensity =
      nonSpaceChars.length > 0
        ? specialChars.length / nonSpaceChars.length
        : 0;

    if (specialCharDensity > 0.15) {
      flags.push("HIGH_SPECIAL_CHAR_DENSITY");
    }

    // 4. Instruction-to-data ratio (> 60% instruction words)
    const instructionRatio = this.calculateInstructionRatio(normalized);
    if (instructionRatio > 0.6) {
      flags.push("HIGH_INSTRUCTION_RATIO");
    }

    // 5. Contradictory instructions detection
    const contradictionFound = this.hasContradictoryInstructions(normalized);
    if (contradictionFound) {
      flags.push("CONTRADICTORY_INSTRUCTIONS");
    }

    return {
      flags,
      metrics: {
        length,
        instructionRatio: Math.round(instructionRatio * 100) / 100,
        specialCharDensity: Math.round(specialCharDensity * 100) / 100,
        newlineCount,
        contradictionFound,
      },
    };
  }

  /**
   * Computes instruction-like imperative word ratio vs data tokens.
   */
  private static calculateInstructionRatio(text: string): number {
    const words = text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 1);

    if (words.length === 0) return 0;

    const INSTRUCTION_VERBS = new Set([
      "ignore", "forget", "disregard", "bypass", "override", "pretend",
      "act", "roleplay", "imagine", "execute", "eval", "transfer",
      "send", "pay", "show", "list", "dump", "export", "reveal",
      "print", "repeat", "clear", "enter", "skip", "disable", "stop",
      "do", "make", "take", "give", "switch", "change", "set"
    ]);

    let instructionCount = 0;
    for (const word of words) {
      // Clean trailing punctuation
      const cleanWord = word.replace(/[^a-z]/g, "");
      if (INSTRUCTION_VERBS.has(cleanWord)) {
        instructionCount++;
      }
    }

    return instructionCount / words.length;
  }

  /**
   * Checks for contradiction or instruction-diverting transition phrases.
   */
  private static hasContradictoryInstructions(text: string): boolean {
    const contradictionPattern =
      /\b(but\s+actually|however\s+ignore|no\s+wait|instead\s+of\s+that|disregard\s+that|never\s+mind\s+that|on\s+second\s+thought)\b/i;
    return contradictionPattern.test(text);
  }

  /**
   * Calculates the Layer 1 composite risk score:
   * max severity among matches, boosted by +0.05 for each heuristic flag (capped at 1.0).
   */
  private static calculateRiskScore(
    matches: PatternMatch[],
    heuristicFlags: HeuristicFlag[],
  ): number {
    let maxMatchSeverity = 0;
    for (const match of matches) {
      if (match.severity > maxMatchSeverity) {
        maxMatchSeverity = match.severity;
      }
    }

    let score = maxMatchSeverity;

    if (maxMatchSeverity > 0) {
      // Boost by +0.05 for each heuristic flag
      score += heuristicFlags.length * 0.05;
    } else if (heuristicFlags.length > 0) {
      // If no pattern matched but heuristic anomalies exist
      score = Math.min(0.35, heuristicFlags.length * 0.08);
    }

    return Math.min(1.0, Math.round(score * 100) / 100);
  }
}
