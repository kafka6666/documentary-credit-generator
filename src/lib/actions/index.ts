// src/lib/actions/index.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
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

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  // Instead of just returning success, redirect to sign-in with a query parameter
  redirect('/auth/sign-in?fromSignup=true');
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
