-- Course Bundling & Tiered Discounts Database Migration

-- 1. We will add a dedicated column to Courses to let Admin manually specify 
-- an exact WhatsApp link rather than relying on our hardcoded generated logic.
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS whatsapp_link text;

-- 2. We need a new table to store Bundled Price Options (Dynamic Tiered Choices)
-- This allows admins to define a group of courses (e.g. 3 Inter Courses) and set a flat discounted price.
CREATE TABLE IF NOT EXISTS public.course_bundles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL, -- e.g. "CA Inter Group 1 Complete"
    description text,
    level text NOT NULL, -- e.g. "Inter", "Final", "Foundation"
    course_ids text[] NOT NULL, -- Array of course UUIDs that belong to this bundle 
    price numeric NOT NULL, -- The special discounted price for this bundle
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: When a user buys a bundle, our checkout router will unpack the `course_ids` array
-- and insert multiple rows into the `enrollments` table for the buyer!
