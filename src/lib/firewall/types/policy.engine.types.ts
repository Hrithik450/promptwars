export type PolicyRuleName =
  | "DENY_BY_DEFAULT"
  | "LAYERED_CONSENSUS"
  | "TRANSACTION_LIMITS"
  | "NO_SYSTEM_DISCLOSURE"
  | "MEMO_ISOLATION"
  | "RATE_LIMIT_EXCEEDED"
  | "REPEAT_OFFENDER";

export interface PolicyDecision {
  decision: "APPROVE" | "BLOCK";
  triggeredPolicies: PolicyRuleName[];
  overridePossible: false;
  reason: string;
}

export interface SessionRateState {
  sessionId: string;
  requestTimestamps: number[];
  consecutiveBlockCount: number;
}
