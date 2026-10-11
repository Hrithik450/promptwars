import { NextRequest, NextResponse } from "next/server";
import { FirewallOrchestratorService } from "@/lib/firewall/services/firewall.orchestrator.service";
import { FirewallVerdictResponse } from "@/lib/firewall/types/verdict.types";

/**
 * POST /api/analyze
 * Primary AI Firewall inspection endpoint.
 *
 * Request body:
 * {
 *   "user_input": "Transfer $50 to alice", // or "userInput"
 *   "session_id": "optional-session-id"     // or "sessionId"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          error: "Invalid JSON request body. Expected { user_input: string }.",
        },
        { status: 400 },
      );
    }

    const rawInput = body.user_input ?? body.userInput;
    const sessionId = body.session_id ?? body.sessionId;

    if (typeof rawInput !== "string" || !rawInput.trim()) {
      return NextResponse.json(
        {
          error: "Missing or invalid 'user_input' parameter. Must be a non-empty string.",
        },
        { status: 400 },
      );
    }

    const verdict = await FirewallOrchestratorService.analyze(rawInput, {
      sessionId: typeof sessionId === "string" ? sessionId : undefined,
    });

    return NextResponse.json(verdict, { status: 200 });
  } catch (error) {
    // FAIL CLOSED: If any unhandled exception occurs in the pipeline, fail closed.
    const failureFallback: FirewallVerdictResponse = {
      requestId: `err_${Date.now()}`,
      timestamp: new Date().toISOString(),
      verdict: "BLOCKED",
      riskScore: 1.0,
      riskLevel: "CRITICAL",
      threatCategory: "POLICY_VIOLATION",
      explanation: "Firewall exception occurred. Access denied under fail-closed security policy.",
      inputSanitized: "",
      parsedIntent: null,
      layerDetails: {
        normalizerFlags: ["FAIL_CLOSED_EXCEPTION"],
        patternMatches: [],
        heuristicFlags: ["SYSTEM_EXCEPTION"],
        semanticClassification: {
          category: "SYSTEM_EXCEPTION",
          confidence: 1.0,
          reasoning: error instanceof Error ? error.message : "Internal error",
        },
        intentValidationErrors: [
          {
            rule: "FAIL_CLOSED",
            message: "Firewall execution failed.",
            severity: "BLOCK",
          },
        ],
        policyTriggers: ["DENY_BY_DEFAULT"],
      },
    };

    return NextResponse.json(failureFallback, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "BankSim AI Firewall Analyze API. Send POST requests with { user_input: string }.",
      endpoints: {
        analyze: "POST /api/analyze",
        health: "GET /api/health",
        stats: "GET /api/stats",
        export: "GET /api/export",
      },
    },
    { status: 200 },
  );
}
