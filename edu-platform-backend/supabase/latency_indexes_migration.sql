-- Latency migration: adds indexes on columns filtered in hot request paths
-- (login, /me, entitlement checks, leaderboard, coupon/payment lookups).
-- Every statement here is purely additive (CREATE INDEX IF NOT EXISTS) —
-- safe to run on a live production database, no data is read, changed, or
-- deleted. Run this in the Supabase SQL editor whenever convenient.
--
-- Postgres builds each index by scanning the table; on a small/medium table
-- (a few thousand rows, which is this app's current scale) this takes well
-- under a second per statement. If a table ever grows very large, swap
-- CREATE INDEX for CREATE INDEX CONCURRENTLY (must then be run one
-- statement at a time, outside a transaction).

-- Auth — looked up on every login/register call
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Course-access checks — read on nearly every course-gated request
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);

-- Quiz attempts — read on /me, leaderboard, and rank calculation
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_set_id ON quiz_attempts(set_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);

-- MCQ / test-series entitlement checks — read on nearly every access-gated
-- MCQ or test-series request
CREATE INDEX IF NOT EXISTS idx_mcq_enrollments_user_subject ON mcq_enrollments(user_id, subject_code);
CREATE INDEX IF NOT EXISTS idx_test_series_enrollments_user_subject ON test_series_enrollments(user_id, subject_id);

-- Payments — looked up by order id on every verify/webhook call
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);

-- Mentor permission checks — read on nearly every admin/mentor request
CREATE INDEX IF NOT EXISTS idx_mentors_profile_id ON mentors(profile_id);

-- Coupons — checked on every coupon validate/apply call
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Session bookings — filtered by these in the admin session list
CREATE INDEX IF NOT EXISTS idx_session_bookings_student_id ON session_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_mentor_id ON session_bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_session_bookings_status ON session_bookings(status);
