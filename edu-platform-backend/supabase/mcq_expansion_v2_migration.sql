-- ==============================================================================
-- Migration: MCQ Module Expansion V2 — CA Examination & Practice Platform
-- ==============================================================================

-- 1. Extend mcq_sets with CA Exam Hierarchy and Test Settings
ALTER TABLE public.mcq_sets 
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'FINAL',
ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT 'GROUP_1',
ADD COLUMN IF NOT EXISTS subject_code TEXT,
ADD COLUMN IF NOT EXISTS test_type TEXT DEFAULT 'FULL_SUBJECT',
ADD COLUMN IF NOT EXISTS chapter_name TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS passing_marks NUMERIC(5,2) DEFAULT 40.0,
ADD COLUMN IF NOT EXISTS total_marks NUMERIC(5,2) DEFAULT 30.0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS shuffle_questions BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS shuffle_options BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS allow_retake BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT NULL;

-- Add index on hierarchy fields for fast filtering
CREATE INDEX IF NOT EXISTS idx_mcq_sets_hierarchy ON public.mcq_sets(level, group_name, subject_code, test_type);
CREATE INDEX IF NOT EXISTS idx_mcq_sets_status ON public.mcq_sets(status);

-- 2. Enhance questions table for rich categorization and negative marking
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS chapter_tag TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS marks NUMERIC(4,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS negative_marks NUMERIC(4,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS case_id TEXT;

-- 3. Enhance test_submissions for granular ICAI analytics
ALTER TABLE public.test_submissions
ADD COLUMN IF NOT EXISTS section_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS topic_scores JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS question_analysis JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS percentile NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS rank INTEGER;

-- 4. Create Subject Chapters Master Table (ICAI Syllabus Directory)
CREATE TABLE IF NOT EXISTS public.subject_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL,
    group_name TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    chapter_number INTEGER NOT NULL,
    chapter_title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subject_chapters_lookup ON public.subject_chapters(level, subject_code, chapter_number);

-- Enable RLS for subject_chapters
ALTER TABLE public.subject_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to subject chapters"
ON public.subject_chapters FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow admins full access to subject chapters"
ON public.subject_chapters FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role = 'admin'))
WITH CHECK ((auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role = 'admin'));

-- 5. User MCQ Subscriptions Table for time-bound access control
CREATE TABLE IF NOT EXISTS public.user_mcq_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    level TEXT NOT NULL,
    subject_ids TEXT[] NOT NULL,
    duration TEXT NOT NULL,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_mcq_subscriptions_user ON public.user_mcq_subscriptions(user_id, is_active);

-- Enable RLS for subscriptions
ALTER TABLE public.user_mcq_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own subscriptions"
ON public.user_mcq_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins full access to subscriptions"
ON public.user_mcq_subscriptions FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role = 'admin'))
WITH CHECK ((auth.jwt() ->> 'email') IN (SELECT email FROM public.users WHERE role = 'admin'));

-- 6. Seed Master Chapters for CA Final, Intermediate, and Foundation
INSERT INTO public.subject_chapters (level, group_name, subject_code, subject_name, chapter_number, chapter_title)
VALUES
    -- CA FINAL - GROUP 1
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 1, 'Introduction to Ind AS & Conceptual Framework'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 2, 'Ind AS on Presentation of Items in Financial Statements (Ind AS 1, 7, 34)'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 3, 'Ind AS on Measurement Based on Accounting Policies (Ind AS 8, 10, 113)'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 4, 'Ind AS on Assets (Ind AS 2, 16, 23, 36, 38, 40, 105)'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 5, 'Ind AS 115 - Revenue from Contracts with Customers'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 6, 'Ind AS 116 - Leases'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 7, 'Ind AS on Liabilities & Taxes (Ind AS 12, 19, 37)'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 8, 'Financial Instruments (Ind AS 32, 107, 109)'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 9, 'Business Combinations & Group Accounting (Ind AS 103, 110, 111, 28)'),
    ('FINAL', 'GROUP_1', 'FR', 'Financial Reporting', 10, 'Professional & Ethical Duty of CA & Accounting for Carbon Credits'),

    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 1, 'Financial Policy and Corporate Strategy'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 2, 'Risk Management & Value at Risk (VaR)'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 3, 'Security Analysis & Valuation'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 4, 'Portfolio Management & Mutual Funds'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 5, 'Securitization'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 6, 'Futures and Options Derivatives'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 7, 'Foreign Exchange Exposure and Risk Management'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 8, 'Interest Rate Risk Management'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 9, 'Business Valuation & Mergers, Acquisitions and Corporate Restructuring'),
    ('FINAL', 'GROUP_1', 'AFM', 'Advanced Financial Management', 10, 'Startup Finance'),

    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 1, 'Quality Management (SQC 1, SA 220)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 2, 'General Auditing Principles & Auditor Responsibilities (SA 200 Series)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 3, 'Audit Planning, Strategy and Execution (SA 300 Series)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 4, 'Internal Control & Risk Assessment (SA 315, 330)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 5, 'Audit Evidence & Specific Items (SA 500 Series)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 6, 'Completion and Review (SA 560, 570, 580)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 7, 'Audit Reporting (SA 700, 701, 705, 706)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 8, 'Specialized Areas & Group Audits (SA 600, 800, 805, 810)'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 9, 'Audit of Banks, NBFCs and Insurance Companies'),
    ('FINAL', 'GROUP_1', 'AUDIT', 'Advanced Auditing, Assurance & Professional Ethics', 10, 'Professional Ethics & Code of Conduct (Chartered Accountants Act 1949)'),

    -- CA FINAL - GROUP 2
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 1, 'Basic Concepts, Residential Status & Scope of Total Income'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 2, 'Profits and Gains of Business or Profession (PGBP)'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 3, 'Capital Gains & Income from Other Sources'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 4, 'Assessment of Various Entities (Companies, LLPs, Trusts)'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 5, 'TDS, TCS, Advance Tax & Recovery of Tax'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 6, 'Appeals, Revision, Search & Seizure and Penalties'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 7, 'Transfer Pricing & Other Anti-Avoidance Measures (GAAR)'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 8, 'Non-Resident Taxation & Double Taxation Relief (DTAA)'),
    ('FINAL', 'GROUP_2', 'DT', 'Direct Tax Laws & International Taxation', 9, 'Equalisation Levy & Model Tax Conventions'),

    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 1, 'Supply Under GST, Charge of GST & Exemptions'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 2, 'Place of Supply, Time and Value of Supply'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 3, 'Input Tax Credit (ITC) & Apportionment'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 4, 'Registration, Tax Invoice, Credit & Debit Notes'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 5, 'Accounts, Records, Returns & E-Way Bill'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 6, 'Payment of Tax, TDS/TCS & Refunds'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 7, 'Assessment, Audit, Inspection, Search, Seizure & Arrest'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 8, 'Demand, Recovery, Offences & Penalties'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 9, 'Customs Law: Levy, Valuation, Classification & Import/Export Procedures'),
    ('FINAL', 'GROUP_2', 'IDT', 'Indirect Tax Laws (GST & Customs)', 10, 'Foreign Trade Policy & Duty Drawback'),

    ('FINAL', 'GROUP_2', 'IBS', 'Integrated Business Solutions', 1, 'Corporate Financial Strategy & Case Study Analysis'),
    ('FINAL', 'GROUP_2', 'IBS', 'Integrated Business Solutions', 2, 'Multi-Disciplinary Financial & Operational Risk Assessment'),
    ('FINAL', 'GROUP_2', 'IBS', 'Integrated Business Solutions', 3, 'Governance, Risk and Compliance Integration'),

    -- CA INTERMEDIATE - GROUP 1
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 1, 'Framework for Preparation and Presentation of Financial Statements'),
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 2, 'Accounting Standards (AS 1, 2, 3, 10, 11, 12, 13, 16)'),
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 3, 'Accounting Standards (AS 15, 18, 19, 20, 22, 24, 26, 28, 29)'),
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 4, 'Financial Statements of Companies (Schedule III)'),
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 5, 'Buyback of Securities and Equity Shares with Differential Rights'),
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 6, 'Amalgamation and Internal Reconstruction'),
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 7, 'Accounting for Branches and Foreign Branches'),
    ('INTERMEDIATE', 'GROUP_1', 'ADV_ACC', 'Advanced Accounting', 8, 'Consolidated Financial Statements (AS 21, 23, 27)'),

    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 1, 'Preliminary & Incorporation of Company'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 2, 'Prospectus and Allotment of Securities'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 3, 'Share Capital and Debentures'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 4, 'Acceptance of Deposits by Companies'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 5, 'Registration of Charges'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 6, 'Management & Administration (Meetings & Resolutions)'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 7, 'Declaration and Payment of Dividend'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 8, 'Accounts of Companies & Audit and Auditors'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 9, 'Companies Incorporated Outside India'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 10, 'The Limited Liability Partnership Act, 2008'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 11, 'The General Clauses Act & Interpretation of Statutes'),
    ('INTERMEDIATE', 'GROUP_1', 'CORP_LAW', 'Corporate and Other Laws', 12, 'The Foreign Exchange Management Act, 1999 (FEMA)'),

    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 1, 'Basic Concepts, Residence and Scope of Total Income'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 2, 'Salaries & Income from House Property'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 3, 'Profits and Gains of Business or Profession (PGBP)'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 4, 'Capital Gains & Income from Other Sources'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 5, 'Clubbing of Income, Set-Off and Carry Forward of Losses'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 6, 'Deductions from Gross Total Income (Chapter VI-A)'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 7, 'Computation of Total Income and Tax Liability'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 8, 'Advance Tax, TDS, TCS and Filing of Return of Income'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 9, 'GST: Concept, Charge, Exemption, Time and Value of Supply'),
    ('INTERMEDIATE', 'GROUP_1', 'TAX', 'Taxation', 10, 'GST: Input Tax Credit (ITC), Registration, Returns & Payment'),

    -- CA INTERMEDIATE - GROUP 2
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 1, 'Introduction to Cost and Management Accounting'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 2, 'Material Cost & Employee (Labour) Cost'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 3, 'Overheads: Absorption Costing Method & Activity Based Costing (ABC)'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 4, 'Cost Accounting System (Non-Integrated & Integrated)'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 5, 'Unit & Batch Costing, Job & Contract Costing'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 6, 'Process & Operation Costing, Joint Products & By Products'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 7, 'Service Costing'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 8, 'Standard Costing & Variance Analysis'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 9, 'Marginal Costing & CVP Analysis'),
    ('INTERMEDIATE', 'GROUP_2', 'COST', 'Cost and Management Accounting', 10, 'Budget and Budgetary Control'),

    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 1, 'Nature, Objective and Scope of Audit'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 2, 'Audit Strategy, Audit Planning and Audit Programme'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 3, 'Risk Assessment and Internal Control'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 4, 'Audit Evidence & Specific Procedures'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 5, 'Audit of Items of Financial Statements'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 6, 'Audit Documentation & Audit Sampling'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 7, 'Company Audit & CARO 2020'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 8, 'Audit Report & Key Audit Matters'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 9, 'Special Features of Audit of Different Types of Entities'),
    ('INTERMEDIATE', 'GROUP_2', 'AUDIT_ETHICS', 'Auditing and Ethics', 10, 'Ethics and Terms of Audit Engagements'),

    ('INTERMEDIATE', 'GROUP_2', 'FM_SM', 'Financial Management and Strategic Management', 1, 'Scope and Objectives of Financial Management'),
    ('INTERMEDIATE', 'GROUP_2', 'FM_SM', 'Financial Management and Strategic Management', 2, 'Financial Analysis and Planning - Ratio Analysis'),
    ('INTERMEDIATE', 'GROUP_2', 'FM_SM', 'Financial Management and Strategic Management', 3, 'Cost of Capital & Financing Decisions - Capital Structure'),
    ('INTERMEDIATE', 'GROUP_2', 'FM_SM', 'Financial Management and Strategic Management', 4, 'Leverage & Investment Decisions (Capital Budgeting)'),
    ('INTERMEDIATE', 'GROUP_2', 'FM_SM', 'Financial Management and Strategic Management', 5, 'Dividend Decisions & Management of Working Capital'),
    ('INTERMEDIATE', 'GROUP_2', 'FM_SM', 'Financial Management and Strategic Management', 6, 'Introduction to Strategic Management & Strategic Analysis'),
    ('INTERMEDIATE', 'GROUP_2', 'FM_SM', 'Financial Management and Strategic Management', 7, 'Strategic Planning, Formulation and Strategy Implementation'),

    -- CA FOUNDATION
    ('FOUNDATIONS', 'NONE', 'FOUND_ACC', 'Accounting', 1, 'Theoretical Framework & Accounting Process'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ACC', 'Accounting', 2, 'Bank Reconciliation Statement (BRS) & Inventories'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ACC', 'Accounting', 3, 'Depreciation and Amortisation & Bills of Exchange'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ACC', 'Accounting', 4, 'Preparation of Final Accounts of Sole Proprietors & NPO'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ACC', 'Accounting', 5, 'Partnership and LLP Accounts'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ACC', 'Accounting', 6, 'Company Accounts (Issue of Shares & Debentures)'),

    ('FOUNDATIONS', 'NONE', 'FOUND_LAW', 'Business Laws', 1, 'Indian Regulatory Framework'),
    ('FOUNDATIONS', 'NONE', 'FOUND_LAW', 'Business Laws', 2, 'The Indian Contract Act, 1872'),
    ('FOUNDATIONS', 'NONE', 'FOUND_LAW', 'Business Laws', 3, 'The Sale of Goods Act, 1930'),
    ('FOUNDATIONS', 'NONE', 'FOUND_LAW', 'Business Laws', 4, 'The Indian Partnership Act, 1932'),
    ('FOUNDATIONS', 'NONE', 'FOUND_LAW', 'Business Laws', 5, 'The Limited Liability Partnership Act, 2008'),
    ('FOUNDATIONS', 'NONE', 'FOUND_LAW', 'Business Laws', 6, 'The Companies Act, 2013'),
    ('FOUNDATIONS', 'NONE', 'FOUND_LAW', 'Business Laws', 7, 'The Negotiable Instruments Act, 1881'),

    ('FOUNDATIONS', 'NONE', 'FOUND_MATH', 'Quantitative Aptitude', 1, 'Ratio, Proportion, Indices and Logarithms & Equations'),
    ('FOUNDATIONS', 'NONE', 'FOUND_MATH', 'Quantitative Aptitude', 2, 'Mathematics of Finance (Simple & Compound Interest, Annuity)'),
    ('FOUNDATIONS', 'NONE', 'FOUND_MATH', 'Quantitative Aptitude', 3, 'Permutations and Combinations & Sequence and Series'),
    ('FOUNDATIONS', 'NONE', 'FOUND_MATH', 'Quantitative Aptitude', 4, 'Logical Reasoning: Number Series, Coding, Direction, Blood Relations'),
    ('FOUNDATIONS', 'NONE', 'FOUND_MATH', 'Quantitative Aptitude', 5, 'Statistical Description of Data & Measures of Central Tendency and Dispersion'),
    ('FOUNDATIONS', 'NONE', 'FOUND_MATH', 'Quantitative Aptitude', 6, 'Probability, Theoretical Distributions & Correlation and Regression'),

    ('FOUNDATIONS', 'NONE', 'FOUND_ECO', 'Business Economics', 1, 'Introduction to Business Economics'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ECO', 'Business Economics', 2, 'Theory of Demand and Supply & Consumer Behaviour'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ECO', 'Business Economics', 3, 'Theory of Production and Cost'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ECO', 'Business Economics', 4, 'Price Determination in Different Markets'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ECO', 'Business Economics', 5, 'Determination of National Income & Public Finance'),
    ('FOUNDATIONS', 'NONE', 'FOUND_ECO', 'Business Economics', 6, 'Money Market, International Trade & Indian Economy')
ON CONFLICT DO NOTHING;
