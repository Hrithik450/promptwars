import {
  Terminal,
  FileSearch,
  Code2,
  Banknote,
  Scale,
  Shield,
  LucideIcon,
} from "lucide-react";

export interface DefenseLayer {
  layer: string;
  name: string;
  icon: LucideIcon;
  latency: string;
  type: string;
  description: string;
  features: string[];
}

export const DEFENSE_LAYERS: DefenseLayer[] = [
  {
    layer: "Layer 0",
    name: "Input Normalizer & Unicode Sanitizer",
    icon: Terminal,
    latency: "< 0.8ms",
    type: "Deterministic",
    description:
      "Performs NFKC decomposition, zero-width character stripping, homoglyphic lookalike conversion, recursive base64/URL decoding, and markdown syntax flattening.",
    features: ["Zero-width stripping", "Cyrillic & Greek homoglyphs", "Nested decoders (depth 3)", "Leet reversal"],
  },
  {
    layer: "Layer 1",
    name: "Regex Pattern Detector & Heuristics",
    icon: FileSearch,
    latency: "< 1.2ms",
    type: "Deterministic",
    description:
      "Evaluates high-entropy exploit signatures (DAN, Developer Mode, System Prompt overrides) and statistical heuristics including special character density and instruction ratios.",
    features: ["35+ Jailbreak regexes", "Instruction-to-data ratio", "Special character density", "Contradiction detector"],
  },
  {
    layer: "Layer 2",
    name: "Adversarial Semantic Intent Classifier",
    icon: Code2,
    latency: "1.5 - 2.8ms",
    type: "Hybrid Neural",
    description:
      "Dual-threshold semantic reasoning parser distinguishing authentic financial operations from conversational evasion, with token-budget optimization skipping.",
    features: ["Dual confidence calibration", "Zero-shot classification", "Skip threshold >= 0.85", "Fail-closed fallback"],
  },
  {
    layer: "Layer 3",
    name: "Banking Grammar & Limit Validator",
    icon: Banknote,
    latency: "< 0.5ms",
    type: "Grammar Engine",
    description:
      "Validates structured banking intents (transfers, balances, history) and isolates untrusted fields such as transfer memos from downstream instruction injection.",
    features: ["Deterministic slots", "Memo injection quarantine", "Ambiguity penalties", "Action mapping"],
  },
  {
    layer: "Layer 4",
    name: "Policy Consensus & DLP Engine",
    icon: Scale,
    latency: "< 0.4ms",
    type: "Deterministic Guardrails",
    description:
      "Enforces strict financial guardrails: hard $10,000 transaction ceiling, canary token exfiltration checks (ZEBRA-7742), rate throttles, and multi-layer agreement.",
    features: ["$10,000 transaction cap", "Canary leakage blocking", "Sliding window rate-limiter", "Multi-layer consensus"],
  },
  {
    layer: "Layer 5",
    name: "Autonomous Banking Core & Model Router",
    icon: Shield,
    latency: "Real-time",
    type: "Ledger Dispatch",
    description:
      "Safe transactional execution ledger and Gemini AI model router. Dispatches approved operations while ensuring blocked threats never touch banking APIs.",
    features: ["Isolated mock ledger", "Gemini 20-turn context", "Balance updates", "Immutable audit store"],
  },
];

export interface OwaspRow {
  id: string;
  name: string;
  status: string;
  layer: string;
}

export const OWASP_MATRIX: OwaspRow[] = [
  { id: "LLM01", name: "Prompt Injection", status: "Protected", layer: "L0, L1, L2" },
  { id: "LLM02", name: "Insecure Output Handling", status: "Protected", layer: "L4 (DLP)" },
  { id: "LLM03", name: "Training Data Poisoning", status: "Mitigated", layer: "Pre-flight" },
  { id: "LLM04", name: "Model Denial of Service", status: "Protected", layer: "L0, L4 (Rate)" },
  { id: "LLM05", name: "Supply Chain Vulnerabilities", status: "Protected", layer: "Architecture" },
  { id: "LLM06", name: "Sensitive Information Disclosure", status: "Protected", layer: "L4 (Canary)" },
  { id: "LLM07", name: "Insecure Plugin Design", status: "Protected", layer: "L3, L5" },
  { id: "LLM08", name: "Excessive Agency", status: "Protected", layer: "L4 ($10K Cap)" },
  { id: "LLM09", name: "Overreliance", status: "Protected", layer: "L4 (Consensus)" },
  { id: "LLM10", name: "Model Theft & Exfiltration", status: "Protected", layer: "L1, L2" },
];
