// app/api/extract-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/gemini';

export const config = {
  api: {
    // Increase the response size limit and timeout
    responseLimit: '8mb',
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check if file is PDF
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }
    
    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Extract text from PDF using Gemini
    const extractedText = await extractTextFromPDF(fileBuffer);
    
    return NextResponse.json({ extractedText }, { status: 200 });
  } catch (error) {
    console.error('Error processing PDF:', error);
    // Ensure we're returning a properly formatted JSON response
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PDF' },
      { status: 500 }
    );
  }
}