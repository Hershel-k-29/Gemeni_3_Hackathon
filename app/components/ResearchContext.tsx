'use client';

export interface ResearchContextData {
  relatedDiseases?: string[];
  similarMutations?: string[];
  researchOpportunities?: string[];
  experimentalQuestions?: string[];
}

interface ResearchContextProps {
  context?: ResearchContextData | null;
  className?: string;
}

function ListBlock({ title, items, icon }: { title: string; items?: string[]; icon: string }) {
  if (!items?.length) return null;
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span>{icon}</span>
        <span className="text-amber-400 font-medium text-sm">{title}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-zinc-300 text-sm flex gap-2">
            <span className="text-amber-600">→</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResearchContext({ context, className = '' }: ResearchContextProps) {
  if (!context || Object.keys(context).length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/30 p-8 text-center text-zinc-500 text-sm ${className}`}
      >
        Research context will appear after analysis
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-amber-800/40 bg-amber-950/20 p-5 shadow-lg shadow-black/5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📚</span>
        <span className="font-semibold text-white">AI Research Context</span>
      </div>
      <ListBlock title="Related Diseases" items={context.relatedDiseases} icon="🩺" />
      <ListBlock title="Similar Known Mutations" items={context.similarMutations} icon="🧬" />
      <ListBlock title="Research Opportunities" items={context.researchOpportunities} icon="🔬" />
      <ListBlock title="Experimental Questions" items={context.experimentalQuestions} icon="❓" />
    </div>
  );
}
