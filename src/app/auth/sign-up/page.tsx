// src/app/auth/sign-up/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { signUp } from '@/lib/actions/index';
import { createClient } from '@/utils/supabase/client';

// Add export configuration to prevent static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function SignUp() {
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  
  // Check for any success message stored in localStorage on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    const storedMessage = localStorage.getItem('signUpSuccessMessage');
    if (storedMessage) {
      setMessage(storedMessage);
      // Clear the message from localStorage after retrieving it
      localStorage.removeItem('signUpSuccessMessage');
    }
  }, []);
  
  const handleSignUp = async (email: string, password: string) => {
    // Clear any previous error messages
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      // First, try a direct signup with the Supabase client to catch existing accounts
      const { error: clientError } = await supabase.auth.signUp({
        email,
        password
      });
      
      // If we detect an existing account error from client-side check
      if (clientError && 
         (clientError.message.includes("already registered") || 
          clientError.message.includes("already in use") || 
          clientError.message.includes("already exists"))) {
        
        // Show the account exists message and provide sign-in option
        setMessage('You are already signed up with us. Please sign in here');
        setIsLoading(false);
        return;
      } else if (clientError) {
        // Handle other client-side errors that were removed
        setErrorMessage(clientError.message);
        setIsLoading(false);
        return;
      }

      // If client-side signup attempt was successful (or server action is preferred),
      // proceed with server action as a fallback or confirmation
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const result = await signUp(formData);
      
      if (result && 'error' in result && result.error) {
        // Handle validation errors from server action
        if (result.error.includes("already registered") || 
            result.error.includes("already in use") || 
            result.error.includes("already exists")) {
          
          setMessage('You are already signed up with us. Please sign in here');
        } else {
          setErrorMessage(result.error);
        }
        setIsLoading(false);
        return;
      }

      // Check for success message from server
      if (result && 'success' in result && result.success) {
        const successMsg = result.message || 'Account created successfully! Please sign in.';
        
        // For redirecting to sign-in page with a success message
        if (router) {
          // Store the message in localStorage for the sign-in page to pick up
          localStorage.setItem('signUpRedirectMessage', successMsg);
          
          // Navigate to sign-in page
          setIsLoading(false);
          router.push('/auth/sign-in');
          return;
        }
        
        // Fallback if router isn't available
        setMessage(successMsg);
        setIsLoading(false);
        return;
      }
      
      // If we get here, it means a successful signup without a specific message
      const successMessage = 'Your account has been created! Check your email for the confirmation link.';
        
      // Store the success message in localStorage to persist across redirects
      localStorage.setItem('signUpSuccessMessage', successMessage);
      setMessage(successMessage);
      
    } catch (error) {
      // Handle unexpected errors
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred during sign up');
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
            Create an account to access document generation features
          </p>
        </div>
        
        {message ? (
          <div className="p-8 bg-black border border-gray-800 rounded-lg shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-16 h-16 ${message.includes("already signed up") ? "bg-yellow-500" : "bg-green-500"} rounded-full flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {message.includes("already signed up") 
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  }
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              {message.includes("already signed up") ? "Account Exists" : "Success!"}
            </h2>
            <p className="mb-6 text-gray-300">{message}</p>
            <button
              onClick={() => router.push('/auth/sign-in')}
              className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 font-medium"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <AuthForm 
            type="signup" 
            onSubmit={handleSignUp} 
            initialError={errorMessage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}