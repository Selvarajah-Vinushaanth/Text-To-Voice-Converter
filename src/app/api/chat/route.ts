import { NextRequest, NextResponse } from 'next/server';
import { edenAI } from '@/lib/eden-ai';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const response = await edenAI.chat(text);
    const chatResponse = response.openai.generated_text;

    return NextResponse.json({ response: chatResponse });

  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate chat response' },
      { status: error.status || 500 }
    );
  }
}
