import { NormalizedInput } from "../types/normalizer.types";
import { PatternResult } from "../types/pattern.detector.types";
import { SemanticResult } from "../types/semantic.classifier.types";
import { IntentResult } from "../types/intent.parser.types";
import {
  PolicyDecision,
  PolicyRuleName,
  SessionRateState,
} from "../types/policy.engine.types";

export class PolicyEngineService {
  private static readonly sessionStore = new Map<string, SessionRateState>();

  /**
   * Evaluates all 6 deterministic policies against the aggregated outputs of Layers 0–3.
   */
  static evaluate(
    normalizedInput: NormalizedInput,
    layer1Result: PatternResult,
    semanticResult: SemanticResult,
    intentResult: IntentResult,
    sessionId?: string,
  ): PolicyDecision {
    const triggeredPolicies: PolicyRuleName[] = [];
    const reasons: string[] = [];

    // --- POLICY 6: RATE LIMITING (Session-based) ---
    if (sessionId) {
      const rateCheck = this.checkRateLimit(sessionId);
      if (rateCheck.triggered) {
        triggeredPolicies.push(rateCheck.policy);
        reasons.push(rateCheck.reason);
      }
    }

    // --- POLICY 4: NO_SYSTEM_DISCLOSURE ---
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

    // --- POLICY 3: TRANSACTION_LIMITS ---
    if (
      intentResult.action === "TRANSFER" &&
      intentResult.params.amount !== undefined &&
      intentResult.params.amount > 10000
    ) {
      triggeredPolicies.push("TRANSACTION_LIMITS");
      reasons.push(`Single transfer amount $${intentResult.params.amount} exceeds hard limit of $10,000.`);
    }

    // --- POLICY 5: MEMO_ISOLATION ---
    const memoError = intentResult.validationErrors.find(
      (e) => e.rule === "MALICIOUS_MEMO",
    );
    if (memoError) {
      triggeredPolicies.push("MEMO_ISOLATION");
      reasons.push("Transfer memo violated security policy (payload detected in untrusted field).");
    }

    // --- POLICY 1: DENY_BY_DEFAULT ---
    const isL1HighRisk = layer1Result.layer1RiskScore > 0.6;
    const isL2NonBenign = semanticResult.category !== "BENIGN";
    const isUnknownIntent = intentResult.action === "UNKNOWN";
    const hasBlockingValidation = intentResult.validationErrors.some(
      (e) => e.severity === "BLOCK",
    );

    if (isL1HighRisk || isL2NonBenign || isUnknownIntent || hasBlockingValidation) {
      triggeredPolicies.push("DENY_BY_DEFAULT");
      if (isL1HighRisk) reasons.push(`Layer 1 risk score (${layer1Result.layer1RiskScore}) exceeds tolerance threshold 0.6.`);
      if (isL2NonBenign) reasons.push(`Semantic analysis classified input as ${semanticResult.category}.`);
      if (isUnknownIntent) reasons.push("Intent could not be mapped to any authorized banking action.");
      if (hasBlockingValidation) reasons.push(`Validation rule failure: ${intentResult.rejectionReason}`);
    }

    // --- POLICY 2: LAYERED_CONSENSUS ---
    // For APPROVAL: Layer 1 risk must be < 0.3 AND Layer 2 must say BENIGN with confidence > 0.7 AND intent must be valid
    const l1Approves = layer1Result.layer1RiskScore < 0.3;
    const l2Approves =
      semanticResult.category === "BENIGN" && semanticResult.confidence >= 0.7;
    const intentApproves = intentResult.isApproved;

    const fullConsensus = l1Approves && l2Approves && intentApproves;

    if (!fullConsensus) {
      if (!triggeredPolicies.includes("LAYERED_CONSENSUS")) {
        triggeredPolicies.push("LAYERED_CONSENSUS");
      }
      if (l1Approves !== l2Approves) {
        reasons.push("Disagreement between pattern detector and semantic classifier (failing closed).");
      }
    }

    // Compose final decision
    const isBlocked = triggeredPolicies.length > 0;
    const decision: "APPROVE" | "BLOCK" = isBlocked ? "BLOCK" : "APPROVE";

    // Update session consecutive block count
    if (sessionId) {
      this.recordSessionVerdict(sessionId, decision);
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

  /**
   * Enforces session rate limiting and repeated-offender blocking.
   */
  private static checkRateLimit(sessionId: string): {
    triggered: boolean;
    policy: PolicyRuleName;
    reason: string;
  } {
    const now = Date.now();
    let state = this.sessionStore.get(sessionId);

    if (!state) {
      state = { sessionId, requestTimestamps: [], consecutiveBlockCount: 0 };
      this.sessionStore.set(sessionId, state);
    }

    // Clean timestamps older than 5 minutes (300,000ms)
    const fiveMinutesAgo = now - 300000;
    state.requestTimestamps = state.requestTimestamps.filter(
      (ts) => ts > fiveMinutesAgo,
    );
    state.requestTimestamps.push(now);

    // Rule: > 20 requests in 5 minutes
    if (state.requestTimestamps.length > 20) {
      return {
        triggered: true,
        policy: "RATE_LIMIT_EXCEEDED",
        reason: `Rate limit exceeded (${state.requestTimestamps.length} requests in 5 minutes).`,
      };
    }

    // Rule: > 5 blocked requests in a row
    if (state.consecutiveBlockCount >= 5) {
      return {
        triggered: true,
        policy: "REPEAT_OFFENDER",
        reason: `Repeated offender throttle active (${state.consecutiveBlockCount} consecutive blocks).`,
      };
    }

    return {
      triggered: false,
      policy: "DENY_BY_DEFAULT",
      reason: "",
    };
  }

  private static recordSessionVerdict(
    sessionId: string,
    verdict: "APPROVE" | "BLOCK",
  ): void {
    const state = this.sessionStore.get(sessionId);
    if (state) {
      if (verdict === "BLOCK") {
        state.consecutiveBlockCount++;
      } else {
        state.consecutiveBlockCount = 0; // Reset upon legitimate approved transaction
      }
    }
  }

  /**
   * Resets rate-limiting state (useful for tests).
   */
  static resetRateLimits(): void {
    this.sessionStore.clear();
  }
}
