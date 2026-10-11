import {
  DollarSign,
  KeyRound,
  ShieldAlert,
  Sliders,
  Lock,
  CheckCheck,
  LucideIcon,
} from "lucide-react";

export interface PolicyRule {
  id: string;
  name: string;
  category: "FINANCIAL" | "EXFILTRATION" | "RESILIENCE" | "TRUST";
  icon: LucideIcon;
  enforcement: "HARD_BLOCK" | "ISOLATION" | "DEGRADE_TRUST" | "FAIL_CLOSED";
  threshold: string;
  description: string;
  rationale: string;
}

export const GUARDRAIL_POLICIES: PolicyRule[] = [
  {
    id: "POL-01",
    name: "Transaction Value Ceiling",
    category: "FINANCIAL",
    icon: DollarSign,
    enforcement: "HARD_BLOCK",
    threshold: "$10,000.00 USD",
    description: "Rejects any transfer request where the parsed amount exceeds the authorized single-transaction threshold.",
    rationale: "Prevents excessive agency and unauthorized asset draining via prompt manipulation.",
  },
  {
    id: "POL-02",
    name: "Canary Secret Protection",
    category: "EXFILTRATION",
    icon: KeyRound,
    enforcement: "HARD_BLOCK",
    threshold: "Token: ZEBRA-7742",
    description: "Scans all outputs and inputs for the internal canary secret token. Blocks exfiltration attempts instantly.",
    rationale: "Detects system prompt leaking and multi-turn indirect jailbreaks attempting credential harvesting.",
  },
  {
    id: "POL-03",
    name: "Transfer Memo Quarantine",
    category: "FINANCIAL",
    icon: Lock,
    enforcement: "ISOLATION",
    threshold: "Raw string sanitization",
    description: "Quarantines payment descriptions and transaction memos, stripping nested control characters and command grammar.",
    rationale: "Mitigates indirect prompt injection via user-supplied invoice comments or recipient metadata.",
  },
  {
    id: "POL-04",
    name: "Adaptive Session Scrutiny",
    category: "TRUST",
    icon: Sliders,
    enforcement: "DEGRADE_TRUST",
    threshold: "3 consecutive violations",
    description: "Dynamically escalates firewall sensitivity from STANDARD to MAXIMUM scrutiny upon repeated hostile injections.",
    rationale: "Thwarts automated red-teaming fuzzers and attacker brute-force variation sweeps.",
  },
  {
    id: "POL-05",
    name: "Fail-Closed Downstream Policy",
    category: "RESILIENCE",
    icon: ShieldAlert,
    enforcement: "FAIL_CLOSED",
    threshold: "Timeout >= 2000ms / 5xx",
    description: "If downstream reasoning models or external APIs fail or timeout, the transaction safely defaults to BLOCKED.",
    rationale: "Guarantees that network degradation or denial-of-service cannot bypass firewall evaluation.",
  },
  {
    id: "POL-06",
    name: "Strict Grammar Allowlisting",
    category: "FINANCIAL",
    icon: CheckCheck,
    enforcement: "HARD_BLOCK",
    threshold: "BNF slot validation",
    description: "Requires all banking operations to parse into strictly verified AST slots (intent, amount, recipient, account).",
    rationale: "Eliminates ambiguous natural language interpretations that could execute unintended side effects.",
  },
];
