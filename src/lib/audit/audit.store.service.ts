import {
  FirewallVerdictResponse,
  LayerDetails,
  FirewallThreatCategory,
} from "../firewall/types/verdict.types";

export interface AuditRecord {
  requestId: string;
  sessionId?: string;
  userInput: string;
  sanitizedInput: string;
  verdict: "APPROVED" | "BLOCKED";
  riskScore: number;
  riskLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  threatCategory: FirewallThreatCategory;
  explanation: string;
  parsedIntent?: FirewallVerdictResponse["parsedIntent"];
  layerDetails: LayerDetails;
  timestamp: string;
}

export interface SessionTrustInfo {
  trustScore: number;
  trustLevel: "TRUSTED" | "DEGRADED" | "HOSTILE";
  consecutiveBlocks: number;
  adaptiveScrutiny: "STANDARD" | "ELEVATED" | "MAXIMUM";
}

export interface AggregateStats {
  totalRequests: number;
  approvedCount: number;
  blockedCount: number;
  approvalRate: number;
  blockRate: number;
  averageRiskScore: number;
  threatBreakdown: Record<string, number>;
  riskLevelBreakdown: Record<string, number>;
  trustInfo: SessionTrustInfo;
}

/**
 * Service managing in-memory audit logs and session metrics.
 * Ensures fast zero-latency reporting, UI updates, and instant JSON exports,
 * while complementing persistent PostgreSQL drizzle storage.
 */
export class AuditStoreService {
  private static history: AuditRecord[] = [];
  private static readonly MAX_HISTORY = 1000;

  /**
   * Records a new verdict entry into the audit history.
   */
  static record(
    verdict: FirewallVerdictResponse,
    userInput: string,
    sessionId?: string,
  ): AuditRecord {
    const record: AuditRecord = {
      requestId: verdict.requestId,
      sessionId,
      userInput,
      sanitizedInput: verdict.inputSanitized,
      verdict: verdict.verdict,
      riskScore: verdict.riskScore,
      riskLevel: verdict.riskLevel,
      threatCategory: verdict.threatCategory,
      explanation: verdict.explanation,
      parsedIntent: verdict.parsedIntent,
      layerDetails: verdict.layerDetails,
      timestamp: verdict.timestamp,
    };

    this.history.unshift(record);

    if (this.history.length > this.MAX_HISTORY) {
      this.history.pop();
    }

    return record;
  }

  /**
   * Retrieves aggregate statistics, optionally filtered by sessionId.
   */
  static getStats(sessionId?: string): AggregateStats {
    const records = sessionId
      ? this.history.filter((r) => r.sessionId === sessionId)
      : this.history;

    const total = records.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        approvedCount: 0,
        blockedCount: 0,
        approvalRate: 0,
        blockRate: 0,
        averageRiskScore: 0,
        threatBreakdown: {},
        riskLevelBreakdown: {},
        trustInfo: {
          trustScore: 100,
          trustLevel: "TRUSTED",
          consecutiveBlocks: 0,
          adaptiveScrutiny: "STANDARD",
        },
      };
    }

    let approved = 0;
    let blocked = 0;
    let totalRisk = 0;
    const threatBreakdown: Record<string, number> = {};
    const riskLevelBreakdown: Record<string, number> = {};

    // Count consecutive blocks from newest records backwards
    let consecutiveBlocks = 0;
    for (const r of records) {
      if (r.verdict === "BLOCKED") {
        consecutiveBlocks++;
      } else {
        break;
      }
    }

    for (const r of records) {
      if (r.verdict === "APPROVED") {
        approved++;
      } else {
        blocked++;
      }

      totalRisk += r.riskScore;

      if (r.threatCategory && r.threatCategory !== "NONE") {
        threatBreakdown[r.threatCategory] = (threatBreakdown[r.threatCategory] || 0) + 1;
      }

      riskLevelBreakdown[r.riskLevel] = (riskLevelBreakdown[r.riskLevel] || 0) + 1;
    }

    // Adaptive Trust Calculation
    // Base 100 - (15 per block) - (10 per consecutive block) + (5 per approval)
    const rawTrust = 100 - blocked * 15 - consecutiveBlocks * 10 + approved * 5;
    const trustScore = Math.max(0, Math.min(100, rawTrust));

    let trustLevel: "TRUSTED" | "DEGRADED" | "HOSTILE" = "TRUSTED";
    let adaptiveScrutiny: "STANDARD" | "ELEVATED" | "MAXIMUM" = "STANDARD";

    if (trustScore < 45 || consecutiveBlocks >= 3) {
      trustLevel = "HOSTILE";
      adaptiveScrutiny = "MAXIMUM";
    } else if (trustScore < 75 || consecutiveBlocks >= 1) {
      trustLevel = "DEGRADED";
      adaptiveScrutiny = "ELEVATED";
    }

    return {
      totalRequests: total,
      approvedCount: approved,
      blockedCount: blocked,
      approvalRate: Math.round((approved / total) * 1000) / 10,
      blockRate: Math.round((blocked / total) * 1000) / 10,
      averageRiskScore: Math.round((totalRisk / total) * 100) / 100,
      threatBreakdown,
      riskLevelBreakdown,
      trustInfo: {
        trustScore,
        trustLevel,
        consecutiveBlocks,
        adaptiveScrutiny,
      },
    };
  }

  /**
   * Retrieves chronological audit history entries (most recent first).
   */
  static getHistory(sessionId?: string, limit = 50): AuditRecord[] {
    const records = sessionId
      ? this.history.filter((r) => r.sessionId === sessionId)
      : this.history;

    return records.slice(0, limit);
  }

  /**
   * Clears the in-memory audit history (useful for test resets).
   */
  static clear(): void {
    this.history = [];
  }
}
