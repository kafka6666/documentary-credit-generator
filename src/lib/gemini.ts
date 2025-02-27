// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generativeai with your API key
const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('Missing Gemini API key. Please set GEMINI_API_KEY in your environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Function to extract text from PDF images
async function extractTextFromPDF(fileContent: ArrayBuffer): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
    
    // Convert ArrayBuffer to base64
    const base64Content = arrayBufferToBase64(fileContent);
    
    // Prepare the prompt for the model to extract text from the PDF
    const prompt = `
      Extract all text from this PDF document. This document contains information for a documentary credit (Letter of Credit) 
      following UCP 600 guidelines. Extract all fields and data including:
      - Applicant and beneficiary details
      - Amount and currency
      - Expiry date
      - Payment terms
      - Required documents
      - Shipment details
      - Any additional conditions or instructions
      
      Format the extracted data clearly with appropriate labels for each field.
    `;
    
    // Add timeout for the API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000);
    });
    
    // Call the Gemini model with the PDF image
    const modelPromise = model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'application/pdf', data: base64Content } }
          ]
        }
      ]
    });
    
    // Race the model call against the timeout
    const result = await Promise.race([modelPromise, timeoutPromise]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    // Return a more specific error message that can be properly JSON-encoded
    throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  try {
    // Convert ArrayBuffer to Buffer
    const nodeBuffer = Buffer.from(buffer);
    // Convert Buffer to base64 string
    return nodeBuffer.toString('base64');
  } catch (error) {
    console.error('Error converting ArrayBuffer to base64:', error);
    throw new Error('Failed to process PDF data');
  }
}

// Function to generate documentary credit draft
async function generateDocumentaryCredit(extractedData: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
    
    const prompt = `
      Create a formal documentary credit (Letter of Credit) draft following UCP 600 guidelines using the 
      following extracted information:
      
      ${extractedData}
      
      Format the documentary credit in a standard compliant format with all necessary sections including:
      1. Issuing Bank details
      2. Applicant details
      3. Beneficiary details
      4. Currency and amount (in figures and words)
      5. Available with (nominated bank)
      6. Drafts at (payment terms)
      7. Expiry date and place
      8. Required documents section (with all document requirements clearly listed)
      9. Additional conditions
      10. Charges
      11. Period for presentation
      12. Confirmation instructions
      13. Reimbursement instructions
      
      Ensure the draft is compliant with UCP 600 standards and includes all standard legal language.
    `;
    
    // Add timeout for the API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000);
    });
    
    // Call the Gemini model
    const modelPromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    // Race the model call against the timeout
    const result = await Promise.race([modelPromise, timeoutPromise]);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating documentary credit draft:', error);
    // Return a more specific error message that can be properly JSON-encoded
    throw new Error(`Draft generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { extractTextFromPDF, generateDocumentaryCredit };