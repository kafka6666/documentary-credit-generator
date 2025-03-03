// src/app/auth/sign-up/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { signUp } from '@/lib/actions';

export default function SignUp() {
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  
  // Check for any success message stored in localStorage on component mount
  useEffect(() => {
    const storedMessage = localStorage.getItem('signUpSuccessMessage');
    if (storedMessage) {
      setMessage(storedMessage);
      // Clear the message from localStorage after retrieving it
      localStorage.removeItem('signUpSuccessMessage');
    }
  }, []);
  
  const handleSignUp = async (email: string, password: string) => {
    // Create a FormData object to pass to the server action
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const result = await signUp(formData);
      
      if (result && 'error' in result) {
        throw new Error(result.error);
      }
      
      // If we get here, it means the redirect didn't happen (client-side rendering)
      // So we'll just set a default success message
      const successMessage = 'Your account has been created! Check your email for the confirmation link.';
        
      // Store the success message in localStorage to persist across redirects
      localStorage.setItem('signUpSuccessMessage', successMessage);
      setMessage(successMessage);
      
    } catch (error) {
      if (error instanceof Error) {
        throw error; // Re-throw so AuthForm can handle it
      }
      throw error;
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
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">Success!</h2>
            <p className="mb-6 text-gray-300">{message}</p>
            <button
              onClick={() => router.push('/auth/sign-in')}
              className="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 font-medium"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <AuthForm type="signup" onSubmit={handleSignUp} />
        )}
      </div>
    </div>
  );
}