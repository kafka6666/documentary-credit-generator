// src/components/UserNav.tsx
'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/lib/actions';

export default function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutSuccess, setSignOutSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          // When we detect a sign out event, update UI accordingly
          setUser(null);
          setSigningOut(false);
          setSignOutSuccess(true);
          // Reset success message after 3 seconds
          setTimeout(() => setSignOutSuccess(false), 3000);
        } else if (!signingOut) {
          // For other events, update user if not in process of signing out
          setUser(session?.user || null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, signingOut]);

  const handleSignOut = async () => {
    try {
      // Set signing out state to true to show loading UI
      setSigningOut(true);
      
      // Allow UI to update before proceeding - just a brief moment
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Sign out on client side first
      await supabase.auth.signOut();
      
      // Then call server action
      await signOut();
      
      // Use a more gentle approach for navigation
      // Delay slightly to allow the signout message to be seen
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error signing out:', error);
      // Reset signing out state if an error occurs
      setSigningOut(false);
    }
  };

  // Reset signingOut state if we somehow got stuck (fallback safety)
  useEffect(() => {
    if (signingOut) {
      // If signing out takes more than 5 seconds, reset the state
      const timeout = setTimeout(() => {
        setSigningOut(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [signingOut]);

  if (loading) {
    return (
      <div className="h-10 w-24 animate-pulse bg-gray-800 rounded"></div>
    );
  }

  if (signingOut) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
        <span className="text-sm text-white">Signing Out...</span>
      </div>
    );
  }

  if (signOutSuccess) {
    return (
      <div className="flex items-center space-x-2">
        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm text-white">Signed Out Successfully!</span>
      </div>
    );
  }

  return user ? (
    <div className="flex items-center space-x-4">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {user.email ? user.email[0].toUpperCase() : '?'}
        </div>
        <div className="ml-3">
          <p className="text-sm text-white font-medium">
            Hello, {user.email?.split('@')[0] || 'User'}
          </p>
          <p className="text-xs text-gray-400">{user.email}</p>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
        disabled={signingOut}
      >
        Sign Out
      </button>
    </div>
  ) : (
    <div className="flex items-center space-x-4">
      <Link
        href="/auth/sign-in"
        className="text-sm text-blue-500 hover:underline"
      >
        Sign In
      </Link>
      <Link
        href="/auth/sign-up"
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}