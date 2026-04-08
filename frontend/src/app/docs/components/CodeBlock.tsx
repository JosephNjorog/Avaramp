"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  code: string;
  language?: string;
}

interface CodeBlockProps {
  tabs?: Tab[];
  code?: string;
  language?: string;
  filename?: string;
  className?: string;
}

export default function CodeBlock({ tabs, code, language = "bash", filename, className }: CodeBlockProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = tabs ? tabs[activeTab] : { code: code ?? "", language };
  const displayLang = current.language ?? language;

  const copy = async () => {
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden text-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between bg-surface border-b border-border px-4 py-2 gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs ? (
            tabs.map((t, i) => (
              <button
                key={t.label}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all",
                  activeTab === i
                    ? "bg-indigo-DEFAULT text-white"
                    : "text-secondary hover:text-primary hover:bg-card"
                )}
              >
                {t.label}
              </button>
            ))
          ) : (
            <span className="text-xs text-muted font-mono">
              {filename ?? displayLang}
            </span>
          )}
        </div>
        <button
          onClick={copy}
          className="shrink-0 flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Code */}
      <pre className="bg-[#0d0d10] px-5 py-4 overflow-x-auto leading-relaxed text-[13px]">
        <code className="text-slate-200 font-mono">{current.code}</code>
      </pre>
    </div>
  );
}
