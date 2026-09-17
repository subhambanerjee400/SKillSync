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

-- 3. RLS Policies: Authenticated users can select, insert, and update their own roles
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

DROP POLICY IF EXISTS "Users can update own roles" ON public.user_roles;
CREATE POLICY "Users can update own roles"
    ON public.user_roles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Trigger to automatically assign default role upon signup
CREATE OR REPLACE FUNCTION public.handle_new_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE NEW.raw_user_meta_data->>'account_role'
      WHEN 'institution' THEN 'institution'
      ELSE 'job_seeker'
    END
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_roles ON auth.users;
CREATE TRIGGER on_auth_user_created_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_roles();

-- 5. One-time Migration: Copy existing accounts / profiles / auth.users into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
    user_id, 
    CASE account_role 
        WHEN 'institution' THEN 'institution'
        ELSE 'job_seeker'
    END
FROM public.accounts
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'job_seeker'
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'job_seeker'
FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;
