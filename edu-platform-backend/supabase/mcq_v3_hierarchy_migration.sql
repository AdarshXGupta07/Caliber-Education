-- ==============================================================================
-- CALIBER EDUCATION V3 HIERARCHY SCHEMA MIGRATION
-- This script completely replaces the legacy MCQ structure with the strict 
-- CA Exam Hierarchy Workflow (Level -> Group -> Subject -> Papers -> Sections -> Questions)
-- ==============================================================================

-- 1. MASTER SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    level text NOT NULL CHECK (level IN ('FOUNDATION', 'INTERMEDIATE', 'FINAL')),
    group_name text NOT NULL CHECK (group_name IN ('GROUP_1', 'GROUP_2', 'BOTH', 'NONE')),
    code text NOT NULL UNIQUE,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT subjects_pkey PRIMARY KEY (id)
);

-- 2. CHAPTERS TABLE (For Chapter-Wise Tests)
CREATE TABLE IF NOT EXISTS public.chapters (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    subject_code text NOT NULL REFERENCES public.subjects(code) ON DELETE CASCADE,
    chapter_number integer NOT NULL,
    chapter_title text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chapters_pkey PRIMARY KEY (id)
);

-- 3. THE MASTER EXAM PAPER TABLE
CREATE TABLE IF NOT EXISTS public.mcq_papers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    level text NOT NULL,
    group_name text NOT NULL,
    subject_code text NOT NULL,
    chapter_name text,
    test_type text NOT NULL DEFAULT 'FULL_SUBJECT' CHECK (test_type IN ('COMPLETE_GROUP', 'FULL_SUBJECT', 'CHAPTER_WISE')),
    duration_minutes integer DEFAULT 60,
    passing_marks numeric DEFAULT 40.0,
    total_marks numeric DEFAULT 100.0,
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    shuffle_questions boolean DEFAULT false,
    shuffle_options boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT mcq_papers_pkey PRIMARY KEY (id)
);

-- 4. EXAM SECTIONS (e.g. Section A: Compulsory, Section B: General)
CREATE TABLE IF NOT EXISTS public.exam_sections (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    paper_id uuid NOT NULL REFERENCES public.mcq_papers(id) ON DELETE CASCADE,
    title text NOT NULL,
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT exam_sections_pkey PRIMARY KEY (id)
);

-- 5. UNIFIED QUESTIONS TABLE (Supports Normal + Case Scenarios Inline)
CREATE TABLE IF NOT EXISTS public.questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    section_id uuid NOT NULL REFERENCES public.exam_sections(id) ON DELETE CASCADE,
    
    -- Identification
    type text NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'case')),
    
    -- The Case Scenario Narrative (Only filled out on the 1st sub-question of a block)
    case_narrative text,
    
    -- The Core Question Data
    content text NOT NULL,
    options jsonb NOT NULL DEFAULT '[]'::jsonb,
    correct_option integer NOT NULL,
    explanation text,
    
    -- Marking Scheme
    marks numeric DEFAULT 1.0,
    negative_marks numeric DEFAULT 0.0,
    difficulty text DEFAULT 'medium',
    
    order_index integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT questions_pkey PRIMARY KEY (id)
);

-- Create optimized index for quick testing paper lookups
CREATE INDEX IF NOT EXISTS idx_mcq_papers_subject ON public.mcq_papers(subject_code, status);
CREATE INDEX IF NOT EXISTS idx_questions_section ON public.questions(section_id);
