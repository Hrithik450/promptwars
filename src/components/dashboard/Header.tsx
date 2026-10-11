"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SessionTrustInfo } from "@/lib/audit/audit.store.service";
import { Shield, Download, Trash2, BarChart2 } from "lucide-react";

interface HeaderProps {
  onOpenBenchmark?: () => void;
  onClearSession?: () => void;
  onExportAuditLog?: () => void;
  totalRequests?: number;
  trustInfo?: SessionTrustInfo;
}

const NAV_LINKS = [
  { href: "/", label: "Console" },
  { href: "/architecture", label: "Architecture" },
  { href: "/benchmark", label: "Benchmark Lab" },
  { href: "/audit", label: "Audit Trail" },
  { href: "/policies", label: "Policies" },
  { href: "/docs", label: "API Docs" },
];

export function Header({
  onOpenBenchmark,
  onClearSession,
  onExportAuditLog,
  totalRequests = 0,
  trustInfo,
}: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-zinc-800 bg-black/90 backdrop-blur-md sticky top-0 z-40 w-full">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="PromptWars home"
            className="size-9 bg-white text-black rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0"
          >
            <Shield className="size-5 text-black stroke-[2.5]" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-base font-semibold tracking-tight text-white font-mono hover:text-zinc-300">
                BankSim
              </Link>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-300 text-[10px] tracking-wider uppercase font-mono px-2 py-0.5"
              >
                AI Firewall
              </Badge>
              {(() => {
                const info = trustInfo ?? { trustLevel: "TRUSTED", trustScore: 100 };
                return (
                  <Badge
                    className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 ${
                      info.trustLevel === "TRUSTED"
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "bg-zinc-900 text-zinc-300 border border-zinc-700"
                    }`}
                  >
                    {info.trustLevel} ({info.trustScore}%)
                  </Badge>
                );
              })()}
            </div>
            <p className="text-xs text-zinc-500 hidden sm:flex items-center gap-2 mt-0.5">
              <span>6-Layer Defense-in-Depth</span>
              <span>&bull;</span>
              <span>Sub-5ms Latency</span>
            </p>
          </div>
        </div>

        {/* Global Navigation Links */}
        <nav role="navigation" aria-label="Main navigation" className="flex items-center gap-1 overflow-x-auto w-full md:w-auto py-1 md:py-0 border-t md:border-t-0 border-zinc-850">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls - Space preserved across all routes */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0 w-[236px] justify-end">
          {onOpenBenchmark && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenBenchmark}
              aria-label="Open benchmark modal"
              className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-colors text-xs h-8 gap-1.5 font-mono"
            >
              <BarChart2 className="size-3.5" />
              <span className="hidden xl:inline">Modal</span>
            </Button>
          )}

          {onExportAuditLog && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportAuditLog}
              aria-label="Export audit logs as JSON file"
              className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-colors text-xs h-8 gap-1.5 font-mono"
            >
              <Download className="size-3.5" />
              <span className="hidden lg:inline">Export</span>
            </Button>
          )}

          {onClearSession && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSession}
              disabled={totalRequests === 0}
              aria-label="Clear session history"
              className="text-zinc-500 hover:text-white hover:bg-zinc-900 text-xs h-8 gap-1 font-mono disabled:opacity-40"
            >
              <Trash2 className="size-3.5" />
              <span className="hidden lg:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
