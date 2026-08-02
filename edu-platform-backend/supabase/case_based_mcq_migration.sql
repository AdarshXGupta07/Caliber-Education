-- Migration: Add support for Case-Based MCQs
-- This script updates the existing MCQ schema to fully support case-based questions 
-- as defined in the implementation plan.

-- Option 1: Based on our existing structure where `questions` belong to `set_sections`,
-- we add the `type` and `case_text` directly to the `questions` table.
-- This limits unnecessary JOINs and meshes perfectly with the frontend JSON payload structure.

ALTER TABLE public.questions
ADD COLUMN type text DEFAULT 'normal' CHECK (type IN ('normal', 'case')),
ADD COLUMN case_text text;

-- (Optional) If we were to strictly use a separate `case_studies` table instead:
-- CREATE TABLE public.case_studies (
--     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
--     section_id uuid REFERENCES public.set_sections(id) ON DELETE CASCADE,
--     title text NOT NULL,
--     passage_text text NOT NULL,
--     created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
-- );
-- ALTER TABLE public.questions ADD COLUMN case_study_id uuid REFERENCES public.case_studies(id) ON DELETE CASCADE;

-- Comments for documentations
COMMENT ON COLUMN public.questions.type IS 'Determines if question is standard MCQ or part of a case study (normal, case).';
COMMENT ON COLUMN public.questions.case_text IS 'The reading comprehension passage for case-based questions.';
