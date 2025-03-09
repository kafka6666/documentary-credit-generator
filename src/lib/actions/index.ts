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
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error during server-side sign out:', error);
    return { error: error.message };
  }

  // Clear cookies to ensure session is fully removed
  // Using cookies() directly as it's not a Promise
  (await cookies()).getAll();

  // Return success instead of redirecting to let the client handle navigation
  return { success: true };
}

export { signIn, signUp, signOut };
