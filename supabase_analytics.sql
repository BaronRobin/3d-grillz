-- 1. Create the Activity Logs Table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visitor_id TEXT NOT NULL,
    user_email TEXT,
    session_duration_sec INTEGER,
    max_scroll_depth INTEGER,
    action_type TEXT NOT NULL,
    detail TEXT NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies
-- Allow anyone to anonymously insert telemetry data (the React app will push these)
CREATE POLICY "Allow anonymous telemetry logging" 
    ON public.activity_logs 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Only Admins can read the telemetry data
CREATE POLICY "Admins can view all activity logs" 
    ON public.activity_logs 
    FOR SELECT 
    TO authenticated 
    USING (
        auth.jwt() ->> 'email' = 'YOUR_PERSONAL_EMAIL_HERE'
    );
