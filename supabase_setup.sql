-- 1. Create the Tickets Table
CREATE TABLE public.tickets (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    material_id TEXT NOT NULL,
    comments TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
);

-- 2. Create the Orders Table
CREATE TABLE public.orders (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    model_type INTEGER NOT NULL,
    current_stage INTEGER NOT NULL DEFAULT 0,
    history JSONB NOT NULL DEFAULT '[]'::jsonb,
    comments TEXT
);

-- 3. Enable Row-Level Security (RLS) to Protect Data
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Public Access Rules
-- Anyone can submit a quote request (INSERT) without being logged in
CREATE POLICY "Allow public to submit tickets" 
    ON public.tickets 
    FOR INSERT 
    TO anon 
    WITH CHECK (true);

-- 5. Admin Access Rules
-- (Later, when we hook up Admin login to Supabase Auth, they will be given full read/write access to these tables)
CREATE POLICY "Allow admins full access to tickets" 
    ON public.tickets 
    FOR ALL 
    TO authenticated 
    USING (auth.email() = 'admin@grillz.com');

CREATE POLICY "Allow admins full access to orders" 
    ON public.orders 
    FOR ALL 
    TO authenticated 
    USING (auth.email() = 'admin@grillz.com');
