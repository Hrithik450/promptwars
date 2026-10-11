"use client";

import { Badge } from "@/components/ui/badge";
import { FirewallVerdictResponse } from "@/lib/firewall/types/verdict.types";

interface LayerDetailProps {
  verdict: FirewallVerdictResponse;
  index: number;
}

export function PipelineLayerDetail({ verdict, index }: LayerDetailProps) {
  const { layerDetails, executionResult, inputSanitized } = verdict;
  const normalizerFlags = layerDetails?.normalizerFlags ?? [];
  const patternMatches = layerDetails?.patternMatches ?? [];
  const heuristicFlags = layerDetails?.heuristicFlags ?? [];
  const semantic = layerDetails?.semanticClassification ?? { category: "UNKNOWN", confidence: 0, reasoning: "" };
  const intentErrors = layerDetails?.intentValidationErrors ?? [];
  const policyTriggers = layerDetails?.policyTriggers ?? [];

  switch (index) {
    case 0:
      return (
        <div className="flex flex-col gap-2 font-mono text-xs">
          <div>
            <span className="text-zinc-500">Sanitized Output: </span>
            <span className="text-white bg-black px-2 py-0.5 rounded border border-zinc-800 break-all">{inputSanitized}</span>
          </div>
          {normalizerFlags.length > 0 && (
            <div>
              <span className="text-zinc-500">Normalization Flags: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {normalizerFlags.map((flag, idx) => (
                  <Badge key={idx} variant="outline" className="border-zinc-700 bg-black text-zinc-300 font-mono text-[10px]">{flag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 1:
      return (
        <div className="flex flex-col gap-2 font-mono text-xs">
          {patternMatches.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-400 font-semibold font-mono">Matched Threats:</span>
              {patternMatches.map((match, idx) => (
                <div key={idx} className="p-2.5 rounded bg-black border border-zinc-800 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">{match.patternId}</span>
                    <span className="text-[10px] text-zinc-400">Severity: {match.severity}</span>
                  </div>
                  <span className="text-zinc-400 text-[11px]">{match.description}</span>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Triggered text: <code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-700">{match.matchedText}</code>
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
                  <Badge key={idx} variant="outline" className="border-zinc-700 bg-black text-zinc-300 font-mono text-[10px]">{flag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case 2:
      return (
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
              <p className="text-zinc-300 font-sans mt-0.5 leading-relaxed bg-black p-2.5 rounded border border-zinc-800">{semantic.reasoning}</p>
            </div>
          )}
          {semantic.skipped && (
            <p className="text-zinc-500 text-[11px]">
              Token budget optimization: Skipped LLM roundtrip because Layer 1 already detected a high-confidence critical threat.
            </p>
          )}
        </div>
      );

    case 3:
      return (
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
                <div key={idx} className="px-2 py-1 bg-black border border-zinc-700 rounded text-zinc-300 text-[11px]">
                  <span className="font-bold">[{err.rule}]</span> {err.message}
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 4:
      return (
        <div className="flex flex-col gap-2 font-mono text-xs">
          {policyTriggers.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-zinc-400 font-semibold font-mono">Triggered Rules:</span>
              {policyTriggers.map((policy, idx) => (
                <div key={idx} className="px-2.5 py-1.5 bg-black border border-zinc-700 rounded text-zinc-200">
                  <span className="font-bold">{policy}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-zinc-400">Passed all deterministic rules (DENY_BY_DEFAULT, LIMITS, CONSENSUS).</span>
          )}
        </div>
      );

    case 5:
      return (
        <div className="flex flex-col gap-2 font-mono text-xs">
          {executionResult ? (
            <div className="bg-black border border-zinc-800 p-3 rounded flex flex-col gap-1">
              <span className="text-white font-bold">Operation Executed</span>
              <p className="text-zinc-300 font-sans">{executionResult.message}</p>
              {Boolean(executionResult.data) && (
                <div className="mt-1 text-zinc-500 text-[11px]">Data: {JSON.stringify(executionResult.data)}</div>
              )}
            </div>
          ) : (
            <span className="text-zinc-500 font-sans">
              Execution prevented. The Mock Banking Core will never run unauthorized or blocked requests.
            </span>
          )}
        </div>
      );

    default:
      return null;
  }
}
