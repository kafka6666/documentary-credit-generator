'use client';

import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';

export default function UserNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutSuccess, setSignOutSuccess] = useState(false);
  const initialLoadComplete = useRef(false);
  const authChangeInProgress = useRef(false);
  
  // Create the Supabase client only once
  const supabase = createClient();

  // Load stored user data from localStorage on initial mount
  useEffect(() => {
    // Only run this once on component mount
    if (typeof window !== 'undefined') {
      const storedUserData = localStorage.getItem('userNavState');
      
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          // Only use stored data if it's recent (less than 1 hour old)
          const isRecent = (new Date().getTime() - userData.lastUpdated) < 3600000;
          
          if (isRecent && userData.email) {
            // Use stored data to prevent flicker while actual data loads
            setUser({
              id: userData.id,
              email: userData.email,
              app_metadata: {},
              user_metadata: {},
              aud: '',
              created_at: ''
            } as User);
            
            // Still loading but we have initial data to show
            setLoading(false);
          }
        } catch (e) {
          // If there's an error parsing the stored data, ignore it
          localStorage.removeItem('userNavState');
          console.log(e);
        }
      }
    }
  }, []);
  
  // Function to fetch and update user state with better error handling
  const refreshUserState = useCallback(async () => {
    // Don't refresh if we're in the middle of an auth change or signing out
    if (authChangeInProgress.current || signingOut) return;
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      // If there's no session or an error, the user is not logged in
      if (!data.session || error) {
        setUser(null);
        // Clear stored user data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userNavState');
        }
        return;
      }
      
      // If we have a session, get the user data
      setUser(data.session.user);
      
      // Store minimal user data in localStorage for persistence between renders
      if (typeof window !== 'undefined' && data.session.user) {
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email,
          lastUpdated: new Date().getTime()
        };
        localStorage.setItem('userNavState', JSON.stringify(userData));
      }
    } catch (error) {
      // Don't log expected auth errors to avoid console spam
      if (error && typeof error === 'object' && 'name' in error && 
          error.name === 'AuthSessionMissingError') {
        // This is an expected error when not logged in, just set user to null
        setUser(null);
      } else {
        console.error('Unexpected error getting user:', error);
        setUser(null);
      }
    } finally {
      setLoading(false);
      initialLoadComplete.current = true;
    }
  }, [supabase.auth, signingOut]);

  // Fetch user state after initial load
  useEffect(() => {
    // Only fetch if we haven't already loaded from localStorage
    if (!initialLoadComplete.current) {
      refreshUserState();
    }
  }, [refreshUserState]);

  useEffect(() => {
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Set flag to prevent concurrent auth operations
        authChangeInProgress.current = true;
        
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN') {
          // When user signs in, update state without forcing a page refresh
          setSigningOut(false);
          
          if (session?.user) {
            setUser(session.user);
            
            // Store user data in localStorage
            if (typeof window !== 'undefined') {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                lastUpdated: new Date().getTime()
              };
              localStorage.setItem('userNavState', JSON.stringify(userData));
            }
          }
          
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          // When we detect a sign out event, update UI accordingly
          setUser(null);
          setSigningOut(false);
          setSignOutSuccess(true);
          
          // Clear stored user data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userNavState');
          }
          
          // Reset success message after 3 seconds
          setTimeout(() => setSignOutSuccess(false), 3000);
        } else if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          // For other events, update user if not in process of signing out
          if (!signingOut && session) {
            setUser(session.user);
            setLoading(false);
            
            // Update stored user data
            if (typeof window !== 'undefined') {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                lastUpdated: new Date().getTime()
              };
              localStorage.setItem('userNavState', JSON.stringify(userData));
            }
          }
        }
        
        // Reset flag after a short delay to allow state updates to complete
        setTimeout(() => {
          authChangeInProgress.current = false;
        }, 500);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth, signingOut]);

  const handleSignOut = async () => {
    try {
      // Prevent multiple sign out attempts
      if (signingOut) return;

      // Set signing out state to true to show loading UI
      setSigningOut(true);

      // Clear stored user data immediately to prevent flicker on page navigation
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userNavState');
      }

      // Focus on client-side sign out which is more reliable
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Skip the server action call since it's causing errors
      // The middleware will handle session cleanup on the next request
      
      // Show success message
      setUser(null);
      setSigningOut(false);
      setSignOutSuccess(true);
      
      // Delay navigation slightly to allow the success message to be seen
      setTimeout(() => {
        // Use a full page refresh to ensure all state is cleared
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Even if there's an error, try to clean up the UI state
      // This helps prevent the user from getting stuck
      setSigningOut(false);
      
      // Clear local storage as a fallback
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userNavState');
      }
      
      // Force a page refresh as a last resort
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
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

  // Fixed height container for all auth states to prevent layout shift
  const navContainerClasses = 'h-[48px] flex items-center';

  // Don't show loading state if we already have user data from localStorage
  if (loading && !user) {
    return (
      <div className={navContainerClasses}>
        <div className="h-10 w-24 animate-pulse bg-gray-800 rounded"></div>
      </div>
    );
  }

  if (signingOut) {
    return (
      <div className={navContainerClasses}>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          <span className="text-sm text-white">Signing Out...</span>
        </div>
      </div>
    );
  }

  if (signOutSuccess) {
    return (
      <div className={navContainerClasses}>
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 text-green-500"
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
          <span className="text-sm text-white">Signed Out Successfully!</span>
        </div>
      </div>
    );
  }

  return (
    <div className={navContainerClasses} data-component-name="UserNav">
      {user ? (
        <div className="flex items-center space-x-4" data-component-name="UserNav">
          <div className="flex items-center" data-component-name="UserNav">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold" data-component-name="UserNav">
              {user.email ? user.email[0].toUpperCase() : '?'}
            </div>
            <div className="ml-3">
              <p className="text-sm text-white font-medium" data-component-name="UserNav">
                Hello, {user.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400" data-component-name="UserNav">{user.email}</p>
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
      )}
    </div>
  );
}
