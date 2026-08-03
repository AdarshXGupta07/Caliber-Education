-- ==============================================================================
-- Migration: MCQ Module Expansion V3 — Complete CA Examination Hierarchy
-- ==============================================================================

-- 1. WARNING: Drop the old model tables
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.set_sections CASCADE;
DROP TABLE IF EXISTS public.mcq_sets CASCADE;
DROP TABLE IF EXISTS public.mcq_series CASCADE;
DROP TABLE IF EXISTS public.case_studies CASCADE;

-- Optional: drop old Enums if they exist and need replacing (we will use IF NOT EXISTS below)

-- 2. Define Enums for the CA Hierarchy
DO $$ BEGIN
    CREATE TYPE public.ca_level AS ENUM ('FINAL', 'INTERMEDIATE', 'FOUNDATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.ca_group AS ENUM ('GROUP_1', 'GROUP_2', 'BOTH', 'NONE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.test_category AS ENUM ('COMPLETE_GROUP_MOCK', 'FULL_SUBJECT_MOCK', 'CHAPTER_PRACTICE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 3. Create Syllabus Hierarchy Tables

-- Table: subjects (Paper / Subject)
CREATE TABLE public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level public.ca_level NOT NULL,
    group_name public.ca_group NOT NULL,
    subject_code TEXT NOT NULL UNIQUE,
    subject_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: chapters (Chapter / Topic)
CREATE TABLE public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    chapter_title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. Create Exam & Test Tables

-- Table: mcq_papers (MCQ Set / Exam Paper)
CREATE TABLE public.mcq_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    level public.ca_level NOT NULL,
    group_name public.ca_group NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE, -- Nullable for Complete Group Mock
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE, -- Nullable for Mocks
    category public.test_category NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    passing_marks NUMERIC(5,2) DEFAULT 40.0,
    total_marks NUMERIC(5,2) DEFAULT 100.0,
    status TEXT DEFAULT 'draft', -- draft, published, archived
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_options BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: exam_sections (e.g., Case Scenario I, Independent MCQs)
CREATE TABLE public.exam_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES public.mcq_papers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: case_scenarios (Case Narrative for Linked Sub-questions)
CREATE TABLE public.case_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE CASCADE,
    narrative TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: questions (Normal Questions (1M / 2M) or Case Scenario Linked)
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.exam_sections(id) ON DELETE CASCADE,
    case_scenario_id UUID REFERENCES public.case_scenarios(id) ON DELETE CASCADE, -- Null if normal independent question
    content TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g., ["A", "B", "C", "D"]
    correct_option INTEGER NOT NULL, -- 0-based index
    explanation TEXT,
    marks NUMERIC(4,2) DEFAULT 1.0,
    negative_marks NUMERIC(4,2) DEFAULT 0.0,
    difficulty TEXT DEFAULT 'medium',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 5. Enable Row Level Security (RLS)

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcq_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;


-- 6. Define RLS Policies

-- For public reads
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Anyone can view published mcq_papers" ON public.mcq_papers FOR SELECT USING (status = 'published' OR (auth.jwt() ->> 'email') IN (SELECT email FROM public.profiles WHERE role = 'admin'));
CREATE POLICY "Anyone can view exam_sections" ON public.exam_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can view case_scenarios" ON public.case_scenarios FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);

-- For Admin all access
CREATE POLICY "Admins manage subjects" ON public.subjects FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage chapters" ON public.chapters FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage mcq_papers" ON public.mcq_papers FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage exam_sections" ON public.exam_sections FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage case_scenarios" ON public.case_scenarios FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL USING (public.is_admin());

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_subjects_level_group ON public.subjects(level, group_name);
CREATE INDEX IF NOT EXISTS idx_chapters_subject ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_papers_lookup ON public.mcq_papers(level, group_name, subject_id, category);
CREATE INDEX IF NOT EXISTS idx_sections_paper ON public.exam_sections(paper_id);
CREATE INDEX IF NOT EXISTS idx_cases_section ON public.case_scenarios(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_section ON public.questions(section_id);
CREATE INDEX IF NOT EXISTS idx_questions_case ON public.questions(case_scenario_id);
