import { BankingAction, IntentParams } from "./intent.parser.types";

export type Verdict = "APPROVED" | "BLOCKED";

export type RiskLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type FirewallThreatCategory =
  | "NONE"
  | "PROMPT_INJECTION"
  | "JAILBREAK"
  | "DATA_EXFILTRATION"
  | "SOCIAL_ENGINEERING"
  | "MALICIOUS_PAYLOAD"
  | "OBFUSCATED_ATTACK"
  | "POLICY_VIOLATION";

export interface LayerDetails {
  normalizerFlags: string[];
  patternMatches: {
    patternId: string;
    threatLabel: string;
    matchedText: string;
    severity: number;
    description: string;
  }[];
  heuristicFlags: string[];
  semanticClassification: {
    category: string;
    confidence: number;
    reasoning: string;
    skipped?: boolean;
  };
  intentValidationErrors: {
    rule: string;
    message: string;
    severity: string;
  }[];
  policyTriggers: string[];
}

export interface BankingExecutionResult {
  success: boolean;
  action: BankingAction;
  data?: unknown;
  message: string;
}

export interface FirewallVerdictResponse {
  verdict: Verdict;
  riskScore: number;
  riskLevel: RiskLevel;
  threatCategory: FirewallThreatCategory;
  explanation: string;
  requestId: string;
  timestamp: string;
  inputSanitized: string;
  parsedIntent: {
    action: BankingAction;
    params: IntentParams;
  } | null;
  layerDetails: LayerDetails;
  executionResult?: BankingExecutionResult;
}
