import Link from "next/link";
import { Shield } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-zinc-850 bg-black py-12 text-xs font-mono text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-white text-black rounded-lg flex items-center justify-center font-bold shrink-0">
            <Shield className="size-4 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wide">BankSim AI Firewall</div>
            <div className="text-[11px] text-zinc-500">Autonomous Banking Blue-Team Defense</div>
          </div>
        </div>

        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-5 text-zinc-400">
          <Link href="/console" className="hover:text-white transition-colors">
            Live Console
          </Link>
          <Link href="/architecture" className="hover:text-white transition-colors">
            Architecture
          </Link>
          <Link href="/benchmark" className="hover:text-white transition-colors">
            Benchmark Lab
          </Link>
          <Link href="/audit" className="hover:text-white transition-colors">
            Audit Trail
          </Link>
          <Link href="/policies" className="hover:text-white transition-colors">
            Policies
          </Link>
          <Link href="/docs" className="hover:text-white transition-colors">
            API Docs
          </Link>
        </nav>

        <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
          <span className="size-2 rounded-full bg-emerald-400 inline-block" />
          <span>All 6 Defense Layers Operational</span>
        </div>
      </div>
    </footer>
  );
}
