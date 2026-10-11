import { PolicyRuleName, SessionRateState } from "../types/policy.engine.types";

export class SessionLimiterService {
  private static readonly sessionStore = new Map<string, SessionRateState>();

  static checkRateLimit(sessionId: string): {
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

    const fiveMinutesAgo = now - 300000;
    while (
      state.requestTimestamps.length > 0 &&
      state.requestTimestamps[0] <= fiveMinutesAgo
    ) {
      state.requestTimestamps.shift();
    }
    state.requestTimestamps.push(now);

    if (state.requestTimestamps.length > 20) {
      return {
        triggered: true,
        policy: "RATE_LIMIT_EXCEEDED",
        reason: `Rate limit exceeded (${state.requestTimestamps.length} requests in 5 minutes).`,
      };
    }

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

  static recordSessionVerdict(
    sessionId: string,
    verdict: "APPROVE" | "BLOCK",
  ): void {
    const state = this.sessionStore.get(sessionId);
    if (state) {
      if (verdict === "BLOCK") {
        state.consecutiveBlockCount++;
      } else {
        state.consecutiveBlockCount = 0;
      }
    }
  }

  static resetRateLimits(): void {
    this.sessionStore.clear();
  }
}
