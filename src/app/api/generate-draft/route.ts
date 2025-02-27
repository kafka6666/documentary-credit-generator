// app/api/generate-draft/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateDocumentaryCredit } from '@/lib/gemini';

export const config = {
  api: {
    // Increase the response size limit and timeout
    responseLimit: '8mb',
  },
};

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
    // Ensure we're returning a properly formatted JSON response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate documentary credit draft' },
      { status: 500 }
    );
  }
}