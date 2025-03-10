// app/api/extract-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/gemini';

export const config = {
  api: {
    // Increase the response size limit and timeout
    responseLimit: '10mb',
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
  // Set a longer runtime for this API route
  runtime: 'nodejs',
  // Increase the maximum duration to 2 minutes
  maxDuration: 120,
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
    
    // Check file size (15MB limit)
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File size exceeds the 15MB limit. Please upload a smaller PDF file.' 
      }, { status: 400 });
    }
    
    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Extract text from PDF using Gemini
    const extractedText = await extractTextFromPDF(fileBuffer);
    
    return NextResponse.json({ extractedText }, { status: 200 });
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to process PDF';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for timeout-related errors
      if (errorMessage.includes('timed out')) {
        errorMessage = 'The PDF processing took too long. This may be due to the complexity or size of your document. Please try again with a simpler or smaller PDF file.';
        statusCode = 408; // Request Timeout
      }
    }
    
    // Ensure we're returning a properly formatted JSON response
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}