-- ============================================================================
-- Migration: Add avatar_url to public.profiles
-- ============================================================================
-- Run this in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Paste & Run

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN public.profiles.avatar_url IS 'Selected preset avatar ID or custom avatar URL';
