// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { signIn } from '@/lib/actions/index';
import { createClient } from '@/utils/supabase/client';

export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  // Check if there's a signup success message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromSignup = params.get('fromSignup');

    if (fromSignup === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, []);

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
        throw new Error(error.message);
      }

      if (!data.session) {
        throw new Error('Failed to create session');
      }

      // Set success message
      setSuccessMessage('Sign in successful! Redirecting...');
      
      // Force a full page refresh to ensure all components update
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
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
          <div className="mb-6 p-3 bg-green-900 border border-green-700 text-white rounded flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {successMessage}
          </div>
        )}

        <AuthForm type="signin" onSubmit={handleSignIn} />

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-900 border border-red-700 text-white rounded flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {errorMessage}
          </div>
        )}

        {isLoading && (
          <div className="mt-4 p-3 bg-blue-900 border border-blue-700 text-white rounded flex items-center justify-center">
            <div className="h-5 w-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin mr-2"></div>
            <span>Signing in...</span>
          </div>
        )}
      </div>
    </div>
  );
}
