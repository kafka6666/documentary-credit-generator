// app/api/generate-draft/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentaryCredit } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { extractedText } = body;
    
    if (!extractedText) {
      return NextResponse.json(
        { error: 'No extracted text provided' },
        { status: 400 }
      );
    }
    
    // Generate documentary credit draft using Gemini
    const draftText = await generateDocumentaryCredit(extractedText);
    
    return NextResponse.json({ draftText }, { status: 200 });
  } catch (error) {
    console.error('Error generating draft:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentary credit draft' },
      { status: 500 }
    );
  }
}