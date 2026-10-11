"use client";

import React from "react";
import { History, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditRecord } from "@/lib/audit/audit.store.service";

interface HistoryLogProps {
  history: AuditRecord[];
  onSelectRecord: (record: AuditRecord) => void;
  selectedRequestId?: string;
}

export function HistoryLog({
  history,
  onSelectRecord,
  selectedRequestId,
}: HistoryLogProps) {
  if (history.length === 0) {
    return (
      <Card className="bg-zinc-950/60 border-zinc-800 border-dashed text-zinc-400 min-h-[140px] flex flex-col items-center justify-center p-6 text-center">
        <History className="size-5 text-zinc-600 mb-1.5" />
        <CardTitle className="text-xs font-mono text-zinc-300">
          No Audit History
        </CardTitle>
        <span className="text-[11px] text-zinc-600 font-mono">
          Past inspection verdicts will be listed here.
        </span>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="size-4 text-zinc-400" />
            <CardTitle className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
              Audit Trail ({history.length})
            </CardTitle>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Click row to inspect
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
          {history.map((record) => {
            const isApproved = record.verdict === "APPROVED";
            const isSelected = selectedRequestId === record.requestId;

            return (
              <button
                key={record.requestId}
                onClick={() => onSelectRecord(record)}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left border transition-all text-xs font-mono group ${
                  isSelected
                    ? "bg-zinc-900 border-zinc-600 shadow-sm"
                    : "bg-black border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`size-1.5 rounded-full shrink-0 ${
                      isApproved ? "bg-white" : "bg-zinc-600"
                    }`}
                  />
                  <span className="truncate text-zinc-300 group-hover:text-white flex-1 font-sans">
                    {record.userInput}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-mono uppercase px-1.5 py-0 ${
                      isApproved
                        ? "bg-white text-black font-bold border-white"
                        : "bg-black border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {record.verdict}
                  </Badge>

                  <span className="text-[11px] font-bold text-white font-mono">
                    {record.riskScore.toFixed(2)}
                  </span>

                  <ArrowRight className="size-3 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
