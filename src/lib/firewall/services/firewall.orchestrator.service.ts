import { InputNormalizerService } from "./input.normalizer.service";
import { PatternDetectorService } from "./pattern.detector.service";
import { SemanticClassifierService } from "./semantic.classifier.service";
import { IntentParserService } from "./intent.parser.service";
import { TransactionValidatorService } from "./transaction.validator.service";
import { PolicyEngineService } from "./policy.engine.service";
import { VerdictAssemblerService } from "./verdict.assembler.service";
import { BankingService } from "../../banking/banking.service";
import { db } from "../../db";
import { firewallLogs } from "../../drizzle/schema";
import {
  BankingExecutionResult,
  FirewallVerdictResponse,
} from "../types/verdict.types";
import { AccountType } from "../types/banking.types";
import { AuditStoreService } from "../../audit/audit.store.service";

import { IntentParams } from "../types/intent.parser.types";

export interface AnalyzeRequestOptions {
  sessionId?: string;
  forceOffline?: boolean;
  skipDatabaseLog?: boolean;
}

export class FirewallOrchestratorService {
  /**
   * Executes the complete end-to-end multi-layer defense firewall pipeline.
   * Runs Layers 0 through 5 and dispatches to Mock Banking Core only if APPROVED.
   */
  static async analyze(
    rawInput: string,
    options: AnalyzeRequestOptions = {},
  ): Promise<FirewallVerdictResponse> {
    const { sessionId, forceOffline = false, skipDatabaseLog = false } = options;

    // --- 1. LAYER 0: Input Normalizer ---
    const normalizedInput = InputNormalizerService.normalize(rawInput);

    // --- 2. LAYER 1: Regex & Heuristic Pattern Detector ---
    const layer1Result = PatternDetectorService.detect(normalizedInput);

    // --- 3. LAYER 2: Semantic Threat Classifier ---
    // (Skips LLM call if Layer 1 already produced high-confidence block > 0.9)
    const semanticResult = await SemanticClassifierService.classify(
      normalizedInput,
      layer1Result,
      { forceOffline },
    );

    // --- 4. LAYER 3: Intent Parser & Transaction Validator ---
    // Runs only if combined risk from L1 and L2 is below 0.7
    const combinedRisk = Math.max(
      layer1Result.layer1RiskScore,
      semanticResult.category !== "BENIGN" ? semanticResult.confidence : 0,
    );

    const intentParsed =
      combinedRisk < 0.7
        ? IntentParserService.parse(normalizedInput)
        : { action: "UNKNOWN" as const, params: {}, confidence: 0.0 };

    const intentValidated = TransactionValidatorService.validate(
      intentParsed.action,
      intentParsed.params,
      intentParsed.confidence,
    );

    // --- 5. LAYER 4: Policy Engine ---
    const policyDecision = PolicyEngineService.evaluate(
      normalizedInput,
      layer1Result,
      semanticResult,
      intentValidated,
      sessionId,
    );

    // --- 6. Execution: Mock Banking Core (ONLY IF APPROVED) ---
    let executionResult: BankingExecutionResult | undefined;
    if (policyDecision.decision === "APPROVE") {
      executionResult = this.dispatchBankingOperation(
        intentValidated.action,
        intentValidated.params,
      );
    }

    // --- 7. LAYER 5: Verdict Assembler ---
    const finalVerdict = VerdictAssemblerService.assemble(
      normalizedInput,
      layer1Result,
      semanticResult,
      intentValidated,
      policyDecision,
      executionResult,
    );

    // --- 8. In-Memory Session Audit Logging & Asynchronous DB Log ---
    AuditStoreService.record(finalVerdict, rawInput, sessionId);

    if (!skipDatabaseLog) {
      this.persistAuditLog(finalVerdict, rawInput, sessionId).catch((err) => {
        // Safe logging error swallow so database issues never crash user transactions
        console.warn("[FirewallOrchestrator] Database log warning:", err instanceof Error ? err.message : String(err));
      });
    }

    return finalVerdict;
  }

  /**
   * Executes banking transaction only when verified APPROVED.
   */
  private static dispatchBankingOperation(
    action: string,
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
            success: false,
            action: "UNKNOWN",
            message: "Unsupported banking action.",
          };
      }
    } catch (error) {
      return {
        success: false,
        action: action as any,
        message: error instanceof Error ? error.message : "Banking operation failed.",
      };
    }
  }

  /**
   * Persists immutable structured audit record into PostgreSQL firewall_logs table.
   */
  private static async persistAuditLog(
    verdict: FirewallVerdictResponse,
    rawInput: string,
    sessionId?: string,
  ): Promise<void> {
    if (!process.env.DATABASE_URL) return;

    await db.insert(firewallLogs).values({
      requestId: verdict.requestId,
      sessionId: sessionId || null,
      userInput: rawInput,
      sanitizedInput: verdict.inputSanitized,
      verdict: verdict.verdict,
      riskScore: verdict.riskScore.toFixed(2),
      riskLevel: verdict.riskLevel,
      threatCategory: verdict.threatCategory,
      explanation: verdict.explanation,
      parsedIntent: verdict.parsedIntent,
      layerDetails: verdict.layerDetails,
    });
  }
}
