export interface ApiEndpointDoc {
  method: "POST" | "GET" | "DELETE";
  path: string;
  title: string;
  description: string;
  curl: string;
  response: string;
}

export const API_ENDPOINTS: ApiEndpointDoc[] = [
  {
    method: "POST",
    path: "/api/analyze",
    title: "Inspect Input Prompt",
    description: "Runs full multi-layer defense pipeline (L0-L5) on untrusted user prompt and executes verified banking action if approved.",
    curl: `curl -X POST https://bank-ai-firewall.internal/api/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_input": "Transfer $500 to Alice for invoice #44",
    "session_id": "session_user_01"
  }'`,
    response: `{
  "requestId": "req_1728649200",
  "verdict": "APPROVED",
  "riskScore": 0.05,
  "riskLevel": "NONE",
  "threatCategory": "BENIGN",
  "explanation": "Authentic wire transfer within $10,000 threshold.",
  "parsedIntent": {
    "action": "TRANSFER",
    "amount": 500,
    "recipient": "Alice"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/stats",
    title: "Session Analytics & Metrics",
    description: "Retrieves aggregate telemetry, trust scores, approval rates, and threat distribution for the active session.",
    curl: `curl -X GET "https://bank-ai-firewall.internal/api/stats?limit=50"`,
    response: `{
  "totalRequests": 42,
  "approvedCount": 38,
  "blockedCount": 4,
  "approvalRate": 0.905,
  "averageRiskScore": 0.12,
  "trustInfo": {
    "trustScore": 100,
    "trustLevel": "TRUSTED"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/export",
    title: "Audit Forensics Export",
    description: "Downloads the complete cryptographic audit ledger with all input variations, normalized strings, and layer details as JSON.",
    curl: `curl -O -J "https://bank-ai-firewall.internal/api/export"`,
    response: `{
  "exportedAt": "2026-10-11T12:00:00.000Z",
  "system": "BankSim Blue-Team AI Firewall",
  "records": [...]
}`,
  },
  {
    method: "GET",
    path: "/api/health",
    title: "System Health & Uptime",
    description: "Returns health status, uptime, latency SLA, and database connection state.",
    curl: `curl -X GET "https://bank-ai-firewall.internal/api/health"`,
    response: `{
  "status": "healthy",
  "pipelineVersion": "2.4.0",
  "medianLatencyMs": 3.8,
  "activeLayers": 6
}`,
  },
];
