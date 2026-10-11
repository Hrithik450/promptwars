"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { PromptConsole } from "@/components/dashboard/PromptConsole";
import { VerdictPanel } from "@/components/dashboard/VerdictPanel";
import { PipelineVisualizer } from "@/components/dashboard/PipelineVisualizer";
import { BankingCoreCard } from "@/components/dashboard/BankingCoreCard";
import { SessionStatsCard } from "@/components/dashboard/SessionStatsCard";
import { HistoryLog } from "@/components/dashboard/HistoryLog";
import { BenchmarkModal } from "@/components/dashboard/BenchmarkModal";
import { FirewallVerdictResponse } from "@/lib/firewall/types/verdict.types";
import { AuditRecord } from "@/lib/audit/audit.store.service";
import { useFirewallSession } from "@/hooks/useFirewallSession";

const SESSION_ID = "banksim-client-session";

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState<FirewallVerdictResponse | null>(null);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();

  const { stats, history, fetchStats, clearSession } = useFirewallSession();

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
          session_id: SESSION_ID,
        }),
      });

      const data: FirewallVerdictResponse = await res.json();
      setCurrentVerdict(data);
      setSelectedRequestId(data.requestId);
      await fetchStats();
    } catch {
      const fallbackVerdict: FirewallVerdictResponse = {
        requestId: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        verdict: "BLOCKED",
        riskScore: 1.0,
        riskLevel: "CRITICAL",
        threatCategory: "POLICY_VIOLATION",
        explanation: "Network timeout or connection refused. Fail-closed defense blocked request.",
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
    await clearSession();
    setCurrentVerdict(null);
    setSelectedRequestId(undefined);
  };

  const handleExportAuditLog = () => {
    const link = document.createElement("a");
    link.href = "/api/export";
    link.setAttribute("download", `banksim-audit-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectRecord = (record: AuditRecord) => {
    setSelectedRequestId(record.requestId);
    setInput(record.userInput);

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
      <Header
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        onClearSession={handleClearSession}
        onExportAuditLog={handleExportAuditLog}
        totalRequests={stats.totalRequests}
        trustInfo={stats.trustInfo}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />
    </div>
  );
}
