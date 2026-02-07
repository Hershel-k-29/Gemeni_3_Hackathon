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

export interface MutationAnalysis {
  chainOfThought: string[];
  impactMap: ImpactLevel[];
  severityScores: SeverityScore[];
  mutationSummary: string;
  pdbId?: string;
  affectedResidue?: string;
}

const SYSTEM_PROMPT = `You are a computational biochemist AI. Your job is to analyze genetic mutations and predict their physical consequences through biochemical reasoning.

When given a mutation (DNA sequence change, codon replacement, or gene mutation command), you MUST respond with valid JSON only, no markdown, no code blocks. Use this exact structure:

{
  "chainOfThought": ["step 1 of reasoning", "step 2", "..."],
  "impactMap": [
    {"level": "molecular", "title": "Molecular", "insight": "Biochemical explanation at atomic/molecular level"},
    {"level": "thermodynamic", "title": "Thermodynamic", "insight": "Energy/equilibrium analysis (ΔG, T-state, etc.)"},
    {"level": "cellular", "title": "Cellular", "insight": "Effect on cell structure/behavior"},
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
  "affectedResidue": "e.g. Beta-globin position 6: Glu → Val"
}

For sickle cell (HBB GAG→GTG at position 6): Explain the Glu→Val substitution, hydrophobic "sticky patch" that causes hemoglobin polymerization, sickling, vaso-occlusion. Use pdbId "2HBS".
Reason through: Translation → Folding logic → Macro effect → Clinical outcome.`;

export async function POST(request: NextRequest) {
  try {
    const { mutation } = await request.json();

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
        maxOutputTokens: 4096,
      },
    });

    const prompt = `${SYSTEM_PROMPT}\n\nUser mutation input:\n"${mutation.trim()}"\n\nRespond with the JSON analysis only.`;

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

    // Validate and normalize structure
    if (!Array.isArray(parsed.chainOfThought)) parsed.chainOfThought = [];
    if (!Array.isArray(parsed.impactMap)) parsed.impactMap = [];
    if (!Array.isArray(parsed.severityScores)) parsed.severityScores = [];
    if (!parsed.mutationSummary) parsed.mutationSummary = 'Analysis complete.';

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in mutation API:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
