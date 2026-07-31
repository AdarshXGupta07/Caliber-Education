"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { courses as defaultCourses, type Course } from "@/lib/mockData";
import {
  ArrowRight, Lock, Users, Star, Clock, Zap,
  Search, ChevronUp, ChevronDown, SlidersHorizontal, X, ArrowUp
} from "lucide-react";

// ─── Level Filter options ────────────
interface FilterOption {
  id: string;
  label: string;
}

const LEVEL_FILTERS: FilterOption[] = [
  { id: "all", label: "All Courses" },
  { id: "level-Final", label: "CA Final" },
  { id: "level-Intermediate", label: "CA Intermediate" },
  { id: "level-Foundation", label: "CA Foundation" },
  { id: "level-All Levels", label: "All Levels" },
  { id: "level-Others", label: "Other Services" },
];

const levelColors: Partial<Record<NonNullable<Course["level"]>, string>> = {
  Foundation: "text-signal-emerald bg-signal-emerald/10",
  Intermediate: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
  Final: "text-alert-coral bg-alert-coral/10",
  "All Levels": "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
};

// ─── Specific Courses Scroll Component ─────────────────────────────────────
function SpecificCoursesScroll({
  activeTab,
  onSelectCourse,
  coursesList
}: {
  activeTab: string;
  onSelectCourse: (id: string) => void;
  coursesList: Course[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showUpBtn, setShowUpBtn] = useState(false);
  const [showDownBtn, setShowDownBtn] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const canScrollUp = el.scrollTop > 5;
    const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight - 5;
    setShowUpBtn(canScrollUp);
    setShowDownBtn(canScrollDown);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();

      const observer = new ResizeObserver(() => checkScroll());
      observer.observe(el);

      // Delay check scroll briefly for initial render layout
      const timer = setTimeout(checkScroll, 100);

      return () => {
        el.removeEventListener("scroll", checkScroll);
        observer.disconnect();
        clearTimeout(timer);
      };
    }
  }, []);

  const handleScroll = (dir: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 140;
    el.scrollBy({
      top: dir === "up" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative border border-line-gray-light dark:border-line-gray-dark rounded-xl bg-paper/50 dark:bg-line-gray-dark/10 p-2">
      {/* Up Button */}
      <AnimatePresence>
        {showUpBtn && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onClick={(e) => handleScroll("up", e)}
            className="absolute top-1.5 left-2 right-2 py-1 bg-white/95 dark:bg-ink-navy/95 text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg border border-line-gray-light dark:border-line-gray-dark flex items-center justify-center transition-all duration-200 z-10 shadow-sm cursor-pointer hover:animate-bounce-subtle"
            title="Scroll Up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="max-h-[180px] overflow-y-auto no-scrollbar scroll-smooth space-y-1 py-1 px-0.5"
        onScroll={checkScroll}
      >
        {coursesList.map((course) => (
          <button
            key={course.id}
            id={`course-item-${course.id}`}
            onClick={() => onSelectCourse(course.id)}
            className={`w-full text-left px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 block truncate ${activeTab === course.id
              ? "bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy shadow-sm font-semibold"
              : "text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper hover:bg-line-gray-light/60 dark:hover:bg-line-gray-dark/40"
              }`}
          >
            {course.title}
          </button>
        ))}
      </div>

      {/* Down Button */}
      <AnimatePresence>
        {showDownBtn && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            onClick={(e) => handleScroll("down", e)}
            className="absolute bottom-1.5 left-2 right-2 py-1 bg-white/95 dark:bg-ink-navy/95 text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper rounded-lg border border-line-gray-light dark:border-line-gray-dark flex items-center justify-center transition-all duration-200 z-10 shadow-sm cursor-pointer hover:animate-bounce-subtle"
            title="Scroll Down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [courses, setCourses] = useState<Course[]>(defaultCourses);

  useEffect(() => {
    const saved = localStorage.getItem("caliber_admin_courses");
    if (saved) {
      setCourses(JSON.parse(saved));
    }
  }, []);

  // Track page scroll to show "Back to Top" button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMobileFiltersOpen(false); // Close drawer on selection (mobile)
    // Scroll selection element into view if needed
    const el = document.getElementById(`course-item-${id}`) || document.getElementById(`level-item-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const clearFilters = () => {
    setActiveTab("all");
    setSearchQuery("");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter courses logic
  const displayed = courses.filter((c) => {
    // 1. Search Query filter (matches title, description, outcomes, level)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchOutcomes = c.outcomes?.some((o) => o.toLowerCase().includes(q)) ?? false;
      const matchLevel = c.level?.toLowerCase().includes(q) ?? false;

      if (!matchTitle && !matchDesc && !matchOutcomes && !matchLevel) {
        return false;
      }
    }

    // 2. Category / tab filter
    if (activeTab === "all") return true;
    if (activeTab.startsWith("level-")) {
      const level = activeTab.replace("level-", "");
      if (level === "Others") {
        return c.level === null;
      }
      return c.level === level;
    }
    return c.id === activeTab;
  });

  return (
    <div className="pt-16 min-h-screen bg-paper dark:bg-ink-navy">
      {/* ─── HEADER ─── */}
      <section className="py-16 bg-white dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <span className="text-xs font-semibold text-slate dark:text-paper/50 uppercase tracking-widest">Courses</span>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-navy dark:text-paper mt-2 leading-tight tracking-tight">
              Find your course
            </h1>
            <p className="mt-3 text-slate dark:text-paper/70 text-base max-w-xl">
              Mentorship, test series, and practice tools for CA Foundation, Intermediate &amp; Final. Pick the course that fits where you are.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10">

        {/* Mobile controls bar */}
        <div className="flex md:hidden items-center gap-3 mb-6">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex-1 flex items-center justify-between px-4 py-3 bg-white dark:bg-line-gray-dark/30 border border-line-gray-light dark:border-line-gray-dark rounded-xl text-xs font-bold text-ink-navy dark:text-paper shadow-sm active:scale-[0.98] transition-all"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate dark:text-paper/50" />
              {activeTab === "all" ? "All Courses" : LEVEL_FILTERS.find(f => f.id === activeTab)?.label || courses.find(c => c.id === activeTab)?.title || "Filtered"}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60">
              {displayed.length}
            </span>
          </button>

          {(activeTab !== "all" || searchQuery !== "") && (
            <button
              onClick={clearFilters}
              className="p-3 bg-white dark:bg-line-gray-dark/30 border border-line-gray-light dark:border-line-gray-dark rounded-xl text-xs font-bold text-alert-coral hover:bg-alert-coral/10 transition-colors"
              title="Clear all filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Responsive layout: Sidebar on left (desktop), collapsible (mobile) */}
        <div className="grid md:grid-cols-12 gap-8 items-start">

          {/* ─── LEFT SIDEBAR (FILTERS) ─── */}
          <aside className={`md:col-span-4 lg:col-span-3 space-y-6 md:sticky md:top-24 max-h-[calc(100vh-120px)] md:overflow-y-auto no-scrollbar md:pr-1 ${mobileFiltersOpen ? "block" : "hidden md:block"
            }`}>
            <div className="bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate dark:text-paper/50 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate dark:text-paper/40" /> Filters
                </span>
                {(activeTab !== "all" || searchQuery !== "") && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] font-bold text-alert-coral hover:underline focus:outline-none flex items-center gap-0.5 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* 1. Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate/50 dark:text-paper/40" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs border border-line-gray-light dark:border-line-gray-dark bg-paper/50 dark:bg-line-gray-dark/40 text-ink-navy dark:text-paper rounded-lg focus:outline-none focus:border-ink-navy dark:focus:border-paper transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate/40 hover:text-ink-navy dark:hover:text-paper"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* 2. Level / Category Section */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/40 block mb-1.5">
                  Course Levels
                </span>
                <div className="flex flex-col gap-1">
                  {LEVEL_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      id={`level-item-${filter.id}`}
                      onClick={() => handleSelectTab(filter.id)}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-between group ${activeTab === filter.id
                        ? "bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy shadow-sm font-semibold"
                        : "text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper hover:bg-line-gray-light/60 dark:hover:bg-line-gray-dark/40"
                        }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${activeTab === filter.id
                        ? "bg-paper/20 dark:bg-ink-navy/20 text-current"
                        : "bg-line-gray-light/50 dark:bg-line-gray-dark/50 text-slate dark:text-paper/50"
                        }`}>
                        {filter.id === "all"
                          ? courses.length
                          : filter.id.startsWith("level-")
                            ? courses.filter(c => filter.id.replace("level-", "") === "Others" ? c.level === null : c.level === filter.id.replace("level-", "")).length
                            : 0
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Browse Specific Courses */}
              <div className="space-y-2.5 pt-2 border-t border-line-gray-light dark:border-line-gray-dark">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate dark:text-paper/40 block">
                  Quick Course Select
                </span>
                <SpecificCoursesScroll
                  activeTab={activeTab}
                  onSelectCourse={handleSelectTab}
                  coursesList={courses}
                />
              </div>
            </div>
          </aside>

          {/* ─── RIGHT SECTION (COURSES GRID) ─── */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-line-gray-light/60 dark:border-line-gray-dark/60">
              <p className="text-xs text-slate dark:text-paper/50 font-medium">
                Showing {displayed.length} {displayed.length === 1 ? "course" : "courses"}
              </p>
              {searchQuery && (
                <p className="text-xs text-slate dark:text-paper/50 italic">
                  Search results for &ldquo;{searchQuery}&rdquo;
                </p>
              )}
            </div>

            {displayed.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {displayed.map((course, i) => (
                    <CourseCard key={course.id} course={course} index={i} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white dark:bg-line-gray-dark/10 border border-line-gray-light dark:border-line-gray-dark rounded-xl p-8 space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-line-gray-light dark:bg-line-gray-dark flex items-center justify-center text-slate mx-auto">
                  <SlidersHorizontal className="w-5 h-5 text-slate dark:text-paper/40" />
                </div>
                <h3 className="font-heading font-bold text-base text-ink-navy dark:text-paper">No courses match your active filters</h3>
                <p className="text-xs text-slate dark:text-paper/60 max-w-sm mx-auto">
                  Try adjusting page search queries or selecting &ldquo;All Courses&rdquo; level in the sidebar filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-3 px-4 py-2 bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy text-xs font-semibold rounded-lg hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  Clear All Filters
                </button>
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* ─── FLOATING BACK TO TOP BUTTON ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 p-3 rounded-full bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy shadow-lg border border-line-gray-light/35 dark:border-line-gray-dark/35 transition-all z-40 cursor-pointer active:scale-95 group"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Course Card ───────────────────────────────────────────────────────────
function CourseCard({ course, index }: { course: Course; index: number }) {
  const isComingSoon = course.status === "coming_soon";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className="h-full"
    >
      <Link href={`/courses/${course.id}`} className="group block h-full">
        <div className="h-full flex flex-col bg-white dark:bg-line-gray-dark/20 border border-line-gray-light dark:border-line-gray-dark rounded-xl overflow-hidden hover:border-ink-navy dark:hover:border-paper transition-all duration-200 shadow-sm hover:shadow-md">
          <div className="p-5 flex flex-col flex-1 gap-4">

            {/* Top row: level badge + status/tag */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {course.level && (
                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${levelColors[course.level] ?? "bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60"}`}>
                  {course.level}
                </span>
              )}
              <div className="flex items-center gap-1.5 ml-auto">
                {isComingSoon && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    Coming Soon
                  </span>
                )}
                {!isComingSoon && course.tag && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-line-gray-light dark:bg-line-gray-dark text-slate dark:text-paper/60">
                    {course.tag}
                  </span>
                )}
              </div>
            </div>

            {/* Title & desc */}
            <div className="flex-1">
              <h3 className={`font-heading font-bold text-base text-ink-navy dark:text-paper leading-snug transition-colors ${isComingSoon ? "" : "group-hover:text-ink-navy/80 dark:group-hover:text-paper/80"}`}>
                {course.title}
              </h3>
              <p className="mt-2 text-xs text-slate dark:text-paper/60 leading-relaxed line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Mentor chips */}
            {course.mentors?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {course.mentors.map((m) => (
                  <div key={m.name} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-line-gray-light/60 dark:bg-line-gray-dark/40 border border-line-gray-light/30">
                    <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0`}>
                      {m.initials}
                    </div>
                    <span className="text-[10px] text-slate dark:text-paper/60 font-medium">{m.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-slate dark:text-paper/50">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {course.enrolledCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {course.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration}
              </span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-line-gray-light dark:border-line-gray-dark">
              <div>
                {course.price === 0 ? (
                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper font-semibold">Free</span>
                ) : (
                  <span className="font-heading font-bold text-sm text-ink-navy dark:text-paper font-semibold">
                    ₹{typeof course.price === "number" ? course.price.toLocaleString() : course.price}
                  </span>
                )}
              </div>

              {isComingSoon ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <Zap className="w-3 h-3" />
                  Notify me
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-semibold text-ink-navy dark:text-paper group-hover:gap-1.5 transition-all">
                  {typeof course.price === "number" && course.price > 0 && <Lock className="w-3 h-3 text-slate dark:text-paper/40" />}
                  View details
                  <ArrowRight className="w-3.5 h-3.5 text-slate dark:text-paper/50 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
