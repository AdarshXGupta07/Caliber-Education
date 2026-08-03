-- Migration: MCQ Packages, Dynamic Pricing Matrix & Bundles
-- Enables dynamic duration pricing (1M, 3M, 6M, 1Y) and smart promotional bundles

CREATE TABLE IF NOT EXISTS public.mcq_subjects (
    id text PRIMARY KEY,
    level text NOT NULL CHECK (level IN ('FINAL', 'INTERMEDIATE', 'FOUNDATIONS')),
    group_name text NOT NULL DEFAULT 'All', -- 'Group I', 'Group II', 'All'
    name text NOT NULL,
    code text NOT NULL,
    description text,
    prices jsonb NOT NULL, -- {"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.mcq_bundles (
    id text PRIMARY KEY,
    title text NOT NULL,
    level text NOT NULL CHECK (level IN ('FINAL', 'INTERMEDIATE', 'FOUNDATIONS')),
    group_name text NOT NULL DEFAULT 'All',
    subject_ids text[] NOT NULL,
    prices jsonb NOT NULL, -- {"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500}
    is_custom boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    badge text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Initial Subjects
INSERT INTO public.mcq_subjects (id, level, group_name, name, code, description, prices, sort_order) VALUES
-- Final Group I
('final-g1-fr', 'FINAL', 'Group I', 'Financial Reporting', 'FR', 'Comprehensive Ind AS & case scenarios practice sets', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', 1),
('final-g1-afm', 'FINAL', 'Group I', 'Advanced Financial Management', 'AFM', 'Portfolio management, derivatives, forex & corporate valuation', '{"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625}', 2),
('final-g1-audit', 'FINAL', 'Group I', 'Advanced Auditing & Professional Ethics', 'Audit', 'Standards on auditing, professional ethics, digital audit', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', 3),

-- Final Group II
('final-g2-dt', 'FINAL', 'Group II', 'Direct Tax Laws & International Taxation', 'DT', 'Income tax computations, transfer pricing & non-resident taxation', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', 4),
('final-g2-idt', 'FINAL', 'Group II', 'Indirect Tax Laws (GST & Customs)', 'IDT', 'GST procedures, input tax credit, customs valuation & FTP', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', 5),
('final-g2-case', 'FINAL', 'Group II', 'Law + SCMPE + IBS Case Studies', 'Case Studies', 'Integrated business solutions, multi-disciplinary case scenarios', '{"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625}', 6),

-- Intermediate Group I
('inter-g1-adv-acc', 'INTERMEDIATE', 'Group I', 'Advanced Accounting', 'Adv Accounting', 'Accounting standards, consolidation, buyback, internal reconstruction', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', 7),
('inter-g1-corp-law', 'INTERMEDIATE', 'Group I', 'Corporate and Other Laws', 'Corp Laws', 'Company Law, LLP Act, interpretation of statutes, General Clauses Act', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', 8),
('inter-g1-tax', 'INTERMEDIATE', 'Group I', 'Taxation', 'Taxation', 'Income Tax law & Goods and Services Tax basics', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', 9),

-- Intermediate Group II
('inter-g2-cost', 'INTERMEDIATE', 'Group II', 'Cost and Management Accounting', 'Costing', 'Standard costing, marginal costing, budget controls & ABC', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', 10),
('inter-g2-audit', 'INTERMEDIATE', 'Group II', 'Auditing and Ethics', 'Audit & Ethics', 'Nature of audit, audit documentation, internal controls & risk assessment', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', 11),
('inter-g2-fm-sm', 'INTERMEDIATE', 'Group II', 'Financial Management & Strategic Management', 'FM & SM', 'Capital structure, leverage, strategic analysis & implementation', '{"1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400}', 12),

-- Foundations
('found-quant', 'FOUNDATIONS', 'All', 'Quantitative Aptitude', 'Quant', 'Business mathematics, logical reasoning, and statistics', '{"1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625}', 13),
('found-eco', 'FOUNDATIONS', 'All', 'Business Economics', 'Economics', 'Microeconomics, macroeconomics, national income & business cycles', '{"1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500}', 14)
ON CONFLICT (id) DO UPDATE SET
    prices = EXCLUDED.prices,
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description;

-- Seed Initial Bundles
INSERT INTO public.mcq_bundles (id, title, level, group_name, subject_ids, prices, badge) VALUES
('final-bundle-g1', 'Group I All Subjects', 'FINAL', 'Group I', ARRAY['final-g1-fr', 'final-g1-afm', 'final-g1-audit'], '{"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500}', 'Group 1 Bundle'),
('final-bundle-g2', 'Group II All Subjects', 'FINAL', 'Group II', ARRAY['final-g2-dt', 'final-g2-idt', 'final-g2-case'], '{"1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500}', 'Group 2 Bundle'),
('final-bundle-both', 'Both Groups Complete Super Bundle', 'FINAL', 'Both Groups', ARRAY['final-g1-fr', 'final-g1-afm', 'final-g1-audit', 'final-g2-dt', 'final-g2-idt', 'final-g2-case'], '{"1_month": 900, "3_months": 1800, "6_months": 2400, "1_year": 3000}', 'Super Bundle'),

('inter-bundle-g1', 'Group I All Subjects', 'INTERMEDIATE', 'Group I', ARRAY['inter-g1-adv-acc', 'inter-g1-corp-law', 'inter-g1-tax'], '{"1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000}', 'Group 1 Bundle'),
('inter-bundle-g2', 'Group II All Subjects', 'INTERMEDIATE', 'Group II', ARRAY['inter-g2-cost', 'inter-g2-audit', 'inter-g2-fm-sm'], '{"1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000}', 'Group 2 Bundle'),
('inter-bundle-both', 'Both Groups Complete Super Bundle', 'INTERMEDIATE', 'Both Groups', ARRAY['inter-g1-adv-acc', 'inter-g1-corp-law', 'inter-g1-tax', 'inter-g2-cost', 'inter-g2-audit', 'inter-g2-fm-sm'], '{"1_month": 500, "3_months": 1000, "6_months": 1600, "1_year": 2000}', 'Super Bundle'),

('found-bundle-all', 'All Subjects Foundation Bundle', 'FOUNDATIONS', 'All', ARRAY['found-quant', 'found-eco'], '{"1_month": 300, "3_months": 650, "6_months": 800, "1_year": 1000}', 'Complete Bundle')
ON CONFLICT (id) DO UPDATE SET
    prices = EXCLUDED.prices,
    title = EXCLUDED.title,
    subject_ids = EXCLUDED.subject_ids;
