-- ============================================================================
-- Migration: Add feedback table for Job Seeker feedback submissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
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

-- Index for lookup by user_id
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Authenticated users can insert and select only their own feedback rows
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.feedback;
CREATE POLICY "Users can insert own feedback"
    ON public.feedback
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can select own feedback" ON public.feedback;
CREATE POLICY "Users can select own feedback"
    ON public.feedback
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
