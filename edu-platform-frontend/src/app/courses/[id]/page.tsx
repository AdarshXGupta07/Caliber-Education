"use client";

import { use, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle, Lock, Users, Star, Clock,
  BookOpen, MessageCircle, ChevronDown, ChevronRight, X, Zap, Copy, Check, Bell, Tag
} from "lucide-react";
import { courses as defaultCourses } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [courses, setCourses] = useState(defaultCourses);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("caliber_admin_courses");
    if (saved) setCourses(JSON.parse(saved));
    setMounted(true);
  }, []);

  const course = courses.find((c) => c.id === id);
  const [openModule, setOpenModule] = useState<number | null>(0);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const {
    user,
    isAuthenticated,
    verifications,
    purchasedCourseIds,
    enrollFreeCourse,
    submitUTR
  } = useAuth();

  const [showManualUpi, setShowManualUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrLoading, setUtrLoading] = useState(false);

  // ─── Coupon state ──────────────────────────────────────────────────────
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount_amount: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";
      const res = await fetch(`${apiURL}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode.trim(), course_id: course?.id }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          discount_amount: data.discount_amount,
          message: data.message,
        });
      } else {
        setCouponError(data.message || "Invalid coupon code.");
      }
    } catch {
      setCouponError("Unable to validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const handleUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 10) {
      alert("Please enter a valid 12-digit UTR/Ref Number");
      return;
    }
    setUtrLoading(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";

      const res = await fetch(`${apiURL}/api/payments/verify-utr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course?.id, utrNumber, couponCode: appliedCoupon?.code || null }),
      });

      if (res.ok) {
        submitUTR(course?.id || "", utrNumber);
        alert("Payment under verification. You will automatically get access once verified by admins!");
        router.push("/dashboard");
      } else {
        const errData = await res.json();
        alert(errData.detail || "Failed to submit UTR. Make sure it isn't duplicated.");
      }
    } catch (err) {
      alert("Error contacting the server. Try again.");
    } finally {
      setUtrLoading(false);
    }
  };

  const router = useRouter();

  if (!mounted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-paper/40 dark:bg-ink-navy/40 backdrop-blur-sm z-50">
        <div className="w-10 h-10 border-4 border-line-gray-light dark:border-line-gray-dark border-t-signal-emerald rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) return notFound();

  const isPurchased = purchasedCourseIds.includes(course.id);
  const isComingSoon = course.status === "coming_soon";
  const pendingVerification = user?.email
    ? verifications.find(
      (v) => v.studentEmail.toLowerCase() === user.email.toLowerCase() &&
        v.courseTitle === course.title &&
        v.status === "pending"
    )
    : undefined;
  const isPending = !!pendingVerification;

  const levelColor =
    course.level === "Foundation"
      ? "text-slate-800 bg-line-gray-light dark:bg-line-gray-dark dark:text-paper"
      : course.level === "Final"
        ? "text-alert-coral bg-alert-coral/10"
        : "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400";

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setPurchaseLoading(true);
    try {
      const apiURL = process.env.NEXT_PUBLIC_API_URL || "";
      const token = localStorage.getItem("caliber_jwt") || "";

      const res = await fetch(`${apiURL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course.id, couponCode: appliedCoupon?.code || null }),
      });

      if (!res.ok) {
        throw new Error("Unable to create order. Please try again.");
      }

      const orderData = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_xxxxxxx",
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "CAliber Education",
        description: course.title,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${apiURL}/api/payments/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              enrollFreeCourse(course.id);
              router.push(`/courses/${course.id}/success`);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Signature verification error", err);
            alert("Error verifying payment signature");
          }
        },
        prefill: {
          email: user?.email || "",
        },
        theme: {
          color: "#0F1A2C",
        },
        modal: {
          ondismiss: () => {
            setPurchaseLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.warn("API payments ordering error:", err.message);
      // Fallback for visual mock testing:
      const confirmDemo = window.confirm("Razorpay API not responding. Fall back to demo payment simulation?");
      if (confirmDemo) {
        enrollFreeCourse(course.id);
        router.push(`/courses/${course.id}/success`);
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  return (
    <div className="pt-16 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-8">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> All Courses
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12">

          {/* ─── MAIN CONTENT ─── */}
          <div className="lg:col-span-8 space-y-10">

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${levelColor}`}>{course.level}</span>
                {course.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60">{course.tag}</span>
                )}
              </div>
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink-navy dark:text-paper leading-tight tracking-tight">
                {course.title}
              </h1>
              <p className="text-slate dark:text-paper/70 leading-relaxed text-sm">{course.description}</p>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate dark:text-paper/50 pt-2">
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {course.rating} rating
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {course.enrolledCount.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {course.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {course.curriculum.reduce((acc, m) => acc + m.topics.length, 0)} topics
                </span>
              </div>

              {/* Mentor chips */}
              {course.mentors?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {course.mentors.map((m) => (
                    <div key={m.name} className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0`}>
                        {m.initials}
                      </div>
                      <div className="leading-none">
                        <p className="text-[10px] font-semibold text-ink-navy dark:text-paper">{m.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Outcomes */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 space-y-4">
              <h2 className="font-heading font-bold text-base text-ink-navy dark:text-paper flex items-center gap-2">
                <Zap className="w-4 h-4 text-ink-navy dark:text-paper" /> What you will achieve
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {course.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-signal-emerald flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate dark:text-paper/85">{outcome}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Curriculum */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper mb-4">Course Curriculum</h2>
              <div className="space-y-2">
                {course.curriculum.map((module, mi) => (
                  <div key={mi} className="rounded-lg border border-line-gray-light dark:border-line-gray-dark overflow-hidden bg-white dark:bg-line-gray-dark/20">
                    <button
                      onClick={() => setOpenModule(openModule === mi ? null : mi)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-line-gray-light/40 dark:hover:bg-line-gray-dark/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate dark:text-paper/40">{String(mi + 1).padStart(2, "0")}</span>
                        <span className="font-semibold text-sm text-ink-navy dark:text-paper">{module.module}</span>
                        <span className="text-[10px] text-slate dark:text-paper/40">({module.topics.length} topics)</span>
                      </div>
                      {openModule === mi
                        ? <ChevronDown className="w-4 h-4 text-slate dark:text-paper/50" />
                        : <ChevronRight className="w-4 h-4 text-slate dark:text-paper/50" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {openModule === mi && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                          <div className="px-5 py-4 space-y-2.5 border-t border-line-gray-light dark:border-line-gray-dark bg-paper/30 dark:bg-line-gray-dark/10">
                            {module.topics.map((topic, ti) => (
                              <div key={ti} className="flex items-center gap-2.5 text-xs text-slate dark:text-paper/70">
                                <BookOpen className="w-3.5 h-3.5 flex-shrink-0 text-slate/40" />
                                {topic}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mentor bios */}
            {course.mentors?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="space-y-4">
                <h2 className="font-heading font-bold text-lg text-ink-navy dark:text-paper">
                  Your Mentor
                </h2>
                <div className="space-y-4">
                  {course.mentors.map((m) => (
                    <div key={m.name} className="flex items-start gap-4 p-6 rounded-xl border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-line-gray-light dark:border-line-gray-dark bg-line-gray-light/35 dark:bg-line-gray-dark/30 flex items-center justify-center text-ink-navy dark:text-paper font-heading font-bold text-sm">
                        {m.initials}
                      </div>
                      <div className="space-y-1">
                        <p className="font-heading font-bold text-sm text-ink-navy dark:text-paper">{m.name}</p>
                        <p className="text-[10px] font-bold text-slate dark:text-paper/40 uppercase">{m.specialty}</p>
                        <p className="text-xs text-slate dark:text-paper/60 leading-relaxed pt-1.5">{m.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ─── STICKY SIDEBAR ─── */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/40">Enrollment Fee</span>
                    <div>
                      {course.price === 0 ? (
                        <span className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">Free</span>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            {appliedCoupon ? (
                              <>
                                <span className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">
                                  ₹{(typeof course.price === "number" ? course.price - appliedCoupon.discount_amount : 0).toLocaleString()}
                                </span>
                                <span className="font-heading font-bold text-lg text-slate/40 line-through">
                                  ₹{typeof course.price === "number" ? course.price.toLocaleString() : course.price}
                                </span>
                              </>
                            ) : (
                              <span className="font-heading font-extrabold text-3xl text-ink-navy dark:text-paper">
                                {typeof course.price === "string" ? course.price : `₹${course.price.toLocaleString()}`}
                              </span>
                            )}
                            {typeof course.price === "number" && (
                              <span className="text-xs text-slate dark:text-paper/40 font-medium">one-time</span>
                            )}
                          </div>
                          {appliedCoupon && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-signal-emerald">
                              <Tag className="w-3.5 h-3.5" />
                              You save ₹{appliedCoupon.discount_amount.toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ─── Coupon Code Input ─── */}
                  {typeof course.price === "number" && course.price > 0 && !isComingSoon && !isPurchased && !isPending && (
                    <div className="space-y-2">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-signal-emerald/10 border border-signal-emerald/30 rounded-xl">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-signal-emerald" />
                            <div>
                              <p className="text-xs font-bold text-signal-emerald">{appliedCoupon.code}</p>
                              <p className="text-[10px] text-signal-emerald/70">{appliedCoupon.message}</p>
                            </div>
                          </div>
                          <button onClick={handleRemoveCoupon} className="p-1 rounded-lg text-signal-emerald/60 hover:text-alert-coral hover:bg-alert-coral/10 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="Coupon code"
                              className="flex-1 px-3 py-2 text-xs font-mono uppercase border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/30 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors tracking-wider placeholder:lowercase placeholder:tracking-normal placeholder:font-sans"
                              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                            />
                            <button
                              onClick={handleApplyCoupon}
                              disabled={couponLoading || !couponCode.trim()}
                              className="px-4 py-2 text-xs font-bold border border-ink-navy dark:border-paper text-ink-navy dark:text-paper rounded-lg hover:bg-ink-navy/5 dark:hover:bg-paper/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {couponLoading ? "..." : "Apply"}
                            </button>
                          </div>
                          {couponError && (
                            <p className="text-[10px] font-semibold text-alert-coral mt-1">{couponError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dynamic CTA logic */}
                  {isComingSoon ? (
                    <div className="space-y-3">
                      <div className="w-full py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 font-bold rounded-lg flex items-center justify-center gap-2 text-sm">
                        <Bell className="w-4 h-4" /> Coming Soon
                      </div>
                      <p className="text-[11px] text-slate dark:text-paper/50 text-center leading-relaxed">
                        This course is being prepared. Check back soon — or follow us on WhatsApp for the launch date.
                      </p>
                    </div>
                  ) : isPurchased ? (
                    <Link href={`/courses/${course.id}/success`}
                      className="w-full py-3 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
                      <MessageCircle className="w-4 h-4" /> View WhatsApp Access
                    </Link>
                  ) : isPending ? (
                    <button disabled
                      className="w-full py-3 bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/40 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed">
                      <Clock className="w-4 h-4 animate-pulse" /> Verification Pending
                    </button>
                  ) : course.price === 0 ? (
                    <button onClick={() => { enrollFreeCourse(course.id); router.push(`/courses/${course.id}/success`); }}
                      className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                      <Zap className="w-4 h-4" /> Enrol for Free
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button onClick={handleBuyNow} disabled={purchaseLoading}
                        className="w-full py-3 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        <Lock className="w-4 h-4" /> {purchaseLoading ? "Processing Razorpay..." : "Pay with Razorpay (Cards/Netbanking)"}
                      </button>

                      <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-line-gray-light dark:border-line-gray-dark"></div>
                        <span className="flex-shrink-0 mx-4 text-slate dark:text-paper/50 text-[10px] font-bold uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-line-gray-light dark:border-line-gray-dark"></div>
                      </div>

                      {!showManualUpi ? (
                        <button onClick={() => {
                          if (!isAuthenticated) return router.push("/login");
                          setShowManualUpi(true);
                        }}
                          className="w-full py-3 border border-ink-navy dark:border-paper text-ink-navy dark:text-paper font-bold rounded-lg hover:bg-slate/5 dark:hover:bg-line-gray-dark/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm">
                          <Zap className="w-4 h-4" /> Pay directly via UPI manually
                        </button>
                      ) : (
                        <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="p-4 border border-line-gray-light dark:border-line-gray-dark bg-white dark:bg-line-gray-dark/20 rounded-xl space-y-4" onSubmit={handleUpiSubmit}>
                          <div className="text-center space-y-1">
                            <p className="text-[10px] font-bold text-slate dark:text-paper/60 uppercase tracking-wider">Transfer to this UPI ID:</p>
                            <p className="font-mono text-base font-extrabold text-ink-navy dark:text-paper">caliber@upibank</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-ink-navy dark:text-paper block">Enter UTR / Transaction Reference No.</label>
                            <input
                              type="text"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              placeholder="e.g. 312567489021"
                              required
                              className="w-full bg-line-gray-light/30 dark:bg-line-gray-dark/50 border border-line-gray-light dark:border-line-gray-dark rounded-lg px-4 py-2.5 text-sm text-ink-navy dark:text-paper focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors"
                            />
                            <p className="text-[10px] text-slate dark:text-paper/60 leading-relaxed">
                              Send the exact amount ({typeof course.price === "number" ? `₹${course.price.toLocaleString()}` : course.price}) to our UPI ID via PhonePe/GPay, and paste the 12-digit UTR number here.
                            </p>
                          </div>

                          <button type="submit" disabled={utrLoading} className="w-full py-2.5 bg-signal-emerald hover:bg-emerald-700 text-white font-bold rounded-lg transition-all text-sm disabled:opacity-50">
                            {utrLoading ? "Submitting..." : "Submit UTR for Verification"}
                          </button>

                          <button type="button" onClick={() => setShowManualUpi(false)} className="w-full py-1.5 text-xs font-bold text-slate dark:text-paper/60 hover:text-ink-navy dark:hover:text-paper transition-colors">
                            Cancel
                          </button>
                        </motion.form>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 pt-4 border-t border-line-gray-light dark:border-line-gray-dark">
                    {[
                      { icon: <MessageCircle className="w-4 h-4" />, label: "WhatsApp group access" },
                      { icon: <Clock className="w-4 h-4" />, label: `${course.duration} program` },
                      { icon: <BookOpen className="w-4 h-4" />, label: "Daily practice sets" },
                      { icon: <Users className="w-4 h-4" />, label: "Join a student batch" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate dark:text-paper/60">
                        <span className="text-slate dark:text-paper/40">{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
