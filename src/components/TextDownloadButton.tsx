// React component for the download button
'use client';

import React from 'react';
import { downloadAsTextFile } from '../lib/downloadAsTextFile';
interface TextDownloadProps {
    content: string;
    fileName?: string;
  }
  
export default function TextDownloadButton({ 
    content, 
    fileName = 'documentary-credit-draft.txt' 
  }: TextDownloadProps) {
    const handleDownload = () => {
      downloadAsTextFile(content, fileName);
    };
  
    return React.createElement(
      'button',
      {
        onClick: handleDownload,
        className: "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      },
      "Download as TXT"
    );
  };