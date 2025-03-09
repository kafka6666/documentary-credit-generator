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

          {/* Fixed height container for results to prevent layout shift */}
          <section className="min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4">Generated Draft</h2>
            {extractedText && (
              <ResultDisplay 
                extractedText={extractedText} 
                isLoading={isLoading} 
              />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}