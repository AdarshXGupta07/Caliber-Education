# Caliber Education — Frontend & Database Specification Document
This document acts as the definitive, comprehensive backend API specification and relational database design manual for the Caliber Education platform. It maps out all existing frontend routes, core data structures, forms, state transitions, authentication protocols, and payment workflows, converting them into a clear, actionable guide for a backend developer to implement a relational database (PostgreSQL/MySQL) and RESTful API.

---

## 1. Dynamic Route & Page Matrix

This table summarizes all frontend pages, their access controls, dynamic parameters, and the backend API resources they consume:

| Page / Route | Directory Component Path | Access Level | Dynamic Parameters & Context | Required Endpoints Used |
| :--- | :--- | :--- | :--- | :--- |
| **Home** (`/`) | `src/app/page.tsx` | Public | None. Displays featured programs. | `GET /api/courses` |
| **About Us** (`/about`) | `src/app/about/page.tsx` | Public | None. Renders static matrices and metrics. | *Static client rendering* |
| **Programs (Courses)** (`/courses`) | `src/app/courses/page.tsx` | Public | Filters courses based on Level and Status. | `GET /api/courses` |
| **Course Details** (`/courses/[id]`) | `src/app/courses/[id]/page.tsx` | Public / Protected CTA | Course matched via dynamic `id`. Checkout modal checks authentication. | `GET /api/courses/:id` <br> `POST /api/payments/verify-utr` <br> `POST /api/payments/create-order` |
| **Success** (`/courses/[id]/success`) | `src/app/courses/[id]/success/page.tsx` | Protected (Student) | Verified by checking user’s enrollment list. Generates WhatsApp cohort invitation. | `GET /api/courses/:id` <br> `GET /api/auth/me` |
| **Dashboard** (`/dashboard`) | `src/app/dashboard/page.tsx` | Protected (Student) | Loads enrolled courses, UTR payment verification lists, and quiz performance analytics. | `GET /api/auth/me` <br> `GET /api/courses` <br> `GET /api/mcq-series` |
| **Quiz Engine** (`/quiz/[id]`) | `src/app/quiz/[id]/page.tsx` | Protected (Student) | dynamic `id` maps to target MCQ practice sets. Tracks timers and submits scoring. | `GET /api/quizzes/:id` <br> `POST /api/quizzes/:id/attempts` <br> `GET /api/quizzes/:id/leaderboard` |
| **Admin Panel** (`/admin`) | `src/app/admin/page.tsx` | Protected (Admin Only) | High-level dashboard for users, courses, MCQ sets, payment verification, and series analytics. | `GET /api/admin/summary` <br> Full CRUD endpoints (see Section 7) |
| **Team Profiles** (`/team`) | `src/app/team/page.tsx` | Public | Displays educational founders, specialties, and support team channels. | *Static client rendering* |
| **Sign In** (`/login`) | `src/app/login/page.tsx` | Guest Only | Validates credentials and stores JWT token in client state. | `POST /api/auth/login` |
| **Sign Up** (`/signup`) | `src/app/signup/page.tsx` | Guest Only | Multi-stage form logic handling email OTP validations. | `POST /api/auth/register` <br> `POST /api/auth/verify-otp` |
| **Forgot Password** | `src/app/forgot-password/page.tsx` | Guest Only | Dispatches instructions key request payload. | `POST /api/auth/forgot-password` |
| **Reset Password** | `src/app/reset-password/page.tsx` | Guest Only | Updates system credentials with verification hash checks. | `POST /api/auth/reset-password` |

---

## 2. PostgreSQL Relational Database Schema Design

To replace the client-side `localStorage` persistence, the backend database must support the following entity relationships. Primary keys, foreign key constraints, nullable definitions, indexes, cascading deletes, and data types are explicitly detailed below.

### 2.1 Database Enums
```sql
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE course_level AS ENUM ('Foundation', 'Intermediate', 'Final', 'All Levels');
CREATE TYPE delivery_type AS ENUM ('whatsapp', 'mcq-series');
CREATE TYPE course_status AS ENUM ('available', 'coming_soon');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');
```

### 2.2 Table Schemas
```sql
-- ─── 1. USERS TABLE ───
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);

-- ─── 2. MENTORS TABLE ───
CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    initials VARCHAR(10) NOT NULL,
    color VARCHAR(100) NOT NULL, -- Tailwind gradient class string e.g., 'from-signal-emerald to-emerald-700'
    bio TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── 3. MCQ SERIES TABLE (Exam series categories) ───
CREATE TABLE mcq_series (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── 4. COURSES Table (Programs) ───
CREATE TABLE courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price_type VARCHAR(50) NOT NULL DEFAULT 'one-time', -- e.g., 'one-time' or 'session'
    level course_level NOT NULL DEFAULT 'Foundation',
    duration VARCHAR(100) NOT NULL,
    tag VARCHAR(100) NULL, -- e.g., 'Premium', 'Popular', 'Bestseller'
    enrolled_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3, 2) NOT NULL DEFAULT 4.50,
    delivery_type delivery_type NOT NULL DEFAULT 'whatsapp',
    whatsapp_link VARCHAR(500) NULL,                 -- Nullable, set if delivery_type is 'whatsapp'
    linked_series_id VARCHAR(100) NULL REFERENCES mcq_series(id) ON DELETE SET NULL, -- Set if delivery_type is 'mcq-series'
    status course_status NOT NULL DEFAULT 'coming_soon',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_courses_delivery ON courses(delivery_type);

-- ─── 5. COURSE MENTOR JOIN TABLE (Many-to-Many Relationship) ───
CREATE TABLE course_mentors (
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, mentor_id)
);

-- ─── 6. COURSE OUTCOMES TABLE ───
CREATE TABLE course_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    outcome VARCHAR(500) NOT NULL,
    sequence_number INTEGER NOT NULL
);
CREATE INDEX idx_outcomes_course ON course_outcomes(course_id);

-- ─── 7. COURSE CURRICULUM MODULES TABLE ───
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id VARCHAR(100) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sequence_number INTEGER NOT NULL
);
CREATE INDEX idx_modules_course ON course_modules(course_id);

-- ─── 8. PATHS/TOPICS IN MODULES TABLE ───
CREATE TABLE module_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sequence_number INTEGER NOT NULL
);
CREATE INDEX idx_topics_module ON module_topics(module_id);

-- ─── 9. MCQ SETS TABLE ───
CREATE TABLE mcq_sets (
    id VARCHAR(100) PRIMARY KEY,
    series_id VARCHAR(100) REFERENCES mcq_series(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT TRUE,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    subject VARCHAR(255) NOT NULL,
    topper_score INTEGER NOT NULL DEFAULT 0,
    topper_time_seconds INTEGER NOT NULL DEFAULT 0,
    topper_per_question_times JSONB NOT NULL, -- Array of seconds taken per question by the topper
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sets_series ON mcq_sets(series_id);

-- ─── 10. MCQ SECTION TABLE ───
CREATE TABLE set_sections (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'sec_a', 'sec_b'
    set_id VARCHAR(100) REFERENCES mcq_sets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sequence_number INTEGER NOT NULL
);
CREATE INDEX idx_sections_set ON set_sections(set_id);

-- ─── 11. QUESTIONS TABLE ───
CREATE TABLE questions (
    id INTEGER PRIMARY KEY, -- Auto-incrementing or explicit question index ids
    section_id VARCHAR(50) REFERENCES set_sections(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL, -- Exact array structure: ["Option A text", "Option B text", "Option C text", "Option D text"]
    correct_option_index INTEGER NOT NULL CHECK (correct_option_index BETWEEN 0 AND 3),
    explanation TEXT NOT NULL,
    sequence_number INTEGER NOT NULL
);
CREATE INDEX idx_questions_section ON questions(section_id);

-- ─── 12. ENROLLMENTS / COURSE PURCHASES (Many-to-Many) ───
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, course_id)
);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);

-- ─── 13. MANUAL PAYMENT VERIFICATIONS TABLE (Manual UTR audits) ───
CREATE TABLE payment_verifications (
    id VARCHAR(100) PRIMARY KEY, -- PV code format: 'pv-<timestamp>'
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status payment_status NOT NULL DEFAULT 'pending',
    utr_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_user ON payment_verifications(user_id);
CREATE INDEX idx_payments_status ON payment_verifications(status);

-- ─── 14. QUIZ ATTEMPTS TABLE (Detailed student tracking) ───
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    set_id VARCHAR(100) NOT NULL REFERENCES mcq_sets(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    elapsed_seconds INTEGER NOT NULL,
    per_question_times JSONB NOT NULL, -- Array of seconds taken per question
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_attempts_user_set ON quiz_attempts(user_id, set_id);
```

---

## 3. Authentication & Session Flow Specifications

Authentication on Caliber Education relies on JWT (JSON Web Tokens) generated after email validations.

```
Guest/Visitor ---> Enter Email ---> Sends Server verification request ---> simulated OTP (123456)
If verified   ---> Create/Login user with JWT returned in Authorization header context.
```

### 3.1 Sign Up & OTP Verification
Since the signup process is a wizard, the backend must split validation:
1. **Email Initialization** (`POST /api/auth/register-init`):
   - Accepts user email. Generates and stores a temporary OTP code (e.g. `123456` in development/staging database or cache) valid for 10 minutes.
2. **OTP Validation** (`POST /api/auth/verify-otp`):
   - Compares entry. Returns verification hash on success: `{ email: "user@example.com", isVerified: true, tempToken: "verificationHash" }`.
3. **Password Compilation & Creation** (`POST /api/auth/register`):
   - Receives email, password, and `tempToken`. Hashes password via `BCrypt` (10 salt rounds) and creates the `users` row. Returns validation tokens.

### 3.2 JWT Payload Structure
API returns JSON Web Tokens.
- **Expiry Rules**: 7 Days.
- **Header Structure**: `Authorization: Bearer <JWT_Token>`
- **JWT Claims Payload**:
```json
{
  "id": "u43dd-d3ef-4f11-9e23-7fa345657ff",
  "email": "student@calibereducation.com",
  "role": "student",
  "exp": 1782637200
}
```

### 3.3 Authorization Middleware Checklist
- **Student Authorization Guard**: Resolves context headers. Rejects requests lacking signature claims. Returns `401 Unauthorized`.
- **Admin Guard Route Wrapper**: Intercepts claims. Verifies target role parameter is explicitly equal to `admin`. Returns `403 Forbidden` on role matches mismatching admin authority keys.

---

## 4. REST API Endpoint Specifications

All endpoints interact via JSON payloads. Standard error messages return `{ "error": "Reason description" }` alongside the HTTP status codes.

### 4.1 Authentication REST Endpoints

#### Register Initialize
- **Method / Path**: `POST /api/auth/register-init`
- **Request Body**:
```json
{ "email": "repeatUser@gmail.com" }
```
- **Response Payloads**:
  - `200 OK`: `{ "success": true, "message": "Demo OTP 123456 sent to email" }`
  - `400 Bad Request`: `{ "error": "Invalid email formatting rule" }`

#### OTP Validation Check
- **Method / Path**: `POST /api/auth/verify-otp`
- **Request Body**:
```json
{
  "email": "repeatUser@gmail.com",
  "otp": "123456"
}
```
- **Response Payloads**:
  - `200 OK`: `{ "success": true, "tempToken": "otpTempHashValidated_xxx" }`
  - `401 Unauthorized`: `{ "error": "Incorrect or expired OTP verification code" }`

#### Final Registration Submit
- **Method / Path**: `POST /api/auth/register`
- **Request Body**:
```json
{
  "email": "repeatUser@gmail.com",
  "password": "strongPassword123",
  "tempToken": "otpTempHashValidated_xxx"
}
```
- **Response Payloads**:
  - `201 Created`:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "8482d3b-93ff-2a1d-a3df-4c3e86",
      "email": "repeatUser@gmail.com",
      "role": "student"
    }
  }
  ```
  - `400 Bad Request`: `{ "error": "Password criteria not met (minimum length: 6 characters)" }`
  - `409 Conflict`: `{ "error": "Email address already registered with caliber educational database" }`

#### Login Submit
- **Method / Path**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "student@calibereducation.com",
  "password": "studentPassword12"
}
```
- **Response Payloads**:
  - `200 OK`:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": "e44d3b-74cd-12da-4edf-8ba3426",
      "email": "student@calibereducation.com",
      "role": "student"
    }
  }
  ```
  - `401 Unauthorized`: `{ "error": "Incorrect email/password credentials matching combination" }`

#### Active User Status Profile
- **Method / Path**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response Payloads**:
  - `200 OK`:
  ```json
  {
    "user": {
      "id": "e44d3b-74cd-12da-4edf-8ba3426",
      "email": "student@calibereducation.com",
      "role": "student"
    },
    "purchases": ["course-ca-inter-account", "course-ca-final-fr"],
    "attempts": [
      {
        "set_id": "ca-accounting-free",
        "setTitle": "CA Accounting basic Set",
        "score": 28,
        "total": 30,
        "date": "2026-07-28"
      }
    ]
  }
  ```
  - `401 Unauthorized`: `{ "error": "Session token expired or missing authorization verification payload" }`

---

### 4.2 Course / Program Endpoints

#### Load Course Listings
- **Method / Path**: `GET /api/courses`
- **Params**:
  - `level` (optional): `Foundation` | `Intermediate` | `Final` | `All Levels`
  - `status` (optional): `available` | `coming_soon`
- **Response Payloads**:
  - `200 OK`:
  ```json
  [
    {
      "id": "course-ca-inter-accounting-p1",
      "title": "CA Inter Advance Accounting",
      "description": "Comprehensive timed worksheets covering FR standards.",
      "price": 14999,
      "level": "Intermediate",
      "duration": "12 weeks",
      "tag": "Bestseller",
      "enrolledCount": 1420,
      "rating": 4.8,
      "deliveryType": "whatsapp",
      "whatsappLink": "https://chat.whatsapp.com/invite/CA-INTER-2026",
      "status": "available",
      "mentors": [
        {
          "name": "Somya Deep",
          "specialty": "Financial Reporting",
          "initials": "SD",
          "color": "from-signal-emerald to-emerald-700",
          "bio": "Chartered Accountant specializing in Advance Accounting."
        }
      ],
      "outcomes": [
        "Master index mapping and timings calculations",
        "Perform structured corporate balance audits"
      ],
      "curriculum": [
        {
          "module": "Basic Consolidation Formulas",
          "topics": ["Intro and base adjustments", "Revaluation rules"]
        }
      ]
    }
  ]
  ```

#### Fetch Single Course Details
- **Method / Path**: `GET /api/courses/:id`
- **Response Payloads**:
  - `200 OK`: Returns single Course object layout matching the schema above.
  - `404 Not Found`: `{ "error": "Target program or course ID not found" }`

---

### 4.3 Payment & Verification Endpoints

#### Submit Payments UTR
- **Method / Path**: `POST /api/payments/verify-utr`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "courseId": "course-ca-inter-accounting-p1",
  "utrNumber": "993322110012"
}
```
- **Response Payloads**:
  - `201 Created`:
  ```json
  {
    "success": true,
    "verification": {
      "id": "pv-1736294726210",
      "studentEmail": "student@calibereducation.com",
      "courseTitle": "CA Inter Advance Accounting",
      "amount": 14999,
      "date": "2026-07-28",
      "status": "pending",
      "utrNumber": "993322110012"
    }
  }
  ```
  - `400 Bad Request`: `{ "error": "Duplicate entry. This UTR number is already submitted for database validation" }`
  - `404 Not Found`: `{ "error": "Target courses not valid" }`

#### Create Razorpay Order (Integration Target)
- **Method / Path**: `POST /api/payments/create-order`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{ "courseId": "course-ca-inter-accounting-p1" }
```
- **Response Payloads**:
  - `201 Created`:
  ```json
  {
    "orderId": "order_Hj3d9K3jdks8",
    "amount": 1499900,
    "currency": "INR",
    "key": "rzp_test_xxxxxx"
  }
  ```

#### Verify Signature Razorpay (Webhook / Webhook Call)
- **Method / Path**: `POST /api/payments/verify-payment`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "razorpay_order_id": "order_Hj3d9K3jdks8",
  "razorpay_payment_id": "pay_KkS93kLdjf89",
  "razorpay_signature": "fa98ef98f39efaee3..."
}
```
- **Response Payloads**:
  - `200 OK`: `{ "success": true, "message": "Signature verified, user enrolled successfully" }`
  - `400 Bad Request`: `{ "error": "Payment verification failed. Invalid cryptographic signature format" }`

---

### 4.4 Quiz Practice & Leaderboard Endpoints

#### Retrieve Single MCQ Quiz Structure
- **Method / Path**: `GET /api/quizzes/:id`
- **Response Payloads**:
  - `200 OK`:
  ```json
  {
    "id": "ca-accounting-free",
    "seriesId": "accounting-series-1",
    "title": "CA Accounting Basic Set",
    "isLocked": false,
    "price": 0,
    "description": "Timed worksheets checking conceptual depth for repeaters.",
    "subject": "Accounting",
    "topperStats": {
      "score": 29,
      "totalTimeSeconds": 840,
      "perQuestionTimes": [30, 20, 45, 12, 10]
    },
    "sections": [
      {
        "id": "sec_a",
        "title": "Section A — Conceptual Exclusions",
        "questions": [
          {
            "id": 1,
            "text": "Which of the following standards dictates corporate consolidation exclusions?",
            "options": [
              "ICAI AS-21 Consolidated Balance Guideline",
              "ICAI AS-14 Mergers accounting",
              "AS-3 Cash flow adjustments statement",
              "AS-9 Revenue rules metadata"
            ],
            "correctOptionIndex": 0,
            "explanation": "AS-21 provides procedures regarding adjustments of subsidiary asset schedules."
          }
        ]
      }
    ]
  }
  ```
  - `404 Not Found`: `{ "error": "Target practice test set ID not found" }`

#### Submit Quiz Attempt Metrics
- **Method / Path**: `POST /api/quizzes/:id/attempts`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
  "score": 28,
  "total": 30,
  "elapsedSeconds": 910,
  "perQuestionTimes": [42, 12, 55, 60, 20]
}
```
- **Response Payloads**:
  - `201 Created`:
  ```json
  {
    "success": true,
    "attemptId": "e4a3b-231a-d421-ba31",
    "rank": 3,
    "totalCompetitors": 124
  }
  ```

#### Fetch Live Set Leaderboard
Calculates rankings from student attempts records using the specified algorithm (Section 6).
- **Method / Path**: `GET /api/quizzes/:id/leaderboard`
- **Response Payloads**:
  - `200 OK`:
  ```json
  [
    { "name": "Akash Mehta (Topper)", "score": 29, "time": 840, "isUser": false },
    { "name": "Meera Nair", "score": 27, "time": 810, "isUser": false },
    { "name": "You", "score": 25, "time": 910, "isUser": true },
    { "name": "Rahul Shah", "score": 24, "time": 1050, "isUser": false }
  ]
  ```

---

## 5. Forms & Validation Logic specifications

All frontend validation rules are verified client-side using native HTML features and Form states:

1. **Sign In Credentials Panel**:
   - **Inputs**: `email` (type="email", required), `password` (type="password", required, minimum length: 1 character).
   - **Pattern Regex**: `^[^\s@]+@[^\s@]+\.[^\s@]+$` (verified email addresses).
   - **Actions**: Trigger login loading -> dispatch data payload -> update storage properties -> route directly to `/dashboard`.

2. **Sign Up Wizard Framework**:
   - **Inputs**: `email` (type="email", validation pattern is identical to login).
   - **OTP Digit Fields**: Length-6 index tracking numeric elements: `pattern="[0-9]*"`. Auto-focus transition on valid value additions.
   - **Password Security Fields**: `password` (required, >= 6 characters), `confirmPassword`. Checks passwords match.
   - **Actions**: Resolves OTP codes -> authenticates validation references -> dispatches registrations -> redirects directly to `/dashboard`.

3. **Verify Payments Manual Upload Form**:
   - **Inputs**: `utr` (required, string, minimum length: 12 characters constraint recommended, allows alphanumeric characters).
   - **Actions**: Locks inputs during submit hooks -> routes to `/dashboard` immediately displaying status markers pending admin resolution reviews.

4. **Team and Educator Profiles**:
   - **Renders**: Somya Deep (SD) and Aditya Kanal (AK) specialties mapping lists, statistics figures (CAs mentored, exclusions metrics), quote sections, links mapping.
   - **Support Coordinators**: Renders operations details for Neha Sharma (Academic Doubts) and Vikram Malhotra (Platform ops metadata).

---

## 6. Quiz Leaderboard Ranking & Score Sorting Algorithm

To rank users, the application uses their attempt metrics. An attempt's rank is calculated using the following strict sorting criteria:

### 6.1 Ranking Hierarchy
1. **Primary Sort key**: Accuracy / Score (Score count value `descending`, highest score first).
2. **Secondary Sort key**: Speed / Duration (Elapsed seconds taken `ascending`, fastest student wins).

```
Score (Desc) ---> Elapsed Seconds (Asc) ---> Ranking Position Index
```

### 6.2 Example Evaluation Set:
If three students submit attempts for a 30-question quiz:
- Student A: 28 correct, 900 seconds.
- Student B: 28 correct, 820 seconds.
- Student C: 29 correct, 1100 seconds.

**Sorting Output Table**:
1. **Rank 1**: Student C (29 correct, 1100s) — Score takes absolute priority.
2. **Rank 2**: Student B (28 correct, 820s) — Matches Student A’s score but resolves questions faster.
3. **Rank 3**: Student A (28 correct, 900s) — Lower speed threshold.

### 6.3 Analytics Breakdown Calculations
The quiz result view compares individual timers against topper stats step-by-step:
`comparisonsYouVsTopperTime = secondsTakenByYou - secondsTakenByTopper`
- Positive Value outputs `+X seconds` (slower).
- Negative Value outputs `-X seconds` (faster).

---

## 7. Admin CRUD Dashboard Panel Endpoints

The Admin dashboard requires a standard set of role-checked API endpoints.

```
Request ---> Valid Admin JWT? Yes ---> Grant Dashboard Access & CRUD Operations
                           No  ---> Rejects with 403 Forbidden
```

### 7.1 Payments & Audit Management
Admins review transactions submitted as UTR codes.
- **`GET /api/admin/payments`**:
  - Query parameters: `status` (`pending` | `approved` | `rejected` | `refunded`).
  - Returns array of manual payment verification records matching the status category.
- **`PATCH /api/admin/payments/:id`**:
  - Input: `{ "status": "approved" | "rejected" | "refunded" }`.
  - Effect: Alters status of payment verification. If status matches `approved`, a course enrollment is automatically generated matching the student's ID and course ID parameters.

### 7.2 User Records Lookup
Provides records of student directories.
- **`GET /api/admin/users`**:
  - Returns directories of all students, registration dates, transaction logs.
- **`GET /api/admin/users/:id/attempts`**:
  - Returns detailed attempt logs database, listing sections completed and duration metrics.

### 7.3 Course Program Management (CRUD)
Provides course catalog updates.
- **`POST /api/admin/courses`**: Creates course catalogs. Accepts Title, Mentors List, outcomes JSON, Curriculum Modules JSON arrays, Pricing.
- **`PUT /api/admin/courses/:id`**: Full replacement of course catalog properties.
- **`DELETE /api/admin/courses/:id`**: Removes course parameter maps. Checks if student enrollment records exists (if yes, restrict delete or cascade enrollment maps).

### 7.4 MCQ Series Setup (CRUD)
- **`POST /api/admin/mcq-series`**: Creates series.
- **`PUT /api/admin/mcq-series/:id`**: Updates series properties.
- **`DELETE /api/admin/mcq-series/:id`**: Removes series directories.

### 7.5 MCQ Sets & Section Builder (CRUD)
Allows modifications of section arrays and questions database maps.
- **`POST /api/admin/mcq-sets`**: Inserts a set entry mapping to parent series ID.
- **`PUT /api/admin/mcq-sets/:id`**: Alters sets, updating Sections structure, topper mock speeds, price criteria.
- **`DELETE /api/admin/mcq-sets/:id`**: Cascades set sections.

---

## 8. Client Refactoring & Migration Guide

To transition the frontend to integrate are real database and RESTful API, implement the following changes in the Next.js frontend code:

### Step 8.1 Setup Environment Config (`.env.local`)
Create `.env.local` inside the frontend directory:
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxx
```

### Step 8.2 Build API Request Wrapper Client (`src/lib/api.ts`)
Create a custom Axios or Fetch client instance that automatically extracts token claims:
```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("caliber_jwt");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

### Step 8.3 Update Authentication Context (`src/context/AuthContext.tsx`)
Refactor the client context to transition from local state mocks to REST calls:

```typescript
// 1. Replace the local mount load effects:
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("caliber_jwt");
    if (!token) return;
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
      setVerifications(response.data.payments);
    } catch {
      localStorage.removeItem("caliber_jwt");
      setUser(null);
    }
  };
  initAuth();
}, []);

// 2. Refactor login action:
const login = async (email: string, password?: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;
    localStorage.setItem("caliber_jwt", token);
    setUser(userData);
    router.push("/dashboard");
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Login validation failed");
  }
};

// 3. Refactor registration actions:
const enrollFreeCourse = async (courseId: string) => {
  try {
    await api.post(`/courses/${courseId}/enroll-free`);
    // re-fetch me to reload active state
    const res = await api.get("/auth/me");
    setUser(res.data.user);
  } catch (err) {
     console.error("Free enrollment query mismatch", err);
  }
};

// 4. Refactor verification updates:
const submitUTR = async (courseId: string, utr: string) => {
  try {
    const response = await api.post("/payments/verify-utr", { courseId, utrNumber: utr });
    setVerifications(prev => [response.data.verification, ...prev]);
  } catch (err: any) {
    alert(err.response?.data?.error || "UTR registration rejected");
  }
};
```

### Step 8.4 Clean out Mocks fallback parameters
Replace arrays in pages with backend fetching:
- **`src/app/courses/page.tsx`**: Add `useEffect` to trigger query `api.get("/courses")` instead of referencing `import { courses }`.
- **`src/app/quiz/[id]/page.tsx`**: Add loader mapping to `api.get("/quizzes/" + id)`. Submit scoring records on submit trigger using:
  `api.post("/quizzes/" + id + "/attempts", { score, total, elapsedSeconds, perQuestionTimes })`
- **`src/app/admin/page.tsx`**: Connect tables to use `api.get("/admin/users")`, `api.get("/admin/payments")` with query pagination filters.
