import { NormalizedInput } from "../types/normalizer.types";
import { PatternResult } from "../types/pattern.detector.types";
import { SemanticResult } from "../types/semantic.classifier.types";
import { IntentResult } from "../types/intent.parser.types";
import { PolicyDecision, PolicyRuleName } from "../types/policy.engine.types";
import { SessionLimiterService } from "./session.limiter.service";

export class PolicyEngineService {
  static evaluate(
    normalizedInput: NormalizedInput,
    layer1Result: PatternResult,
    semanticResult: SemanticResult,
    intentResult: IntentResult,
    sessionId?: string,
  ): PolicyDecision {
    const triggeredPolicies: PolicyRuleName[] = [];
    const reasons: string[] = [];

    if (sessionId) {
      const rateCheck = SessionLimiterService.checkRateLimit(sessionId);
      if (rateCheck.triggered) {
        triggeredPolicies.push(rateCheck.policy);
        reasons.push(rateCheck.reason);
      }
    }

    const lowerText = normalizedInput.normalized.toLowerCase();
    const disclosureKeywords = [
      "system prompt",
      "internal configuration",
      "api key",
      "api keys",
      "reveal your prompt",
      "show instructions",
      "training data",
      "internal instructions",
    ];
    if (disclosureKeywords.some((kw) => lowerText.includes(kw))) {
      triggeredPolicies.push("NO_SYSTEM_DISCLOSURE");
      reasons.push("Request probes for confidential system prompt or internal configuration.");
    }

    if (
      intentResult.action === "TRANSFER" &&
      intentResult.params.amount !== undefined &&
      intentResult.params.amount > 10000
    ) {
      triggeredPolicies.push("TRANSACTION_LIMITS");
      reasons.push(`Single transfer amount $${intentResult.params.amount} exceeds hard limit of $10,000.`);
    }

    const memoError = intentResult.validationErrors.find(
      (e) => e.rule === "MALICIOUS_MEMO",
    );
    if (memoError) {
      triggeredPolicies.push("MEMO_ISOLATION");
      reasons.push("Transfer memo violated security policy (payload detected in untrusted field).");
    }

    const isL1HighRisk = layer1Result.layer1RiskScore > 0.6;
    const isL2NonBenign = semanticResult.category !== "BENIGN";
    const isConversationalSafe =
      intentResult.action === "UNKNOWN" &&
      layer1Result.layer1RiskScore < 0.3 &&
      semanticResult.category === "BENIGN";

    const hasBlockingValidation = intentResult.validationErrors.some(
      (e) =>
        e.severity === "BLOCK" &&
        !(isConversationalSafe && e.rule === "AMBIGUOUS_INTENT"),
    );

    const isUnknownIntent = intentResult.action === "UNKNOWN" && !isConversationalSafe;

    if (isL1HighRisk || isL2NonBenign || isUnknownIntent || hasBlockingValidation) {
      triggeredPolicies.push("DENY_BY_DEFAULT");
      if (isL1HighRisk) reasons.push(`Layer 1 risk score (${layer1Result.layer1RiskScore}) exceeds tolerance threshold 0.6.`);
      if (isL2NonBenign) reasons.push(`Semantic analysis classified input as ${semanticResult.category}.`);
      if (isUnknownIntent) reasons.push("Intent could not be mapped to any authorized banking action.");
      if (hasBlockingValidation) reasons.push(`Validation rule failure: ${intentResult.rejectionReason}`);
    }

    const l1Approves = layer1Result.layer1RiskScore < 0.3;
    const l2Approves =
      semanticResult.category === "BENIGN" && semanticResult.confidence >= 0.7;
    const intentApproves = intentResult.isApproved || isConversationalSafe;

    const fullConsensus = l1Approves && l2Approves && intentApproves;

    if (!fullConsensus) {
      if (!triggeredPolicies.includes("LAYERED_CONSENSUS")) {
        triggeredPolicies.push("LAYERED_CONSENSUS");
      }
      if (l1Approves !== l2Approves) {
        reasons.push("Disagreement between pattern detector and semantic classifier (failing closed).");
      }
    }

    const isBlocked = triggeredPolicies.length > 0;
    const decision: "APPROVE" | "BLOCK" = isBlocked ? "BLOCK" : "APPROVE";

    if (sessionId) {
      SessionLimiterService.recordSessionVerdict(sessionId, decision);
    }

    return {
      decision,
      triggeredPolicies,
      overridePossible: false,
      reason: isBlocked
        ? reasons.join(" ")
        : "All deterministic policies satisfied and multi-layer consensus reached.",
    };
  }

  static resetRateLimits(): void {
    SessionLimiterService.resetRateLimits();
  }
}
