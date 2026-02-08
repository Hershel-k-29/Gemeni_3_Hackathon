'use client';

interface ReasoningTerminalProps {
  steps: string[];
  isLoading?: boolean;
  className?: string;
}

export default function ReasoningTerminal({ steps, isLoading, className = '' }: ReasoningTerminalProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden font-mono text-sm shadow-xl shadow-black/10 ${className}`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/80">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-emerald-400 font-semibold">Gemini Chain of Thought</span>
      </div>
      <div className="p-4 max-h-[360px] overflow-y-auto space-y-3">
        {steps.length === 0 && !isLoading && (
          <p className="text-zinc-500 text-sm py-8 text-center">Run a mutation analysis to see AI reasoning...</p>
        )}
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-emerald-600 shrink-0">{String(i + 1).padStart(2)}.</span>
            <p className="text-zinc-300 leading-relaxed">{step}</p>
          </div>
        ))}
        {isLoading && steps.length === 0 && (
          <div className="flex items-center gap-2 text-emerald-500">
            <span className="animate-pulse">▌</span> Analyzing mutation...
          </div>
        )}
        {isLoading && steps.length > 0 && (
          <div className="flex items-center gap-2 text-emerald-500">
            <span className="animate-pulse">▌</span> Reasoning...
          </div>
        )}
      </div>
    </div>
  );
}
