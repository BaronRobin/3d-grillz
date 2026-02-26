-- 0. Drop existing tables to refresh schema
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;

-- 1. Create the Tickets Table
CREATE TABLE public.tickets (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    material_id TEXT NOT NULL,
    comments TEXT NOT NULL,
    device_os TEXT NOT NULL DEFAULT 'Unknown',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending'
);

-- 2. Create the Orders Table
CREATE TABLE public.orders (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    model_type INTEGER NOT NULL,
    current_stage INTEGER NOT NULL DEFAULT 0,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    comments TEXT,
    admin_notes TEXT DEFAULT '',
    device_os TEXT NOT NULL DEFAULT 'Unknown',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable Row-Level Security (RLS) to Protect Data
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Public Access Rules
CREATE POLICY "Allow public to submit tickets" 
    ON public.tickets 
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- 5. Strict Authenticated Rules (Users see only their tickets/orders, Admins see all)
-- Tickets:
CREATE POLICY "Users can view their own tickets or admins can view all" 
    ON public.tickets 
    FOR SELECT 
    TO authenticated 
    USING (
        auth.jwt() ->> 'email' = email 
        OR auth.jwt() ->> 'email' = 'YOUR_PERSONAL_EMAIL_HERE'
    );

CREATE POLICY "Admins can update tickets" 
    ON public.tickets 
    FOR UPDATE 
    TO authenticated 
    USING (auth.jwt() ->> 'email' = 'YOUR_PERSONAL_EMAIL_HERE');

-- Orders:
CREATE POLICY "Users can view their own orders or admins can view all" 
    ON public.orders 
    FOR SELECT 
    TO authenticated 
    USING (
        auth.jwt() ->> 'email' = email 
        OR auth.jwt() ->> 'email' = 'YOUR_PERSONAL_EMAIL_HERE'
    );

CREATE POLICY "Admins can insert/update orders" 
    ON public.orders 
    FOR ALL 
    TO authenticated 
    USING (auth.jwt() ->> 'email' = 'YOUR_PERSONAL_EMAIL_HERE');
