import Link from "next/link";
import { Check, X, Shield, Lock, FileText, ArrowRight } from "lucide-react";

const COMPARISON = [
  {
    feature: "Prompt Injection Detection",
    traditionalWaf: "None (HTTP payload only)",
    banksimFirewall: "Pre-flight L0/L1 Regex + Semantics",
  },
  {
    feature: "Unicode Homoglyphs & Zero-Width",
    traditionalWaf: "Bypassed via alternate encoding",
    banksimFirewall: "NFKC decomposition & strip",
  },
  {
    feature: "Financial Transaction Caps",
    traditionalWaf: "Requires manual API coding",
    banksimFirewall: "Deterministic $10,000 hard rule",
  },
  {
    feature: "System Canary Protection",
    traditionalWaf: "Blind to model output tokens",
    banksimFirewall: "ZEBRA-7742 exfiltration blocker",
  },
  {
    feature: "Downstream Outage Policy",
    traditionalWaf: "Fail-open vulnerability",
    banksimFirewall: "Fail-closed autonomous ledger",
  },
  {
    feature: "Audit Trail & Forensics",
    traditionalWaf: "Basic access log",
    banksimFirewall: "Full L0-L5 trace + RFC-4180 export",
  },
];

export function SecurityComplianceSection() {
  return (
    <section aria-label="Security & Compliance Comparison" className="py-16 sm:py-24 border-t border-zinc-850 bg-zinc-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Enterprise Defense Comparison
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white">
              Why Traditional WAFs Fail with LLMs
            </h2>
          </div>
          <Link
            href="/policies"
            className="text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors group shrink-0"
          >
            <span>Review guardrail policy rules</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Comparison Table */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black border-b border-zinc-800 text-zinc-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5 sm:p-4 font-semibold">Security Requirement</th>
                  <th className="p-3.5 sm:p-4 font-semibold text-zinc-500">Standard Web WAF</th>
                  <th className="p-3.5 sm:p-4 font-semibold text-white">BankSim AI Firewall</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {COMPARISON.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3.5 sm:p-4 font-semibold text-white font-sans">
                      {row.feature}
                    </td>
                    <td className="p-3.5 sm:p-4 text-zinc-500 flex items-center gap-2">
                      <X className="size-3.5 text-zinc-600 shrink-0" />
                      <span>{row.traditionalWaf}</span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-zinc-200">
                      <div className="flex items-center gap-2">
                        <Check className="size-3.5 text-white shrink-0" />
                        <span className="font-semibold text-white">{row.banksimFirewall}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Badges Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-zinc-850 bg-black flex items-center gap-3">
            <Shield className="size-5 text-white shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-white">OWASP Top 10 LLM</div>
              <div className="text-[11px] text-zinc-400 font-sans">10/10 Full Mitigation Mapping</div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-850 bg-black flex items-center gap-3">
            <Lock className="size-5 text-white shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-white">$10,000 Hard Limit</div>
              <div className="text-[11px] text-zinc-400 font-sans">Enforced prior to LLM turn</div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-850 bg-black flex items-center gap-3">
            <FileText className="size-5 text-white shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-white">RFC-4180 Forensics</div>
              <div className="text-[11px] text-zinc-400 font-sans">Immutable audit export logging</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
