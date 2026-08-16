# Test Mode MCQ Extension - Implementation Guide

## ✅ Current Configuration: TEST MODE (No Razorpay)

### **What Happens in Test Mode:**

When you click "Pay" on the MCQ page:
1. ✅ Creates order on backend
2. ✅ **SKIPS** Razorpay checkout modal completely
3. ✅ Instantly calls `/api/payments/mock-confirm-mcq`
4. ✅ Backend creates/extends MCQ enrollment
5. ✅ Shows success message
6. ✅ Redirects to dashboard after 2 seconds

**No Razorpay integration = Pure test mode for verifying extension logic**

## 🧪 Testing the Extension Logic

### Test Case 1: New Purchase
1. Go to `/mcq`
2. Select a subject you DON'T own yet
3. Choose "1 Month" duration
4. Click "Pay ₹XXX"
5. Should see success message immediately
6. Check database: New row in `mcq_enrollments` with `access_until` = now + 30 days

### Test Case 2: Extension (The Important One!)
1. Go to `/mcq`
2. Click "Extend Plan" on a subject you ALREADY own
3. Note the current expiry date in dashboard
4. Choose "3 Months" duration
5. Click "Pay ₹XXX"
6. Check backend logs: Should show:
   ```
   [MCQ ENROLL] Existing expiry for final-fr: 2027-01-31 06:10:10.089926+00
   [MCQ ENROLL] Extending final-fr: 2027-01-31... + 3_months → 2027-04-30...
   ```
7. Check database: `access_until` should be original + 90 days ✅

### Test Case 3: Multiple Extensions
1. Buy 1 month → check expiry
2. Immediately extend by 3 months → should add 90 days to future expiry
3. Extend again by 6 months → should add 180 days to the new expiry
4. Each extension stacks on top of the previous one ✅

## 📊 Backend Extension Logic

**Location:** `edu-platform-backend/app/routers/payments.py` → `_apply_mcq_grant()`

```python
# Find existing enrollment
existing_enroll = db.table("mcq_enrollments")\
    .select("id, access_until")\
    .eq("user_id", user_id)\
    .eq("subject_code", sub_id)\
    .execute()

if existing_enroll.data:
    # Pick the latest expiry row
    best_row = max(existing_enroll.data, key=lambda r: parse_dt(r.get("access_until")))
    existing_expiry = parse_dt(best_row["access_until"])
    
    # Stack extension: use existing expiry if future, else now
    base_date = existing_expiry if existing_expiry > now else now
    
    # Add new duration on top
    if duration_str == "1_month":    new_expiry = (base_date + timedelta(days=30))
    elif duration_str == "3_months": new_expiry = (base_date + timedelta(days=90))
    elif duration_str == "6_months": new_expiry = (base_date + timedelta(days=180))
    elif duration_str == "1_year":   new_expiry = (base_date + timedelta(days=365))
    
    print(f"[MCQ ENROLL] Extending {sub_id}: {existing_expiry} + {duration_str} → {new_expiry}")
    
    # Update ONLY the latest row for this subject
    db.table("mcq_enrollments").update({
        "access_until": new_expiry.isoformat()
    }).eq("id", best_row["id"]).execute()
else:
    # New enrollment
    db.table("mcq_enrollments").insert({...})
```

## 🔍 How to Verify Extension is Working

### Method 1: Check Backend Logs
Watch the backend terminal for lines like:
```
[MCQ ENROLL] Processing subject: final-fr, duration: 3_months
[MCQ ENROLL] Existing expiry for final-fr: 2027-01-31 06:10:10.089926+00
[MCQ ENROLL] Extending final-fr: 2027-01-31 06:10:10.089926+00 + 3_months → 2027-04-30 06:10:10.089926+00
```

### Method 2: Check Database Directly
```sql
SELECT 
    subject_code,
    access_until,
    created_at,
    payment_id
FROM mcq_enrollments
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

### Method 3: Check Dashboard Display
1. Go to `/dashboard?tab=mcqs`
2. Each subject card should show "X days left"
3. After extension, refresh → should show increased days

## 📝 Frontend Flow (Simplified for Test Mode)

**File:** `edu-platform-frontend/src/app/mcq/page.tsx`

```typescript
const handleCheckout = async () => {
  setIsProcessing(true);
  
  // 1. Create order on backend
  const orderRes = await fetch(`${apiURL}/api/payments/create-mcq-order`, {
    method: "POST",
    body: JSON.stringify({
      level: activeLevel,
      subjectIds: modalSelectedSubjectIds,
      duration: selectedDuration,
    }),
  });

  const orderData = await orderRes.json();

  // 2. Instantly confirm (test mode)
  const confirmRes = await fetch(`${apiURL}/api/payments/mock-confirm-mcq`, {
    method: "POST",
    body: JSON.stringify({
      razorpay_order_id: orderData.orderId,
      razorpay_payment_id: "pay_TEST_" + random,
      razorpay_signature: "test_mode_signature"
    }),
  });

  // 3. Show success and redirect
  setPurchaseSuccess(true);
  setTimeout(() => {
    window.location.href = "/dashboard?tab=mcqs";
  }, 2000);
};
```

## ✅ What Has Been Removed for Test Mode:

- ❌ Razorpay script loading
- ❌ Razorpay SDK initialization
- ❌ Razorpay checkout modal
- ❌ Payment gateway integration
- ❌ Signature verification (in test mode)

## ✅ What Remains Active:

- ✅ Order creation on backend
- ✅ Price calculation with bundles/discounts
- ✅ Mock payment confirmation
- ✅ MCQ enrollment creation/extension
- ✅ Success modal
- ✅ Dashboard redirect

## 🎯 Extension Logic Examples

### Example 1: Simple Extension
- **Current:** 2026-09-01 (30 days from now)
- **Buy:** 3 months extension
- **New Expiry:** 2026-12-01 (30 + 90 = 120 days from now) ✅

### Example 2: Expired Access
- **Current:** 2026-07-01 (expired 4 days ago)
- **Buy:** 1 month extension
- **New Expiry:** 2026-09-04 (30 days from TODAY) ✅
- *Note: Extensions on expired access start from now, not expired date*

### Example 3: Stacking Extensions
- **Initial:** Buy 1 month → 2026-09-04
- **Extend:** Buy 3 months → 2026-12-04 (added 90 to existing)
- **Extend:** Buy 6 months → 2027-06-04 (added 180 to existing)
- **Total:** 330 days from original purchase ✅

## 🚀 Backend Configuration

**File:** `edu-platform-backend/.env`

```env
# Test payments enabled (allows mock-confirm-mcq)
ALLOW_TEST_PAYMENTS=true

# Razorpay keys present but NOT used in test mode
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔄 Switching to Production Mode Later

When you want to enable real Razorpay:

1. **Uncomment these lines in `mcq/page.tsx`:**
   ```typescript
   import Script from "next/script";
   const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
   ```

2. **Add script loader back:**
   ```tsx
   <Script
     src="https://checkout.razorpay.com/v1/checkout.js"
     strategy="afterInteractive"
   />
   ```

3. **Update handleCheckout to check for Razorpay:**
   ```typescript
   if (RAZORPAY_KEY && (window as any).Razorpay) {
     // Open real Razorpay checkout
   } else {
     // Test mode
   }
   ```

4. **Set in backend `.env`:**
   ```env
   ALLOW_TEST_PAYMENTS=false
   ```

## 📊 Current Status

✅ **Test Mode Active**
- No Razorpay integration
- Instant payment confirmation
- Extension logic fully functional
- Backend logs show calculations
- Dashboard displays correct expiry dates

**Perfect for testing the extension logic without payment gateway overhead!**

## 🎬 Quick Test Flow

```bash
# 1. Start servers (already running)
Backend: http://localhost:8000
Frontend: http://localhost:3000

# 2. Test extension
Open: http://localhost:3000/mcq
Click: "Extend Plan" on any owned subject
Choose: 3 months
Click: "Pay ₹XXX"
Watch: Backend logs for extension calculation
Check: Dashboard for updated expiry

# 3. Verify in database
SELECT * FROM mcq_enrollments WHERE user_id = '...' ORDER BY created_at DESC;
```

That's it! Pure test mode to verify extension logic works correctly. 🚀
