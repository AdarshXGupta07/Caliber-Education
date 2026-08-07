-- ==============================================================================
-- 🚨 MCQ ANALYTICS ENGINE SCHEMA UPGRADE 🚨
-- This properly wires the `quiz_attempts` table to store detailed ICAI-level
-- analytics (per section/topic tracking) and links directly to your new 
-- CA Hierarchy papers!
-- ==============================================================================

-- 1. Safely bind `quiz_attempts` to the correct Hierarchy Master Table
-- First, drop the old vague constraints if they exist
ALTER TABLE public.quiz_attempts
DROP CONSTRAINT IF EXISTS quiz_attempts_set_id_fkey;

-- Now, firmly attach it to `mcq_papers`
ALTER TABLE public.quiz_attempts
ADD CONSTRAINT quiz_attempts_set_id_fkey FOREIGN KEY (set_id) REFERENCES public.mcq_papers(id) ON DELETE CASCADE;

-- 2. Expand columns to handle Advanced Graphical Analytics tracking
ALTER TABLE public.quiz_attempts
ADD COLUMN IF NOT EXISTS user_answers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS section_scores jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS topic_scores jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS full_question_analysis jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'evaluated';

-- Create an index to quickly load the leaderboard and a student's past attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_set on public.quiz_attempts(set_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user on public.quiz_attempts(user_id);
