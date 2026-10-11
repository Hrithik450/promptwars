"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { LayerDetails } from "@/lib/firewall/types/verdict.types";

interface InterceptionDiagnosticsProps {
  layerDetails: LayerDetails;
}

export function InterceptionDiagnostics({ layerDetails }: InterceptionDiagnosticsProps) {
  const { patternMatches, policyTriggers, intentValidationErrors } = layerDetails;

  const caughtByText =
    patternMatches && patternMatches.length > 0
      ? "Caught by Layer 1 (Pattern Detector)"
      : policyTriggers && policyTriggers.length > 0
        ? "Caught by Layer 4 (Policy Engine)"
        : intentValidationErrors && intentValidationErrors.length > 0
          ? "Caught by Layer 3 (Intent Validator)"
          : "Caught by Defense Guardrails";

  return (
    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-700/80 flex flex-col gap-2.5 text-xs font-mono">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
          <AlertCircle className="size-3.5 text-zinc-400" />
          Interception Diagnostics
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-black border border-zinc-700 text-zinc-300">
          {caughtByText}
        </span>
      </div>

      {patternMatches && patternMatches.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-400">Triggered Patterns:</span>
          <div className="flex flex-wrap gap-1.5">
            {patternMatches.map((m, idx) => (
              <div
                key={idx}
                className="px-2 py-1 rounded bg-black border border-zinc-700 text-zinc-200 text-[11px] flex items-center gap-1.5"
              >
                <span className="text-zinc-400 font-bold">[{m.patternId}]</span>
                <span className="text-white font-semibold underline underline-offset-2">
                  &quot;{m.matchedText}&quot;
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {policyTriggers && policyTriggers.length > 0 && (
        <div className="flex flex-col gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-400">Policy Rules Enforced:</span>
          <div className="flex flex-wrap gap-1.5">
            {policyTriggers.map((policy, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-black border border-zinc-800 text-zinc-300 text-[11px]"
              >
                {policy}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-zinc-400 font-sans mt-0.5 leading-relaxed">
        Defensive security halt: execution was blocked before reaching the mock banking core to protect accounts against prompt hijacking or unauthorized financial transactions.
      </p>
    </div>
  );
}
