'use client';

import { useState } from 'react';
import MolecularViewer from './MolecularViewer';
import ReasoningTerminal from './ReasoningTerminal';
import ImpactMap from './ImpactMap';
import SeverityScores from './SeverityScores';
import CascadeTimeline from './CascadeTimeline';
import PatientScenario from './PatientScenario';
import ResearchContext from './ResearchContext';
import ConfidenceBadge from './ConfidenceBadge';

interface MutationAnalysis {
  chainOfThought: string[];
  impactMap: Array<{ level: string; title: string; insight: string; visualHint?: string }>;
  severityScores: Array<{ name: string; score: number; description: string }>;
  mutationSummary: string;
  pdbId?: string;
  affectedResidue?: string;
  cascadeSteps?: Array<{ step: number; scale: string; description: string; icon?: string }>;
  patientScenario?: {
    patientAge?: string;
    presentingSymptoms?: string[];
    labFindings?: string[];
    diseaseProgression?: string;
    treatmentChallenges?: string[];
    longTermComplications?: string[];
  };
  researchContext?: {
    relatedDiseases?: string[];
    similarMutations?: string[];
    researchOpportunities?: string[];
    experimentalQuestions?: string[];
  };
  confidence?: {
    score: number;
    classification: 'known' | 'well_characterized' | 'speculative';
    dataBacked: boolean;
    uncertaintyNote?: string;
  };
}

const PRESETS = [
  {
    label: 'Sickle Cell',
    value:
      'Perform a missense mutation on the HBB gene (Beta-globin). Replace the GAG codon at position 6 with GTG.',
  },
  {
    label: 'Hypothetical',
    value: 'Replace alanine with tryptophan at the active site of beta-globin.',
  },
  {
    label: 'Custom',
    value: '',
  },
];

const EXPLANATION_MODES = [
  { id: 'beginner', label: 'Beginner', desc: 'High school level' },
  { id: 'medical_student', label: 'Medical Student', desc: 'Pathophysiology focus' },
  { id: 'researcher', label: 'Researcher', desc: 'Molecular detail' },
] as const;

export default function BioWhatIfEngine() {
  const [mutation, setMutation] = useState(PRESETS[0].value);
  const [preset, setPreset] = useState(0);
  const [explanationMode, setExplanationMode] = useState<(typeof EXPLANATION_MODES)[number]['id']>('researcher');
  const [analysis, setAnalysis] = useState<MutationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasResults = !!analysis;
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
        body: JSON.stringify({
          mutation: trimmed,
          explanationDepth: explanationMode,
        }),
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
    <div className="min-h-screen bg-[#080c10] text-zinc-100 bg-grid-pattern">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#080c10]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Bio-Genomic <span className="text-emerald-400">What-If</span> Engine
              </h1>
              <p className="text-zinc-500 text-sm mt-0.5 hidden sm:block">
                From code to consequence — AI-driven prediction of genetic mutation outcomes
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Input Section */}
        <section className="mb-8">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 sm:p-6 shadow-xl shadow-black/20">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-zinc-500 text-sm font-medium">Quick start:</span>
              {PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handlePresetChange(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    preset === i
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-glow'
                      : 'bg-zinc-800/80 text-zinc-400 border border-transparent hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-zinc-500 text-sm font-medium">Explanation depth:</span>
              {EXPLANATION_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setExplanationMode(m.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    explanationMode === m.id
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/40'
                      : 'bg-zinc-800/60 text-zinc-500 border border-transparent hover:text-zinc-300'
                  }`}
                  title={m.desc}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                value={mutation}
                onChange={(e) => setMutation(e.target.value)}
                placeholder="Enter a mutation command, e.g. Perform a missense mutation on the HBB gene..."
                className="flex-1 min-h-[100px] px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none transition-shadow"
                disabled={isLoading}
                rows={3}
              />
              <button
                onClick={handleRun}
                disabled={isLoading || !mutation.trim()}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed font-semibold text-zinc-900 transition-all shrink-0"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-zinc-900/30 border-t-current rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  'Run Analysis'
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 px-3 py-2 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-400 text-sm">
                {error}
              </p>
            )}
          </div>
        </section>

        {/* Welcome / Empty State */}
        {!hasResults && !isLoading && (
          <section className="mb-8 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8 sm:p-12 text-center animate-fade-in">
            <div className="max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mx-auto mb-4">
                🧬
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Ready to analyze</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Enter a mutation above and run analysis to see AI reasoning, 3D structure, impact cascade, and clinical predictions.
              </p>
            </div>
          </section>
        )}

        {/* Summary + Confidence */}
        {(analysis?.mutationSummary || analysis?.confidence) && (
          <section className="mb-6 flex flex-col lg:flex-row gap-4 animate-slide-up">
            {analysis.mutationSummary && (
              <div className="flex-1 p-5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                <p className="text-emerald-100 text-sm leading-relaxed">{analysis.mutationSummary}</p>
                {analysis.affectedResidue && (
                  <p className="mt-3 text-emerald-500/90 text-xs font-mono">{analysis.affectedResidue}</p>
                )}
              </div>
            )}
            {analysis.confidence && (
              <div className="lg:w-72 shrink-0">
                <ConfidenceBadge confidence={analysis.confidence} />
              </div>
            )}
          </section>
        )}

        {/* Main Grid: 3D Viewer + Reasoning Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 overflow-hidden shadow-xl shadow-black/10">
              <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/80">
                <span className="text-zinc-400 text-sm font-medium">3D Structure</span>
                {analysis?.pdbId && (
                  <span className="text-emerald-500/90 text-xs font-mono bg-emerald-500/10 px-2 py-1 rounded">
                    PDB: {analysis.pdbId}
                  </span>
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

        {/* Multiscale Cascade Timeline */}
        {analysis?.cascadeSteps && analysis.cascadeSteps.length > 0 && (
          <section className="mb-6 rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 animate-slide-up">
            <h2 className="text-base font-semibold text-emerald-400 mb-4">
              Biological Cascade — DNA to Patient
            </h2>
            <CascadeTimeline steps={analysis.cascadeSteps} />
          </section>
        )}

        {/* Impact Map + Severity Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 card-hover">
              <h2 className="text-base font-semibold text-emerald-400 mb-4">Impact Map</h2>
              <ImpactMap levels={analysis?.impactMap ?? []} />
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 card-hover">
              <h2 className="text-base font-semibold text-emerald-400 mb-4">Severity Scores</h2>
              <SeverityScores scores={analysis?.severityScores ?? []} />
            </div>
          </div>

        {/* Patient Scenario + Research Context */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PatientScenario scenario={analysis?.patientScenario} />
            <ResearchContext context={analysis?.researchContext} />
          </div>
      </main>
    </div>
  );
}
