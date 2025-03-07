// src/components/ResultDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TextDownloadButton from '../components/TextDownloadButton';

interface ResultDisplayProps {
  extractedText: string;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ extractedText, isLoading }) => {
  const [draftText, setDraftText] = useState<string>('');
  const [generatingDraft, setGeneratingDraft] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Generate draft when extracted text changes
    const generateDraft = async () => {
      if (!extractedText) return;
      
      setGeneratingDraft(true);
      setError(null);
      
      try {
        const response = await fetch('/api/generate-draft', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ extractedText }),
        });
        
        if (!response.ok) {
          let errorMessage = 'Failed to generate draft';
          
          // Try to parse error message from response
          try {
            const errorData = await response.json();
            if (errorData && errorData.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // If response is not valid JSON, use text content instead
            const textError = await response.text();
            if (textError) {
              errorMessage = `Server error: ${textError.substring(0, 100)}`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setDraftText(data.draftText);
      } catch (error) {
        console.error('Error generating draft:', error);
        setError(error instanceof Error ? error.message : 'Failed to generate draft');
      } finally {
        setGeneratingDraft(false);
      }
    };
    
    if (extractedText) {
      generateDraft();
    }
  }, [extractedText]);
  
  // Fixed height container for all states to prevent layout shift
  const containerClasses = "w-full max-w-4xl mx-auto min-h-[120px] flex items-center justify-center";
  
  if (isLoading) {
    return (
      <div className={`${containerClasses} p-6 bg-gray-50 rounded-lg shadow-sm`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="text-orange-500">Processing PDF document...</p>
        </div>
      </div>
    );
  }
  
  if (generatingDraft) {
    return (
      <div className={`${containerClasses} p-6 bg-gray-50 rounded-lg shadow-sm`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-6 h-6 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="text-green-600">Generating documentary credit draft...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`${containerClasses} p-6 bg-red-50 rounded-lg shadow-sm text-red-700`}>
        <p className="font-medium">Error:</p>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!draftText) {
    return (
      <div className={`${containerClasses} opacity-0`}></div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-black text-xl font-bold mb-4">Documentary Credit Draft</h2>
      
      <div className="bg-gray-50 text-black p-4 rounded-md mb-6 whitespace-pre-wrap font-mono text-sm">
        {draftText}
      </div>
      
      <div className="flex flex-wrap gap-4">
        <TextDownloadButton 
          content={draftText} 
          fileName="documentary-credit-draft.txt" 
        />
      </div>
    </div>
  );
};

export default ResultDisplay;