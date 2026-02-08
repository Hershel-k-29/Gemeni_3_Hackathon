'use client';

export interface ImpactLevel {
  level: 'molecular' | 'thermodynamic' | 'cellular' | 'clinical';
  title: string;
  insight: string;
  visualHint?: string;
}

interface ImpactMapProps {
  levels: ImpactLevel[];
  className?: string;
}

const LEVEL_STYLES: Record<string, { bg: string; border: string; icon: string; label: string }> = {
  molecular: { bg: 'bg-violet-950/50', border: 'border-violet-700/50', icon: '🧬', label: 'Molecular' },
  thermodynamic: { bg: 'bg-amber-950/50', border: 'border-amber-700/50', icon: '⚡', label: 'Thermodynamic' },
  cellular: { bg: 'bg-cyan-950/50', border: 'border-cyan-700/50', icon: '🔬', label: 'Cellular' },
  clinical: { bg: 'bg-rose-950/50', border: 'border-rose-700/50', icon: '🏥', label: 'Clinical' },
};

export default function ImpactMap({ levels, className = '' }: ImpactMapProps) {
  if (levels.length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/30 p-8 text-center text-zinc-500 text-sm ${className}`}
      >
        Impact map will appear after analysis
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {levels.map((item) => {
        const style = LEVEL_STYLES[item.level] || LEVEL_STYLES.molecular;
        return (
          <div
            key={item.level}
            className={`rounded-xl border ${style.border} ${style.bg} p-4 transition-all hover:shadow-lg`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{style.icon}</span>
              <span className="font-semibold text-white">{item.title}</span>
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{item.insight}</p>
            {item.visualHint && (
              <p className="mt-2 text-xs text-zinc-500 italic">{item.visualHint}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
