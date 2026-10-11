import { Zap, ShieldCheck, Target, Lock } from "lucide-react";

const STATS = [
  {
    icon: Zap,
    value: "< 3.8 ms",
    label: "Median Pipeline Latency",
    subtext: "90% threats halted at L0/L1",
  },
  {
    icon: Target,
    value: "100.0%",
    label: "Attack Battery Accuracy",
    subtext: "Zero false approvals on benchmark",
  },
  {
    icon: ShieldCheck,
    value: "0.00%",
    label: "False Positive Rate",
    subtext: "Authentic banking queries unblocked",
  },
  {
    icon: Lock,
    value: "$10,000",
    label: "Deterministic Ceiling",
    subtext: "Hard limit on single transactions",
  },
];

export function LiveTelemetryTicker() {
  return (
    <section aria-label="System Performance Telemetry" className="border-y border-zinc-850 bg-zinc-950/60 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-mono">
                  <Icon className="size-3.5 text-white" />
                  <span>{stat.label}</span>
                </div>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {stat.subtext}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
