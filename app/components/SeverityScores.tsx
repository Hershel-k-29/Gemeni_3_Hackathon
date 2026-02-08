'use client';

export interface SeverityScore {
  name: string;
  score: number;
  description: string;
}

interface SeverityScoresProps {
  scores: SeverityScore[];
  className?: string;
}

function getScoreColor(score: number): string {
  if (score <= 3) return 'bg-emerald-500';
  if (score <= 6) return 'bg-amber-500';
  return 'bg-rose-500';
}

export default function SeverityScores({ scores, className = '' }: SeverityScoresProps) {
  if (scores.length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/30 p-8 text-center text-zinc-500 text-sm ${className}`}
      >
        Severity scores will appear after analysis
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {scores.map((s) => (
        <div key={s.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-300 font-medium">{s.name}</span>
            <span className="text-zinc-400">{s.score}/10</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(s.score)}`}
              style={{ width: `${Math.min(100, (s.score / 10) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500">{s.description}</p>
        </div>
      ))}
    </div>
  );
}
