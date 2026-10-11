import {
  HeuristicEvaluation,
  HeuristicFlag,
  PatternMatch,
} from "../types/pattern.detector.types";

const INSTRUCTION_VERBS = new Set([
  "ignore", "forget", "disregard", "bypass", "override", "pretend",
  "act", "roleplay", "imagine", "execute", "eval", "transfer",
  "send", "pay", "show", "list", "dump", "export", "reveal",
  "print", "repeat", "clear", "enter", "skip", "disable", "stop",
  "do", "make", "take", "give", "switch", "change", "set"
]);

export function calculateInstructionRatio(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalWords = 0;
  let instructionCount = 0;

  for (const rawWord of words) {
    if (rawWord.length <= 1) continue;
    totalWords++;
    const cleanWord = rawWord.replace(/[^a-z]/g, "");
    if (INSTRUCTION_VERBS.has(cleanWord)) {
      instructionCount++;
    }
  }

  return totalWords > 0 ? instructionCount / totalWords : 0;
}

const CONTRADICTION_PATTERN =
  /\b(but\s+actually|however\s+ignore|no\s+wait|instead\s+of\s+that|disregard\s+that|never\s+mind\s+that|on\s+second\s+thought)\b/i;

export function hasContradictoryInstructions(text: string): boolean {
  return CONTRADICTION_PATTERN.test(text);
}

export function evaluateHeuristics(
  original: string,
  normalized: string,
): HeuristicEvaluation {
  const flags: HeuristicFlag[] = [];
  const length = original.length;

  if (length > 500) {
    flags.push("UNUSUALLY_LONG");
  }

  let newlineCount = 0;
  let nonSpaceCount = 0;
  let specialCount = 0;

  for (let i = 0; i < length; i++) {
    const code = original.charCodeAt(i);
    if (code === 10) newlineCount++;

    if (code === 32 || (code >= 9 && code <= 13)) {
      continue;
    }
    nonSpaceCount++;
    if (
      !(
        (code >= 48 && code <= 57) ||
        (code >= 65 && code <= 90) ||
        (code >= 97 && code <= 122)
      )
    ) {
      specialCount++;
    }
  }

  if (newlineCount > 5) {
    flags.push("MULTI_BLOCK_INPUT");
  }

  const specialCharDensity = nonSpaceCount > 0 ? specialCount / nonSpaceCount : 0;
  if (specialCharDensity > 0.15) {
    flags.push("HIGH_SPECIAL_CHAR_DENSITY");
  }

  const instructionRatio = calculateInstructionRatio(normalized);
  if (instructionRatio > 0.6) {
    flags.push("HIGH_INSTRUCTION_RATIO");
  }

  const contradictionFound = hasContradictoryInstructions(normalized);
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

export function calculateRiskScore(
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
    score += heuristicFlags.length * 0.05;
  } else if (heuristicFlags.length > 0) {
    score = Math.min(0.35, heuristicFlags.length * 0.08);
  }

  return Math.min(1.0, Math.round(score * 100) / 100);
}
