"use client";

import React from "react";
import { Activity, ShieldCheck, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AggregateStats } from "@/lib/audit/audit.store.service";

interface SessionStatsCardProps {
  stats: AggregateStats;
}

export function SessionStatsCard({ stats }: SessionStatsCardProps) {
  const threats = Object.entries(stats.threatBreakdown || {});

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-zinc-400" />
            <CardTitle className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
              Session Telemetry
            </CardTitle>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Avg Risk: {stats.averageRiskScore.toFixed(2)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-3">
        {/* Metric Tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg bg-black border border-zinc-800 flex flex-col gap-1">
            <span className="text-zinc-500 text-[11px] font-mono">Requests</span>
            <span className="text-lg font-bold text-white font-mono">
              {stats.totalRequests}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">Session total</span>
          </div>

          <div className="p-3 rounded-lg bg-black border border-zinc-800 flex flex-col gap-1">
            <span className="text-zinc-400 text-[11px] font-mono">Approved</span>
            <span className="text-lg font-bold text-white font-mono">
              {stats.approvedCount}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {stats.approvalRate}% Rate
            </span>
          </div>

          <div className="p-3 rounded-lg bg-black border border-zinc-800 flex flex-col gap-1">
            <span className="text-zinc-400 text-[11px] font-mono">Blocked</span>
            <span className="text-lg font-bold text-white font-mono">
              {stats.blockedCount}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {stats.blockRate}% Rate
            </span>
          </div>
        </div>

        {/* Adaptive Trust Bar */}
        {stats.trustInfo && (
          <div className="bg-black border border-zinc-800/80 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="size-3.5 text-zinc-400" />
                Session Reputation:
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                  stats.trustInfo.trustLevel === "TRUSTED"
                    ? "bg-white text-black font-bold border-white"
                    : "bg-zinc-900 border-zinc-700 text-zinc-300"
                }`}
              >
                {stats.trustInfo.trustScore}% &bull; {stats.trustInfo.trustLevel}
              </Badge>
            </div>

            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500 rounded-full"
                style={{ width: `${stats.trustInfo.trustScore}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>Consecutive Blocks: {stats.trustInfo.consecutiveBlocks}</span>
              <span>Scrutiny: {stats.trustInfo.adaptiveScrutiny}</span>
            </div>
          </div>
        )}

        {/* Threat Distribution Badges */}
        {threats.length > 0 && (
          <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800/80">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Flame className="size-3 text-zinc-500" />
              Intercepted Threat Vectors:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {threats.map(([category, count]) => (
                <div
                  key={category}
                  className="px-2 py-0.5 rounded bg-black border border-zinc-800 text-zinc-300 text-[11px] font-mono flex items-center gap-1.5"
                >
                  <span>{category}</span>
                  <span className="size-4 rounded bg-zinc-900 border border-zinc-700 text-white text-[10px] flex items-center justify-center font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
