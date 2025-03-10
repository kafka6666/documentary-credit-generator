// src/components/FileUpload.tsx
'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUploaded: (extractedText: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isAuthenticated?: boolean;
  redirectToSignIn?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUploaded, 
  setIsLoading,
  isAuthenticated = false,
  redirectToSignIn 
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processingTimer, setProcessingTimer] = useState<number>(0);

  // Timer for processing large PDFs
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (processingStatus && processingTimer >= 0) {
      interval = setInterval(() => {
        setProcessingTimer(prev => prev + 1);
      }, 1000);
    } else if (!processingStatus) {
      setProcessingTimer(0);
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processingStatus, processingTimer]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check if file is PDF
    if (!file.type.includes('pdf')) {
      setUploadError('Please upload a PDF file');
      return;
    }
    
    // If user is not authenticated, redirect to sign in
    if (!isAuthenticated) {
      setUploadError('Authentication required. Please sign in to process documents.');
      if (redirectToSignIn) {
        redirectToSignIn();
      }
      return;
    }
    
    // Check file size and set appropriate processing message
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 15) {
      setUploadError('File size exceeds the 15MB limit. Please upload a smaller PDF file.');
      return;
    }
    
    setIsLoading(true);
    setUploadError(null);
    
    // Set initial processing status based on file size
    if (fileSizeMB > 5) {
      setProcessingStatus('Processing large PDF document. This may take up to 2 minutes...');
    } else {
      setProcessingStatus('Processing PDF document...');
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Call API to extract text from PDF
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to extract text from PDF';
        
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
      onFileUploaded(data.extractedText);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to process PDF');
    } finally {
      setIsLoading(false);
      setProcessingStatus(null);
    }
  }, [onFileUploaded, setIsLoading, isAuthenticated, redirectToSignIn]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  // Format processing time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors flex items-center justify-center ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        style={{ height: '200px', minHeight: '200px' }}
        data-component-name="FileUpload"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            className="w-12 h-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="48"
            height="48"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium">Drag and drop your PDF file here</p>
          <p className="text-sm text-gray-500">or click to browse files</p>
          {/* Reserve space for the auth message to prevent layout shift */}
          <div className="h-6">
            {!isAuthenticated && (
              <p className="text-xs text-blue-500">
                You&#39;ll need to sign in to process documents
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Processing status message */}
      {processingStatus && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{processingStatus}</span>
            </div>
            <span className="text-xs font-mono">{formatTime(processingTimer)}</span>
          </div>
        </div>
      )}

      {/* Fixed height container for error message to prevent layout shift */}
      <div className="h-16 mt-4 flex items-center justify-center">
        {uploadError ? (
          <div className="p-3 bg-red-900 border border-red-700 text-white rounded text-sm w-full">
            {uploadError}
          </div>
        ) : (
          <div className="hidden">Placeholder</div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;