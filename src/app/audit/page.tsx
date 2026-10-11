"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { useFirewallSession } from "@/hooks/useFirewallSession";
import { AuditRecord } from "@/lib/audit/audit.store.service";
import { AuditDetailDrawer } from "@/components/dashboard/AuditDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  FileText,
  Search,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AuditPage() {
  const { history, clearSession } = useFirewallSession();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "APPROVED" | "BLOCKED">("ALL");
  const [selected, setSelected] = useState<AuditRecord | null>(null);

  const filtered = useMemo(() => {
    return history.filter((r) => {
      const matchFilter = filter === "ALL" || r.verdict === filter;
      const matchQuery =
        !query ||
        r.userInput.toLowerCase().includes(query.toLowerCase()) ||
        r.requestId.toLowerCase().includes(query.toLowerCase()) ||
        r.threatCategory.toLowerCase().includes(query.toLowerCase());
      return matchFilter && matchQuery;
    });
  }, [history, filter, query]);

  const handleExport = () => {
    window.open("/api/export", "_blank");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="size-5 text-white" />
              <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white uppercase">
                Forensics & Audit Trail
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-mono">
              Real-time immutable inspection log with threat signatures and layer-by-layer telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              aria-label="Export audit JSON"
              className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-white hover:text-black hover:border-white font-mono text-xs gap-1.5 h-9"
            >
              <Download className="size-3.5" />
              <span>Export JSON</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSession}
              disabled={history.length === 0}
              aria-label="Clear all audit records"
              className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white font-mono text-xs gap-1.5 h-9 disabled:opacity-40"
            >
              <Trash2 className="size-3.5" />
              <span>Clear</span>
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by prompt, request ID, or threat category..."
              className="pl-9 bg-zinc-950 border-zinc-800 text-xs font-mono text-white placeholder:text-zinc-600 focus-visible:ring-zinc-700"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-lg border border-zinc-800 self-start">
            {(["ALL", "APPROVED", "BLOCKED"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  filter === type
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Records List and Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-2">
            {filtered.length === 0 ? (
              <Card className="bg-zinc-950/40 border-zinc-850 p-8 text-center text-zinc-500 font-mono text-xs">
                No audit records found matching criteria. Submit prompts in the Console or run the Benchmark Lab.
              </Card>
            ) : (
              filtered.map((record) => {
                const isApproved = record.verdict === "APPROVED";
                const isSelected = selected?.requestId === record.requestId;
                return (
                  <div
                    key={record.requestId}
                    onClick={() => setSelected(record)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer font-mono text-xs flex flex-col gap-2 ${
                      isSelected
                        ? "bg-zinc-900 border-zinc-600 shadow-sm"
                        : "bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isApproved ? (
                          <CheckCircle2 className="size-4 text-white" />
                        ) : (
                          <AlertTriangle className="size-4 text-zinc-400" />
                        )}
                        <Badge
                          className={`text-[10px] font-mono px-2 py-0.5 ${
                            isApproved
                              ? "bg-white text-black font-semibold"
                              : "bg-zinc-900 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {record.verdict}
                        </Badge>
                        <span className="text-zinc-500 text-[11px]">{record.requestId}</span>
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        Risk: {(record.riskScore * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-zinc-200 line-clamp-2 font-mono text-[11px]">
                      &ldquo;{record.userInput}&rdquo;
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                      <span>Threat: {record.threatCategory}</span>
                      <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex flex-col gap-4">
            <AuditDetailDrawer selected={selected} />
          </div>
        </div>
      </main>
    </div>
  );
}
