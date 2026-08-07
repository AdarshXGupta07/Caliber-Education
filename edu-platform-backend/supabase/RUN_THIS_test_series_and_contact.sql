-- ═══════════════════════════════════════════════════════════════════════════
-- RUN THIS ONCE in the Supabase SQL Editor (paste whole file, click Run).
-- Adds: Test Series product line + contact_messages table.
-- Safe to re-run — every statement is idempotent.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Contact form messages ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins manage contact messages"
  ON public.contact_messages FOR ALL USING (public.is_admin());

-- ─── Test Series: catalog of individual subjects ────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_series_subjects (
  id text PRIMARY KEY,
  level text NOT NULL,                      -- FOUNDATION | INTERMEDIATE | FINAL
  group_name text NOT NULL DEFAULT 'NONE',  -- GROUP_1 | GROUP_2 | NONE
  name text NOT NULL,
  code text NOT NULL,
  description text DEFAULT '',
  price numeric,                            -- NULL until you set it in the admin panel
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Test Series: bundles (Group 1 / Group 2 / Both / Complete) ─────────────
CREATE TABLE IF NOT EXISTS public.test_series_bundles (
  id text PRIMARY KEY,
  title text NOT NULL,
  level text NOT NULL,
  group_name text NOT NULL DEFAULT 'NONE',
  subject_ids text[] NOT NULL,
  price numeric,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Test Series: entitlements ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.test_series_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id text NOT NULL REFERENCES public.test_series_subjects(id),
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  access_until timestamptz,                 -- NULL = lifetime (one-time purchase)
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ts_enrollments_user ON public.test_series_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_ts_subjects_level_group ON public.test_series_subjects(level, group_name);

-- ─── Link existing `tests` table (the actual papers) to a test-series subject ──
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS subject_id text REFERENCES public.test_series_subjects(id),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_tests_subject_status ON public.tests(subject_id, status);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE public.test_series_subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active test series subjects" ON public.test_series_subjects;
CREATE POLICY "Anyone can view active test series subjects"
  ON public.test_series_subjects FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage test series subjects" ON public.test_series_subjects;
CREATE POLICY "Admins manage test series subjects"
  ON public.test_series_subjects FOR ALL USING (public.is_admin());

ALTER TABLE public.test_series_bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active test series bundles" ON public.test_series_bundles;
CREATE POLICY "Anyone can view active test series bundles"
  ON public.test_series_bundles FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage test series bundles" ON public.test_series_bundles;
CREATE POLICY "Admins manage test series bundles"
  ON public.test_series_bundles FOR ALL USING (public.is_admin());

ALTER TABLE public.test_series_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students see own test series enrollments" ON public.test_series_enrollments;
CREATE POLICY "Students see own test series enrollments"
  ON public.test_series_enrollments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
DROP POLICY IF EXISTS "Admins manage test series enrollments" ON public.test_series_enrollments;
CREATE POLICY "Admins manage test series enrollments"
  ON public.test_series_enrollments FOR ALL USING (public.is_admin());

-- ─── Seed the catalog from the product sheet (prices left NULL for you) ─────
INSERT INTO public.test_series_subjects (id, level, group_name, name, code, description, sort_order) VALUES
('ts-found-accounting','FOUNDATION','NONE','Accounting','ACC','CA Foundation Paper 1 — Accounting',1),
('ts-found-business-laws','FOUNDATION','NONE','Business Laws','LAW','CA Foundation Paper 2 — Business Laws',2),
('ts-found-quant-apt','FOUNDATION','NONE','Quantitative Aptitude','QUANT','CA Foundation Paper 3 — Quantitative Aptitude',3),
('ts-found-biz-eco','FOUNDATION','NONE','Business Economics','ECO','CA Foundation Paper 4 — Business Economics',4),
('ts-inter-adv-acc','INTERMEDIATE','GROUP_1','Advanced Accounting','ADV_ACC','CA Intermediate Group I — Advanced Accounting',5),
('ts-inter-corp-law','INTERMEDIATE','GROUP_1','Corporate & Other Laws','CORP_LAW','CA Intermediate Group I — Corporate & Other Laws',6),
('ts-inter-tax','INTERMEDIATE','GROUP_1','Taxation','TAX','CA Intermediate Group I — Taxation',7),
('ts-inter-cma','INTERMEDIATE','GROUP_2','Cost & Management Accounting','CMA','CA Intermediate Group II — Cost & Management Accounting',8),
('ts-inter-audit-ethics','INTERMEDIATE','GROUP_2','Auditing & Ethics','AUDIT_ETHICS','CA Intermediate Group II — Auditing & Ethics',9),
('ts-inter-fm-sm','INTERMEDIATE','GROUP_2','Financial Management & Strategic Management','FM_SM','CA Intermediate Group II — FM & SM',10),
('ts-final-fr','FINAL','GROUP_1','Financial Reporting','FR','CA Final Group I — Financial Reporting (FR)',11),
('ts-final-afm','FINAL','GROUP_1','Advanced Financial Management','AFM','CA Final Group I — Advanced Financial Management (AFM)',12),
('ts-final-audit','FINAL','GROUP_1','Advanced Auditing, Assurance & Professional Ethics','AUDIT','CA Final Group I — Advanced Auditing, Assurance & Professional Ethics',13),
('ts-final-dt','FINAL','GROUP_2','Direct Tax Laws & International Taxation','DT','CA Final Group II — Direct Tax Laws & International Taxation (DT)',14),
('ts-final-idt','FINAL','GROUP_2','Indirect Tax Laws','IDT','CA Final Group II — Indirect Tax Laws (IDT)',15),
('ts-final-ibs','FINAL','GROUP_2','Integrated Business Solutions','IBS','CA Final Group II — Integrated Business Solutions (IBS)',16)
ON CONFLICT (id) DO UPDATE SET
  level=EXCLUDED.level, group_name=EXCLUDED.group_name, name=EXCLUDED.name,
  code=EXCLUDED.code, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order;

INSERT INTO public.test_series_bundles (id, title, level, group_name, subject_ids) VALUES
('ts-found-complete','Complete (All 4 Papers)','FOUNDATION','NONE',ARRAY['ts-found-accounting','ts-found-business-laws','ts-found-quant-apt','ts-found-biz-eco']),
('ts-inter-group1','Group 1','INTERMEDIATE','GROUP_1',ARRAY['ts-inter-adv-acc','ts-inter-corp-law','ts-inter-tax']),
('ts-inter-group2','Group 2','INTERMEDIATE','GROUP_2',ARRAY['ts-inter-cma','ts-inter-audit-ethics','ts-inter-fm-sm']),
('ts-inter-both','Both Groups (All 6 Papers)','INTERMEDIATE','BOTH',ARRAY['ts-inter-adv-acc','ts-inter-corp-law','ts-inter-tax','ts-inter-cma','ts-inter-audit-ethics','ts-inter-fm-sm']),
('ts-final-group1','Group 1','FINAL','GROUP_1',ARRAY['ts-final-fr','ts-final-afm','ts-final-audit']),
('ts-final-group2','Group 2','FINAL','GROUP_2',ARRAY['ts-final-dt','ts-final-idt','ts-final-ibs']),
('ts-final-both','Both Groups (All 6 Papers)','FINAL','BOTH',ARRAY['ts-final-fr','ts-final-afm','ts-final-audit','ts-final-dt','ts-final-idt','ts-final-ibs'])
ON CONFLICT (id) DO UPDATE SET
  title=EXCLUDED.title, level=EXCLUDED.level, group_name=EXCLUDED.group_name, subject_ids=EXCLUDED.subject_ids;
