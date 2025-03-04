// src/components/FileUpload.tsx
'use client';

import React, { useCallback, useState } from 'react';
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
  isAuthenticated = true,
  redirectToSignIn 
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    // Check if file is PDF
    if (!file.type.includes('pdf')) {
      setUploadError('Please upload a PDF file');
      return;
    }
    
    // If user is not authenticated, redirect to sign in
    if (!isAuthenticated && redirectToSignIn) {
      redirectToSignIn();
      return;
    }
    
    setIsLoading(true);
    setUploadError(null);
    
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
    }
  }, [onFileUploaded, setIsLoading, isAuthenticated, redirectToSignIn]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors h-[180px] flex items-center justify-center ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        style={{ minHeight: '180px' }}
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
          {!isAuthenticated && (
            <p className="text-xs text-blue-500 mt-2">
              You&#39;ll need to sign in to process documents
            </p>
          )}
        </div>
      </div>

      {/* Fixed height container for error message to prevent layout shift */}
      <div className="h-[60px] mt-4">
        {uploadError && (
          <div className="p-3 bg-red-900 border border-red-700 text-white rounded text-sm">
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;