export type SemanticCategory =
  | "BENIGN"
  | "PROMPT_INJECTION"
  | "JAILBREAK"
  | "DATA_EXFILTRATION"
  | "SOCIAL_ENGINEERING"
  | "MALICIOUS_PAYLOAD"
  | "OBFUSCATED_ATTACK"
  | "UNKNOWN";

export interface SemanticResult {
  category: SemanticCategory;
  confidence: number;
  reasoning: string;
  skipped?: boolean;
  latencyMs: number;
  error?: string;
}

export interface SemanticClassifierOptions {
  timeoutMs?: number;
  modelName?: string;
  skipThreshold?: number; // Defaults to 0.9 (Layer 1 bypass threshold)
  forceOffline?: boolean;
}
