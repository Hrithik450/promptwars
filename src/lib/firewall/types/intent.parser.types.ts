export type BankingAction =
  | "TRANSFER"
  | "BALANCE_CHECK"
  | "TRANSACTION_HISTORY"
  | "ACCOUNT_INFO"
  | "HELP"
  | "CONVERSATIONAL"
  | "UNKNOWN";

export interface IntentParams {
  amount?: number;
  currency?: string;
  recipient?: string;
  memo?: string;
  fromAccount?: "checking" | "savings" | "credit";
  accountType?: string;
  count?: number;
  topic?: string;
}

export type ValidationRuleType =
  | "EXCEEDS_TRANSACTION_LIMIT"
  | "INVALID_AMOUNT"
  | "MISSING_RECIPIENT"
  | "INVALID_RECIPIENT"
  | "INVALID_AMOUNT_PRECISION"
  | "MALICIOUS_MEMO"
  | "SELF_TRANSFER"
  | "AMBIGUOUS_INTENT";

export interface ValidationError {
  rule: ValidationRuleType;
  message: string;
  severity: "BLOCK" | "FLAG";
}

export interface IntentResult {
  action: BankingAction;
  params: IntentParams;
  validationErrors: ValidationError[];
  intentConfidence: number;
  isApproved: boolean;
  rejectionReason?: string;
}
