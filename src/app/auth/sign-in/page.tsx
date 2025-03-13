// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { createClient } from '@/utils/supabase/client';

// Add export configuration to prevent static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for messages from different sources
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // First check URL parameters (for backward compatibility)
    const fromSignup = searchParams?.get('fromSignup');
    const accountExists = searchParams?.get('accountExists');
    
    if (accountExists === 'true') {
      setSuccessMessage('You are already signed up with us. Please sign in here');
      return;
    }
    
    if (fromSignup === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
      return;
    }
    
    // Then check localStorage for messages from the new flow
    const signupMessage = localStorage.getItem('signUpRedirectMessage');
    if (signupMessage) {
      // If the message indicates an existing account, replace it with our standard message
      if (signupMessage.toLowerCase().includes('already registered') || 
          signupMessage.toLowerCase().includes('already exists') ||
          signupMessage.toLowerCase().includes('already have an account')) {
        setSuccessMessage('You are already signed up with us. Please sign in here');
      } else {
        setSuccessMessage(signupMessage);
      }
      localStorage.removeItem('signUpRedirectMessage');
    }
  }, [searchParams]);

  const handleSignIn = async (email: string, password: string) => {
    // Clear any previous messages
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // First try client-side sign-in to set cookies properly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Set error message and throw error to prevent further execution
        setErrorMessage(error.message);
        setIsLoading(false);
        return; // Stop execution here instead of throwing
      }

      if (!data.session) {
        setErrorMessage('Failed to create session');
        setIsLoading(false);
        return;
      }

      // Store user data in localStorage for immediate UI update
      if (typeof window !== 'undefined' && data.session.user) {
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email,
          lastUpdated: new Date().getTime()
        };
        localStorage.setItem('userNavState', JSON.stringify(userData));
      }

      // Set success message
      setSuccessMessage('Sign in successful! Redirecting...');
      
      // Use Next.js router for client-side navigation instead of full page refresh
      setTimeout(() => {
        router.push('/');
        router.refresh(); // Refresh the current route to update server components
      }, 800);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if the success message is about an existing account
  const isExistingAccountMessage = successMessage && (
    successMessage.toLowerCase().includes('already signed up') || 
    successMessage.toLowerCase().includes('already registered') || 
    successMessage.toLowerCase().includes('already exists') ||
    successMessage.toLowerCase().includes('already have an account')
  );

  return (
    <div className="min-h-screen py-12 px-4 flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white mb-2 hover:text-blue-500 transition-colors">
              Documentary Credit Generator
            </h1>
          </Link>
          <p className="text-blue-500">
            Sign in to access document generation features
          </p>
        </div>

        {successMessage && (
          <div className={`mb-6 p-3 ${isExistingAccountMessage ? 'bg-yellow-900 border-yellow-700' : 'bg-green-900 border-green-700'} border text-white rounded flex items-center`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 mr-2 ${isExistingAccountMessage ? 'text-yellow-400' : 'text-green-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isExistingAccountMessage ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              )}
            </svg>
            {successMessage}
          </div>
        )}

        <AuthForm 
          type="signin" 
          onSubmit={handleSignIn} 
          isLoading={isLoading}
          initialError={errorMessage}
        />
      </div>
    </div>
  );
}
