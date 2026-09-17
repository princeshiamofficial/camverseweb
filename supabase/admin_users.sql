-- ==============================================================================
-- CamVerse Admin Users & Roles Schema for Supabase
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create admin_users table in public schema
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'superadmin' CHECK (role IN ('superadmin', 'admin', 'moderator')),
    full_name TEXT DEFAULT 'CamVerse Administrator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies:
-- Allow authenticated users to view admin list if they are in admin_users or have role='admin'
DROP POLICY IF EXISTS "Admins can view admin_users" ON public.admin_users;
CREATE POLICY "Admins can view admin_users"
    ON public.admin_users FOR SELECT
    USING (
        auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
        OR auth.email() IN (SELECT email FROM public.admin_users WHERE is_active = true)
    );

-- Allow public read of active admin emails for access checks
DROP POLICY IF EXISTS "Public check of active admins" ON public.admin_users;
CREATE POLICY "Public check of active admins"
    ON public.admin_users FOR SELECT
    USING (is_active = true);

-- 4. Seed initial admin user if not exists
INSERT INTO public.admin_users (email, role, full_name)
VALUES ('admin@camverse.app', 'superadmin', 'CamVerse Super Administrator')
ON CONFLICT (email) DO UPDATE 
SET is_active = true, role = 'superadmin';

-- 5. Helper Function: Check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE email = LOWER(check_email) AND is_active = true
    );
$$;
