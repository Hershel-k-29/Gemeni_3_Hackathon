import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

export interface ImpactLevel {
  level: 'molecular' | 'thermodynamic' | 'cellular' | 'clinical';
  title: string;
  insight: string;
  visualHint?: string;
}

export interface SeverityScore {
  name: string;
  score: number;
  description: string;
}

export interface CascadeStep {
  step: number;
  scale: string;
  description: string;
  icon?: string;
}

export interface PatientScenario {
  patientAge?: string;
  presentingSymptoms?: string[];
  labFindings?: string[];
  diseaseProgression?: string;
  treatmentChallenges?: string[];
  longTermComplications?: string[];
}

export interface ResearchContext {
  relatedDiseases?: string[];
  similarMutations?: string[];
  researchOpportunities?: string[];
  experimentalQuestions?: string[];
}

export interface ConfidenceInfo {
  score: number;
  classification: 'known' | 'well_characterized' | 'speculative';
  dataBacked: boolean;
  uncertaintyNote?: string;
}

export interface MutationAnalysis {
  chainOfThought: string[];
  impactMap: ImpactLevel[];
  severityScores: SeverityScore[];
  mutationSummary: string;
  pdbId?: string;
  affectedResidue?: string;
  cascadeSteps?: CascadeStep[];
  patientScenario?: PatientScenario;
  researchContext?: ResearchContext;
  confidence?: ConfidenceInfo;
}

const DEPTH_INSTRUCTIONS: Record<string, string> = {
  beginner: 'Explain at a high-school biology level. Use simple language, avoid jargon. Use analogies when helpful.',
  medical_student: 'Explain at medical school level. Include pathophysiology, clinical correlations, and appropriate terminology.',
  researcher: 'Explain at research level. Include molecular mechanisms, thermodynamic parameters, and cite relevant biological concepts.',
};

function buildSystemPrompt(explanationDepth: string): string {
  const depthGuide = DEPTH_INSTRUCTIONS[explanationDepth] || DEPTH_INSTRUCTIONS.researcher;
  return `You are a computational biochemist AI. Analyze genetic mutations and predict their physical consequences. Adapt your explanations to: ${depthGuide}

Respond with valid JSON only, no markdown, no code blocks. Use this exact structure:

{
  "chainOfThought": ["step 1 of reasoning", "step 2", "..."],
  "impactMap": [
    {"level": "molecular", "title": "Molecular", "insight": "Biochemical explanation"},
    {"level": "thermodynamic", "title": "Thermodynamic", "insight": "Energy/equilibrium analysis"},
    {"level": "cellular", "title": "Cellular", "insight": "Cell structure/behavior effect"},
    {"level": "clinical", "title": "Clinical", "insight": "Human health consequence"}
  ],
  "severityScores": [
    {"name": "Protein folding", "score": 0-10, "description": "brief"},
    {"name": "Oxygen binding", "score": 0-10, "description": "brief"},
    {"name": "Cell integrity", "score": 0-10, "description": "brief"},
    {"name": "Clinical severity", "score": 0-10, "description": "brief"}
  ],
  "mutationSummary": "One paragraph summary",
  "pdbId": "relevant PDB ID if known, e.g. 2HBS for sickle cell",
  "affectedResidue": "e.g. Beta-globin position 6: Glu → Val",
  "cascadeSteps": [
    {"step": 1, "scale": "DNA", "description": "Mutation at codon level"},
    {"step": 2, "scale": "Amino Acid", "description": "Substitution effect"},
    {"step": 3, "scale": "Protein Structure", "description": "Folding/geometry change"},
    {"step": 4, "scale": "Intermolecular", "description": "Protein-protein interactions"},
    {"step": 5, "scale": "Cellular", "description": "Cell deformation/behavior"},
    {"step": 6, "scale": "Organ/System", "description": "Tissue/organ effect"},
    {"step": 7, "scale": "Patient", "description": "Symptoms and clinical outcome"}
  ],
  "patientScenario": {
    "patientAge": "typical age range",
    "presentingSymptoms": ["symptom1", "symptom2"],
    "labFindings": ["finding1", "finding2"],
    "diseaseProgression": "brief description",
    "treatmentChallenges": ["challenge1"],
    "longTermComplications": ["complication1"]
  },
  "researchContext": {
    "relatedDiseases": ["disease1", "disease2"],
    "similarMutations": ["mutation1"],
    "researchOpportunities": ["opportunity1"],
    "experimentalQuestions": ["question1"]
  },
  "confidence": {
    "score": 0-100,
    "classification": "known" | "well_characterized" | "speculative",
    "dataBacked": true/false,
    "uncertaintyNote": "brief note if speculative"
  }
}

For sickle cell (HBB GAG→GTG at position 6): Use pdbId "2HBS". Include full cascade, patient scenario (anemia, vaso-occlusive crises), and confidence "known".
For hypothetical/less-known mutations: Use "speculative" and explain uncertainty.`;
}

export async function POST(request: NextRequest) {
  try {
    const { mutation, explanationDepth = 'researcher' } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key missing. Set API_KEY in .env' },
        { status: 500 }
      );
    }

    if (!mutation || typeof mutation !== 'string') {
      return NextResponse.json(
        { error: 'mutation string is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const systemPrompt = buildSystemPrompt(explanationDepth);
    const prompt = `${systemPrompt}\n\nUser mutation input:\n"${mutation.trim()}"\n\nRespond with the JSON analysis only.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No response from model');
    }

    let parsed: MutationAnalysis;
    try {
      let jsonStr = text.trim();
      const codeBlock = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlock) jsonStr = codeBlock[1].trim();
      parsed = JSON.parse(jsonStr) as MutationAnalysis;
    } catch {
      throw new Error('Model did not return valid JSON');
    }

    // Validate and normalize
    if (!Array.isArray(parsed.chainOfThought)) parsed.chainOfThought = [];
    if (!Array.isArray(parsed.impactMap)) parsed.impactMap = [];
    if (!Array.isArray(parsed.severityScores)) parsed.severityScores = [];
    if (!Array.isArray(parsed.cascadeSteps)) parsed.cascadeSteps = [];
    if (!parsed.mutationSummary) parsed.mutationSummary = 'Analysis complete.';

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in mutation API:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
