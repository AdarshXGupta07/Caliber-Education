# Caliber Education Backend — Setup Guide
### Everything You Need Before Running the Server

---

## 1. Supabase URL & Service Role Key

**Used for**: All database reads/writes (courses, users, payments, etc.)

**Steps:**
1. Go to [supabase.com](https://supabase.com) → open your project
2. Click **Project Settings** → **API** (left sidebar)
3. Copy:
   - **Project URL** → paste as `SUPABASE_URL`
   - **`service_role`** key (under "Project API keys") → paste as `SUPABASE_SERVICE_KEY`

> ⚠️ The `service_role` key bypasses Row Level Security. **Never expose it to the frontend.**

```env
SUPABASE_URL=https://abcdefghij.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOi...
```

---

## 2. JWT Secret Key

**Used for**: Signing and verifying user login tokens

**Steps:**
Run this in your terminal to generate a secure secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Paste the output as `JWT_SECRET`.

```env
JWT_SECRET=a3f9b2e4c1d7...  (your 64-char random string)
```

---

## 3. Razorpay Key ID + Secret

**Used for**: Creating payment orders and verifying signatures

**Steps:**
1. Go to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Login → click **Settings** → **API Keys**
3. Click **Generate Test Key** (for development)
4. Copy both:
   - **Key ID** → `RAZORPAY_KEY_ID`
   - **Key Secret** → `RAZORPAY_KEY_SECRET`

> 💡 Use test keys (prefix `rzp_test_`) during development. Switch to live keys only when deploying to production.

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

Also set this in the **frontend** `.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
```

---

## 4. Cloudflare Turnstile Secret Key

**Used for**: Bot protection on login, signup, contact, and forgot-password forms

**Steps:**
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile** (left sidebar)
2. Select your existing site or click **Add Site**
3. Under your site → go to **Settings**
4. Copy **Secret Key** → paste as `TURNSTILE_SECRET_KEY`

> 💡 The frontend already has `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. The backend needs the **Secret Key**, which is different.

```env
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

---

## 5. SendGrid API Key (Optional — for real OTP emails)

**Used for**: Sending OTP codes to users during signup and password recovery

**Without this**: OTP delivery is handled by Supabase Auth directly — without a configured SendGrid key, verification still goes through Supabase's own email flow, not a hardcoded/dev-only code.

**Steps:**
1. Create a free account at [sendgrid.com](https://sendgrid.com)
2. Go to **Settings** → **API Keys** → **Create API Key**
3. Give it "Mail Send" restricted permissions
4. Copy the key → `SENDGRID_API_KEY`
5. Set a verified sender email → `SENDGRID_FROM_EMAIL`

```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@calibereducation.com
```

---

## 6. Supabase Storage Buckets

**Used for**: Storing student answer sheet uploads and admin-evaluated papers

**Steps:**
1. In Supabase → go to **Storage**
2. Click **New Bucket** → name it `test-submissions` → set to **Private**
3. Click **New Bucket** → name it `evaluated-papers` → set to **Private**

```env
SUPABASE_SUBMISSION_BUCKET=test-submissions
SUPABASE_EVALUATION_BUCKET=evaluated-papers
```

---

## Final Checklist

Before running the server, check that your `.env` file has:

- [ ] `SUPABASE_URL` — your Supabase project URL
- [ ] `SUPABASE_SERVICE_KEY` — the `service_role` key
- [ ] `JWT_SECRET` — a long random string
- [ ] `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — from Razorpay dashboard
- [ ] `TURNSTILE_SECRET_KEY` — from Cloudflare dashboard
- [ ] Two storage buckets created in Supabase

Optional (production only):
- [ ] `SENDGRID_API_KEY` + `SENDGRID_FROM_EMAIL`

---

## Frontend `.env.local` Checklist

In `edu-platform-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```
