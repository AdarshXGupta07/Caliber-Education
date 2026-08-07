-- =========================================================================
-- ALIGN CURRENT DATABASE TO NEW UI WORKFLOW
-- Run this in your Supabase SQL Editor. 
-- It merges the Case Scenarios safely into the questions table as we discussed!
-- =========================================================================

-- 1. UNIFY CASE SCENARIOS DIRECTLY INTO THE QUESTIONS TABLE
ALTER TABLE public.questions
ADD COLUMN type text NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'case')),
ADD COLUMN case_narrative text;

-- 2. REMOVE THE OLD CASE_SCENARIOS FOREIGN KEY FROM QUESTIONS
ALTER TABLE public.questions
DROP CONSTRAINT IF EXISTS questions_case_scenario_id_fkey;

ALTER TABLE public.questions
DROP COLUMN IF EXISTS case_scenario_id;

-- 3. DROP THE STANDALONE CASE_SCENARIOS TABLE (We don't need it anymore!)
DROP TABLE IF EXISTS public.case_scenarios;

-- 4. UPDATE MCQ_PAPERS TO MATCH THE FRONTEND ENGINES
ALTER TABLE public.mcq_papers
ADD COLUMN test_type text NOT NULL DEFAULT 'FULL_SUBJECT' CHECK (test_type IN ('COMPLETE_GROUP', 'FULL_SUBJECT', 'CHAPTER_WISE')),
ADD COLUMN subject_code text,
ADD COLUMN chapter_name text;

-- 5. (OPTIONAL) Since the UI now uses 'subject_code' and 'test_type', 
-- you can safely drop the old conflicting columns from mcq_papers
ALTER TABLE public.mcq_papers
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS subject_id;
