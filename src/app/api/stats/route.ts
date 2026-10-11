import { NextRequest, NextResponse } from "next/server";
import { AuditStoreService } from "@/lib/audit/audit.store.service";

/**
 * GET /api/stats
 * Aggregate metrics and session threat distribution.
 *
 * Query params:
 * ?sessionId=<string> - optional session filter
 * ?limit=<number>     - optional history length limit (default 20)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId") || undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(100, Math.max(1, parseInt(limitParam, 10))) : 20;

  const stats = AuditStoreService.getStats(sessionId);
  const history = AuditStoreService.getHistory(sessionId, limit);

  return NextResponse.json(
    {
      ...stats,
      recentHistory: history,
      timestamp: new Date().toISOString(),
    },
    { status: 200 },
  );
}

/**
 * DELETE /api/stats
 * Resets in-memory stats (useful for demos or testing).
 */
export async function DELETE() {
  AuditStoreService.clear();
  return NextResponse.json({ message: "Audit history cleared successfully." });
}
