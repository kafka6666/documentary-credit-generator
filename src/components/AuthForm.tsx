// src/components/AuthForm.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
  initialError?: string | null;
  isLoading?: boolean;
}

export default function AuthForm({ 
  type, 
  onSubmit, 
  initialError = null, 
  isLoading = false 
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError);
  const [loading, setLoading] = useState(isLoading);

  // Update error state when initialError prop changes
  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  // Update loading state when isLoading prop changes
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return; // Prevent multiple submissions
    
    setError(null);
    setLoading(true);

    try {
      await onSubmit(email, password);
      // Note: We don't navigate here anymore, the parent component handles that
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during authentication';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-black border border-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        {type === 'signin' ? 'Sign In' : 'Sign Up'}
      </h2>
      
      {/* Fixed height error container to prevent layout shift */}
      <div className="min-h-[60px] mb-4 flex items-center justify-center">
        {error ? (
          <div className="w-full bg-red-900 border border-red-700 text-white px-4 py-3 rounded opacity-100 transition-opacity duration-300 ease-in-out">
            {error}
          </div>
        ) : (
          <div className="w-full opacity-0 h-0 transition-opacity duration-300 ease-in-out">
            {/* Hidden placeholder to maintain consistent spacing */}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-blue-500 mb-2 font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-blue-500 mb-2 font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 font-medium h-[50px] relative flex items-center justify-center"
        >
          <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
            {type === 'signin' ? 'Sign In' : 'Sign Up'}
          </span>
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center transition-opacity duration-200">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Loading...</span>
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-300">
        {type === 'signin' ? (
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="text-blue-500 hover:underline">
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{' '}
            <Link href="/auth/sign-in" className="text-blue-500 hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}