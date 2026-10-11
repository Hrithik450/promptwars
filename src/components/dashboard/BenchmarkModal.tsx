"use client";

import { useState } from "react";
import { X, Play, RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUICK_PRESETS } from "@/lib/firewall/data/presets.data";
import {
  ConfusionMatrixStats,
  BenchmarkItemResult,
} from "./ConfusionMatrixStats";

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BenchmarkModal({ isOpen, onClose }: BenchmarkModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BenchmarkItemResult[]>([]);

  if (!isOpen) return null;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="benchmark-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-4xl bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <BarChart2 className="size-4 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2
                id="benchmark-modal-title"
                className="text-sm font-bold uppercase tracking-wider text-white font-mono"
              >
                Confidence Calibration & Confusion Matrix
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Evaluates true detection recall on attacks & false positive rate
                on benign queries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close benchmark modal"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto font-mono">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-xs font-semibold text-white">
                Test Battery: {QUICK_PRESETS.length} Multi-Vector Scenarios
              </span>
              <span className="text-[11px] text-zinc-500">
                Injections, Jailbreaks, Homoglyphs, Multilingual Attacks &
                Banking Queries.
              </span>
            </div>

            <Button
              onClick={runBenchmark}
              disabled={isRunning}
              aria-label="Execute benchmark battery"
              className="bg-white text-black hover:bg-zinc-200 font-semibold text-xs px-4 h-9 gap-2 rounded-lg shadow-sm font-mono w-full sm:w-auto shrink-0 disabled:opacity-40"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Evaluating ({progress}%)...</span>
                </>
              ) : (
                <>
                  <Play className="size-3.5 stroke-[2.5]" />
                  <span>Execute Benchmark</span>
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
              className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden"
            >
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {results.length > 0 && <ConfusionMatrixStats results={results} />}
        </div>
      </div>
    </div>
  );
}
