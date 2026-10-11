"use client";

import React from "react";
import { Check, X, ShieldAlert, Hash, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FirewallVerdictResponse } from "@/lib/firewall/types/verdict.types";
import { InterceptionDiagnostics } from "./InterceptionDiagnostics";

interface VerdictPanelProps {
  verdict: FirewallVerdictResponse | null;
  isLoading: boolean;
}

export function VerdictPanel({ verdict, isLoading }: VerdictPanelProps) {
  if (isLoading) {
    return (
      <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 min-h-[220px] flex flex-col items-center justify-center shadow-xl">
        <div className="size-6 border-2 border-zinc-700 border-t-white rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono text-zinc-400">
          Running 6-layer defense pipeline...
        </span>
      </Card>
    );
  }

  if (!verdict) {
    return (
      <Card className="bg-zinc-950/60 border-zinc-800 border-dashed text-zinc-400 min-h-[220px] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="size-8 text-zinc-600 mb-2" />
        <CardTitle className="text-sm font-mono text-zinc-300">
          Pipeline Standing By
        </CardTitle>
        <p className="text-xs text-zinc-500 font-mono mt-1 max-w-sm">
          Submit a query or click any test scenario to inspect execution.
        </p>
      </Card>
    );
  }

  const isApproved = verdict.verdict === "APPROVED";
  const risk = Math.min(1.0, Math.max(0, verdict.riskScore));
  const riskPercent = Math.round(risk * 100);

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`size-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                isApproved
                  ? "bg-white text-black shadow-sm"
                  : "bg-black border border-white/40 text-white"
              }`}
            >
              {isApproved ? (
                <Check className="size-5 stroke-[3]" />
              ) : (
                <X className="size-5 stroke-[3]" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold font-mono tracking-tight text-white">
                  {verdict.verdict}
                </span>
                <Badge
                  className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                    isApproved
                      ? "bg-white text-black hover:bg-zinc-200 font-bold"
                      : "bg-zinc-900 border border-zinc-700 text-zinc-300 font-semibold"
                  }`}
                >
                  {verdict.riskLevel} RISK
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {isApproved
                  ? "All layers passed. Forwarded to mock banking ledger."
                  : "Security threat intercepted. Execution halted."}
              </p>
            </div>
          </div>

          {verdict.threatCategory && verdict.threatCategory !== "NONE" && (
            <Badge
              variant="outline"
              className="border-zinc-700 bg-black text-zinc-200 text-xs font-mono font-semibold px-2.5 py-1"
            >
              {verdict.threatCategory}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-4">
        <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
              Composite Risk Score:
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-white">
                {verdict.riskScore.toFixed(2)}
              </span>
              <span className="text-zinc-500 text-[11px]">/ 1.00 ({riskPercent}%)</span>
            </div>
          </div>

          <div
            role="progressbar"
            aria-valuenow={riskPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Composite Risk Score: ${riskPercent} percent`}
            className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(4, riskPercent)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-black border border-zinc-800/80 text-xs font-mono flex flex-col gap-1.5">
          <span className="text-zinc-400 font-semibold uppercase text-[11px] tracking-wider">
            Firewall Rationale:
          </span>
          <p className="text-zinc-300 leading-relaxed font-sans text-xs">
            {verdict.explanation}
          </p>
        </div>

        {isApproved && verdict.executionResult && verdict.executionResult.message && (
          <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-700/90 text-xs font-mono flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                Sentinel AI Assistant Response
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black border border-zinc-700 text-zinc-300 font-mono">
                Gemini 2.5 Multi-Turn
              </span>
            </div>
            <p className="text-zinc-200 font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-wrap pt-0.5">
              {verdict.executionResult.message}
            </p>
          </div>
        )}

        {!isApproved && <InterceptionDiagnostics layerDetails={verdict.layerDetails} />}

        <Separator className="bg-zinc-800/80" />

        <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1">
            <Hash className="size-3 text-zinc-600" />
            {verdict.requestId.slice(0, 16)}...
          </span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 text-zinc-600" />
            {new Date(verdict.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
