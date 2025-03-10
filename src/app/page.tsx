// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ResultDisplay from '@/components/ResultDisplay';
import FileUpload from '@/components/FileUpload';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const supabase = createClient();
  
  useEffect(() => {
    // Initial auth check
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user);
    };
    
    checkAuth();
    
    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      // Update authentication state based on session
      setIsAuthenticated(!!session?.user);
      
      // Clear results when user signs out
      if (event === 'SIGNED_OUT') {
        setExtractedText('');
      }
    });
    
    // Cleanup subscription when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-center my-8">
          Documentary Credit Generator
        </h1>
        <p className="text-lg text-gray-300 text-center mb-12">
          Upload your documents to generate UCP 600 compliant documentary credit drafts
        </p>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-orange-500 text-xl font-semibold mb-4 text-center">Upload Document</h2>
            <FileUpload 
              onFileUploaded={setExtractedText} 
              setIsLoading={setIsLoading}
              isAuthenticated={isAuthenticated}
              redirectToSignIn={() => window.location.href = "/auth/sign-in?redirectTo=/"}
            />
          </section>

          {/* Draft output section with consistent appearance */}
          <section className="border border-gray-800 rounded-lg p-6 bg-gray-900 min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4 text-orange-500 text-center">Generated Draft</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : extractedText ? (
              <ResultDisplay 
                extractedText={extractedText} 
                isLoading={isLoading} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-gray-500 mb-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p className="text-gray-400 text-lg">Upload a document to generate a draft</p>
                <p className="text-gray-500 mt-2">Your generated content will appear here</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}