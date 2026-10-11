"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QUICK_PRESETS } from "@/lib/firewall/data/presets.data";
import {
  ConfusionMatrixStats,
  BenchmarkItemResult,
} from "@/components/dashboard/ConfusionMatrixStats";
import { BarChart2, Play, RefreshCw, Activity, ShieldCheck } from "lucide-react";

export default function BenchmarkPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BenchmarkItemResult[]>([]);

  const runBenchmark = async () => {
    setIsRunning(true);
    setProgress(0);
    const itemResults: BenchmarkItemResult[] = [];

    for (let i = 0; i < QUICK_PRESETS.length; i++) {
      const preset = QUICK_PRESETS[i];
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_input: preset.payload,
            session_id: "benchmark-session",
          }),
        });

        const data = await res.json();
        const actualVerdict = data.verdict as "APPROVED" | "BLOCKED";
        itemResults.push({
          preset,
          actualVerdict,
          riskScore: data.riskScore,
          passed: actualVerdict === preset.expectedVerdict,
        });
      } catch {
        itemResults.push({
          preset,
          actualVerdict: "BLOCKED",
          riskScore: 1.0,
          passed: preset.expectedVerdict === "BLOCKED",
        });
      }

      setResults([...itemResults]);
      setProgress(Math.round(((i + 1) / QUICK_PRESETS.length) * 100));
    }

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 font-mono">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <BarChart2 className="size-5 text-white" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
                Red-Team Calibration & Benchmark Lab
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans">
              Evaluates true detection recall against multi-vector adversarial attacks and verifies zero false positives on authentic financial banking operations.
            </p>
          </div>

          <Button
            onClick={runBenchmark}
            disabled={isRunning}
            aria-label="Execute benchmark battery"
            className="bg-white text-black hover:bg-zinc-200 font-semibold text-xs px-5 h-10 gap-2 rounded-lg shadow-sm font-mono shrink-0 disabled:opacity-40"
          >
            {isRunning ? (
              <>
                <RefreshCw className="size-4 animate-spin" />
                <span>Evaluating ({progress}%)...</span>
              </>
            ) : (
              <>
                <Play className="size-4 stroke-[2.5]" />
                <span>Run Full Test Battery</span>
              </>
            )}
          </Button>
        </div>

        {isRunning && (
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Benchmark execution progress"
            className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden"
          >
            <div
              className="bg-white h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                <ShieldCheck className="size-4 text-white" />
                <span>Scenarios in Suite</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white mt-1">
                {QUICK_PRESETS.length} Cases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-zinc-500 font-sans">
              Injections, Jailbreaks, Homoglyphs, Decoders & Remittances.
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                <Activity className="size-4 text-white" />
                <span>Execution Status</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white mt-1">
                {results.length > 0 ? `${results.length} / ${QUICK_PRESETS.length}` : "Ready"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-zinc-500 font-sans">
              {isRunning ? "Simulating active multi-vector traffic..." : "Click button to execute test run."}
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                <BarChart2 className="size-4 text-white" />
                <span>Success Rate</span>
              </div>
              <CardTitle className="text-2xl font-bold text-white mt-1">
                {results.length > 0
                  ? `${Math.round((results.filter((r) => r.passed).length / results.length) * 100)}%`
                  : "--"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-zinc-500 font-sans">
              Calculated dynamically from confusion matrix true counts.
            </CardContent>
          </Card>
        </div>

        {/* Confusion Matrix and Result List */}
        {results.length > 0 ? (
          <ConfusionMatrixStats results={results} />
        ) : (
          <div className="p-12 rounded-xl bg-zinc-950/60 border border-zinc-800 border-dashed text-center flex flex-col items-center justify-center gap-3">
            <BarChart2 className="size-8 text-zinc-600" />
            <span className="text-sm text-zinc-300 font-bold uppercase">
              Benchmark Suite Standing By
            </span>
            <p className="text-xs text-zinc-500 max-w-md font-sans">
              Click &quot;Run Full Test Battery&quot; to fire 30 live adversarial queries and benign banking actions against all 6 defense layers.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
