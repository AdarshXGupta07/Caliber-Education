-- ==============================================================================
-- MCQ STOREFRONT PRICING DATA MIGRATION
-- This script creates and populates the storefront pricing tables for MCQs.
-- ==============================================================================

-- 1. Create MCQ Subjects Table (Storefront mapping)
CREATE TABLE IF NOT EXISTS public.mcq_subjects (
    id text PRIMARY KEY,
    level text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text NOT NULL,
    prices jsonb NOT NULL,
    "isPopular" boolean DEFAULT false,
    group_name text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now()
);

-- 2. Create MCQ Bundles Table (Storefront bundles)
CREATE TABLE IF NOT EXISTS public.mcq_bundles (
    id text PRIMARY KEY,
    title text NOT NULL,
    level text NOT NULL,
    prices jsonb NOT NULL,
    badge text,
    group_name text NOT NULL,
    subject_ids text[] NOT NULL,
    is_active boolean DEFAULT true,
    is_custom boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Clear existing data to ensure clean insert
TRUNCATE TABLE public.mcq_subjects RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.mcq_bundles RESTART IDENTITY CASCADE;

-- 4. INSERT MCQ SUBJECTS
INSERT INTO public.mcq_subjects (id, level, name, code, description, prices, "isPopular", group_name, sort_order)
VALUES
-- CA FINAL 
('final-fr', 'FINAL', 'FR', 'FR', 'Financial Reporting', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', true, 'Group I', 1),
('final-afm', 'FINAL', 'AFM', 'AFM', 'Advanced Financial Management', '{"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625}', false, 'Group I', 2),
('final-audit', 'FINAL', 'Audit', 'Audit', 'Advanced Auditing', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', false, 'Group I', 3),
('final-dt', 'FINAL', 'DT', 'DT', 'Direct Tax Laws', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', true, 'Group II', 4),
('final-idt', 'FINAL', 'IDT', 'IDT', 'Indirect Tax Laws', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', false, 'Group II', 5),
('final-case', 'FINAL', 'Law+SCMPE+IBS Case Studies', 'Case Studies', 'Integrated Case Studies', '{"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625}', false, 'Group II', 6),

-- CA INTERMEDIATE
('inter-adv-acc', 'INTERMEDIATE', 'Adv Accounting', 'Adv Acc', 'Advanced Accounting', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', true, 'Group I', 1),
('inter-law', 'INTERMEDIATE', 'Corporate and Other Laws', 'Laws', 'Corporate and Other Laws', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', false, 'Group I', 2),
('inter-tax', 'INTERMEDIATE', 'Taxation', 'Tax', 'Taxation', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', false, 'Group I', 3),
('inter-cost', 'INTERMEDIATE', 'Cost and Management Accounting', 'Costing', 'Cost and Management Accounting', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', false, 'Group II', 4),
('inter-audit', 'INTERMEDIATE', 'Auditing and Ethics', 'Audit', 'Auditing and Ethics', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', false, 'Group II', 5),
('inter-fm-sm', 'INTERMEDIATE', 'Financial Management and Strategic Management', 'FM&SM', 'FM & SM', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', false, 'Group II', 6),

-- CA FOUNDATION (Note: mapping FOUNDATIONS to UI level exact string)
('found-quant', 'FOUNDATIONS', 'Quantitative Aptitude', 'Quant', 'Quantitative Aptitude', '{"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625}', true, 'All', 1),
('found-eco', 'FOUNDATIONS', 'Business Economics', 'Economics', 'Business Economics', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', false, 'All', 2);

-- 5. INSERT MCQ BUNDLES
INSERT INTO public.mcq_bundles (id, title, level, prices, badge, group_name, subject_ids)
VALUES
-- CA FINAL BUNDLES
('final-bundle-g1', 'Group I - All Subjects', 'FINAL', '{"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500}', 'Group I', 'Group I', '{"final-fr", "final-afm", "final-audit"}'),
('final-bundle-g2', 'Group II - All Subjects', 'FINAL', '{"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500}', 'Group II', 'Group II', '{"final-dt", "final-idt", "final-case"}'),
('final-bundle-both', 'Both Groups', 'FINAL', '{"1_month": 900, "3_months": 1800, "6_months": 2400, "1_year": 3000}', 'Super Saver', 'Both Groups', '{"final-fr", "final-afm", "final-audit", "final-dt", "final-idt", "final-case"}'),

-- CA INTERMEDIATE BUNDLES
('inter-bundle-g1', 'Group I - All Subjects', 'INTERMEDIATE', '{"1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000}', 'Group I', 'Group I', '{"inter-adv-acc", "inter-law", "inter-tax"}'),
('inter-bundle-g2', 'Group II - All Subjects', 'INTERMEDIATE', '{"1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000}', 'Group II', 'Group II', '{"inter-cost", "inter-audit", "inter-fm-sm"}'),
('inter-bundle-both', 'Both Groups', 'INTERMEDIATE', '{"1_month": 500, "3_months": 1000, "6_months": 1600, "1_year": 2000}', 'Super Saver', 'Both Groups', '{"inter-adv-acc", "inter-law", "inter-tax", "inter-cost", "inter-audit", "inter-fm-sm"}'),

-- CA FOUNDATION BUNDLES
('found-bundle-all', 'All Subjects', 'FOUNDATIONS', '{"1_month": 300, "3_months": 650, "6_months": 800, "1_year": 1000}', 'Complete Bundle', 'All', '{"found-quant", "found-eco"}');
