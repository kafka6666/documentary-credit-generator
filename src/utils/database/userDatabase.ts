import { createClient } from '@/utils/supabase/server';
import { User, DocumentUpload, DocumentResult, UserActivityLog } from '@/types/database';

/**
 * User Database utility functions for Documentary Credit AI Application
 * Provides methods to interact with user data in Supabase
 */
export class UserDatabase {
  /**
   * Get a user by their ID
   * @param userId The user's UUID
   * @returns The user object or null if not found
   */
  static async getUserById(userId: string): Promise<User | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data as User;
  }

  /**
   * Get a user by their email
   * @param email The user's email address
   * @returns The user object or null if not found
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user by email:', error);
      return null;
    }
    
    return data as User;
  }

  /**
   * Update a user's profile information
   * @param userId The user's UUID
   * @param userData Partial user data to update
   * @returns The updated user object or null if update failed
   */
  static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    const supabase = await createClient();
    
    // Remove id from update data if present
    const { ...updateData } = userData;
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data as User;
  }

  /**
   * Create a new document upload record
   * @param uploadData Document upload data
   * @returns The created document upload record or null if creation failed
   */
  static async createDocumentUpload(uploadData: Omit<DocumentUpload, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentUpload | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('document_uploads')
      .insert(uploadData)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating document upload:', error);
      return null;
    }
    
    return data as DocumentUpload;
  }

  /**
   * Get all document uploads for a user
   * @param userId The user's UUID
   * @returns Array of document uploads or empty array if none found
   */
  static async getUserDocumentUploads(userId: string): Promise<DocumentUpload[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('document_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      console.error('Error fetching user document uploads:', error);
      return [];
    }
    
    return data as DocumentUpload[];
  }

  /**
   * Update a document upload's status
   * @param documentId The document upload ID
   * @param status The new status
   * @returns The updated document upload or null if update failed
   */
  static async updateDocumentStatus(documentId: string, status: DocumentUpload['status']): Promise<DocumentUpload | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('document_uploads')
      .update({ status })
      .eq('id', documentId)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating document status:', error);
      return null;
    }
    
    return data as DocumentUpload;
  }

  /**
   * Create a document result record
   * @param resultData Document result data
   * @returns The created document result or null if creation failed
   */
  static async createDocumentResult(resultData: Omit<DocumentResult, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentResult | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('document_results')
      .insert(resultData)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating document result:', error);
      return null;
    }
    
    return data as DocumentResult;
  }

  /**
   * Get document results for a specific document
   * @param documentId The document ID
   * @returns The document result or null if not found
   */
  static async getDocumentResult(documentId: string): Promise<DocumentResult | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('document_results')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching document result:', error);
      return null;
    }
    
    return data as DocumentResult;
  }

  /**
   * Update a user's subscription
   * @param userId The user's UUID
   * @param subscriptionData Subscription data to update
   * @returns The updated user or null if update failed
   */
  static async updateUserSubscription(
    userId: string, 
    subscriptionData: {
      subscription_tier: string;
      subscription_status: string;
      subscription_start_date?: Date;
      subscription_end_date?: Date;
      document_credits?: number;
    }
  ): Promise<User | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('users')
      .update(subscriptionData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating user subscription:', error);
      return null;
    }
    
    // Create subscription history record
    await supabase.from('subscription_history').insert({
      user_id: userId,
      new_tier: subscriptionData.subscription_tier,
      // Other fields can be added as needed
    });
    
    return data as User;
  }

  /**
   * Log user activity
   * @param activityData User activity data
   * @returns The created activity log or null if creation failed
   */
  static async logUserActivity(
    activityData: Omit<UserActivityLog, 'id' | 'created_at'>
  ): Promise<UserActivityLog | null> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_activity_logs')
      .insert(activityData)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error logging user activity:', error);
      return null;
    }
    
    return data as UserActivityLog;
  }

  /**
   * Get user activity logs
   * @param userId The user's UUID
   * @param limit Maximum number of logs to return
   * @returns Array of user activity logs or empty array if none found
   */
  static async getUserActivityLogs(userId: string, limit = 50): Promise<UserActivityLog[]> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error || !data) {
      console.error('Error fetching user activity logs:', error);
      return [];
    }
    
    return data as UserActivityLog[];
  }

  /**
   * Check if a user has enough document credits
   * @param userId The user's UUID
   * @returns Boolean indicating if user has credits
   */
  static async hasDocumentCredits(userId: string): Promise<boolean> {
    const user = await UserDatabase.getUserById(userId);
    return user ? user.document_credits > 0 : false;
  }

  /**
   * Decrement a user's document credits
   * @param userId The user's UUID
   * @returns The updated user or null if update failed
   */
  static async useDocumentCredit(userId: string): Promise<User | null> {
    const supabase = await createClient();
    
    // First get current credits
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('document_credits')
      .eq('id', userId)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user credits:', userError);
      return null;
    }
    
    // Only decrement if user has credits
    if (userData.document_credits <= 0) {
      console.error('User has no document credits');
      return null;
    }
    
    // Update credits
    const { data, error } = await supabase
      .from('users')
      .update({ document_credits: userData.document_credits - 1 })
      .eq('id', userId)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error using document credit:', error);
      return null;
    }
    
    return data as User;
  }
}
