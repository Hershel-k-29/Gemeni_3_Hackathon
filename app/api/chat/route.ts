import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

type IncomingMsg = { role: string; content: string };

function toGeminiHistory(history: unknown) {
  if (!Array.isArray(history)) return [];

  const mapped = history
    .filter(
      (m): m is IncomingMsg =>
        !!m &&
        typeof m === 'object' &&
        typeof (m as IncomingMsg).role === 'string' &&
        typeof (m as IncomingMsg).content === 'string' &&
        (m as IncomingMsg).content.trim().length > 0
    )
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  // Gemini SDK requires the first history item to be a user message.
  while (mapped.length > 0 && mapped[0]?.role !== 'user') mapped.shift();

  return mapped;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfigured: API_KEY is missing' },
        { status: 500 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const chatHistory = toGeminiHistory(history);

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}
