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
    TO anon 
    WITH CHECK (true);

-- Allow admins to read/update the tables without authenticated login yet (temporarily allowed for the local admin mock to fetch data)
CREATE POLICY "Allow anon admin access" 
    ON public.tickets 
    FOR ALL 
    TO anon 
    USING (true);

CREATE POLICY "Allow anon admin access orders" 
    ON public.orders 
    FOR ALL 
    TO anon 
    USING (true);
