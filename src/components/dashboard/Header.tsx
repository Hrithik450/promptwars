"use client";

import React from "react";
import { Shield, Download, Trash2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionTrustInfo } from "@/lib/audit/audit.store.service";

interface HeaderProps {
  onOpenBenchmark: () => void;
  onClearSession: () => void;
  onExportAuditLog: () => void;
  totalRequests: number;
  trustInfo?: SessionTrustInfo;
}

export function Header({
  onOpenBenchmark,
  onClearSession,
  onExportAuditLog,
  totalRequests,
  trustInfo,
}: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-black/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="size-9 bg-white text-black rounded-lg flex items-center justify-center font-bold shadow-sm">
            <Shield className="size-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-white font-mono">
                BankSim
              </span>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] tracking-wider uppercase font-mono px-2 py-0.5"
              >
                Blue-Team AI Firewall
              </Badge>
              {trustInfo && (
                <Badge
                  className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 ${
                    trustInfo.trustLevel === "TRUSTED"
                      ? "bg-white text-black hover:bg-zinc-200"
                      : "bg-zinc-900 text-zinc-300 border border-zinc-700"
                  }`}
                >
                  {trustInfo.trustLevel} ({trustInfo.trustScore}%)
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
              <span>6-Layer Defense-in-Depth</span>
              <span>&bull;</span>
              <span>Deny-by-Default Architecture</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenBenchmark}
            className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-colors text-xs h-8 gap-1.5 font-mono"
          >
            <BarChart2 className="size-3.5" />
            <span>Benchmark</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportAuditLog}
            className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-colors text-xs h-8 gap-1.5 font-mono"
          >
            <Download className="size-3.5" />
            <span className="hidden md:inline">Export Audit</span>
            <span className="md:hidden">Export</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSession}
            disabled={totalRequests === 0}
            className="text-zinc-500 hover:text-white hover:bg-zinc-900 text-xs h-8 gap-1 font-mono disabled:opacity-40"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden md:inline">Clear</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
