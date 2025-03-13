-- User Database Schema for Documentary Credit AI Application

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    role TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_start_date TIMESTAMP WITH TIME ZONE,
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    document_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User document uploads
CREATE TABLE IF NOT EXISTS document_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document processing results
CREATE TABLE IF NOT EXISTS document_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    result_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscription history
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    previous_tier TEXT,
    new_tier TEXT,
    change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_amount DECIMAL(10, 2),
    payment_status TEXT,
    payment_reference TEXT
);

-- User activity logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for security
-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Document uploads policies
ALTER TABLE document_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_uploads_select_own ON document_uploads
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY document_uploads_insert_own ON document_uploads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY document_uploads_update_own ON document_uploads
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY document_uploads_delete_own ON document_uploads
    FOR DELETE
    USING (auth.uid() = user_id);

-- Document results policies
ALTER TABLE document_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_results_select_own ON document_results
    FOR SELECT
    USING (auth.uid() = user_id);

-- Subscription history policies
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_history_select_own ON subscription_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- User activity logs policies
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_activity_logs_select_own ON user_activity_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_document_uploads_timestamp
BEFORE UPDATE ON document_uploads
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_document_results_timestamp
BEFORE UPDATE ON document_results
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Function to create a user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_uploads_user_id ON document_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_document_results_user_id ON document_results(user_id);
CREATE INDEX IF NOT EXISTS idx_document_results_document_id ON document_results(document_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
