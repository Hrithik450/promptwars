import { NormalizedInput } from "../types/normalizer.types";
import {
  PatternDefinition,
  PatternMatch,
  PatternResult,
  ThreatCategory,
} from "../types/pattern.detector.types";
import { PATTERN_DEFINITIONS } from "../data/patterns.data";
import {
  evaluateHeuristics,
  calculateRiskScore,
} from "./heuristic.analyzer";

export class PatternDetectorService {
  static detect(
    normalizedInput: NormalizedInput,
    customPatterns?: PatternDefinition[],
  ): PatternResult {
    const patterns = customPatterns || PATTERN_DEFINITIONS;
    const { original, normalized, lowered } = normalizedInput;

    const matchMap = new Map<string, PatternMatch>();

    const hasDecoded = normalizedInput.decodedPayloads.length > 0;
    const sameOrigNorm = original === normalized;

    for (const def of patterns) {
      const hit =
        def.pattern.exec(normalized) ??
        (!sameOrigNorm ? def.pattern.exec(original) : null) ??
        (!def.pattern.ignoreCase && lowered !== normalized
          ? def.pattern.exec(lowered)
          : null);

      if (hit) {
        matchMap.set(def.id, {
          patternId: def.id,
          threatLabel: def.category,
          matchedText: hit[0],
          severity: def.severity,
          description: def.description,
        });
      }

      if (hasDecoded) {
        for (const payload of normalizedInput.decodedPayloads) {
          const payloadHit = def.pattern.exec(payload);
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
    }

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
    const heuristics = evaluateHeuristics(original, normalized);
    const layer1RiskScore = calculateRiskScore(matches, heuristics.flags);

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
}
