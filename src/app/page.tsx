// app/page.tsx
'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ResultDisplay from '@/components/ResultDisplay';

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">
            Documentary Credit Generator
          </h1>
          <p className="text-blue-500 max-w-2xl mx-auto">
            Upload a PDF containing documentary credit information to automatically generate 
            a UCP 600 compliant documentary credit draft.
          </p>
        </header>

        <div className="space-y-8">
          <section>
            <h2 className="text-orange-500 text-xl font-semibold mb-4">Upload Document</h2>
            <FileUpload 
              onFileUploaded={setExtractedText} 
              setIsLoading={setIsLoading} 
            />
          </section>

          {(extractedText || isLoading) && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Generated Draft</h2>
              <ResultDisplay 
                extractedText={extractedText} 
                isLoading={isLoading} 
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}