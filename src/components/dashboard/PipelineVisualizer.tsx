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

interface PipelineVisualizerProps {
  verdict: FirewallVerdictResponse | null;
}

export function PipelineVisualizer({ verdict }: PipelineVisualizerProps) {
  const [expandedLayer, setExpandedLayer] = useState<number | null>(null);

  if (!verdict) return null;

  const { layerDetails, executionResult, inputSanitized } = verdict;

  const normalizerFlags = (layerDetails.normalizerFlags as string[]) || [];
  const patternMatches = (layerDetails.patternMatches as any[]) || [];
  const heuristicFlags = (layerDetails.heuristicFlags as string[]) || [];
  const semantic = (layerDetails.semanticClassification as any) || {};
  const intentErrors = (layerDetails.intentValidationErrors as any[]) || [];
  const policyTriggers = (layerDetails.policyTriggers as string[]) || [];

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
      content: (
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div>
            <span className="text-zinc-500">Sanitized Output: </span>
            <span className="text-white bg-black px-2 py-0.5 rounded border border-zinc-800 break-all">
              {inputSanitized}
            </span>
          </div>
          {normalizerFlags.length > 0 && (
            <div>
              <span className="text-zinc-500">Normalization Flags: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {normalizerFlags.map((flag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-zinc-700 bg-black text-zinc-300 font-mono text-[10px]"
                  >
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      index: 1,
      name: "Layer 1: Pattern Detector",
      subtitle: "Regex Threats & Statistical Heuristics",
      icon: FileSearch,
      passed: l1Passed,
      badgeText: patternMatches.length > 0 ? `${patternMatches.length} Matches` : "0 Matches",
      badgeHighlight: !l1Passed,
      content: (
        <div className="flex flex-col gap-2 font-mono text-xs">
          {patternMatches.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-400 font-semibold font-mono">Matched Threats:</span>
              {patternMatches.map((match, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-black border border-zinc-800 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">{match.patternId}</span>
                    <span className="text-[10px] text-zinc-400">Severity: {match.severity}</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">{match.description}</span>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Triggered text:{" "}
                    <code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-700">
                      {match.matchedText}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-zinc-400">No malicious patterns detected.</span>
          )}

          {heuristicFlags.length > 0 && (
            <div className="mt-1">
              <span className="text-zinc-500">Heuristic Flags: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {heuristicFlags.map((flag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-zinc-700 bg-black text-zinc-300 font-mono text-[10px]"
                  >
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      index: 2,
      name: "Layer 2: Semantic Classifier",
      subtitle: "LLM Intent & Zero-Shot Classification",
      icon: Code2,
      passed: l2Passed,
      badgeText: semantic.skipped ? "Skipped (Budget)" : semantic.category || "Evaluated",
      badgeHighlight: !l2Passed,
      content: (
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Category: </span>
            <span className="font-bold text-white">{semantic.category || "N/A"}</span>
            <span className="text-zinc-500">Confidence: </span>
            <span className="text-zinc-300">{semantic.confidence ?? "1.00"}</span>
          </div>
          {semantic.reasoning && (
            <div>
              <span className="text-zinc-500">Reasoning: </span>
              <p className="text-zinc-300 font-sans mt-0.5 leading-relaxed bg-black p-2.5 rounded border border-zinc-800">
                {semantic.reasoning}
              </p>
            </div>
          )}
          {semantic.skipped && (
            <p className="text-zinc-500 text-[11px]">
              Token budget optimization: Skipped LLM roundtrip because Layer 1 already detected a high-confidence critical threat.
            </p>
          )}
        </div>
      ),
    },
    {
      index: 3,
      name: "Layer 3: Intent Parser & Validator",
      subtitle: "Banking Grammar & Financial Limits",
      icon: Banknote,
      passed: l3Passed,
      badgeText: verdict.parsedIntent ? verdict.parsedIntent.action : "UNKNOWN",
      badgeHighlight: !l3Passed,
      content: (
        <div className="flex flex-col gap-2 font-mono text-xs">
          {verdict.parsedIntent ? (
            <div className="bg-black p-2.5 rounded border border-zinc-800 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Action:</span>
                <span className="text-white font-bold">{verdict.parsedIntent.action}</span>
              </div>
              <div className="text-zinc-400">
                <span className="text-zinc-500">Params: </span>
                <span>{JSON.stringify(verdict.parsedIntent.params)}</span>
              </div>
            </div>
          ) : (
            <span className="text-zinc-400">No banking intent recognized.</span>
          )}

          {intentErrors.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-zinc-400 font-semibold font-mono">Validation Errors:</span>
              {intentErrors.map((err, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 bg-black border border-zinc-700 rounded text-zinc-300 text-[11px]"
                >
                  <span className="font-bold">[{err.rule}]</span> {err.message}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      index: 4,
      name: "Layer 4: Deterministic Policy Engine",
      subtitle: "Deny-by-Default & Rate Limits",
      icon: Scale,
      passed: l4Passed,
      badgeText: l4Passed ? "Pass" : `${policyTriggers.length} Blocked`,
      badgeHighlight: !l4Passed,
      content: (
        <div className="flex flex-col gap-2 font-mono text-xs">
          {policyTriggers.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-400 font-semibold font-mono">Triggered Rules:</span>
              {policyTriggers.map((policy, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 bg-black border border-zinc-700 rounded text-zinc-200"
                >
                  <span className="font-bold">{policy}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-zinc-400">
              Passed all deterministic rules (DENY_BY_DEFAULT, LIMITS, CONSENSUS).
            </span>
          )}
        </div>
      ),
    },
    {
      index: 5,
      name: "Layer 5: Mock Banking Core",
      subtitle: "Secure Financial Ledger Dispatch",
      icon: Shield,
      passed: l5Approved,
      badgeText: l5Approved ? "Executed" : "Halted",
      badgeHighlight: l5Approved,
      content: (
        <div className="flex flex-col gap-2 font-mono text-xs">
          {executionResult ? (
            <div className="bg-black border border-zinc-800 p-3 rounded flex flex-col gap-1">
              <span className="text-white font-bold">
                Operation Executed
              </span>
              <p className="text-zinc-300 font-sans">{executionResult.message}</p>
              {Boolean(executionResult.data) && (
                <div className="mt-1 text-zinc-500 text-[11px]">
                  Data: {JSON.stringify(executionResult.data)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-zinc-500 font-sans">
              Execution prevented. The Mock Banking Core will never run unauthorized or blocked requests.
            </span>
          )}
        </div>
      ),
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
                <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-800/80">
                  {layer.content}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
