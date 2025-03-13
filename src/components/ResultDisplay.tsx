// src/components/ResultDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TextDownloadButton from '../components/TextDownloadButton';
import EditTextButton from '../components/EditTextButton';

interface ResultDisplayProps {
  extractedText: string;
  isLoading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ extractedText, isLoading }) => {
  const [draftText, setDraftText] = useState<string>('');
  const [generatingDraft, setGeneratingDraft] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTimer, setGenerationTimer] = useState<number>(0);
  
  // Timer for draft generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (generatingDraft && generationTimer >= 0) {
      interval = setInterval(() => {
        setGenerationTimer(prev => prev + 1);
      }, 1000);
    } else if (!generatingDraft) {
      setGenerationTimer(0);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generatingDraft, generationTimer]);
  
  // Format time helper function
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
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
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Fixed height container for processing message to prevent layout shift */}
      <div className="h-[52px] mt-4">
        {generatingDraft ? (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating documentary credit draft...</span>
              </div>
              <span className="text-xs font-mono">{formatTime(generationTimer)}</span>
            </div>
          </div>
        ) : (
          <div className="hidden">Placeholder for processing message</div>
        )}
      </div>
      
      {isLoading ? (
        <div className={`${containerClasses} p-6 bg-gray-50 rounded-lg shadow-sm mt-4`}>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
            <p className="text-orange-500">Processing PDF document...</p>
          </div>
        </div>
      ) : generatingDraft ? (
        <div className={`${containerClasses} p-6 bg-gray-50 rounded-lg shadow-sm mt-4`}>
          <div className="flex items-center justify-center space-x-2">
            <p className="text-gray-400">Preparing your documentary credit draft...</p>
          </div>
        </div>
      ) : error ? (
        <div className={`${containerClasses} p-6 bg-red-50 rounded-lg shadow-sm text-red-700 mt-4`}>
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      ) : !draftText ? (
        <div className={`${containerClasses} opacity-0 mt-4`}></div>
      ) : (
        <div className="w-full p-6 bg-white rounded-lg shadow-md mt-4">
          <h2 className="text-black text-xl font-bold mb-4">Documentary Credit Draft</h2>
          
          <div className="bg-gray-50 text-black p-4 rounded-md mb-6 whitespace-pre-wrap font-mono text-sm">
            {draftText}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <TextDownloadButton 
              content={draftText} 
              fileName="documentary-credit-draft.txt" 
            />
            <EditTextButton
              content={draftText}
              onSave={(editedContent) => setDraftText(editedContent)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;