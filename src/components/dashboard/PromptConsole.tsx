"use client";

import React, { useState } from "react";
import { ArrowUp, Terminal, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QUICK_PRESETS, QuickPreset } from "@/lib/firewall/data/presets.data";

interface PromptConsoleProps {
  input: string;
  setInput: (val: string) => void;
  onSubmit: (text?: string) => void;
  isLoading: boolean;
}

export function PromptConsole({
  input,
  setInput,
  onSubmit,
  isLoading,
}: PromptConsoleProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Benign",
    "Prompt Injection",
    "Jailbreak",
    "Data Exfil",
    "Social Eng",
    "Obfuscation",
    "Malicious Memo",
    "Policy Violation",
    "Multi-Lingual",
  ];

  const filteredPresets =
    selectedCategory === "All"
      ? QUICK_PRESETS
      : QUICK_PRESETS.filter((p) => p.category === selectedCategory);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const handlePresetClick = (preset: QuickPreset) => {
    setInput(preset.payload);
    onSubmit(preset.payload);
  };

  return (
    <Card className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-xl">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-zinc-400" />
            <CardTitle className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
              Query & Payload Inspector
            </CardTitle>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px]">Enter ↵</kbd>
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 flex flex-col gap-4">
        {/* Input Area */}
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a banking query or select an adversarial preset below..."
            rows={3}
            disabled={isLoading}
            className="w-full resize-none rounded-xl bg-black border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-white focus-visible:ring-1 focus-visible:ring-white/20 font-mono p-3.5 pr-20 transition-colors"
          />
          <div className="absolute right-2.5 bottom-2.5">
            <Button
              size="sm"
              onClick={() => onSubmit()}
              disabled={!input.trim() || isLoading}
              className="bg-white text-black hover:bg-zinc-200 font-semibold text-xs h-8 px-3.5 rounded-lg shadow-sm font-mono disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500"
            >
              {isLoading ? (
                <span className="inline-block size-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>Send</span>
                  <ArrowUp className="size-3.5 stroke-[2.5]" />
                </div>
              )}
            </Button>
          </div>
        </div>

        <Separator className="bg-zinc-800/80" />

        {/* Quick Presets Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Shield className="size-3 text-zinc-500" />
              Test Payloads Battery
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              {filteredPresets.length} scenarios
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-zinc-900 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
            {filteredPresets.map((preset) => {
              const isBenign = preset.expectedVerdict === "APPROVED";
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  disabled={isLoading}
                  title={preset.description}
                  className="flex flex-col items-start p-2.5 rounded-lg text-left border border-zinc-800/80 bg-black hover:bg-zinc-900/60 hover:border-zinc-700 transition-all text-xs group"
                >
                  <div className="flex items-center justify-between w-full gap-1 mb-1">
                    <span className="font-semibold text-zinc-200 group-hover:text-white truncate">
                      {preset.label}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-mono px-1 py-0 uppercase shrink-0 ${
                        isBenign
                          ? "border-zinc-700 text-zinc-400 bg-zinc-900"
                          : "border-white bg-white text-black font-bold"
                      }`}
                    >
                      {isBenign ? "Benign" : "Attack"}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate w-full font-mono">
                    {preset.payload}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
