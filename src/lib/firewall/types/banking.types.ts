export type AccountType = "checking" | "savings" | "credit";

export interface BankAccountModel {
  accountType: AccountType;
  accountNumber: string; // Masked for display, e.g. ****4821
  balance: number;
  currency: string;
  holderName: string;
}

export interface BankTransactionModel {
  id: string;
  accountType: AccountType;
  recipient: string;
  amount: number;
  currency: string;
  memo?: string;
  timestamp: string;
  status: "COMPLETED" | "PENDING" | "REJECTED";
}

export interface TransferExecutionResult {
  transactionId: string;
  fromAccount: AccountType;
  recipient: string;
  amount: number;
  currency: string;
  newBalance: number;
  timestamp: string;
}
