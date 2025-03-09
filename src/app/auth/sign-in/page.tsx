// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { createClient } from '@/utils/supabase/client';

export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
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
