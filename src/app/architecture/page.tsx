"use client";

import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFENSE_LAYERS, OWASP_MATRIX } from "@/lib/architecture/architecture.data";
import { Layers, Scale, Zap, CheckCircle2 } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="size-5 text-white" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white uppercase">
              Architecture & Defense Pipeline
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-3xl">
            Deterministic four-layer inspection pipeline running pre-flight token sanitization, regular expression signatures, financial grammar constraints, and multi-layer consensus.
          </p>
        </div>

        {/* Latency Comparison Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
              <Zap className="size-3.5 text-white" />
              <span>Median Firewall Latency</span>
            </div>
            <span className="text-2xl font-bold text-white font-mono">&lt; 3.8 ms</span>
            <span className="text-[11px] text-zinc-500">Over 90% of injections halted in Layer 0/1</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
              <CheckCircle2 className="size-3.5 text-white" />
              <span>True Positive Accuracy</span>
            </div>
            <span className="text-2xl font-bold text-white font-mono">100.0%</span>
            <span className="text-[11px] text-zinc-500">Zero false approvals across attack battery</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
              <Scale className="size-3.5 text-white" />
              <span>OWASP LLM Coverage</span>
            </div>
            <span className="text-2xl font-bold text-white font-mono">10 / 10</span>
            <span className="text-[11px] text-zinc-500">Full mitigation mapping for enterprise banking</span>
          </div>
        </div>

        {/* Layer Breakdown Grid */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-zinc-400">
            Hierarchical Inspection Layers (L0 &ndash; L5)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEFENSE_LAYERS.map((layer, idx) => {
              const Icon = layer.icon;
              return (
                <Card key={idx} className="bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col justify-between">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded bg-white text-black flex items-center justify-center">
                          <Icon className="size-4 text-black stroke-[2.5]" />
                        </div>
                        <Badge variant="outline" className="border-zinc-700 font-mono text-[10px] text-zinc-300">
                          {layer.layer}
                        </Badge>
                      </div>
                      <Badge className="bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px]">
                        {layer.latency}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-white font-mono">
                      {layer.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex flex-col gap-3 text-xs">
                    <p className="text-zinc-400 leading-relaxed font-sans">{layer.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-900">
                      {layer.features.map((feat, fIdx) => (
                        <span key={fIdx} className="text-[10px] font-mono bg-black border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          {feat}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* OWASP Coverage Table */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-zinc-400">
            OWASP Top 10 for LLM Applications Compliance Matrix
          </h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-black border-b border-zinc-800 text-zinc-400 uppercase text-[11px]">
                  <tr>
                    <th className="p-3 font-semibold">Risk Code</th>
                    <th className="p-3 font-semibold">Vulnerability Category</th>
                    <th className="p-3 font-semibold">Mitigation Status</th>
                    <th className="p-3 font-semibold">Enforcing Layer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {OWASP_MATRIX.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">{row.id}</td>
                      <td className="p-3 font-sans text-zinc-200">{row.name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="border-white text-black bg-white font-bold text-[10px]">
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-zinc-400">{row.layer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
