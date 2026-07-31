# Caliber Education — FastAPI Backend

REST API backend for the Caliber Education CA prep platform. Built with **FastAPI** and **Supabase**.

---

## Quick Start

### 1. Create & activate a virtual environment
```bash
cd edu-platform-backend

# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
# Copy the example file
copy .env.example .env     # Windows
cp .env.example .env       # macOS/Linux

# Then open .env and fill in your real values
# (See SETUP_GUIDE.md for exactly what to put where)
```

### 4. Run the development server
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be live at:
- **API Root**: http://localhost:8000
- **Swagger UI** (interactive docs): http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Connect to the Frontend

In `edu-platform-frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Folder Structure

```
app/
├── main.py            # FastAPI app, CORS, router mounts
├── dependencies.py    # Auth guard dependencies
├── core/
│   ├── config.py      # Pydantic Settings (reads .env)
│   ├── database.py    # Supabase client singleton
│   └── security.py    # JWT + bcrypt utilities
├── routers/
│   ├── auth.py        # /api/auth/*
│   ├── courses.py     # /api/courses/*
│   ├── payments.py    # /api/payments/*
│   ├── mcq.py         # /api/mcq-series/*, /api/quizzes/*
│   ├── sessions.py    # /api/mentors/*, /api/sessions/*
│   ├── tests.py       # /api/tests/*
│   ├── contact.py     # /api/contact
│   └── admin.py       # /api/admin/*
└── schemas/
    ├── auth.py
    ├── courses.py
    ├── payments.py
    ├── mcq.py
    ├── sessions.py
    ├── tests.py
    └── admin.py
```

---

## API Overview

| Group | Prefix | Auth |
|---|---|---|
| Authentication | `/api/auth` | Public / JWT |
| Courses | `/api/courses` | Public + Student |
| Payments | `/api/payments` | Student JWT |
| MCQ / Quizzes | `/api/mcq-series`, `/api/quizzes` | Public + Student |
| Sessions | `/api/mentors`, `/api/sessions` | Student JWT |
| Tests | `/api/tests` | Student JWT |
| Contact | `/api/contact` | Public + Turnstile |
| Admin | `/api/admin` | Admin JWT |

Full endpoint details are in **Swagger UI** at `/docs`.

---

## Supabase Storage Buckets

Create these two buckets in your Supabase project → **Storage**:

| Bucket Name | Purpose | Access |
|---|---|---|
| `test-submissions` | Student answer sheet uploads | Private |
| `evaluated-papers` | Admin checked copy uploads | Private |

---

## Development vs Production

| Feature | Development | Production |
|---|---|---|
| OTP code | Always `123456` | Random 6-digit via SendGrid |
| Turnstile | Skipped | Verified with Cloudflare |
| Razorpay | Stub order IDs | Live Razorpay API |
| JWT expiry | 7 days | 7 days |

Set `APP_ENV=production` in `.env` to enable all live integrations.
