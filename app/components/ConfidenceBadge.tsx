'use client';

export interface ConfidenceInfo {
  score: number;
  classification: 'known' | 'well_characterized' | 'speculative';
  dataBacked: boolean;
  uncertaintyNote?: string;
}

interface ConfidenceBadgeProps {
  confidence?: ConfidenceInfo | null;
  className?: string;
}

const CLASS_STYLES: Record<string, { bg: string; label: string; desc: string }> = {
  known: { bg: 'bg-emerald-900/50 border-emerald-600/50', label: 'Known Mutation', desc: 'Well-documented in literature' },
  well_characterized: { bg: 'bg-amber-900/50 border-amber-600/50', label: 'Well Characterized', desc: 'Multiple studies support' },
  speculative: { bg: 'bg-violet-900/50 border-violet-600/50', label: 'Speculative', desc: 'Predicted based on reasoning' },
};

export default function ConfidenceBadge({ confidence, className = '' }: ConfidenceBadgeProps) {
  if (!confidence) return null;

  const style = CLASS_STYLES[confidence.classification] || CLASS_STYLES.speculative;

  return (
    <div className={`rounded-xl border ${style.bg} p-4 shadow-lg shadow-black/5 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-zinc-400 text-sm font-medium">Confidence</span>
        <span className="text-white font-bold">{confidence.score}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full ${
            confidence.score >= 80 ? 'bg-emerald-500' : confidence.score >= 50 ? 'bg-amber-500' : 'bg-violet-500'
          }`}
          style={{ width: `${Math.min(100, confidence.score)}%` }}
        />
      </div>
      <p className="text-sm font-medium text-white">{style.label}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{style.desc}</p>
      {confidence.dataBacked && (
        <p className="text-xs text-emerald-500 mt-1">✓ Data-backed prediction</p>
      )}
      {confidence.uncertaintyNote && (
        <p className="text-xs text-violet-400 mt-2 italic">{confidence.uncertaintyNote}</p>
      )}
    </div>
  );
}
