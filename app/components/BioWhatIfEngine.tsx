'use client';

import { useState } from 'react';
import MolecularViewer from './MolecularViewer';
import ReasoningTerminal from './ReasoningTerminal';
import ImpactMap from './ImpactMap';
import SeverityScores from './SeverityScores';

interface MutationAnalysis {
  chainOfThought: string[];
  impactMap: Array<{ level: string; title: string; insight: string; visualHint?: string }>;
  severityScores: Array<{ name: string; score: number; description: string }>;
  mutationSummary: string;
  pdbId?: string;
  affectedResidue?: string;
}

const PRESETS = [
  {
    label: 'Sickle Cell Anemia',
    value:
      'Perform a missense mutation on the HBB gene (Beta-globin). Replace the GAG codon at position 6 with GTG.',
  },
  {
    label: 'Custom mutation',
    value: '',
  },
];

export default function BioWhatIfEngine() {
  const [mutation, setMutation] = useState(PRESETS[0].value);
  const [preset, setPreset] = useState(0);
  const [analysis, setAnalysis] = useState<MutationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePresetChange = (i: number) => {
    setPreset(i);
    setMutation(PRESETS[i].value);
    setAnalysis(null);
    setError(null);
  };

  const handleRun = async () => {
    const trimmed = mutation.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch('/api/mutation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutation: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data as MutationAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f14] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0d1117]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Bio-Genomic <span className="text-emerald-400">What-If</span> Engine
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">
            From code to consequence — Gemini reasons through the physical reality of genetic mutations
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Input Section */}
        <section className="mb-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => handlePresetChange(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  preset === i
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <textarea
              value={mutation}
              onChange={(e) => setMutation(e.target.value)}
              placeholder="e.g. Perform a missense mutation on the HBB gene..."
              className="flex-1 min-h-[100px] px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              disabled={isLoading}
              rows={3}
            />
            <button
              onClick={handleRun}
              disabled={isLoading || !mutation.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed font-semibold transition-colors shrink-0"
            >
              {isLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-rose-400 text-sm">{error}</p>
          )}
        </section>

        {/* Summary Banner */}
        {analysis?.mutationSummary && (
          <section className="mb-6 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
            <p className="text-emerald-100 text-sm leading-relaxed">{analysis.mutationSummary}</p>
            {analysis.affectedResidue && (
              <p className="mt-2 text-emerald-400/80 text-xs font-mono">{analysis.affectedResidue}</p>
            )}
          </section>
        )}

        {/* Main Grid: 3D Viewer + Reasoning Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-800 overflow-hidden bg-[#0d1117]">
              <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-zinc-400 text-sm font-medium">3D Structure</span>
                {analysis?.pdbId && (
                  <span className="text-emerald-500 text-xs font-mono">PDB: {analysis.pdbId}</span>
                )}
              </div>
              <MolecularViewer
                pdbId={analysis?.pdbId}
                variant={analysis ? 'sickle' : 'normal'}
                className="h-[400px] min-h-[400px]"
              />
            </div>
          </div>
          <div>
            <ReasoningTerminal
              steps={analysis?.chainOfThought ?? []}
              isLoading={isLoading}
              className="h-[400px]"
            />
          </div>
        </div>

        {/* Impact Map + Severity Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-zinc-800 bg-[#0d1117] p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-4">Impact Map</h2>
            <ImpactMap levels={analysis?.impactMap ?? []} />
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#0d1117] p-6">
            <h2 className="text-lg font-semibold text-emerald-400 mb-4">Severity Scores</h2>
            <SeverityScores scores={analysis?.severityScores ?? []} />
          </div>
        </div>
      </main>
    </div>
  );
}
