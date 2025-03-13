// Database types for Documentary Credit AI Application

export interface User {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  role?: string;
  subscription_tier: string;
  subscription_status: string;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  document_credits: number;
  created_at: Date;
  updated_at: Date;
}

export interface DocumentUpload {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface DocumentResult {
  id: string;
  document_id: string;
  user_id: string;
  result_data: Record<string, unknown>; 
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionHistory {
  id: string;
  user_id: string;
  previous_tier?: string;
  new_tier: string;
  change_date: Date;
  payment_amount?: number;
  payment_status?: string;
  payment_reference?: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  activity_details: Record<string, unknown>; 
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface Database {
  users: User[];
  document_uploads: DocumentUpload[];
  document_results: DocumentResult[];
  subscription_history: SubscriptionHistory[];
  user_activity_logs: UserActivityLog[];
}
