"use client";

import { useState, useEffect, useCallback } from "react";
import { AuditRecord, AggregateStats } from "@/lib/audit/audit.store.service";

const initialStats: AggregateStats = {
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

export function useFirewallSession() {
  const [stats, setStats] = useState<AggregateStats>(initialStats);
  const [history, setHistory] = useState<AuditRecord[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalRequests: data.totalRequests ?? 0,
          approvedCount: data.approvedCount ?? 0,
          blockedCount: data.blockedCount ?? 0,
          approvalRate: data.approvalRate ?? 0,
          blockRate: data.blockRate ?? 0,
          averageRiskScore: data.averageRiskScore ?? 0,
          threatBreakdown: data.threatBreakdown ?? {},
          riskLevelBreakdown: data.riskLevelBreakdown ?? {},
          trustInfo: data.trustInfo ?? initialStats.trustInfo,
        });
        if (Array.isArray(data.recentHistory)) {
          setHistory(data.recentHistory);
        }
      }
    } catch {
      // Fail-safe fallback
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok && isMounted) {
          const data = await res.json();
          setStats({
            totalRequests: data.totalRequests ?? 0,
            approvedCount: data.approvedCount ?? 0,
            blockedCount: data.blockedCount ?? 0,
            approvalRate: data.approvalRate ?? 0,
            blockRate: data.blockRate ?? 0,
            averageRiskScore: data.averageRiskScore ?? 0,
            threatBreakdown: data.threatBreakdown ?? {},
            riskLevelBreakdown: data.riskLevelBreakdown ?? {},
            trustInfo: data.trustInfo ?? initialStats.trustInfo,
          });
          if (Array.isArray(data.recentHistory)) {
            setHistory(data.recentHistory);
          }
        }
      } catch {
        // Fail-safe fallback
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearSession = useCallback(async () => {
    try {
      await fetch("/api/stats", { method: "DELETE" });
      await fetchStats();
    } catch {
      // Fail-safe fallback
    }
  }, [fetchStats]);

  return {
    stats,
    history,
    fetchStats,
    clearSession,
  };
}
