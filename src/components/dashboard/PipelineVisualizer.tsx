"use client";

import React, { useState } from "react";
import {
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  Code2,
  Terminal,
  FileSearch,
  Scale,
  Banknote,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FirewallVerdictResponse } from "@/lib/firewall/types/verdict.types";
import { PipelineLayerDetail } from "./PipelineLayerDetails";

interface PipelineVisualizerProps {
  verdict: FirewallVerdictResponse | null;
}

export function PipelineVisualizer({ verdict }: PipelineVisualizerProps) {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);

  if (!verdict) return null;

  const { layerDetails } = verdict;
  const normalizerFlags = layerDetails?.normalizerFlags ?? [];
  const patternMatches = layerDetails?.patternMatches ?? [];
  const heuristicFlags = layerDetails?.heuristicFlags ?? [];
  const semantic = layerDetails?.semanticClassification ?? { category: "UNKNOWN", confidence: 0, reasoning: "" };
  const intentErrors = layerDetails?.intentValidationErrors ?? [];
  const policyTriggers = layerDetails?.policyTriggers ?? [];

  const l0Passed = true;
  const l1Passed = patternMatches.length === 0 && heuristicFlags.length === 0;
  const l2Passed = semantic.skipped === true || semantic.category === "BENIGN";
  const l3Passed = intentErrors.length === 0 && verdict.parsedIntent !== null;
  const l4Passed = policyTriggers.length === 0;
  const l5Approved = verdict.verdict === "APPROVED";

  const layers = [
    {
      index: 0,
      name: "Layer 0: Input Normalizer",
      subtitle: "NFKC, Homoglyphs & Nested Decoders",
      icon: Terminal,
      passed: l0Passed,
      badgeText: normalizerFlags.length > 0 ? `${normalizerFlags.length} Flags` : "Clean",
      badgeHighlight: normalizerFlags.length > 0,
    },
    {
      index: 1,
      name: "Layer 1: Pattern Detector",
      subtitle: "Regex Threats & Statistical Heuristics",
      icon: FileSearch,
      passed: l1Passed,
      badgeText: patternMatches.length > 0 ? `${patternMatches.length} Matches` : "0 Matches",
      badgeHighlight: !l1Passed,
    },
    {
      index: 2,
      name: "Layer 2: Semantic Classifier",
      subtitle: "LLM Intent & Zero-Shot Classification",
      icon: Code2,
      passed: l2Passed,
      badgeText: semantic.skipped ? "Skipped (Budget)" : semantic.category || "Evaluated",
      badgeHighlight: !l2Passed,
    },
    {
      index: 3,
      name: "Layer 3: Intent Parser & Validator",
      subtitle: "Banking Grammar & Financial Limits",
      icon: Banknote,
      passed: l3Passed,
      badgeText: verdict.parsedIntent ? verdict.parsedIntent.action : "UNKNOWN",
      badgeHighlight: !l3Passed,
    },
    {
      index: 4,
      name: "Layer 4: Deterministic Policy Engine",
      subtitle: "Deny-by-Default & Rate Limits",
      icon: Scale,
      passed: l4Passed,
      badgeText: l4Passed ? "Pass" : `${policyTriggers.length} Blocked`,
      badgeHighlight: !l4Passed,
    },
    {
      index: 5,
      name: "Layer 5: Mock Banking Core",
      subtitle: "Secure Financial Ledger Dispatch",
      icon: Shield,
      passed: l5Approved,
      badgeText: l5Approved ? "Executed" : "Halted",
      badgeHighlight: l5Approved,
    },
  ];

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-zinc-400" />
            <CardTitle className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
              Pipeline Defense Inspection (L0 - L5)
            </CardTitle>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Click layer to expand
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-2">
        {layers.map((layer) => {
          const isExpanded = expandedLayer === layer.index;

          return (
            <div
              key={layer.index}
              className={`rounded-lg border transition-all ${
                isExpanded
                  ? "bg-black border-zinc-700"
                  : "bg-black/40 border-zinc-800/80 hover:border-zinc-700"
              }`}
            >
              <button
                onClick={() => setExpandedLayer(isExpanded ? null : layer.index)}
                aria-expanded={isExpanded}
                aria-controls={`layer-detail-${layer.index}`}
                className="w-full flex items-center justify-between p-3 text-left focus:outline-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`size-5 rounded flex items-center justify-center shrink-0 ${
                      layer.passed
                        ? "bg-white text-black font-bold"
                        : "bg-zinc-900 border border-zinc-700 text-zinc-400"
                    }`}
                  >
                    {layer.passed ? (
                      <Check className="size-3.5 stroke-[3]" />
                    ) : (
                      <X className="size-3.5 stroke-[3]" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-zinc-200 font-mono truncate">
                      {layer.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono truncate">
                      {layer.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 ${
                      layer.badgeHighlight
                        ? "bg-white text-black border-white font-bold"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    {layer.badgeText}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="size-4 text-zinc-400" />
                  ) : (
                    <ChevronRight className="size-4 text-zinc-600" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div
                  id={`layer-detail-${layer.index}`}
                  className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/80"
                >
                  <PipelineLayerDetail verdict={verdict} index={layer.index} />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
