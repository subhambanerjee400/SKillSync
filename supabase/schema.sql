-- ============================================================================
-- SkillSync Minimal Normalized Database Schema for Supabase
-- ============================================================================

-- Clean up any previous unnormalized or obsolete tables/triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.score_history CASCADE;
DROP TABLE IF EXISTS public.user_skills CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;

-- Also clean up any legacy prototype tables if they exist
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.job_skills CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.curriculum_skills CASCADE;
DROP TABLE IF EXISTS public.curricula CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    segment TEXT NOT NULL,
    role TEXT NOT NULL,
    experience TEXT NOT NULL,
    location TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Account type is intentionally separate from profiles.role (the selected job/trade role).
CREATE TABLE public.accounts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    account_role TEXT NOT NULL DEFAULT 'user'
      CHECK (account_role IN ('user', 'institution', 'industry')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User roles table: supports multiple roles (job_seeker + institution + industry_partner) per single account
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('job_seeker', 'institution', 'industry_partner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- 2. User Skills Table (normalized: one row per user skill)
CREATE TABLE public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_skill UNIQUE (user_id, skill_name)
);

-- 3. Score History Table
CREATE TABLE public.score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Feedback Table (Job Seeker recommendations & training feedback)
CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    relevance_rating TEXT NOT NULL CHECK (relevance_rating IN ('Not Relevant', 'Slightly Relevant', 'Relevant', 'Very Relevant', 'Highly Relevant')),
    skills_improved TEXT[] DEFAULT '{}',
    skills_still_needed TEXT[] DEFAULT '{}',
    written_feedback TEXT NOT NULL,
    suggestions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================
-- Row Level Security (RLS) Configuration
-- =========================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Explicit RLS Policies for "profiles"
-- Users can select, insert, and update only their own profile row (auth.uid() = id)
CREATE POLICY "Users can select own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can select own account"
    ON public.accounts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own account"
    ON public.accounts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own account"
    ON public.accounts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Explicit RLS Policies for "user_roles"
CREATE POLICY "Users can select own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles"
    ON public.user_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Explicit RLS Policies for "user_skills"
-- Users can select, insert, update, and delete only their own user_skills rows (auth.uid() = user_id)
CREATE POLICY "Users can select own skills"
    ON public.user_skills
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
    ON public.user_skills
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
    ON public.user_skills
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills"
    ON public.user_skills
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Explicit RLS Policies for "score_history"
-- Users can select and insert only their own score_history rows (auth.uid() = user_id)
CREATE POLICY "Users can select own score history"
    ON public.score_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own score history"
    ON public.score_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Explicit RLS Policies for "feedback"
-- Users can insert and select only their own feedback rows (auth.uid() = user_id)
CREATE POLICY "Users can insert own feedback"
    ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own feedback"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.accounts (user_id, account_role)
  VALUES (
    NEW.id,
    CASE NEW.raw_user_meta_data->>'account_role'
      WHEN 'institution' THEN 'institution'
      WHEN 'industry' THEN 'industry'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
