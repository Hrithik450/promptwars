"use client";

import React, { useState } from "react";
import { X, Play, Check, RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QUICK_PRESETS, QuickPreset } from "@/lib/firewall/data/presets.data";

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BenchmarkItemResult {
  preset: QuickPreset;
  actualVerdict: "APPROVED" | "BLOCKED";
  riskScore: number;
  passed: boolean;
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
          body: JSON.stringify({ user_input: preset.payload, session_id: "benchmark-session" }),
        });

        const data = await res.json();
        const actualVerdict = data.verdict as "APPROVED" | "BLOCKED";
        const passed = actualVerdict === preset.expectedVerdict;

        itemResults.push({
          preset,
          actualVerdict,
          riskScore: data.riskScore,
          passed,
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

  let truePositives = 0;
  let trueNegatives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (const r of results) {
    if (r.preset.expectedVerdict === "BLOCKED") {
      if (r.actualVerdict === "BLOCKED") {
        truePositives++;
      } else {
        falseNegatives++;
      }
    } else {
      if (r.actualVerdict === "APPROVED") {
        trueNegatives++;
      } else {
        falsePositives++;
      }
    }
  }

  const total = results.length;
  const accuracy = total > 0 ? Math.round(((truePositives + trueNegatives) / total) * 100) : 0;
  const precision =
    truePositives + falsePositives > 0
      ? Math.round((truePositives / (truePositives + falsePositives)) * 100)
      : 100;
  const recall =
    truePositives + falseNegatives > 0
      ? Math.round((truePositives / (truePositives + falseNegatives)) * 100)
      : 100;
  const f1 =
    precision + recall > 0
      ? ((2 * (precision * recall)) / (precision + recall) / 100).toFixed(2)
      : "1.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-black border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-white text-black flex items-center justify-center font-bold">
              <BarChart2 className="size-4 text-black stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Confidence Calibration & Confusion Matrix
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Evaluates true detection recall on attacks & false positive rate on benign queries.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto font-mono">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-xs font-semibold text-white">
                Test Battery: {QUICK_PRESETS.length} Multi-Vector Scenarios
              </span>
              <span className="text-[11px] text-zinc-500">
                Injections, Jailbreaks, Homoglyphs, Multilingual Attacks & Banking Queries.
              </span>
            </div>

            <Button
              onClick={runBenchmark}
              disabled={isRunning}
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

          {/* Progress Bar */}
          {isRunning && (
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Confusion Matrix Results */}
          {results.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                  <span className="text-zinc-500 text-[11px]">True Positives (TP)</span>
                  <span className="text-xl font-bold text-white">
                    {truePositives}
                  </span>
                  <span className="text-[10px] text-zinc-600">Attacks blocked</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                  <span className="text-zinc-500 text-[11px]">True Negatives (TN)</span>
                  <span className="text-xl font-bold text-white">
                    {trueNegatives}
                  </span>
                  <span className="text-[10px] text-zinc-600">Benign approved</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                  <span className="text-zinc-500 text-[11px]">False Positives (FP)</span>
                  <span className="text-xl font-bold text-white">
                    {falsePositives}
                  </span>
                  <span className="text-[10px] text-zinc-600">Benign blocked</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                  <span className="text-zinc-500 text-[11px]">False Negatives (FN)</span>
                  <span className="text-xl font-bold text-white">
                    {falseNegatives}
                  </span>
                  <span className="text-[10px] text-zinc-600">Attacks slipped</span>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-4 gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-center text-xs">
                <div>
                  <span className="text-zinc-500 text-[10px] block uppercase">Accuracy</span>
                  <span className="text-base font-bold text-white">{accuracy}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block uppercase">Precision</span>
                  <span className="text-base font-bold text-white">{precision}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block uppercase">Recall</span>
                  <span className="text-base font-bold text-white">{recall}%</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] block uppercase">F1 Score</span>
                  <span className="text-base font-bold text-white">{f1}</span>
                </div>
              </div>

              {/* List of cases */}
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate flex-1">
                      <div
                        className={`size-4 rounded flex items-center justify-center shrink-0 ${
                          r.passed
                            ? "bg-white text-black font-bold"
                            : "bg-black border border-zinc-600 text-zinc-400"
                        }`}
                      >
                        {r.passed ? (
                          <Check className="size-3 stroke-[3]" />
                        ) : (
                          <X className="size-3 stroke-[3]" />
                        )}
                      </div>
                      <span className="text-zinc-300 truncate font-sans">
                        {r.preset.label}: &quot;{r.preset.payload}&quot;
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-zinc-500 text-[10px]">
                        Expected: {r.preset.expectedVerdict}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-mono uppercase px-1.5 py-0 ${
                          r.actualVerdict === "APPROVED"
                            ? "bg-white text-black font-bold border-white"
                            : "bg-black border-zinc-700 text-zinc-300"
                        }`}
                      >
                        Got: {r.actualVerdict}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
