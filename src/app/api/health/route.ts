import { NextResponse } from "next/server";
import { BankingService } from "@/lib/banking/banking.service";

/**
 * GET /api/health
 * System health and firewall layer status monitor.
 */
export async function GET() {
  const checking = BankingService.getBalance("checking");
  const savings = BankingService.getBalance("savings");
  const credit = BankingService.getBalance("credit");

  return NextResponse.json(
    {
      status: "HEALTHY",
      service: "BankSim Blue-Team AI Firewall",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      layers: {
        layer0_normalizer: "ONLINE",
        layer1_pattern_detector: "ONLINE",
        layer2_semantic_classifier: process.env.GEMINI_API_KEY ? "ONLINE (LLM)" : "ONLINE (HEURISTIC_BACKUP)",
        layer3_intent_validator: "ONLINE",
        layer4_policy_engine: "ONLINE",
        layer5_verdict_assembler: "ONLINE",
      },
      bankingCore: {
        status: "ACTIVE",
        accounts: {
          checking: checking.formatted,
          savings: savings.formatted,
          credit: credit.formatted,
        },
      },
      database: {
        configured: Boolean(process.env.DATABASE_URL),
      },
    },
    { status: 200 },
  );
}
