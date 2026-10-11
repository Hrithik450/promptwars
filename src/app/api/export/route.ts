import { NextRequest, NextResponse } from "next/server";
import { AuditStoreService } from "@/lib/audit/audit.store.service";

/**
 * GET /api/export
 * Downloads the session's complete audit log as a formatted JSON attachment file.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || undefined;

  const history = AuditStoreService.getHistory(sessionId, 1000);
  const stats = AuditStoreService.getStats(sessionId);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    system: "BankSim Blue-Team AI Firewall",
    sessionId: sessionId || "all",
    summary: stats,
    records: history,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="banksim-firewall-audit-${Date.now()}.json"`,
    },
  });
}
