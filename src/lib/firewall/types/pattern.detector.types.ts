export type ThreatCategory =
  | "PROMPT_INJECTION"
  | "JAILBREAK_ROLEPLAY"
  | "INSTRUCTION_OVERRIDE"
  | "DATA_EXFIL"
  | "CODE_INJECTION"
  | "CONTEXT_BREAK"
  | "SOCIAL_ENGINEERING";

export type HeuristicFlag =
  | "UNUSUALLY_LONG"
  | "HIGH_INSTRUCTION_RATIO"
  | "HIGH_SPECIAL_CHAR_DENSITY"
  | "MULTI_BLOCK_INPUT"
  | "CONTRADICTORY_INSTRUCTIONS";

export interface PatternMatch {
  patternId: string;
  threatLabel: ThreatCategory;
  matchedText: string;
  severity: number;
  description: string;
}

export interface PatternDefinition {
  id: string;
  category: ThreatCategory;
  pattern: RegExp;
  severity: number;
  description: string;
}

export interface HeuristicEvaluation {
  flags: HeuristicFlag[];
  metrics: {
    length: number;
    instructionRatio: number;
    specialCharDensity: number;
    newlineCount: number;
    contradictionFound: boolean;
  };
}

export interface PatternResult {
  matches: PatternMatch[];
  heuristicFlags: HeuristicFlag[];
  layer1RiskScore: number;
  highestThreatCategory: ThreatCategory | null;
  metrics: HeuristicEvaluation["metrics"];
}
