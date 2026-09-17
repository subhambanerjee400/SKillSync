-- ============================================================================
-- Migration: Add user_roles table to support multiple roles per account
-- Enables accounts with a single email to hold both 'job_seeker' and 'institution'
-- ============================================================================

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('job_seeker', 'institution')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Authenticated users can select and insert only their own roles
DROP POLICY IF EXISTS "Users can select own roles" ON public.user_roles;
CREATE POLICY "Users can select own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
CREATE POLICY "Users can insert own roles"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 4. One-time Migration: Copy existing accounts / profiles into user_roles
-- Migrate from public.accounts if present ('user' -> 'job_seeker', 'institution' -> 'institution')
INSERT INTO public.user_roles (user_id, role)
SELECT 
    user_id, 
    CASE account_role 
        WHEN 'institution' THEN 'institution'
        ELSE 'job_seeker'
    END
FROM public.accounts
ON CONFLICT (user_id, role) DO NOTHING;

-- Migrate from public.profiles if any user has a profile but was not in accounts
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'job_seeker'
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Backfill any remaining auth.users as default job_seeker
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'job_seeker'
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
