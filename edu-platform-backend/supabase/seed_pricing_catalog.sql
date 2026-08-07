-- ═══════════════════════════════════════════════════════════════════════════
-- Caliber Education — Real Pricing / Catalog Seed Data
-- Source: client pricing sheet (MCQ / CA Final / CA Inter / CA Foundation /
-- Career-Others tabs), Aug 2026.
-- Run AFTER production_hardening_migration.sql. Idempotent (ON CONFLICT DO
-- UPDATE) — safe to re-run if the sheet changes; admins can also edit any of
-- this afterwards through the admin panel, this just avoids a blank-slate
-- start the night before launch.
--
-- ⚠ ONE INFERRED VALUE, flagged below: CA Inter "Both Groups" MCQ bundle
-- pricing wasn't visible in the sheet screenshot (cut off) — computed as
-- Group I + Group II (matches how Final's "Both Groups" = Group I + Group II
-- exactly). Confirm/correct in the admin panel before relying on it.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── MCQ subjects (individual) ────────────────────────────────────────────

INSERT INTO public.mcq_subjects (id, level, name, code, description, prices, "isPopular", group_name, is_active, sort_order) VALUES
('final-fr',        'FINAL', 'Financial Reporting',                       'FR',    'CA Final Group I — Financial Reporting MCQ practice.',        '{"1_month":150,"3_months":300,"6_months":400,"1_year":500}',  false, 'GROUP_1', true, 1),
('final-afm',       'FINAL', 'Advanced Financial Management',             'AFM',   'CA Final Group I — Advanced Financial Management MCQ practice.', '{"1_month":200,"3_months":400,"6_months":500,"1_year":625}', false, 'GROUP_1', true, 2),
('final-audit',     'FINAL', 'Advanced Auditing & Professional Ethics',   'AUDIT', 'CA Final Group I — Audit MCQ practice.',                       '{"1_month":150,"3_months":300,"6_months":400,"1_year":500}',  false, 'GROUP_1', true, 3),
('final-dt',        'FINAL', 'Direct Tax Laws & International Taxation',  'DT',    'CA Final Group II — Direct Tax MCQ practice.',                 '{"1_month":150,"3_months":300,"6_months":400,"1_year":500}',  false, 'GROUP_2', true, 4),
('final-idt',       'FINAL', 'Indirect Tax Laws',                         'IDT',   'CA Final Group II — Indirect Tax MCQ practice.',               '{"1_month":150,"3_months":300,"6_months":400,"1_year":500}',  false, 'GROUP_2', true, 5),
('final-ibs',       'FINAL', 'Law + SCMPE + IBS Case Studies',            'IBS',   'CA Final Group II — Integrated Business Solutions case-study MCQ practice.', '{"1_month":200,"3_months":400,"6_months":500,"1_year":625}', false, 'GROUP_2', true, 6),
('inter-adv-acc',   'INTERMEDIATE', 'Advanced Accounting',                'ADV_ACC',   'CA Intermediate Group I — Advanced Accounting MCQ practice.', '{"1_month":99,"3_months":200,"6_months":300,"1_year":400}', false, 'GROUP_1', true, 7),
('inter-corp-law',  'INTERMEDIATE', 'Corporate and Other Laws',           'CORP_LAW',  'CA Intermediate Group I — Corporate and Other Laws MCQ practice.', '{"1_month":99,"3_months":200,"6_months":300,"1_year":400}', false, 'GROUP_1', true, 8),
('inter-tax',       'INTERMEDIATE', 'Taxation',                           'TAX',       'CA Intermediate Group I — Taxation MCQ practice.',           '{"1_month":99,"3_months":200,"6_months":300,"1_year":400}', false, 'GROUP_1', true, 9),
('inter-cma',       'INTERMEDIATE', 'Cost and Management Accounting',     'CMA',       'CA Intermediate Group II — Cost and Management Accounting MCQ practice.', '{"1_month":99,"3_months":200,"6_months":300,"1_year":400}', false, 'GROUP_2', true, 10),
('inter-audit-ethics','INTERMEDIATE', 'Auditing and Ethics',              'AUDIT_ETHICS', 'CA Intermediate Group II — Auditing and Ethics MCQ practice.', '{"1_month":99,"3_months":200,"6_months":300,"1_year":400}', false, 'GROUP_2', true, 11),
('inter-fm-sm',      'INTERMEDIATE', 'Financial Management and Strategic Management', 'FM_SM', 'CA Intermediate Group II — FM & SM MCQ practice.', '{"1_month":99,"3_months":200,"6_months":300,"1_year":400}', false, 'GROUP_2', true, 12),
('foundation-quant-apt', 'FOUNDATION', 'Quantitative Aptitude',           'QUANT_APT', 'CA Foundation — Quantitative Aptitude MCQ practice.',        '{"1_month":200,"3_months":400,"6_months":500,"1_year":625}', false, 'NONE', true, 13),
('foundation-biz-eco',   'FOUNDATION', 'Business Economics',              'BIZ_ECO',   'CA Foundation — Business Economics MCQ practice.',           '{"1_month":150,"3_months":300,"6_months":400,"1_year":500}', false, 'NONE', true, 14)
ON CONFLICT (id) DO UPDATE SET
  level = EXCLUDED.level, name = EXCLUDED.name, code = EXCLUDED.code, description = EXCLUDED.description,
  prices = EXCLUDED.prices, "isPopular" = EXCLUDED."isPopular", group_name = EXCLUDED.group_name,
  is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order;

-- ─── MCQ bundles (group / all-subjects combos) ───────────────────────────

INSERT INTO public.mcq_bundles (id, title, level, prices, badge, group_name, subject_ids, is_active, is_custom) VALUES
('final-group1', 'Group I - All Subjects', 'FINAL', '{"1_month":450,"3_months":900,"6_months":1200,"1_year":1500}', NULL, 'GROUP_1',
  ARRAY['final-fr','final-afm','final-audit'], true, false),
('final-group2', 'Group II - All Subjects', 'FINAL', '{"1_month":450,"3_months":900,"6_months":1200,"1_year":1500}', NULL, 'GROUP_2',
  ARRAY['final-dt','final-idt','final-ibs'], true, false),
('final-both', 'Both Groups', 'FINAL', '{"1_month":900,"3_months":1800,"6_months":2400,"1_year":3000}', 'Best Value', 'BOTH',
  ARRAY['final-fr','final-afm','final-audit','final-dt','final-idt','final-ibs'], true, false),
('inter-group1', 'Group I - All Subjects', 'INTERMEDIATE', '{"1_month":250,"3_months":500,"6_months":800,"1_year":1000}', NULL, 'GROUP_1',
  ARRAY['inter-adv-acc','inter-corp-law','inter-tax'], true, false),
('inter-group2', 'Group II - All Subjects', 'INTERMEDIATE', '{"1_month":250,"3_months":500,"6_months":800,"1_year":1000}', NULL, 'GROUP_2',
  ARRAY['inter-cma','inter-audit-ethics','inter-fm-sm'], true, false),
-- INFERRED (not visible in the sheet) — confirm in admin panel:
('inter-both', 'Both Groups', 'INTERMEDIATE', '{"1_month":500,"3_months":1000,"6_months":1600,"1_year":2000}', 'Best Value', 'BOTH',
  ARRAY['inter-adv-acc','inter-corp-law','inter-tax','inter-cma','inter-audit-ethics','inter-fm-sm'], true, false),
('foundation-all', 'All Subjects', 'FOUNDATION', '{"1_month":300,"3_months":650,"6_months":800,"1_year":1000}', NULL, 'NONE',
  ARRAY['foundation-quant-apt','foundation-biz-eco'], true, false)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, level = EXCLUDED.level, prices = EXCLUDED.prices, badge = EXCLUDED.badge,
  group_name = EXCLUDED.group_name, subject_ids = EXCLUDED.subject_ids, is_active = EXCLUDED.is_active;


-- ─── Courses: mentorship / test-series / RTI / career products ──────────────
-- All delivered via delivery_type='whatsapp' (mentor-coordinated, not the
-- auto-graded MCQ engine) — whatsapp_link is left NULL for admins to fill in
-- via the panel; frontend must handle a missing link gracefully (fast-follow
-- task already tracks this).

INSERT INTO public.courses (id, title, description, price, level, delivery_type, status) VALUES
-- CA Final
('final-1on1-strategy', '1:1 Discussion and Overall Strategy', 'A focused one-on-one session to understand your current preparation, identify weaknesses, and create a personalized strategy for the upcoming attempt. Get clarity on study planning, subject prioritization, revision approach, and exam-day strategy.', 99, 'Final', 'whatsapp', 'available'),
('final-mentorship-with-ts', 'Mentorship Program [With Test Series]', NULL, 3500, 'Final', 'whatsapp', 'available'),
('final-mentorship-without-ts', 'Mentorship Program [Without Test Series]', NULL, 2999, 'Final', 'whatsapp', 'available'),
('final-rankers-with-ts', 'Rankers Program [With Test Series]', 'Our flagship mentorship program designed for students targeting exemption, rank, or maximum score improvement. Includes: dedicated personal mentor, customized study plan & timetable, regular performance tracking, doubt-solving guidance, 2 full-length mock tests per subject, detailed answer evaluation & improvement suggestions, revision strategy and accountability support.', 5999, 'Final', 'whatsapp', 'available'),
('final-rankers-without-ts', 'Rankers Program [Without Test Series]', 'Everything included in the Rankers Program except the mock test series. Perfect for students who already have access to a test series but want personalized mentorship, planning, motivation, and continuous guidance throughout their preparation.', 5000, 'Final', 'whatsapp', 'available'),
('final-test-series-both', 'Test Series Program - Both Groups', 'Simulate the actual ICAI examination with expert evaluation. Includes: 1 mock test for every subject, detailed paper checking, personalized feedback report, marks improvement suggestions, time management guidance.', 2200, 'Final', 'whatsapp', 'available'),
('final-test-series-g1', 'Test Series Program - Group I', 'Comprehensive mock tests for all Group I papers with detailed evaluation, examiner-style feedback, and actionable suggestions to maximize your score.', 1300, 'Final', 'whatsapp', 'available'),
('final-test-series-g2', 'Test Series Program - Group II', 'Practice every Group II paper under exam conditions and receive detailed corrections, presentation tips, and score improvement guidance.', 1300, 'Final', 'whatsapp', 'available'),
('final-test-series-single', 'Test Series Program - Single Paper', 'Attempt one subject before the actual examination and receive a comprehensive evaluation with personalized feedback, presentation review, and improvement recommendations.', 500, 'Final', 'whatsapp', 'available'),
('final-rti-analysis', 'RTI Copy Analysis', 'Discover exactly where you lost marks using your certified ICAI answer book. Includes: detailed written analysis report, personal discussion call, subject-wise improvement points, presentation and answer-writing feedback, practical recommendations for higher marks.', 600, 'Final', 'whatsapp', 'available'),
('final-ibs-mentorship', 'IBS Mentorship', 'Specialized mentorship for the Integrated Business Solutions (IBS) paper. Includes: case-solving framework, answer presentation techniques, exam approach and strategy, regular mentoring sessions, practice guidance based on ICAI pattern.', 3000, 'Final', 'whatsapp', 'available'),
('final-afm-practice', 'AFM Difficult Questions/New Questions Practice', 'Master high-weightage, tricky, and newly expected AFM questions with structured practice. Includes: curated question booklet (hard copy only), new pattern questions, step-by-step solutions, MCQ Portal access, revision-oriented practice material.', 2500, 'Final', 'whatsapp', 'available'),
-- CA Inter
('inter-1on1-strategy', '1:1 Discussion and Overall Strategy', 'Get a personalized roadmap for your preparation with expert guidance on planning, revision, subject prioritization, and effective study techniques.', 99, 'Intermediate', 'whatsapp', 'available'),
('inter-mentorship-with-ts', 'Mentorship Program [With Test Series]', NULL, 3200, 'Intermediate', 'whatsapp', 'available'),
('inter-mentorship-without-ts', 'Mentorship Program [Without Test Series]', NULL, 2500, 'Intermediate', 'whatsapp', 'available'),
('inter-rankers-with-ts', 'Rankers Program [With Test Series]', 'A complete mentorship solution for serious CA Inter aspirants. Includes: dedicated mentor, personalized study plan, weekly performance review, doubt-solving support, 2 mock tests per subject, detailed evaluation, accountability and revision guidance.', 5399, 'Intermediate', 'whatsapp', 'available'),
('inter-rankers-without-ts', 'Rankers Program [Without Test Series]', 'Receive all mentorship benefits including planning, guidance, accountability, and performance tracking without the integrated mock tests.', 4500, 'Intermediate', 'whatsapp', 'available'),
('inter-test-series-both', 'Test Series Program - Both Groups', 'Practice every subject in real exam conditions with professional evaluation and constructive feedback to improve accuracy, presentation, and confidence.', 1650, 'Intermediate', 'whatsapp', 'available'),
('inter-test-series-g1', 'Test Series Program - Group I', 'One mock test for each Group I paper with detailed checking, improvement points, and examiner-level feedback.', 950, 'Intermediate', 'whatsapp', 'available'),
('inter-test-series-g2', 'Test Series Program - Group II', 'Strengthen your preparation through full-length Group II mock exams evaluated with practical recommendations for score improvement.', 950, 'Intermediate', 'whatsapp', 'available'),
('inter-test-series-single', 'Test Series Program - Single Paper', 'Take one mock exam of your chosen subject and receive comprehensive evaluation along with personalized improvement suggestions.', 350, 'Intermediate', 'whatsapp', 'available'),
('inter-rti-analysis', 'RTI Copy Analysis', 'Turn your previous attempt into your biggest learning opportunity. Includes: detailed answer sheet review, marks-loss analysis, personal discussion call, presentation improvement suggestions, action plan for the next attempt.', 450, 'Intermediate', 'whatsapp', 'available'),
-- CA Foundation
('foundation-1on1-strategy', '1:1 Discussion and Overall Strategy', 'Start your CA journey with the right strategy. Receive personalized guidance on study planning, revision schedules, and smart preparation techniques.', 99, 'Foundation', 'whatsapp', 'available'),
('foundation-test-series', 'Test Series Program', 'Practice under real examination conditions with one mock test per subject, expert evaluation, and detailed performance feedback.', 500, 'Foundation', 'whatsapp', 'available'),
('foundation-test-series-single', 'Test Series Program - Single Paper', 'Choose any one Foundation subject for a professionally evaluated mock test with personalized suggestions for improvement.', 150, 'Foundation', 'whatsapp', 'available'),
('foundation-rti-analysis', 'RTI Copy Analysis', 'Understand your previous performance through a detailed review of your ICAI answer sheet, followed by a personalized improvement report and discussion.', 350, 'Foundation', 'whatsapp', 'available'),
-- Career / Others
('career-articleship-guidance', 'Articleship Guidance - 1:1 Call', 'Confused about choosing your articleship? Speak directly with experienced Chartered Accountants to understand firm selection, domain preferences, interview preparation, and long-term career planning.', 499, 'All Levels', 'whatsapp', 'available'),
('career-cv-review', 'CV/Resume Review and Mock Interview', 'Increase your chances of securing your preferred articleship or job. Includes: professional CV review, resume enhancement suggestions, mock interview session, personalized feedback, interview confidence-building tips.', 99, 'All Levels', 'whatsapp', 'available'),
('career-post-qualification', 'Post Qualification Mentorship', 'Receive career guidance after becoming a Chartered Accountant. Topics include: job vs practice, industry opportunities, higher studies, career transitions, long-term professional growth.', 499, 'All Levels', 'whatsapp', 'available'),
('career-ug-commerce-mentorship', 'Undergraduate Commerce Mentorship', 'Guidance for commerce students on building a strong career foundation through skill development, certifications, internships, career planning, and CA preparation.', 249, 'All Levels', 'whatsapp', 'available')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description, price = EXCLUDED.price,
  level = EXCLUDED.level, delivery_type = EXCLUDED.delivery_type, status = EXCLUDED.status;
