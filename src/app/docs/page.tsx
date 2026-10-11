"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS } from "@/lib/docs/docs.data";
import { Code, Terminal, Copy, Check } from "lucide-react";

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Terminal className="size-5 text-white" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white uppercase">
              Developer API Reference
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-3xl">
            Integrate BankSim AI Firewall into external microservices and LLM agents via high-performance REST APIs.
          </p>
        </div>

        {/* Endpoints List */}
        <div className="flex flex-col gap-6">
          {API_ENDPOINTS.map((endpoint, idx) => (
            <Card key={endpoint.path + endpoint.method} className="bg-zinc-950 border-zinc-800 text-zinc-100">
              <CardHeader className="p-5 pb-3 border-b border-zinc-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Badge
                      className={`text-xs font-mono font-bold px-2 py-0.5 ${
                        endpoint.method === "POST"
                          ? "bg-white text-black"
                          : "bg-zinc-900 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {endpoint.method}
                    </Badge>
                    <span className="text-sm font-mono font-bold text-white tracking-wide">
                      {endpoint.path}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{endpoint.title}</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-2">{endpoint.description}</p>
              </CardHeader>

              <CardContent className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
                {/* Request Snippet */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="uppercase">Request Example</span>
                    <button
                      onClick={() => copyToClipboard(endpoint.curl, idx)}
                      className="hover:text-white transition-colors flex items-center gap-1"
                      aria-label="Copy request curl command"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="size-3 text-white" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-lg bg-black border border-zinc-850 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                    <code>{endpoint.curl}</code>
                  </pre>
                </div>

                {/* Response Schema */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="uppercase">Response Schema (200 OK)</span>
                    <Code className="size-3" />
                  </div>
                  <pre className="p-3.5 rounded-lg bg-black border border-zinc-850 text-zinc-400 overflow-x-auto text-[11px] leading-relaxed">
                    <code>{endpoint.response}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
