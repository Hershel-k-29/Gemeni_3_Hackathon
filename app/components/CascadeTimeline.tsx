'use client';

export interface CascadeStep {
  step: number;
  scale: string;
  description: string;
  icon?: string;
}

interface CascadeTimelineProps {
  steps: CascadeStep[];
  className?: string;
}

const SCALE_ICONS: Record<string, string> = {
  dna: '🧬',
  amino: '🧪',
  protein: '📐',
  structure: '📐',
  intermolecular: '🔗',
  cellular: '🔬',
  cell: '🔬',
  organ: '❤️',
  system: '🫀',
  patient: '👤',
};

function getIcon(scale: string): string {
  const key = scale.toLowerCase();
  for (const [k, icon] of Object.entries(SCALE_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return '→';
}

export default function CascadeTimeline({ steps, className = '' }: CascadeTimelineProps) {
  if (steps.length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/30 p-8 text-center text-zinc-500 text-sm ${className}`}
      >
        Biological cascade will appear after analysis
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {steps.map((item, idx) => (
        <div key={item.step} className="flex gap-3">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-9 h-9 rounded-full bg-emerald-900/80 border border-emerald-600/50 flex items-center justify-center text-base">
              {item.icon || getIcon(item.scale)}
            </div>
            {idx < steps.length - 1 && (
              <div className="w-0.5 flex-1 min-h-[24px] bg-emerald-700/40 my-1" />
            )}
          </div>
          <div className="pb-4">
            <span className="text-emerald-400 font-semibold text-sm">{item.scale}</span>
            <p className="text-zinc-300 text-sm mt-0.5 leading-relaxed">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
