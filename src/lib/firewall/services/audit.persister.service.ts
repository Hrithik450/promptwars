import { db } from "../../db";
import { firewallLogs } from "../../drizzle/schema";
import { FirewallVerdictResponse } from "../types/verdict.types";

export class AuditPersisterService {
  static async persistAuditLog(
    verdict: FirewallVerdictResponse,
    rawInput: string,
    sessionId?: string,
  ): Promise<void> {
    if (!process.env.DATABASE_URL) return;

    await db.insert(firewallLogs).values({
      requestId: verdict.requestId,
      sessionId: sessionId || null,
      userInput: rawInput,
      sanitizedInput: verdict.inputSanitized,
      verdict: verdict.verdict,
      riskScore: verdict.riskScore.toFixed(2),
      riskLevel: verdict.riskLevel,
      threatCategory: verdict.threatCategory,
      explanation: verdict.explanation,
      parsedIntent: verdict.parsedIntent,
      layerDetails: verdict.layerDetails,
    });
  }
}
