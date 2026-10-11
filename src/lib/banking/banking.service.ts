import { randomUUID } from "crypto";
import {
  AccountType,
  BankAccountModel,
  BankTransactionModel,
  TransferExecutionResult,
} from "../firewall/types/banking.types";

export class BankingService {
  private static accounts: Map<AccountType, BankAccountModel> = new Map([
    [
      "checking",
      {
        accountType: "checking",
        accountNumber: "****4821",
        balance: 5000.0,
        currency: "USD",
        holderName: "Alex Mercer",
      },
    ],
    [
      "savings",
      {
        accountType: "savings",
        accountNumber: "****9912",
        balance: 12000.0,
        currency: "USD",
        holderName: "Alex Mercer",
      },
    ],
    [
      "credit",
      {
        accountType: "credit",
        accountNumber: "****1044",
        balance: -450.0,
        currency: "USD",
        holderName: "Alex Mercer",
      },
    ],
  ]);

  private static transactions: BankTransactionModel[] = [
    {
      id: "tx-init-01",
      accountType: "checking",
      recipient: "Whole Foods Market",
      amount: 84.5,
      currency: "USD",
      memo: "Groceries",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "COMPLETED",
    },
    {
      id: "tx-init-02",
      accountType: "checking",
      recipient: "Spotify USA",
      amount: 11.99,
      currency: "USD",
      memo: "Monthly Subscription",
      timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
      status: "COMPLETED",
    },
    {
      id: "tx-init-03",
      accountType: "checking",
      recipient: "bob",
      amount: 120.0,
      currency: "USD",
      memo: "Concert tickets",
      timestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
      status: "COMPLETED",
    },
    {
      id: "tx-init-04",
      accountType: "savings",
      recipient: "Payroll Deposit",
      amount: 3200.0,
      currency: "USD",
      memo: "Bi-weekly direct deposit",
      timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
      status: "COMPLETED",
    },
    {
      id: "tx-init-05",
      accountType: "credit",
      recipient: "Blue Bottle Coffee",
      amount: 6.75,
      currency: "USD",
      memo: "Coffee",
      timestamp: new Date(Date.now() - 86400000 * 9).toISOString(),
      status: "COMPLETED",
    },
  ];

  /**
   * Returns current account balance.
   */
  static getBalance(accountType: AccountType = "checking"): {
    accountType: AccountType;
    balance: number;
    currency: string;
    formatted: string;
  } {
    const acct = this.accounts.get(accountType) || this.accounts.get("checking")!;
    return {
      accountType: acct.accountType,
      balance: acct.balance,
      currency: acct.currency,
      formatted: `$${acct.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    };
  }

  /**
   * Executes funds transfer (deducts from source, registers in ledger).
   */
  static executeTransfer(
    amount: number,
    recipient: string,
    memo?: string,
    fromAccount: AccountType = "checking",
  ): TransferExecutionResult {
    const acct = this.accounts.get(fromAccount) || this.accounts.get("checking")!;

    if (acct.balance < amount && fromAccount !== "credit") {
      throw new Error(`Insufficient funds in ${fromAccount} account.`);
    }

    // Deduct balance
    acct.balance -= amount;

    const txId = `tx-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const record: BankTransactionModel = {
      id: txId,
      accountType: acct.accountType,
      recipient,
      amount,
      currency: acct.currency,
      memo: memo || "Direct Transfer",
      timestamp: now,
      status: "COMPLETED",
    };

    // Prepend to transaction ledger
    this.transactions.unshift(record);

    return {
      transactionId: txId,
      fromAccount: acct.accountType,
      recipient,
      amount,
      currency: acct.currency,
      newBalance: acct.balance,
      timestamp: now,
    };
  }

  /**
   * Returns recent transaction ledger entries.
   */
  static getTransactions(count: number = 5): BankTransactionModel[] {
    return this.transactions.slice(0, count);
  }

  /**
   * Returns account profile info.
   */
  static getAccountInfo(accountType: AccountType = "checking"): BankAccountModel {
    return this.accounts.get(accountType) || this.accounts.get("checking")!;
  }

  /**
   * Resets mock account balances to default for tests.
   */
  static reset(): void {
    this.accounts.get("checking")!.balance = 5000.0;
    this.accounts.get("savings")!.balance = 12000.0;
    this.accounts.get("credit")!.balance = -450.0;
  }
}
