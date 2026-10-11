"use client";

import React, { useEffect, useState } from "react";
import { Building2, Wallet, PiggyBank, CreditCard, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BankingExecutionResult } from "@/lib/firewall/types/verdict.types";

interface BankingCoreCardProps {
  lastExecution?: BankingExecutionResult;
}

interface AccountBalances {
  checking: string;
  savings: string;
  credit: string;
}

export function BankingCoreCard({ lastExecution }: BankingCoreCardProps) {
  const [balances, setBalances] = useState<AccountBalances>({
    checking: "$5,000.00",
    savings: "$12,000.00",
    credit: "-$450.00",
  });

  const fetchBalances = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        if (data.bankingCore?.accounts) {
          setBalances(data.bankingCore.accounts);
        }
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [lastExecution]);

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-zinc-400" />
            <CardTitle className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
              Mock Banking Ledger
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="border-zinc-700 bg-black text-zinc-300 font-mono text-[10px] uppercase"
          >
            Alex Mercer &bull; Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-3">
        {/* Account Tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-lg bg-black border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
              <Wallet className="size-3 text-zinc-400" />
              <span>Checking</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-white font-mono">
              {balances.checking}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">**** 4920</span>
          </div>

          <div className="p-3 rounded-lg bg-black border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
              <PiggyBank className="size-3 text-zinc-400" />
              <span>Savings</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-white font-mono">
              {balances.savings}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">**** 8831</span>
          </div>

          <div className="p-3 rounded-lg bg-black border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
              <CreditCard className="size-3 text-zinc-400" />
              <span>Credit</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-white font-mono">
              {balances.credit}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono">**** 1042</span>
          </div>
        </div>

        {/* Last Executed Transaction / Agent Response */}
        {lastExecution && lastExecution.success && (
          <div className="p-3 rounded-lg bg-black border border-zinc-700 flex items-start gap-2.5 text-xs font-mono">
            <div className="size-4 rounded-full bg-white text-black flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Check className="size-3 stroke-[3]" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">
                {lastExecution.action === "TRANSFER"
                  ? "Ledger Transfer & AI Confirmation:"
                  : "Sentinel Banking Agent Response:"}
              </span>
              <p className="text-zinc-300 text-[12px] font-sans leading-relaxed whitespace-pre-wrap">
                {lastExecution.message}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
