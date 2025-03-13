// src/lib/actions/index.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  // Ensure cookies are properly set
  const cookieStore = await cookies();
  cookieStore.getAll(); // Force cookies to be processed

  // Return success instead of redirecting to let the client handle navigation
  return { success: true };
}

async function signUp(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Try to sign up the user
  const { data: signUpData, error } = await supabase.auth.signUp(data);

  // Handle various error cases
  if (error) {
    // Check for specific error messages related to existing users
    if (error.message.toLowerCase().includes("already registered") || 
        error.message.toLowerCase().includes("already in use") || 
        error.message.toLowerCase().includes("already exists") ||
        error.message.toLowerCase().includes("email already")) {
      // Return a clear error instead of redirecting
      return { error: "You are already signed up with us. Please sign in here" };
    }
    return { error: error.message };
  }

  // If signUpData.user is null, it may indicate an existing account in some cases
  // Supabase sometimes returns success with no user for existing accounts
  if (!signUpData.user) {
    return { error: "You are already signed up with us. Please sign in here" };
  }

  // Successful sign-up - redirect to sign-in
  return { success: true, message: "Account created successfully! Please sign in." };
}

async function signOut() {
  try {
    const supabase = await createClient();
    
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error during server-side sign out:', error);
      return { error: error.message };
    }
    
    // In server actions, we can't directly manipulate cookies the same way as in client-side code
    // The Supabase client should handle clearing the auth cookies for us
    // We'll just return success and let the client handle the UI updates
    
    return { success: true };
  } catch (err) {
    console.error('Unexpected error during sign out:', err);
    // Still return success so the client can proceed with UI updates
    // This prevents the user from getting stuck in a broken state
    return { success: true, warning: 'Partial sign out completed' };
  }
}

export { signIn, signUp, signOut };
