-- ==============================================================================
-- CASE-STUDY CLUSTER MIGRATION
--
-- Adds a first-class case_group_id to public.questions so every sub-question
-- in a case-study block is reliably associated with its parent case, instead
-- of relying on adjacent order + matching case_narrative text (which broke
-- down whenever the narrative was empty on sub-questions — the exact bug
-- this migration also backfills a fix for).
--
-- Safe to run multiple times:
--   - The ALTER TABLE uses ADD COLUMN IF NOT EXISTS.
--   - The backfill UPDATE only touches rows WHERE case_group_id IS NULL, so
--     re-running it after a first successful run is a no-op.
--   - Nothing is deleted; existing published content (question text, options,
--     correct answers, marks) is untouched — only case_group_id and, where
--     currently blank, case_narrative are populated.
--
-- Assumption: case-block boundaries are inferred from contiguous rows of
-- type = 'case' within the same section, ordered by order_index (falling
-- back to id as a tiebreaker for deterministic ordering). This matches how
-- the admin authoring UI has always created case blocks. If a case block was
-- ever manually reordered in a way that broke that contiguity, that block
-- will need a manual case_group_id fix after running this script.
-- ==============================================================================

-- 1. Add the column (nullable — normal questions never get a case_group_id).
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS case_group_id uuid;

CREATE INDEX IF NOT EXISTS idx_questions_case_group ON public.questions(case_group_id);

-- 2. Backfill existing case-study rows: one case_group_id per contiguous
--    run of type='case' questions in a section, and one resolved narrative
--    (the first non-empty case_narrative found anywhere in that run) copied
--    onto every row in the run.
WITH ordered AS (
    SELECT
        id,
        section_id,
        type,
        case_narrative,
        order_index,
        CASE
            WHEN type = 'case'
                 AND LAG(type) OVER (PARTITION BY section_id ORDER BY order_index, id) IS DISTINCT FROM 'case'
            THEN 1 ELSE 0
        END AS run_start
    FROM public.questions
    WHERE case_group_id IS NULL
),
runs AS (
    SELECT
        id,
        section_id,
        case_narrative,
        order_index,
        SUM(run_start) OVER (
            PARTITION BY section_id ORDER BY order_index, id
            ROWS UNBOUNDED PRECEDING
        ) AS run_number
    FROM ordered
    WHERE type = 'case'
),
run_ids AS (
    SELECT
        section_id,
        run_number,
        gen_random_uuid() AS group_id,
        (ARRAY_AGG(case_narrative ORDER BY order_index, id)
            FILTER (WHERE COALESCE(TRIM(case_narrative), '') <> ''))[1] AS resolved_narrative
    FROM runs
    GROUP BY section_id, run_number
)
UPDATE public.questions q
SET
    case_group_id = ri.group_id,
    case_narrative = COALESCE(ri.resolved_narrative, q.case_narrative, '')
FROM runs r
JOIN run_ids ri ON ri.section_id = r.section_id AND ri.run_number = r.run_number
WHERE q.id = r.id;
