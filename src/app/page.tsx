"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { PromptConsole } from "@/components/dashboard/PromptConsole";
import { VerdictPanel } from "@/components/dashboard/VerdictPanel";
import { PipelineVisualizer } from "@/components/dashboard/PipelineVisualizer";
import { BankingCoreCard } from "@/components/dashboard/BankingCoreCard";
import { SessionStatsCard } from "@/components/dashboard/SessionStatsCard";
import { HistoryLog } from "@/components/dashboard/HistoryLog";
import { BenchmarkModal } from "@/components/dashboard/BenchmarkModal";
import { FirewallVerdictResponse } from "@/lib/firewall/types/verdict.types";
import { AuditRecord, AggregateStats } from "@/lib/audit/audit.store.service";

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerdict, setCurrentVerdict] =
    useState<FirewallVerdictResponse | null>(null);
  const [history, setHistory] = useState<AuditRecord[]>([]);
  const [stats, setStats] = useState<AggregateStats>({
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
  });
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<
    string | undefined
  >();

  const sessionId = "banksim-client-session";

  const fetchStats = async () => {
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
          trustInfo: data.trustInfo ?? {
            trustScore: 100,
            trustLevel: "TRUSTED",
            consecutiveBlocks: 0,
            adaptiveScrutiny: "STANDARD",
          },
        });
        if (Array.isArray(data.recentHistory)) {
          setHistory(data.recentHistory);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSubmit = async (textToSubmit?: string) => {
    const payload = (textToSubmit ?? input).trim();
    if (!payload || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_input: payload,
          session_id: sessionId,
        }),
      });

      const data: FirewallVerdictResponse = await res.json();
      setCurrentVerdict(data);
      setSelectedRequestId(data.requestId);

      // Refresh session statistics
      await fetchStats();
    } catch {
      // Fail closed fallback in UI
      const fallbackVerdict: FirewallVerdictResponse = {
        requestId: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        verdict: "BLOCKED",
        riskScore: 1.0,
        riskLevel: "CRITICAL",
        threatCategory: "POLICY_VIOLATION",
        explanation:
          "Network timeout or connection refused. Fail-closed defense blocked request.",
        inputSanitized: payload,
        parsedIntent: null,
        layerDetails: {
          normalizerFlags: ["NETWORK_TIMEOUT"],
          patternMatches: [],
          heuristicFlags: [],
          semanticClassification: {
            category: "NETWORK_ERROR",
            confidence: 1.0,
            reasoning: "Connection failure",
          },
          intentValidationErrors: [],
          policyTriggers: ["DENY_BY_DEFAULT"],
        },
      };
      setCurrentVerdict(fallbackVerdict);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    try {
      await fetch("/api/stats", { method: "DELETE" });
      setCurrentVerdict(null);
      setSelectedRequestId(undefined);
      await fetchStats();
    } catch {
      // Fallback
    }
  };

  const handleExportAuditLog = () => {
    window.location.href = "/api/export";
  };

  const handleSelectRecord = (record: AuditRecord) => {
    setSelectedRequestId(record.requestId);
    setInput(record.userInput);

    // Reconstruct inspection view from record
    const reconstitutedVerdict: FirewallVerdictResponse = {
      requestId: record.requestId,
      timestamp: record.timestamp,
      verdict: record.verdict,
      riskScore: record.riskScore,
      riskLevel: record.riskLevel,
      threatCategory: record.threatCategory,
      explanation: record.explanation,
      inputSanitized: record.sanitizedInput,
      parsedIntent: record.parsedIntent ?? null,
      layerDetails: record.layerDetails,
      executionResult: record.executionResult,
    };
    setCurrentVerdict(reconstitutedVerdict);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Navigation Header */}
      <Header
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onClearSession={handleClearSession}
        onExportAuditLog={handleExportAuditLog}
        totalRequests={stats.totalRequests}
        trustInfo={stats.trustInfo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input, Mock Banking Core & Session Stats */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <PromptConsole
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />

            <BankingCoreCard lastExecution={currentVerdict?.executionResult} />

            <SessionStatsCard stats={stats} />
          </div>

          {/* Right Column: Verdict, Pipeline Inspector & History Log */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <VerdictPanel verdict={currentVerdict} isLoading={isLoading} />

            <PipelineVisualizer verdict={currentVerdict} />

            <HistoryLog
              history={history}
              onSelectRecord={handleSelectRecord}
              selectedRequestId={selectedRequestId}
            />
          </div>
        </div>
      </main>

      {/* Benchmark / Confidence Calibration Modal */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => {
          setIsBenchmarkOpen(false);
          fetchStats();
        }}
      />
    </div>
  );
}
