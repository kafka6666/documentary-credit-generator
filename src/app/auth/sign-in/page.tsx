// src/app/auth/sign-in/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { signIn } from '@/lib/actions';

export default function SignIn() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    // Create a FormData object to pass to the server action
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const result = await signIn(formData);

      // If there's an error from the server action
      if (result && 'error' in result) {
        throw new Error(result.error);
      }

      // The server action will handle redirect on success
      // But we'll set a success message for a brief moment
      setSuccessMessage('Sign in successful! Redirecting...');

      // Redirect will be handled by the server action
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
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

        {successMessage && (
          <div className="mt-4 p-3 bg-green-900 border border-green-700 text-white rounded flex items-center">
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
      </div>
    </div>
  );
}
