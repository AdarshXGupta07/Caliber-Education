-- Migration: Atomic Subscription Extensions

-- 1. Ensure `enrollments` table has the expiration column
ALTER TABLE public.enrollments 
ADD COLUMN IF NOT EXISTS access_until TIMESTAMP WITH TIME ZONE;
-- (Note: Primary Key is already (user_id, course_id), so we don't need a separate UNIQUE constraint)

-- 2. Create the RPC function that automatically handles INSERT or atomic UPDATE
CREATE OR REPLACE FUNCTION grant_or_extend_enrollment(
    p_user_id UUID,
    p_course_id TEXT,
    p_duration_days INT
) 
RETURNS TIMESTAMP WITH TIME ZONE 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    INSERT INTO public.enrollments (user_id, course_id, purchased_at, access_until, added_by)
    VALUES (
        p_user_id, 
        p_course_id, 
        now(), 
        now() + (p_duration_days || ' days')::interval,
        'purchase'
    )
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET 
        access_until = GREATEST(public.enrollments.access_until, now()) + (p_duration_days || ' days')::interval
    RETURNING access_until INTO new_expires_at;

    RETURN new_expires_at;
END;
$$;
