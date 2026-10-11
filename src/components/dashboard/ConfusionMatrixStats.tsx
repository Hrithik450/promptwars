"use client";

import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { QuickPreset } from "@/lib/firewall/data/presets.data";

export interface BenchmarkItemResult {
  preset: QuickPreset;
  actualVerdict: "APPROVED" | "BLOCKED";
  riskScore: number;
  passed: boolean;
}

interface ConfusionMatrixStatsProps {
  results: BenchmarkItemResult[];
}

export function ConfusionMatrixStats({ results }: ConfusionMatrixStatsProps) {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (const r of results) {
    if (r.preset.expectedVerdict === "BLOCKED") {
      if (r.actualVerdict === "BLOCKED") tp++;
      else fn++;
    } else {
      if (r.actualVerdict === "APPROVED") tn++;
      else fp++;
    }
  }

  const total = results.length;
  const accuracy = total > 0 ? Math.round(((tp + tn) / total) * 100) : 0;
  const precision = tp + fp > 0 ? Math.round((tp / (tp + fp)) * 100) : 100;
  const recall = tp + fn > 0 ? Math.round((tp / (tp + fn)) * 100) : 100;
  const f1 =
    precision + recall > 0
      ? ((2 * (precision * recall)) / (precision + recall) / 100).toFixed(2)
      : "1.00";

  return (
    <div className="flex flex-col gap-4 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px]">True Positives (TP)</span>
          <span className="text-xl font-bold text-white">{tp}</span>
          <span className="text-[10px] text-zinc-600">Attacks blocked</span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px]">True Negatives (TN)</span>
          <span className="text-xl font-bold text-white">{tn}</span>
          <span className="text-[10px] text-zinc-600">Benign approved</span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px]">
            False Positives (FP)
          </span>
          <span className="text-xl font-bold text-white">{fp}</span>
          <span className="text-[10px] text-zinc-600">Benign blocked</span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px]">
            False Negatives (FN)
          </span>
          <span className="text-xl font-bold text-white">{fn}</span>
          <span className="text-[10px] text-zinc-600">Attacks slipped</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-center text-xs">
        <div>
          <span className="text-zinc-500 text-[10px] block uppercase">
            Accuracy
          </span>
          <span className="text-base font-bold text-white">{accuracy}%</span>
        </div>
        <div>
          <span className="text-zinc-500 text-[10px] block uppercase">
            Precision
          </span>
          <span className="text-base font-bold text-white">{precision}%</span>
        </div>
        <div>
          <span className="text-zinc-500 text-[10px] block uppercase">
            Recall
          </span>
          <span className="text-base font-bold text-white">{recall}%</span>
        </div>
        <div>
          <span className="text-zinc-500 text-[10px] block uppercase">
            F1 Score
          </span>
          <span className="text-base font-bold text-white">{f1}</span>
        </div>
      </div>

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
  );
}
