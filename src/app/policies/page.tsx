"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GUARDRAIL_POLICIES } from "@/lib/policies/policies.data";
import { Shield, Filter, CheckCircle2, Lock } from "lucide-react";

export default function PoliciesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const categories = ["ALL", "FINANCIAL", "EXFILTRATION", "RESILIENCE", "TRUST"];

  const filteredPolicies =
    selectedCategory === "ALL"
      ? GUARDRAIL_POLICIES
      : GUARDRAIL_POLICIES.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Lock className="size-5 text-white" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white uppercase">
              Financial Guardrails & Policy Matrix
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-3xl">
            Deterministic rule specifications governing autonomous agent actions, secret tokens, and asset transfer limits.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 mr-2">
            <Filter className="size-3.5" />
            <span>Scope:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolicies.map((policy) => {
            const Icon = policy.icon;
            return (
              <Card
                key={policy.id}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col justify-between"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded bg-white text-black flex items-center justify-center">
                        <Icon className="size-4 text-black stroke-[2.5]" />
                      </div>
                      <Badge variant="outline" className="border-zinc-700 font-mono text-[10px] text-zinc-300">
                        {policy.id}
                      </Badge>
                    </div>
                    <Badge className="bg-zinc-900 border border-zinc-800 text-white font-mono text-[10px]">
                      {policy.enforcement}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-semibold text-white font-mono">
                    {policy.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 pt-2 flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-black border border-zinc-900 font-mono text-[11px]">
                    <span className="text-zinc-500">Threshold:</span>
                    <span className="text-white font-semibold">{policy.threshold}</span>
                  </div>

                  <p className="text-zinc-300 leading-relaxed font-sans">{policy.description}</p>

                  <div className="p-2.5 rounded bg-zinc-900/50 border border-zinc-850 flex flex-col gap-1 text-[11px]">
                    <span className="text-zinc-500 font-mono uppercase text-[9px] tracking-wider">
                      Security Rationale
                    </span>
                    <span className="text-zinc-400 font-sans">{policy.rationale}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guardrail Policy Architecture Summary */}
        <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center shrink-0">
              <Shield className="size-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white font-mono">
                Multi-Layer Policy Enforcement
              </h3>
              <p className="text-xs text-zinc-400 font-sans mt-0.5">
                Every policy is verified deterministically in Layer 4 prior to model execution. Zero transactions bypass boundary checks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-300 bg-black px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
            <CheckCircle2 className="size-4 text-white" />
            <span>All 6 Rules Enforced</span>
          </div>
        </div>
      </main>
    </div>
  );
}
