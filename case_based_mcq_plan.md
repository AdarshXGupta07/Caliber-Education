# Case-Based MCQ Implementation Plan

## Step 1: Style Analysis
Based on the existing `HeroMCQCard.tsx` and the overarching design system, the new components must adhere to the following Tailwind stylistic patterns:

*   **Background & Glassmorphism:** 
    *   Dark mode container: `bg-white dark:bg-line-gray-dark/20`
    *   Backdrop blur: `backdrop-blur-sm` (or `backdrop-blur-md`)
    *   Borders: `border border-line-gray-light dark:border-line-gray-dark`
*   **Typography:**
    *   Primary Text (Questions/Headings): `text-ink-navy dark:text-paper font-medium text-sm` to `text-base`
    *   Secondary Text (Labels/Hints/Explanations): `text-slate dark:text-paper/50 text-xs`
    *   Accents/Scores/Monospace: `font-mono text-signal-emerald`
*   **Interactive Elements / Options:**
    *   Rely on the existing `<AnswerRevealOption>` component to maintain selection, correct, and wrong state animations and colors.
*   **Layout Specifics:**
    *   Soft rounded corners: `rounded-xl` or `rounded-2xl`
    *   Smooth transitions using Framer Motion (`AnimatePresence`, `motion.div`)
    *   Dividers: `border-b border-line-gray-light dark:border-line-gray-dark`

## Step 2: Database & Backend
**2.1 SQL Migration (`edu-platform-backend/supabase/case_based_mcq_migration.sql`)**
*   Create `question_sets` table: Tracks `id`, `passage_text` (nullable), `title`, `created_at`.
*   Modify/Create `questions` table: Links to `question_set_id`, holds `question_text`, `correct_option_index`, `explanation`.
*   Create `options` table: Links to `question_id`, holds `option_text`.
*   *(Alternatively, if options are stored as a JSONB array, we will update the `questions` table to use a JSONB field to limit joins, matching the frontend's string array approach).*

**2.2 FastAPI Schemas (`edu-platform-backend/app/schemas/mcq.py`)**
*   Update the `QuestionCreate` and `QuestionOut` Pydantic models.
*   Introduce `MCQSetCreate` model:
    ```python
    class MCQSetCreate(BaseModel):
        title: str
        is_case_based: bool
        passage_text: Optional[str] = None
        questions: List[QuestionCreate]
    ```
*   Update API route handlers to recursively insert the set, questions, and options.

## Step 3: Frontend - Student View
**3.1 Create Component (`edu-platform-frontend/src/components/CaseStudyMCQ.tsx`)**
*   **Layout Constraint:** `grid lg:grid-cols-2 gap-8 items-start` on desktop; standard flex column on mobile.
*   **Left Column (Passage):** 
    *   Use a sticky position or fixed height with `overflow-y-auto` so the user can scroll the case study independently.
    *   Style with `prose prose-sm dark:prose-invert` for high readability.
*   **Right Column (Questions):**
    *   Render a single specific sub-question at a time.
    *   Incorporate next/previous sub-question navigation local to the `CaseStudyMCQ` component.
    *   Utilize `<AnswerRevealOption>` for choices to keep interactivity synced with the rest of the application.

## Step 4: Frontend - Mentor Dashboard
**4.1 Update Admin Panel (`edu-platform-frontend/src/app/admin/page.tsx`)**
*   Replace standard text inputs with a conditional form section.
*   **Toggle:** Add "Standard MCQ" vs "Case-Based" segment control.
*   **Case-Based Path:**
    *   Render `textarea` for the overarching case passage.
    *   Render a dynamic list of nested sub-questions (`map` over an array of sub-questions in state).
    *   Include a button to "Add Sub-Question".
*   **State Management:** Consolidate the passage and its related sub-questions into a structured JSON payload that validates perfectly against the updated FastAPI `MCQSetCreate` schema.

---
**Status:** Pending Review. 
Please let me know if this task list aligning with your requirements so I can proceed with the execution.
