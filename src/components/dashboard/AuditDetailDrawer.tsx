"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditRecord } from "@/lib/audit/audit.store.service";
import { Layers } from "lucide-react";

interface AuditDetailDrawerProps {
  selected: AuditRecord | null;
}

export function AuditDetailDrawer({ selected }: AuditDetailDrawerProps) {
  return (
    <Card className="bg-zinc-950 border-zinc-800 text-white sticky top-20">
      <CardHeader className="p-4 border-b border-zinc-850">
        <CardTitle className="text-sm font-mono uppercase tracking-wider flex items-center gap-2">
          <Layers className="size-4 text-white" />
          Forensic Inspector
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex flex-col gap-4 text-xs font-mono">
        {selected ? (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Raw Input</span>
              <p className="p-2.5 rounded bg-black border border-zinc-850 text-zinc-200 break-words text-[11px]">
                {selected.userInput}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Sanitized Input (L0)</span>
              <p className="p-2.5 rounded bg-black border border-zinc-850 text-zinc-400 break-words text-[11px]">
                {selected.sanitizedInput}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase text-zinc-500">Verdict Explanation</span>
              <p className="text-zinc-300 font-sans text-xs leading-relaxed">
                {selected.explanation}
              </p>
            </div>

            <div className="p-3 rounded bg-zinc-900 border border-zinc-800 flex justify-between items-center">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase">Risk Level</div>
                <div className="text-sm font-bold text-white">{selected.riskLevel}</div>
              </div>
              <Badge className="bg-white text-black font-bold">
                {(selected.riskScore * 100).toFixed(0)}% Score
              </Badge>
            </div>
          </>
        ) : (
          <p className="text-zinc-500 py-8 text-center">
            Select any record on the left to inspect layer telemetry and threat explanations.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
