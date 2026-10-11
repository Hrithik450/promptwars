import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  FileSearch,
  Code2,
  Banknote,
  Scale,
  Shield,
  ArrowRight,
} from "lucide-react";

const PILLARS = [
  {
    icon: Terminal,
    layer: "Layer 0",
    name: "Pre-Flight Unicode & NFKC Normalizer",
    latency: "< 0.8ms",
    description: "Eliminates zero-width invisible payloads, Cyrillic homoglyphs, nested base64/URL decoders, and markdown jailbreak masks.",
  },
  {
    icon: FileSearch,
    layer: "Layer 1",
    name: "High-Entropy Heuristics & Regex Signatures",
    latency: "< 1.2ms",
    description: "Identifies DAN personas, system override triggers, high punctuation entropy, and adversarial contradictions.",
  },
  {
    icon: Code2,
    layer: "Layer 2",
    name: "Adversarial Semantic Intent Classifier",
    latency: "1.5 - 2.8ms",
    description: "Dual-threshold neural intent parser distinguishing genuine financial queries from conversational evasion.",
  },
  {
    icon: Banknote,
    layer: "Layer 3",
    name: "Banking BNF Grammar & Slot Isolator",
    latency: "< 0.5ms",
    description: "Enforces deterministic action slots and quarantines untrusted payment memos to prevent downstream instruction injection.",
  },
  {
    icon: Scale,
    layer: "Layer 4",
    name: "Policy Consensus & Canary DLP Guard",
    latency: "< 0.4ms",
    description: "Validates the hard $10,000 transaction ceiling, blocks canary exfiltration (ZEBRA-7742), and enforces sliding rate limits.",
  },
  {
    icon: Shield,
    layer: "Layer 5",
    name: "Autonomous Core & Safe Ledger Dispatcher",
    latency: "Real-time",
    description: "Dispatches approved banking actions safely to mock ledger state and routes multi-turn conversations through Gemini models.",
  },
];

export function FeaturesSection() {
  return (
    <section aria-label="Core Defense Architecture" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-850 pb-6">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Comprehensive Security Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              6-Layer Defense-in-Depth Pipeline
            </h2>
          </div>
          <Link
            href="/architecture"
            className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors group shrink-0"
          >
            <span>Explore full architecture matrix</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                className="bg-zinc-950 border-zinc-800 text-zinc-100 flex flex-col justify-between hover:border-zinc-700 transition-colors"
              >
                <CardHeader className="p-5 pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="size-8 rounded-lg bg-white text-black flex items-center justify-center">
                      <Icon className="size-4 text-black stroke-[2.5]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-zinc-800 text-zinc-400 text-[10px] font-mono">
                        {pillar.layer}
                      </Badge>
                      <Badge className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-mono">
                        {pillar.latency}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-sm font-semibold font-mono text-white">
                    {pillar.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 pt-2 text-xs font-sans text-zinc-400 leading-relaxed">
                  {pillar.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
