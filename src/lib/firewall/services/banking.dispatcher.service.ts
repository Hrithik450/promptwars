import { BankingService } from "../../banking/banking.service";
import { BankingAction, IntentParams } from "../types/intent.parser.types";
import { BankingExecutionResult } from "../types/verdict.types";
import { AccountType } from "../types/banking.types";

export class BankingDispatcherService {
  static dispatch(
    action: BankingAction,
    params: IntentParams,
  ): BankingExecutionResult {
    try {
      switch (action) {
        case "BALANCE_CHECK": {
          const acctType = (params.accountType as AccountType) || "checking";
          const bal = BankingService.getBalance(acctType);
          return {
            success: true,
            action: "BALANCE_CHECK",
            data: bal,
            message: `Your ${bal.accountType} balance is ${bal.formatted}.`,
          };
        }

        case "TRANSFER": {
          const amount = Number(params.amount);
          const recipient = String(params.recipient || "");
          const memo = params.memo ? String(params.memo) : undefined;
          const fromAccount = (params.fromAccount as AccountType) || "checking";

          const tx = BankingService.executeTransfer(
            amount,
            recipient,
            memo,
            fromAccount,
          );
          return {
            success: true,
            action: "TRANSFER",
            data: tx,
            message: `Transfer of $${amount.toFixed(2)} to ${recipient} completed successfully. New balance: $${tx.newBalance.toFixed(2)}.`,
          };
        }

        case "TRANSACTION_HISTORY": {
          const count = Number(params.count) || 5;
          const txs = BankingService.getTransactions(count);
          return {
            success: true,
            action: "TRANSACTION_HISTORY",
            data: txs,
            message: `Retrieved ${txs.length} recent transactions.`,
          };
        }

        case "ACCOUNT_INFO": {
          const info = BankingService.getAccountInfo("checking");
          return {
            success: true,
            action: "ACCOUNT_INFO",
            data: info,
            message: `Account holder: ${info.holderName}, checking account ending in ${info.accountNumber.slice(-4)}.`,
          };
        }

        case "HELP": {
          return {
            success: true,
            action: "HELP",
            message:
              "You can check balances (checking, savings, credit), send transfers (up to $10,000), or review transaction history.",
          };
        }

        default:
          return {
            success: true,
            action: action === "UNKNOWN" ? "CONVERSATIONAL" : action,
            message: "Request analyzed and verified by Sentinel firewall.",
          };
      }
    } catch (error) {
      return {
        success: false,
        action,
        message: error instanceof Error ? error.message : "Banking operation failed.",
      };
    }
  }
}
