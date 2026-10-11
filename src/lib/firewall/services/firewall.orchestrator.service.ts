import { InputNormalizerService } from "./input.normalizer.service";
import { PatternDetectorService } from "./pattern.detector.service";
import { SemanticClassifierService } from "./semantic.classifier.service";
import { IntentParserService } from "./intent.parser.service";
import { TransactionValidatorService } from "./transaction.validator.service";
import { PolicyEngineService } from "./policy.engine.service";
import { VerdictAssemblerService } from "./verdict.assembler.service";
import { BankingDispatcherService } from "./banking.dispatcher.service";
import { AuditPersisterService } from "./audit.persister.service";
import { AuditStoreService } from "../../audit/audit.store.service";
import {
  BankingExecutionResult,
  FirewallVerdictResponse,
} from "../types/verdict.types";
import { runAgent } from "../../agent/orchestrator";

export interface AnalyzeRequestOptions {
  sessionId?: string;
  forceOffline?: boolean;
  skipDatabaseLog?: boolean;
}

export class FirewallOrchestratorService {
  static async analyze(
    rawInput: string,
    options: AnalyzeRequestOptions = {},
  ): Promise<FirewallVerdictResponse> {
    const { sessionId, forceOffline = false, skipDatabaseLog = false } = options;

    const normalizedInput = InputNormalizerService.normalize(rawInput);
    const layer1Result = PatternDetectorService.detect(normalizedInput);

    const semanticResult = await SemanticClassifierService.classify(
      normalizedInput,
      layer1Result,
      { forceOffline },
    );

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

    const policyDecision = PolicyEngineService.evaluate(
      normalizedInput,
      layer1Result,
      semanticResult,
      intentValidated,
      sessionId,
    );

    let executionResult: BankingExecutionResult | undefined;
    if (policyDecision.decision === "APPROVE") {
      executionResult = BankingDispatcherService.dispatch(
        intentValidated.action,
        intentValidated.params,
      );

      if (!forceOffline) {
        try {
          const agentRes = await runAgent(sessionId, rawInput);
          if (agentRes && agentRes.text) {
            executionResult.message = agentRes.text;
          }
        } catch (err) {
          console.warn(
            "[FirewallOrchestrator] AI Agent router fallback:",
            err instanceof Error ? err.message : String(err),
          );
        }
      }
    }

    const finalVerdict = VerdictAssemblerService.assemble(
      normalizedInput,
      layer1Result,
      semanticResult,
      intentValidated,
      policyDecision,
      executionResult,
    );

    AuditStoreService.record(finalVerdict, rawInput, sessionId);

    if (!skipDatabaseLog) {
      AuditPersisterService.persistAuditLog(finalVerdict, rawInput, sessionId).catch((err) => {
        console.warn("[FirewallOrchestrator] Database log warning:", err instanceof Error ? err.message : String(err));
      });
    }

    return finalVerdict;
  }
}
