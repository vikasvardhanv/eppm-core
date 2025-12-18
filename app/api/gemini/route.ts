import { NextResponse } from 'next/server';
import { generateContent, generateJSON } from '@/lib/gemini';

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, type } = body; // type: 'text' or 'json'
  
  try {
      if (type === 'json') {
          const data = await generateJSON(prompt);
          return NextResponse.json(data);
      } else {
          const text = await generateContent(prompt);
          return NextResponse.json({ text });
      }
  } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
