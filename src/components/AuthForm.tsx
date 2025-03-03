// src/components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AuthFormProps {
  type: 'signin' | 'signup';
  onSubmit: (email: string, password: string) => Promise<void>;
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(email, password);
      router.push('/');
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-black border border-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">
        {type === 'signin' ? 'Sign In' : 'Sign Up'}
      </h2>
      
      {error && (
        <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

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
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 font-medium"
        >
          {loading
            ? 'Loading...'
            : type === 'signin'
            ? 'Sign In'
            : 'Sign Up'}
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