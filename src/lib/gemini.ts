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
    
    // Increased timeout from 60 to 120 seconds
    const TIMEOUT_MS = 120000;
    const MAX_RETRIES = 2;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    // Retry logic for handling transient errors
    while (retryCount <= MAX_RETRIES) {
      try {
        // Add timeout for the API call
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Request timed out after ${TIMEOUT_MS/1000} seconds`)), TIMEOUT_MS);
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
        
        // for obtaining token usage by the Gemini model
        const totalTokenUsage = result.response.usageMetadata?.totalTokenCount;
        console.log('Total token usage:', totalTokenUsage);
        
        const response = await result.response;
        return response.text();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`PDF extraction attempt ${retryCount + 1}/${MAX_RETRIES + 1} failed:`, lastError);
        
        // If we've reached max retries, throw the error
        if (retryCount === MAX_RETRIES) {
          throw new Error(`PDF extraction failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        retryCount++;
      }
    }
    
    // This should never be reached due to the throw in the catch block above
    throw lastError || new Error('PDF extraction failed for unknown reasons');
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
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });
    
    const prompt = `
      You are a specialized banking assistant that converts provided 
      pdf-extracted data containing trade finance details into properly 
      formatted SWIFT MT700 (Documentary Credit) messages according 
      to UCP 600 standards. The user will upload one or more PDF files 
      containing information about a trade transaction, and you will 
      extract the relevant information and generate a complete SWIFT 
      MT700 message.

      Create a formal documentary credit (Letter of Credit) draft following UCP 600 guidelines using the 
      following extracted information:
      
      ${extractedData}

      Output Format Requirements:

      1. Begin with the bank identifier code (BIC) of the Sender
      2. Use the proper SWIFT MT700 field tags (e.g., :27:, :40A:, :20:, etc.)
      3. Maintain proper line breaks and field separations
      4. Follow the exact sequence of fields as shown in the example
      5. Use uppercase for all field data
      6. For multi-line fields, begin each subsequent line with a period (.) when necessary
      
      Required Fields to Include:

      :27: - Sequence of Total (e.g., 1/1)
      :40A: - Form of Documentary Credit (e.g., IRREVOCABLE)
      :20: - Documentary Credit Number
      :31C: - Date of Issue (YYMMDD format)
      :40E: - Applicable Rules (e.g., UCP LATEST VERSION)
      :31D: - Date and Place of Expiry
      :50: - Applicant details (name, address)
      :59: - Beneficiary details (name, address)
      :32B: - Currency Code, Amount
      :41D: - Available With... By... (negotiating bank details)
      :42C: - Drafts at... (e.g., SIGHT)
      :42A: - Drawee (bank BIC)
      :43P: - Partial Shipments (ALLOWED/PROHIBITED)
      :43T: - Transhipment (ALLOWED/PROHIBITED)
      :44A: - Place of Taking in Charge/Dispatch
      :44B: - Place of Final Destination
      :44C: - Latest Date of Shipment (YYMMDD)
      :45A: - Description of Goods and/or Services
      :46A: - Documents Required
      :47A: - Additional Conditions
      :71D: - Charges
      :48: - Period for Presentation
      :49: - Confirmation Instructions
      :78: - Instructions to the Paying/Accepting/Negotiating Bank
      :72Z: - Sender to Receiver Information
      
      Instructions for Processing:

      1. Review all uploaded PDF documents thoroughly to extract key information.
      2. Identify trade transaction details including parties, goods, amounts, and dates.
      3. Map the extracted information to the appropriate SWIFT MT700 fields.
      4. Format the message exactly according to SWIFT standards as shown in the "Example Output" attached below.
      5. Ensure all mandatory fields are completed.
      6. Use proper field tags and maintain correct formatting for multiline fields.
      7. Output the complete SWIFT MT700 message in text format.

      Important Formatting Rules:

      1. Text should be in uppercase for all field content
      2. Field identifiers should be preceded by a colon and followed by another colon (e.g., :20:)
      3. Use a period (.) at the beginning of continuation lines in multiline fields
      4. Maintain proper indentation when required
      5. For fields with numbered items (like documents required), use the format "1)..." with parenthesis
      6. Format the currency amount without spaces between the currency code and amount (e.g., USD78897,00)
      7. Use commas (,) not periods (.) as decimal separators in amounts
      8. Use the format "INPUT THE LC NUMBER HERE" alwaysin field 20
      9. Truncate all texts before field no. 27 and after field no. 72Z
      10. In field 48, use the format "21/from the date of shipment"
      11. In field 49, always use "WITHOUT" but if it is specified as confirmed L/C, use "CONFIRM"
      12.In field 72Z, always put beneficiary contact information, e.g., telephone, fax, email.

      Example Output:

      :27:1/1
      :40A:IRREVOCABLE
      :20:INPUT THE LC NUMBER HERE
      :31C:250114
      :40E:UCP LATEST VERSION
      :31D:250413 SINGAPORE
      :50:SQUARE INFORMATIX LIMITED,SQUARE
      CENTRE,48,MOHAKHALI C/A,DHAKA-1212,
      FACTORY:SARDAGONJ,KASHIMPUR,GAZIPUR
      BANGLADESH
      :59:INFLOW TECHNOLOGIES (SINGAPORE) 
      PTE LTD.
      101 CECIL STREET, 19-03 TONG ENG 
      BUILDING, SINGAPORE 069533
      :32B:USD78897,00
      :41D:ANY BANK
      BY NEGOTIATION
      :42C:SIGHT
      :42A:MBLBBDDH012
      :43P:ALLOWED
      :43T:ALLOWED
      :44A:ANY AIRPORT OF SINGAPORE
      :44B:DHAKA AIRPORT, BANGLADESH
      :44C:250323
      :45A:CISCO NETWORKING SWITCH ,ROUTER AND 
        RELATED ACCESSORIES:
        .
        DESCRIPTION, QUANTITY, QUALITY, UNIT PRICE, TOTAL PRICE AND 
        ALL OTHER SPECIFICATIONS AS PER BENEFICIARY'S PROFORMA 
        INVOICE NO.: BGLSNG6603 DATED 01.01.2025.
        .
        DELIVERY TERMS:FCA SINGAPORE.
        .
      :46A:1)BENEFICIARY'S SIGNED COMMERCIAL INVOICE IN FOUR FOLDS
        IN ENGLISH CERTIFYING MERCHANDISE TO BE OF CHINA/MALAYSIA/
        SINGAPORE/VIETNUM ORIGIN.
      .
      2)DETAILED SIGNED PACKING, WEIGHT AND MEASUREMENT IN FOUR FOLDS.
      .
      3)AIRWAY BILL CONSIGNED TO THE MERCANTILE BANK PLC., MOHAKHALI 
        BRANCH, 51-52 MOHAKHALI C/A, DHAKA-1212, BANGLADESH SHOWING 
        FREIGHT COLLECT AND MARKED NOTIFY APPLICANT GIVING FULL NAME
        AND ADDRESS.
      .
      4)CERTIFICATE OF ORIGIN ISSUED BY CHAMBER OF COMMERCE OF THE 
        EXPORTING COUNTRY. ONE ORIGINAL AND THREE COPIES OF THIS 
        CERTIFICATE MUST ACCOMPANY THE ORIGINAL DOCUMENTS.
      .
      5)COPY OF BENEFICIARY'S SHIPMENT ADVICE TO BE SENT TO PIONEER 
        INSURANCE COMPANY LTD.,HEAD OFFICE, RANGS BABYLONIA(5TH FL), 
        246, TEJGAON, DHAKA, BANGLADESH (EMAIL:picluwd(AT)gmail.com, 
        FAX: 88-02-8878913) SHOWING INSURANCE COVER NOTE NO. 
        PIONEER/HO/MC-00459/01/2025 DATED 09.01.2025.
      .
      6)COUNTRY OF ORIGIN TO BE MENTIONED CLEARLY ON ALL GOODS/GOODS
        PACKAGES/CONTAINER AND BENEFICIARY'S CERTIFICATE TO THIS 
        EFFECT MUST ACCOMPANY THE ORIGINAL DOCUMENTS.
      .
      :47A:1)IRC NO.260326110492319,H.S.CODE NO.8517.62.30,8517.62.10,
        8471.80.00 APPLICANT'S TIN 811258319958,APPLICANT'S BIN/VAT 
        REG.NO. 000466076-0101, ISSUING BANK'S BIN 000151542-0202 
        AND DOCUMENTARY CREDIT NUMBER WITH DATE MUST APPEAR IN 
        ALL DOCUMENTS.
      .
      2)SHIPMENT PRIOR TO L/C DATE NOT ACCEPTABLE.
      .
      3)APPLICANT'S NAME, ADDRESS, TIN AND VAT REG NUMBER MUST EITHER
        BE PRINTED OR WRITTEN IN IRREMOVABLE INK ON THE PACKAGE/COVER/
        WOODEN BOX/OTHER PACKAGES, ON THE BIGGEST PACKAGE/BOX OF THE
        SHIPMENT.
      .
      4)AIRWAY BILL MUST BE ISSUED BY THE CARRIER OR BY THEIR AGENT.
      .
      5)PACKING TO BE EXPORT STANDARD PACKING.
      .
      6)USD58.00 WILL BE DEDUCTED FROM THE BILL AMOUNT AT THE TIME OF
        PAYMENT FOR PRESENTATION OF EACH SET OF DISCREPANT DOCS.
      .
      7)USD69.00 WILL BE DEDUCTED FOR EACH BILL FROM BENEFICIARY AT 
        THE TIME OF PAYMENT AS PAYMENT PROCESSING FEE.
      .
      8)ALL DOCUMENTS MUST BE IN ENGLISH.
      .
      :71D:ALL BANKING CHARGES OUTSIDE
      BANGLADESH ARE ON BENEFICIARY'S 
      ACCOUNT.
      :48:21/FROM THE DATE OF SHIPMENT.
      :49:WITHOUT
      :78:A)DOCUMENTS TO BE PRESENTED TO MERCANTILE BANK PLC.,
      MOHAKHALI BRANCH, GREEN DELTA AIMS TOWER, 51-52, MOHAKHALI C/A,
      DHAKA,BANGLADESH.
      B)WE SHALL ARRANGE REMITTANCE OF FUND ON RECEIPT OF DOCUMENTS
      STRICTLY COMPLYING CREDIT TERMS TO THE DESIGNATED BANK ACCOUNT
      AS PER PRESENTER INSTRUCTION.
      :72Z:BENEFICIARY CONTACT:
      TEL: +65 62700860
      FAX: +65 62739300
      EMAIL:ops.singapore(AT)inflowtechnologies.com

      Generate a complete, properly formatted SWIFT MT700 message 
      based on the information in the uploaded documents, following 
      all formatting conventions exactly as demonstrated in the 
      example output.
    `;
    
    // Add timeout for the API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out after 60 seconds')), 60000);
    });
    
    // Call the Gemini model
    const modelPromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    // Race the model call against the timeout
    const result = await Promise.race([modelPromise, timeoutPromise]);
    
    // for obtaining token usage by the Gemini model
    const totalTokenUsage = result.response.usageMetadata?.totalTokenCount;
    console.log('Total token usage:', totalTokenUsage);
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating documentary credit draft:', error);
    // Return a more specific error message that can be properly JSON-encoded
    throw new Error(`Draft generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { extractTextFromPDF, generateDocumentaryCredit };