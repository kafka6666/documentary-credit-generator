// src/components/ProtectedFileUpload.tsx
'use client';

import React from 'react';
import ProtectedPage from './ProtectedPage';
import FileUpload from './FileUpload';

interface ProtectedFileUploadProps {
  onFileUploaded: (extractedText: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const ProtectedFileUpload: React.FC<ProtectedFileUploadProps> = ({ onFileUploaded, setIsLoading }) => {
  return (
    <ProtectedPage>
      <FileUpload onFileUploaded={onFileUploaded} setIsLoading={setIsLoading} />
    </ProtectedPage>
  );
};

export default ProtectedFileUpload;