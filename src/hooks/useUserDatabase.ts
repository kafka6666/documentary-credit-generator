import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, DocumentUpload, DocumentResult } from '@/types/database';
import { useRouter } from 'next/navigation';

/**
 * Hook for interacting with the user database from client components
 */
export function useUserDatabase() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // Fetch current user data on mount
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        setLoading(true);
        
        // Get current authenticated user
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Get user profile from database
        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profileError || !data) {
          console.error('Error fetching user profile:', profileError);
          setError('Failed to load user profile');
          setUser(null);
        } else {
          setUser(data as User);
          setError(null);
        }
      } catch (err) {
        console.error('Unexpected error in useUserDatabase:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Fetch user profile when signed in
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (data) {
            setUser(data as User);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  /**
   * Update the current user's profile
   * @param userData Partial user data to update
   */
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) {
      setError('No user is currently logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user profile:', error);
        setError('Failed to update profile');
        return null;
      }
      
      setUser(data as User);
      return data as User;
    } catch (err) {
      console.error('Unexpected error updating profile:', err);
      setError('An unexpected error occurred');
      return null;
    }
  };

  /**
   * Get all document uploads for the current user
   */
  const getUserDocuments = async () => {
    if (!user) {
      setError('No user is currently logged in');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user documents:', error);
        setError('Failed to load documents');
        return [];
      }
      
      return data as DocumentUpload[];
    } catch (err) {
      console.error('Unexpected error fetching documents:', err);
      setError('An unexpected error occurred');
      return [];
    }
  };

  /**
   * Create a new document upload
   * @param uploadData Document upload data
   */
  const createDocumentUpload = async (uploadData: Omit<DocumentUpload, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      setError('No user is currently logged in');
      return null;
    }

    try {
      // Check if user has document credits
      if (user.document_credits <= 0 && user.subscription_tier === 'free') {
        setError('You have no document credits remaining');
        return null;
      }

      const { data, error } = await supabase
        .from('document_uploads')
        .insert({
          ...uploadData,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error creating document upload:', error);
        setError('Failed to upload document');
        return null;
      }

      // Decrement user's document credits if on free tier
      if (user.subscription_tier === 'free') {
        await supabase
          .from('users')
          .update({ document_credits: user.document_credits - 1 })
          .eq('id', user.id);
        
        // Update local user state
        setUser({
          ...user,
          document_credits: user.document_credits - 1
        });
      }
      
      // Log user activity
      await supabase.from('user_activity_logs').insert({
        user_id: user.id,
        activity_type: 'document_upload',
        activity_details: { document_id: data.id, file_name: data.file_name }
      });
      
      return data as DocumentUpload;
    } catch (err) {
      console.error('Unexpected error creating document upload:', err);
      setError('An unexpected error occurred');
      return null;
    }
  };

  /**
   * Get document result for a specific document
   * @param documentId The document ID
   */
  const getDocumentResult = async (documentId: string) => {
    if (!user) {
      setError('No user is currently logged in');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('document_results')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching document result:', error);
        setError('Failed to load document result');
        return null;
      }
      
      return data as DocumentResult;
    } catch (err) {
      console.error('Unexpected error fetching document result:', err);
      setError('An unexpected error occurred');
      return null;
    }
  };

  /**
   * Check if user has enough document credits
   */
  const hasDocumentCredits = () => {
    if (!user) return false;
    
    // Users with paid subscriptions always have credits
    if (user.subscription_tier !== 'free') return true;
    
    // Free tier users need to have document credits
    return user.document_credits > 0;
  };

  return {
    user,
    loading,
    error,
    updateUserProfile,
    getUserDocuments,
    createDocumentUpload,
    getDocumentResult,
    hasDocumentCredits,
    setError
  };
}
