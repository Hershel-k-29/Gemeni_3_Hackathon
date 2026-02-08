'use client';

export interface PatientScenarioData {
  patientAge?: string;
  presentingSymptoms?: string[];
  labFindings?: string[];
  diseaseProgression?: string;
  treatmentChallenges?: string[];
  longTermComplications?: string[];
}

interface PatientScenarioProps {
  scenario?: PatientScenarioData | null;
  className?: string;
}

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mb-3">
      <span className="text-rose-400 font-medium text-sm">{title}</span>
      <ul className="mt-1 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-zinc-300 text-sm flex gap-2">
            <span className="text-rose-600">•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PatientScenario({ scenario, className = '' }: PatientScenarioProps) {
  if (!scenario || Object.keys(scenario).length === 0) {
    return (
      <div
        className={`rounded-xl border border-dashed border-zinc-700/60 bg-zinc-900/30 p-8 text-center text-zinc-500 text-sm ${className}`}
      >
        Simulated patient scenario will appear after analysis
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-rose-800/40 bg-rose-950/20 p-5 shadow-lg shadow-black/5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚕️</span>
        <span className="font-semibold text-white">Simulated Clinical Case</span>
      </div>
      {scenario.patientAge && (
        <p className="text-zinc-400 text-sm mb-3">
          <span className="text-rose-400">Typical presentation:</span> {scenario.patientAge}
        </p>
      )}
      <ListBlock title="Presenting Symptoms" items={scenario.presentingSymptoms} />
      <ListBlock title="Lab Findings" items={scenario.labFindings} />
      {scenario.diseaseProgression && (
        <div className="mb-3">
          <span className="text-rose-400 font-medium text-sm">Disease Progression</span>
          <p className="text-zinc-300 text-sm mt-1">{scenario.diseaseProgression}</p>
        </div>
      )}
      <ListBlock title="Treatment Challenges" items={scenario.treatmentChallenges} />
      <ListBlock title="Long-term Complications" items={scenario.longTermComplications} />
    </div>
  );
}
