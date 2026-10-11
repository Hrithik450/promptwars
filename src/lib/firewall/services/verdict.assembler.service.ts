import { randomUUID } from "crypto";
import { NormalizedInput } from "../types/normalizer.types";
import { PatternResult } from "../types/pattern.detector.types";
import { SemanticResult } from "../types/semantic.classifier.types";
import { IntentResult } from "../types/intent.parser.types";
import { PolicyDecision } from "../types/policy.engine.types";
import {
  BankingExecutionResult,
  FirewallThreatCategory,
  FirewallVerdictResponse,
  RiskLevel,
  Verdict,
} from "../types/verdict.types";

export class VerdictAssemblerService {
  /**
   * Composes final standardized verdict JSON from all layer outputs.
   */
  static assemble(
    normalizedInput: NormalizedInput,
    layer1Result: PatternResult,
    semanticResult: SemanticResult,
    intentResult: IntentResult,
    policyDecision: PolicyDecision,
    executionResult?: BankingExecutionResult,
    customRequestId?: string,
  ): FirewallVerdictResponse {
    const isApproved = policyDecision.decision === "APPROVE";
    const verdict: Verdict = isApproved ? "APPROVED" : "BLOCKED";

    // --- Risk Score Composition Formula (plan.md:336-342) ---
    const hasBlockingValidationError = intentResult.validationErrors.some(
      (e) => e.severity === "BLOCK",
    );

    let compositeRisk: number;
    if (isApproved) {
      compositeRisk = Math.max(0, layer1Result.layer1RiskScore);
    } else {
      compositeRisk = Math.max(
        layer1Result.layer1RiskScore,
        semanticResult.category !== "BENIGN" ? semanticResult.confidence : 0,
        hasBlockingValidationError ? 1.0 : 0,
        policyDecision.decision === "BLOCK" ? 0.85 : 0,
      );
    }

    const riskScore = Math.min(1.0, Math.round(compositeRisk * 100) / 100);
    const riskLevel = this.calculateRiskLevel(riskScore);
    const threatCategory = this.determineThreatCategory(
      isApproved,
      layer1Result,
      semanticResult,
      policyDecision,
      intentResult,
    );

    const explanation = isApproved
      ? `Request approved. Valid ${intentResult.action} intent verified across all defense layers.`
      : policyDecision.reason || "Request blocked by defensive security policy.";

    return {
      verdict,
      riskScore,
      riskLevel,
      threatCategory,
      explanation,
      requestId: customRequestId || randomUUID(),
      timestamp: new Date().toISOString(),
      inputSanitized: normalizedInput.normalized,
      parsedIntent:
        intentResult.action !== "UNKNOWN"
          ? { action: intentResult.action, params: intentResult.params }
          : null,
      layerDetails: {
        normalizerFlags: normalizedInput.flags,
        patternMatches: layer1Result.matches.map((m) => ({
          patternId: m.patternId,
          threatLabel: m.threatLabel,
          matchedText: m.matchedText,
          severity: m.severity,
          description: m.description,
        })),
        heuristicFlags: layer1Result.heuristicFlags,
        semanticClassification: {
          category: semanticResult.category,
          confidence: semanticResult.confidence,
          reasoning: semanticResult.reasoning,
          skipped: semanticResult.skipped,
        },
        intentValidationErrors: intentResult.validationErrors.map((v) => ({
          rule: v.rule,
          message: v.message,
          severity: v.severity,
        })),
        policyTriggers: policyDecision.triggeredPolicies,
      },
      executionResult,
    };
  }

  /**
   * Maps numerical risk score (0.0 - 1.0) to 5-tier RiskLevel enum.
   */
  private static calculateRiskLevel(score: number): RiskLevel {
    if (score < 0.1) return "NONE";
    if (score < 0.3) return "LOW";
    if (score < 0.6) return "MEDIUM";
    if (score < 0.8) return "HIGH";
    return "CRITICAL";
  }

  /**
   * Resolves final consolidated threat category for logging & display.
   */
  private static determineThreatCategory(
    isApproved: boolean,
    layer1Result: PatternResult,
    semanticResult: SemanticResult,
    policyDecision: PolicyDecision,
    intentResult: IntentResult,
  ): FirewallThreatCategory {
    if (isApproved) {
      return "NONE";
    }

    // 1. Check if memo triggered MALICIOUS_MEMO
    if (intentResult.validationErrors.some((e) => e.rule === "MALICIOUS_MEMO")) {
      return "PROMPT_INJECTION";
    }

    // 2. Check Layer 1 detected threat category
    if (layer1Result.highestThreatCategory) {
      switch (layer1Result.highestThreatCategory) {
        case "PROMPT_INJECTION":
          return "PROMPT_INJECTION";
        case "JAILBREAK_ROLEPLAY":
          return "JAILBREAK";
        case "DATA_EXFIL":
          return "DATA_EXFILTRATION";
        case "CODE_INJECTION":
          return "MALICIOUS_PAYLOAD";
        case "SOCIAL_ENGINEERING":
          return "SOCIAL_ENGINEERING";
        case "INSTRUCTION_OVERRIDE":
          return "PROMPT_INJECTION";
        case "CONTEXT_BREAK":
          return "PROMPT_INJECTION";
      }
    }

    // 3. Check Layer 2 semantic threat category
    if (
      semanticResult.category !== "BENIGN" &&
      semanticResult.category !== "UNKNOWN"
    ) {
      switch (semanticResult.category) {
        case "PROMPT_INJECTION":
          return "PROMPT_INJECTION";
        case "JAILBREAK":
          return "JAILBREAK";
        case "DATA_EXFILTRATION":
          return "DATA_EXFILTRATION";
        case "SOCIAL_ENGINEERING":
          return "SOCIAL_ENGINEERING";
        case "MALICIOUS_PAYLOAD":
          return "MALICIOUS_PAYLOAD";
        case "OBFUSCATED_ATTACK":
          return "OBFUSCATED_ATTACK";
      }
    }

    // 4. Policy violations
    if (
      policyDecision.triggeredPolicies.includes("TRANSACTION_LIMITS") ||
      intentResult.validationErrors.some((e) => e.rule === "EXCEEDS_TRANSACTION_LIMIT")
    ) {
      return "POLICY_VIOLATION";
    }

    return "POLICY_VIOLATION";
  }
}
