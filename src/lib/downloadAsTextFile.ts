// src/lib/downloadAsTextFile.ts

/**
 * Function to format documentary credit content
 * This helps structure the raw text into a more readable format
 */
function formatDocumentaryCredit(content: string): string {
  // Split content into lines
  const lines = content.split('\n');
  let formattedContent = '';
  
  // Add proper spacing and formatting
  lines.forEach(line => {
    // Check if line appears to be a section header
    if (/^[A-Z\s]{3,}:?$/.test(line.trim()) || line.trim().endsWith(':')) {
      // Add extra spacing before section headers
      formattedContent += '\n' + line.trim() + '\n';
      // Add a separator line for major sections
      formattedContent += '='.repeat(line.trim().length) + '\n';
    } else if (line.trim()) {
      // Regular content line
      formattedContent += line.trim() + '\n';
    }
  });
  
  // Add UCP 600 footer
  formattedContent += '\n\n';
  formattedContent += ''.padStart(40, '-') + '\n';
  formattedContent += 'This Documentary Credit is subject to the Uniform Customs and Practice\n';
  formattedContent += 'for Documentary Credits, 2007 Revision, ICC Publication No. 600\n';
  
  return formattedContent;
}

/**
 * Function to download content as a text file
 */
export function downloadAsTextFile(content: string, fileName: string = 'documentary-credit-draft.txt'): void {
  // Format the content
  const formattedContent = formatDocumentaryCredit(content);
  
  // Create a blob with the formatted content
  const blob = new Blob([formattedContent], { type: 'text/plain' });
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Append the link to the document body
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}