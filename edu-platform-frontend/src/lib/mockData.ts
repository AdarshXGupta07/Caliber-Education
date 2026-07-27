// ─── MENTOR ───────────────────────────────────────────────────────────────
export interface Mentor {
  name: string;
  specialty: string;
  initials: string;
  color: string;
  bio: string;
}

// ─── COURSES / PROGRAMS ────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number | string; // number for fixed price, string for variable like "₹500/session"
  level: "Foundation" | "Intermediate" | "Final" | "All Levels" | null;
  duration: string;
  outcomes: string[];
  curriculum: { module: string; topics: string[] }[];
  enrolledCount: number;
  rating: number;
  tag?: string;
  mentors: Mentor[];
  // Delivery type — determines what happens after purchase
  deliveryType: "whatsapp" | "mcq-series";
  whatsappLink?: string;      // For WhatsApp delivery
  linkedSeriesId?: string;    // For MCQ Series delivery
  // Availability — "coming_soon" hides the buy action; product is visible but not purchasable
  status: "available" | "coming_soon";
}

export const courses: Course[] = [
  {
    id: "ca-final-mentorship",
    title: "CA Final Mentorship",
    description: "Comprehensive mentorship program for CA Final students covering all papers with personalized guidance, doubt resolution, and strategic study planning.",
    price: 15000,
    level: "Final",
    duration: "6 months",
    tag: "Premium",
    enrolledCount: 450,
    rating: 4.9,
    mentors: [{ name: "Somya Deep", specialty: "CA Final Mentor", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "Chartered Accountant specializing in CA Final mentorship with proven track record." }],
    outcomes: ["Complete coverage of all CA Final papers", "Weekly doubt resolution sessions", "Personalized study plan", "Mock test series with detailed feedback"],
    curriculum: [
      { module: "Financial Reporting", topics: ["Ind AS", "Consolidated Financial Statements", "Cash Flow Statements"] },
      { module: "Strategic Management", topics: ["Strategic Analysis", "Strategic Planning", "Implementation & Control"] },
      { module: "Advanced Auditing", topics: ["Audit Planning", "Risk Assessment", "Quality Control"] },
    ],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-FINAL-MENTORSHIP-2026",
    status: "available",
  },
  {
    id: "ca-final-rankers-program",
    title: "CA Final Ranker's Program",
    description: "Elite training program designed for students targeting top ranks in CA Final exams, with intensive practice and advanced problem-solving techniques.",
    price: 25000,
    level: "Final",
    duration: "4 months",
    tag: "Top Rated",
    enrolledCount: 180,
    rating: 5.0,
    mentors: [
      { name: "Somya Deep", specialty: "CA Final Expert", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "Specialized in training rank holders." },
      { name: "Aditya Kanal", specialty: "CA Final Expert", initials: "AK", color: "from-blue-500 to-blue-700", bio: "Expert in advanced problem solving." },
    ],
    outcomes: ["Target AIR 100", "Advanced problem-solving techniques", "150+ mock tests", "Personal mentor support"],
    curriculum: [
      { module: "Advanced Concepts", topics: ["Complex Ind AS", "Consolidated Financials", "Advanced Costing"] },
      { module: "Exam Strategy", topics: ["Time Management", "Answer Writing", "High-Scoring Techniques"] },
    ],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-FINAL-RANKERS-2026",
    status: "coming_soon",
  },
  {
    id: "ca-inter-mentorship",
    title: "CA Inter Mentorship",
    description: "Complete mentorship for CA Intermediate covering both groups with structured learning, regular tests, and continuous guidance.",
    price: 12000,
    level: "Intermediate",
    duration: "6 months",
    tag: "Popular",
    enrolledCount: 820,
    rating: 4.8,
    mentors: [{ name: "Aditya Kanal", specialty: "CA Inter Mentor", initials: "AK", color: "from-blue-500 to-blue-700", bio: "Expert in CA Intermediate mentorship." }],
    outcomes: ["Both Group coverage", "Weekly live doubt sessions", "Chapter-wise tests", "Personalized feedback"],
    curriculum: [
      { module: "Accounts & Audit", topics: ["Accounting Standards", "Auditing Standards", "Company Accounts"] },
      { module: "Law & Tax", topics: ["Corporate Law", "Income Tax", "GST"] },
      { module: "Costing & FM", topics: ["Cost Accounting", "Financial Management", "Strategic Management"] },
    ],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-INTER-MENTORSHIP-2026",
    status: "available",
  },
  {
    id: "ca-inter-rankers-program",
    title: "CA Inter Ranker's Program",
    description: "Intensive program for CA Inter students targeting exemptions and top ranks with advanced practice and expert guidance.",
    price: 18000,
    level: "Intermediate",
    duration: "5 months",
    tag: "Premium",
    enrolledCount: 350,
    rating: 4.9,
    mentors: [
      { name: "Somya Deep", specialty: "CA Inter Expert", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "Specialized in ranker training." },
      { name: "Aditya Kanal", specialty: "CA Inter Expert", initials: "AK", color: "from-blue-500 to-blue-700", bio: "Expert in exam strategy." },
    ],
    outcomes: ["Target exemptions in all subjects", "100+ mock tests", "Advanced problem sets", "Weekly strategy sessions"],
    curriculum: [
      { module: "Core Subjects", topics: ["Accounts", "Audit", "Law", "Costing", "Tax"] },
      { module: "Advanced Practice", topics: ["Previous Year Analysis", "Difficult Problems", "Exam Techniques"] },
    ],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-INTER-RANKERS-2026",
    status: "coming_soon",
  },
  {
    id: "test-series-all-levels",
    title: "Test Series — All Levels",
    description: "Comprehensive MCQ test series for CA Foundation, Intermediate, and Final covering all subjects with instant results and detailed analysis.",
    price: 2999,
    level: "All Levels",
    duration: "Full exam cycle",
    tag: "Bestseller",
    enrolledCount: 2400,
    rating: 4.8,
    mentors: [
      { name: "Somya Deep", specialty: "Test Series Creator", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "Expert in MCQ design." },
      { name: "Aditya Kanal", specialty: "Test Series Creator", initials: "AK", color: "from-blue-500 to-blue-700", bio: "Specialist in exam patterns." },
    ],
    outcomes: ["200+ MCQ sets across all levels", "Instant scoring and analysis", "Topic-wise performance tracking", "Compare with toppers"],
    curriculum: [
      { module: "Foundation Tests", topics: ["Accounting", "Law", "Maths", "Economics"] },
      { module: "Intermediate Tests", topics: ["Accounts", "Audit", "Tax", "Costing", "Law"] },
      { module: "Final Tests", topics: ["FR", "SFM", "Audit", "Law", "SCMPE"] },
    ],
    deliveryType: "mcq-series",
    linkedSeriesId: "all-levels-comprehensive", // Links to MCQ Series
    status: "available",
  },
  {
    id: "rti-copy-analysis",
    title: "RTI Copy Analysis",
    description: "Get your CA exam answer sheets analyzed through RTI with detailed feedback on presentation, content, and scoring strategy.",
    price: 1500,
    level: null,
    duration: "Per attempt",
    tag: undefined,
    enrolledCount: 95,
    rating: 4.7,
    mentors: [{ name: "Aditya Kanal", specialty: "Copy Analyzer", initials: "AK", color: "from-blue-500 to-blue-700", bio: "Expert in answer writing analysis." }],
    outcomes: ["RTI copy procurement", "Detailed marking analysis", "Improvement suggestions", "Answer writing tips"],
    curriculum: [{ module: "Analysis Report", topics: ["Presentation Review", "Content Assessment", "Scoring Insights"] }],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-RTI-ANALYSIS-2026",
    status: "available",
  },
  {
    id: "one-on-one-session",
    title: "1:1 Session",
    description: "Personalized one-on-one mentoring sessions for doubt clearing, exam strategy, or specific topic guidance. Charged per session.",
    price: "₹800/session",
    level: null,
    duration: "1 hour per session",
    tag: undefined,
    enrolledCount: 340,
    rating: 4.9,
    mentors: [
      { name: "Somya Deep", specialty: "Personal Mentor", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "Available for 1:1 sessions." },
      { name: "Aditya Kanal", specialty: "Personal Mentor", initials: "AK", color: "from-blue-500 to-blue-700", bio: "Available for 1:1 sessions." },
    ],
    outcomes: ["Personalized attention", "Custom doubt resolution", "Flexible scheduling", "Topic-specific guidance"],
    curriculum: [{ module: "Flexible Topics", topics: ["Student Choice", "Any CA Subject", "Exam Strategy"] }],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-1ON1-BOOKING-2026",
    status: "available",
  },
  {
    id: "ca-foundation-mentorship",
    title: "CA Foundation Mentorship",
    description: "Complete Foundation mentorship covering all four papers with structured learning and regular assessments.",
    price: 8000,
    level: "Foundation",
    duration: "4 months",
    tag: "Popular",
    enrolledCount: 1100,
    rating: 4.7,
    mentors: [{ name: "Somya Deep", specialty: "Foundation Mentor", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "Foundation exam specialist." }],
    outcomes: ["All 4 papers covered", "Weekly tests", "Doubt resolution", "Study plan"],
    curriculum: [
      { module: "Core Subjects", topics: ["Accounting", "Law", "Maths", "Economics"] },
      { module: "Practice", topics: ["MCQs", "Numericals", "Theory"] },
    ],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-FOUNDATION-MENTORSHIP-2026",
    status: "available",
  },
  {
    id: "quiz-mcq-practice",
    title: "Quiz",
    description: "Subject-wise MCQ practice platform with instant feedback, explanations, and performance analytics for all CA levels.",
    price: 999,
    level: "All Levels",
    duration: "1 year access",
    tag: "Free Trial",
    enrolledCount: 3200,
    rating: 4.6,
    mentors: [
      { name: "Somya Deep", specialty: "Quiz Creator", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "MCQ expert." },
      { name: "Aditya Kanal", specialty: "Quiz Creator", initials: "AK", color: "from-blue-500 to-blue-700", bio: "Question bank designer." },
    ],
    outcomes: ["1000+ practice questions", "Instant feedback", "Topic-wise quizzes", "Performance dashboard"],
    curriculum: [
      { module: "Subject Banks", topics: ["Accounting", "Law", "Audit", "Tax", "Costing"] },
      { module: "Mock Quizzes", topics: ["Timed Tests", "Chapter Tests", "Full Mocks"] },
    ],
    deliveryType: "mcq-series",
    linkedSeriesId: "quiz-practice-all", // Links to MCQ Series
    status: "available",
  },
  {
    id: "ibs-mentorship",
    title: "IBS Mentorship",
    description: "Specialized mentorship for Integrated Business Solutions (IBS) covering strategic thinking and implementation.",
    price: 10000,
    level: "Final",
    duration: "3 months",
    tag: undefined,
    enrolledCount: 75,
    rating: 4.8,
    mentors: [{ name: "Aditya Kanal", specialty: "IBS Specialist", initials: "AK", color: "from-blue-500 to-blue-700", bio: "IBS expert and mentor." }],
    outcomes: ["Complete IBS coverage", "Case study practice", "Strategic analysis", "Implementation techniques"],
    curriculum: [
      { module: "IBS Concepts", topics: ["Business Strategy", "Integration", "Solutions Design"] },
      { module: "Case Studies", topics: ["Analysis Framework", "Solution Development", "Presentation"] },
    ],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-IBS-MENTORSHIP-2026",
    status: "coming_soon",
  },
  {
    id: "afm-difficult-questions",
    title: "AFM Difficult Questions",
    description: "Advanced Financial Management difficult question bank with detailed solutions for CA Final students targeting high scores.",
    price: 1499,
    level: "Final",
    duration: "Lifetime access",
    tag: undefined,
    enrolledCount: 420,
    rating: 4.9,
    mentors: [{ name: "Somya Deep", specialty: "AFM Expert", initials: "SD", color: "from-signal-emerald to-emerald-700", bio: "AFM specialist." }],
    outcomes: ["100+ difficult problems", "Step-by-step solutions", "Concept clarity", "Exam-focused"],
    curriculum: [
      { module: "Advanced Topics", topics: ["Derivatives", "Risk Management", "Portfolio Management"] },
      { module: "Complex Problems", topics: ["Multi-concept Questions", "Calculation Intensive", "Theory Heavy"] },
    ],
    deliveryType: "whatsapp",
    whatsappLink: "https://chat.whatsapp.com/invite/CA-AFM-DIFFICULT-2026",
    status: "available",
  },
];


// ═══════════════════════════════════════════════════════════════════════════
// MCQ HIERARCHY  Series → Paper → Section → Question
// ═══════════════════════════════════════════════════════════════════════════

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

/** A named group of questions within a Set (e.g. "Section A — Depreciation"). */
export interface SetSection {
  id: string;
  title: string;       // e.g. "Section A — Depreciation"
  questions: Question[];
}

/**
 * A single test Set inside a Series.
 * topperStats is MOCK/SEED DATA ONLY — not aggregated from real student attempts.
 * Replace with backend aggregation before going to production.
 */
export interface MCQSet {
  id: string;
  seriesId: string;
  title: string;
  isLocked: boolean;
  price: number;
  sections: SetSection[];
  /**
   * ⚠ MOCK DATA — seed fixture only.
   * perQuestionTimes is indexed across all questions in section order (section 0 first, then section 1, etc.).
   * Replace with real backend aggregation before production.
   */
  topperStats: {
    score: number;
    totalTimeSeconds: number;
    perQuestionTimes: number[];
  };
  // Display helpers — derived from sections
  description: string;
  subject: string;
}

/** @deprecated Alias for MCQSet — kept for any legacy references. Use MCQSet instead. */
export type Paper = MCQSet;

/** A Series groups multiple Sets under one subject umbrella. */
export interface MCQSeries {
  id: string;
  title: string;
  subject: string;
  description: string;
  price: number;       // Series-level price (what a student pays to unlock the series)
  isLocked: boolean;   // false = free to browse/attempt; true = requires purchase
}

// ─── Seed questions ────────────────────────────────────────────────────────

const accountingQs: Question[] = [
  { id: 1, text: "Which accounting concept assumes the business will continue to operate for the foreseeable future?", options: ["Accrual Concept", "Going Concern Concept", "Consistency Concept", "Materiality Concept"], correctOptionIndex: 1, explanation: "The Going Concern Concept assumes the entity will continue operations indefinitely, so assets are recorded at cost rather than liquidation value." },
  { id: 2, text: "Under double-entry bookkeeping, every transaction affects at least:", options: ["One account", "Two accounts", "Three accounts", "Four accounts"], correctOptionIndex: 1, explanation: "The fundamental rule of double-entry: every transaction has equal debit and credit entries in at least two accounts." },
  { id: 3, text: "The accounting equation is:", options: ["Assets = Liabilities + Capital", "Assets + Liabilities = Capital", "Capital = Assets + Liabilities", "Liabilities = Capital + Assets"], correctOptionIndex: 0, explanation: "Assets = Liabilities + Capital (Equity). This equation must always balance." },
  { id: 4, text: "Which of the following is a real account?", options: ["Salary Account", "Debtor's Account", "Building Account", "Capital Account"], correctOptionIndex: 2, explanation: "Real accounts relate to tangible assets (Buildings, Machinery). Personal accounts relate to persons; nominal accounts to incomes and expenses." },
  { id: 5, text: "Goods returned by a customer should be debited to:", options: ["Sales Account", "Purchases Return Account", "Sales Return Account", "Customer Account"], correctOptionIndex: 2, explanation: "Sales Returns (Returns Inward) account is debited when goods are returned by customers, reducing net sales." },
  { id: 6, text: "Closing stock appears in:", options: ["Trial Balance only", "Trading Account and Balance Sheet", "P&L Account only", "Cash Flow Statement"], correctOptionIndex: 1, explanation: "Closing stock appears as a credit in the Trading Account (reducing COGS) and as a current asset on the Balance Sheet." },
  { id: 7, text: "Which convention requires that anticipated losses should be recorded but anticipated profits should not?", options: ["Consistency", "Conservatism", "Materiality", "Full Disclosure"], correctOptionIndex: 1, explanation: "The Conservatism (Prudence) convention: recognise losses when probable, but only recognise profits when realised." },
  { id: 8, text: "The balance of the Profit & Loss Account is transferred to:", options: ["Trading Account", "Capital Account", "Bank Account", "Reserves Account"], correctOptionIndex: 1, explanation: "Net profit/loss is transferred to the Capital Account (in a sole proprietorship/partnership) or Retained Earnings." },
  { id: 9, text: "Prepaid expenses are classified as:", options: ["Current Liabilities", "Non-current Assets", "Current Assets", "Revenue"], correctOptionIndex: 2, explanation: "Prepaid expenses represent a future economic benefit (expense paid in advance) and are shown as current assets on the balance sheet." },
  { id: 10, text: "Outstanding salaries are shown in the Balance Sheet as:", options: ["Asset", "Current Liability", "Non-current Liability", "Contingent Liability"], correctOptionIndex: 1, explanation: "Outstanding (accrued) expenses are obligations due but not yet paid — recorded as current liabilities." },
];

const accountingQsB: Question[] = [
  { id: 11, text: "Which account is used to record small cash payments?", options: ["Cash Book", "Petty Cash Book", "Journal", "Ledger"], correctOptionIndex: 1, explanation: "A Petty Cash Book records small, frequent cash payments (stationery, postage, etc.) under the imprest system." },
  { id: 12, text: "Goodwill is an example of:", options: ["Tangible fixed asset", "Fictitious asset", "Intangible fixed asset", "Wasting asset"], correctOptionIndex: 2, explanation: "Goodwill is an intangible fixed asset representing the firm's reputation, customer relationships, and earning potential above normal profits." },
  { id: 13, text: "Depreciation charged under the Straight-Line Method is:", options: ["Variable each year", "Constant each year", "Reducing each year", "Increasing each year"], correctOptionIndex: 1, explanation: "Under SLM, depreciation = (Cost − Residual Value) / Useful Life. This amount is constant every year." },
  { id: 14, text: "Capital expenditure is recorded in:", options: ["P&L Account", "Balance Sheet", "Manufacturing Account", "Trading Account"], correctOptionIndex: 1, explanation: "Capital expenditure adds future economic benefit and is capitalised on the Balance Sheet as a non-current asset, not expensed." },
  { id: 15, text: "The excess of current assets over current liabilities is called:", options: ["Net Worth", "Working Capital", "Liquid Ratio", "Capital Employed"], correctOptionIndex: 1, explanation: "Working Capital = Current Assets − Current Liabilities. It measures a firm's short-term liquidity." },
  { id: 16, text: "In a partnership, interest on drawings is:", options: ["Income of the firm", "Expense of the firm", "Capital contribution", "Liability of the firm"], correctOptionIndex: 0, explanation: "Interest on drawings is charged to the partner and treated as income of the firm, credited to the Profit & Loss Appropriation Account." },
  { id: 17, text: "A Bank Reconciliation Statement is prepared to reconcile:", options: ["Cash book and passbook balances", "Trial balance totals", "P&L and Balance Sheet", "Capital and drawings"], correctOptionIndex: 0, explanation: "BRS explains the difference between the firm's cash book balance and the bank passbook balance due to timing differences." },
  { id: 18, text: "When a bill is dishonoured, the party who drew the bill debits:", options: ["Bills Payable Account", "Bills Receivable Account", "Bank Account", "Drawee Account"], correctOptionIndex: 3, explanation: "On dishonour, the drawer reverses the original entry by debiting the Drawee's (acceptor's) personal account and crediting Bills Receivable." },
  { id: 19, text: "The capital of a company is divided into small units called:", options: ["Bonds", "Debentures", "Shares", "Fixed deposits"], correctOptionIndex: 2, explanation: "A company's share capital is divided into shares, each representing a unit of ownership in the company." },
  { id: 20, text: "Debenture holders are:", options: ["Owners of the company", "Creditors of the company", "Preference shareholders", "Equity shareholders"], correctOptionIndex: 1, explanation: "Debenture holders are creditors who have lent money to the company. They earn fixed interest and have priority over shareholders in liquidation." },
];

const accountingQsC: Question[] = [
  { id: 21, text: "Which of the following is NOT a current asset?", options: ["Debtors", "Inventories", "Goodwill", "Cash & Cash Equivalents"], correctOptionIndex: 2, explanation: "Goodwill is a non-current intangible asset. Current assets are expected to be converted to cash within 12 months." },
  { id: 22, text: "The process of recording a transaction first in the Journal is called:", options: ["Posting", "Journalising", "Balancing", "Casting"], correctOptionIndex: 1, explanation: "Journalising is the primary entry of transactions in the Journal (book of original entry) before posting to the ledger." },
  { id: 23, text: "Which financial statement shows the financial position at a point in time?", options: ["Income Statement", "Cash Flow Statement", "Balance Sheet", "Trial Balance"], correctOptionIndex: 2, explanation: "The Balance Sheet (Statement of Financial Position) shows assets, liabilities, and equity at a specific date." },
  { id: 24, text: "Accumulated depreciation is shown in the Balance Sheet as:", options: ["Addition to the asset", "Deduction from the asset", "Current liability", "Revenue reserve"], correctOptionIndex: 1, explanation: "Accumulated depreciation is a contra-asset account, shown as a deduction from the gross carrying amount of the related fixed asset." },
  { id: 25, text: "The matching concept requires that:", options: ["All cash receipts are income", "Expenses are matched with the revenues they help generate in the same period", "Assets equal liabilities", "All transactions are recorded at cost"], correctOptionIndex: 1, explanation: "The matching (accruals) concept: expenses should be recognised in the same period as the revenues they helped produce." },
  { id: 26, text: "A subsidiary book that records only credit purchases is:", options: ["Cash Book", "Sales Book", "Purchases Book", "Journal Proper"], correctOptionIndex: 2, explanation: "The Purchases Book (Day Book) records only credit purchases of goods. Cash purchases are recorded in the Cash Book." },
  { id: 27, text: "Forfeiture of shares increases:", options: ["Share Capital", "Forfeited Shares Account (Capital Reserve on reissue)", "General Reserve", "Debenture Redemption Reserve"], correctOptionIndex: 1, explanation: "On forfeiture, called-up amounts already paid are transferred to Forfeited Shares Account. On reissue, any surplus goes to Capital Reserve." },
  { id: 28, text: "Which ratio measures the ability to pay short-term obligations from liquid assets?", options: ["Current Ratio", "Quick Ratio", "Debt-Equity Ratio", "Gross Profit Ratio"], correctOptionIndex: 1, explanation: "Quick Ratio (Acid-Test) = (Current Assets − Inventories − Prepayments) / Current Liabilities. It excludes less liquid assets." },
  { id: 29, text: "Revaluation Account in partnership is opened when:", options: ["A new partner is admitted", "Goodwill is written off", "A partner retires", "Both A and C"], correctOptionIndex: 3, explanation: "Revaluation Account is prepared on admission or retirement of a partner to record changes in asset/liability values so all partners share gains/losses equitably." },
  { id: 30, text: "Which of the following best describes 'accrued income'?", options: ["Income received in advance", "Income earned but not yet received", "Income paid to employees", "Income from capital gains"], correctOptionIndex: 1, explanation: "Accrued income is income earned in the current period but not yet received in cash. It is shown as a current asset on the Balance Sheet." },
];

const lawQs: Question[] = [
  { id: 1, text: "An offer becomes a promise when it is:", options: ["Made in writing", "Accepted by the offeree", "Communicated to the public", "Signed by both parties"], correctOptionIndex: 1, explanation: "When the offeree unconditionally accepts the offer, it becomes a promise — forming the basis of a contract under the Indian Contract Act 1872." },
  { id: 2, text: "Consideration in a contract must be:", options: ["Adequate", "Lawful", "Past", "Future"], correctOptionIndex: 1, explanation: "Consideration need not be adequate, but it must be lawful. Past consideration is valid in India (unlike English law)." },
  { id: 3, text: "A contract with a minor is:", options: ["Voidable", "Void ab initio", "Valid", "Unenforceable"], correctOptionIndex: 1, explanation: "Under the Indian Contract Act, a minor lacks capacity to contract. A contract with a minor is void ab initio (void from the start)." },
  { id: 4, text: "Which of the following is NOT an essential element of a valid contract?", options: ["Free consent", "Lawful consideration", "Registration", "Competency of parties"], correctOptionIndex: 2, explanation: "Registration is not essential for all contracts. The essentials are offer, acceptance, consideration, capacity, free consent, and lawful object." },
  { id: 5, text: "Coercion as defined in the Indian Contract Act means:", options: ["Undue influence", "Committing or threatening to commit an offence", "Misrepresentation", "Fraud"], correctOptionIndex: 1, explanation: "Section 15: Coercion means committing or threatening to commit any act forbidden by IPC, or unlawfully detaining property, to obtain consent." },
  { id: 6, text: "A contract made under undue influence is:", options: ["Void", "Voidable at the option of the influenced party", "Valid", "Illegal"], correctOptionIndex: 1, explanation: "A contract caused by undue influence is voidable at the option of the party whose consent was unduly influenced (Section 19A)." },
  { id: 7, text: "Acceptance of an offer must be:", options: ["Conditional", "Absolute and unqualified", "In writing only", "Communicated only to the offeror's agent"], correctOptionIndex: 1, explanation: "Section 7: Acceptance must be absolute and unqualified. A conditional acceptance is treated as a counter-offer." },
  { id: 8, text: "Which of the following contracts is valid even without consideration?", options: ["Contract with a minor", "Contract of agency", "Agreement to pay a time-barred debt in writing", "Agreement to do an impossible act"], correctOptionIndex: 2, explanation: "Section 25(3): A written and signed promise to pay a time-barred debt is enforceable without fresh consideration." },
  { id: 9, text: "In a contract of sale, when does property in specific goods pass to the buyer?", options: ["On delivery of goods", "When the contract is made, if goods are in deliverable state", "On payment of price", "On registration of sale"], correctOptionIndex: 1, explanation: "Section 20, Sale of Goods Act 1930: In an unconditional contract for specific goods in a deliverable state, property passes when the contract is made." },
  { id: 10, text: "Doctrine of Caveat Emptor means:", options: ["Seller beware", "Buyer beware", "Government beware", "Agent beware"], correctOptionIndex: 1, explanation: "Caveat Emptor ('buyer beware') — the buyer must examine goods before purchase. The seller is not liable for defects if the buyer could have discovered them." },
];

const lawQsB: Question[] = [
  { id: 11, text: "An unpaid seller's right of lien means:", options: ["Right to stop goods in transit", "Right to resell the goods", "Right to retain possession until price is paid", "Right to sue for damages"], correctOptionIndex: 2, explanation: "Lien is the right of the unpaid seller to retain possession of goods until the price is paid." },
  { id: 12, text: "A partnership is dissolved compulsorily by:", options: ["Death of a partner", "Insolvency of all partners", "Notice by a partner", "Agreement of partners"], correctOptionIndex: 1, explanation: "Section 41, Partnership Act: Compulsory dissolution occurs when all (or all but one) partners are adjudicated insolvent, or business becomes unlawful." },
  { id: 13, text: "Ostensible (apparent) authority of a partner means:", options: ["Authority given in the partnership deed", "Authority that third parties reasonably assume a partner has", "Authority to act in emergencies", "Authority delegated by all partners"], correctOptionIndex: 1, explanation: "Section 19: Ostensible authority is the implied authority a partner appears to have in the normal course of the firm's business." },
  { id: 14, text: "A contract becomes void if it becomes impossible to perform after its formation. This is called:", options: ["Rescission", "Frustration (Supervening Impossibility)", "Novation", "Accord and Satisfaction"], correctOptionIndex: 1, explanation: "Section 56: Frustration (Doctrine of Supervening Impossibility) renders a contract void when performance becomes impossible due to unforeseen events." },
  { id: 15, text: "Which of the following is an example of a voidable contract?", options: ["Agreement to do an illegal act", "Contract obtained by coercion", "Agreement by a minor", "Wagering agreement"], correctOptionIndex: 1, explanation: "A contract obtained by coercion, fraud, undue influence, or misrepresentation is voidable at the option of the aggrieved party." },
  { id: 16, text: "Consideration moving from a third party is valid in India:", options: ["Never", "Only if it is monetary", "Yes, under Indian Contract Act", "Only with court approval"], correctOptionIndex: 2, explanation: "In India (unlike English law), consideration can move from a third party. The Indian Contract Act does not require consideration to come from the promisee." },
  { id: 17, text: "The Sale of Goods Act, 1930 applies to:", options: ["All goods including immovable property", "Movable goods only (excluding money)", "Services and goods", "Immovable property only"], correctOptionIndex: 1, explanation: "The Sale of Goods Act applies to movable goods (excludes actionable claims and money). Immovable property is governed by the Transfer of Property Act." },
  { id: 18, text: "A condition in a contract of sale is:", options: ["Incidental to the main purpose", "Collateral to the main purpose", "Stipulation essential to the main purpose", "An implied term only"], correctOptionIndex: 2, explanation: "Section 12: A condition is a stipulation essential to the main purpose of the contract. Its breach gives the right to repudiate the contract." },
  { id: 19, text: "Which of the following best describes 'void agreement'?", options: ["Agreement that can be set aside by one party", "Agreement without legal enforceability from the beginning", "Agreement pending court approval", "Agreement between parties of unequal bargaining power"], correctOptionIndex: 1, explanation: "A void agreement (e.g., agreement with a minor, wagering agreement) has no legal effect from the outset. It cannot be enforced by either party." },
  { id: 20, text: "Maximum number of partners in a banking firm is:", options: ["10", "20", "50", "100"], correctOptionIndex: 0, explanation: "Section 464, Companies Act 2013 & Rule 10: Maximum partners in a banking partnership = 10; in any other partnership = 100." },
];

const lawQsC: Question[] = [
  { id: 21, text: "Novation means:", options: ["Extension of contract period", "Substitution of a new contract for the original one", "Part performance of contract", "Partial waiver of claims"], correctOptionIndex: 1, explanation: "Novation (Section 62) replaces the original contract with a new one — either with new parties or new terms — discharging the original obligations." },
  { id: 22, text: "Breach of warranty entitles the aggrieved party to:", options: ["Reject the goods and claim damages", "Claim damages only", "Rescind the contract", "Both reject goods and rescind contract"], correctOptionIndex: 1, explanation: "Breach of warranty (a lesser stipulation) only entitles the buyer to claim damages, not to reject the goods or repudiate the contract." },
  { id: 23, text: "An agency by ratification requires:", options: ["Prior authority from principal", "The act was done on behalf of principal", "Written ratification only", "Consideration from the agent"], correctOptionIndex: 1, explanation: "Ratification: the principal retrospectively adopts an unauthorised act done on his behalf. The act must have been done in his name at the time." },
  { id: 24, text: "A wagering agreement is:", options: ["Void", "Voidable", "Valid but unenforceable", "Legal in some states"], correctOptionIndex: 0, explanation: "Section 30: Wagering (betting) agreements are void and cannot be enforced. Transactions contingent on collateral matters may be valid." },
  { id: 25, text: "The Indian Partnership Act was enacted in:", options: ["1872", "1930", "1932", "1956"], correctOptionIndex: 2, explanation: "The Indian Partnership Act 1932 governs the formation, operation, and dissolution of partnership firms in India." },
  { id: 26, text: "Transfer of property in goods from seller to buyer is called:", options: ["Delivery", "Sale", "Agreement to sell", "Bailment"], correctOptionIndex: 1, explanation: "Section 4, Sale of Goods Act: A sale involves the immediate transfer of property in goods. If transfer is future/conditional, it is an agreement to sell." },
  { id: 27, text: "A partner's implied authority does NOT include:", options: ["Buying goods for the firm", "Selling firm's goods", "Submitting a dispute to arbitration", "Opening a bank account"], correctOptionIndex: 2, explanation: "Section 19(2)(e): Submitting a dispute to arbitration requires express authority. Implied authority covers ordinary business acts only." },
  { id: 28, text: "Free consent means consent free from:", options: ["Consideration", "Coercion, undue influence, fraud, misrepresentation, and mistake", "Registration requirements", "Witness requirements"], correctOptionIndex: 1, explanation: "Section 14: Consent is free when not caused by coercion, undue influence, fraud, misrepresentation, or mistake." },
  { id: 29, text: "Which of the following discharges a contract by agreement?", options: ["Breach by one party", "Impossibility of performance", "Novation", "Government intervention"], correctOptionIndex: 2, explanation: "Novation (Section 62) is a mode of discharge by agreement — the original contract is replaced with a new one, releasing all parties." },
  { id: 30, text: "The right of stoppage in transit belongs to:", options: ["The buyer", "The unpaid seller when the buyer is insolvent", "Any creditor of the buyer", "The carrier"], correctOptionIndex: 1, explanation: "Section 50, Sale of Goods Act: An unpaid seller can stop goods in transit and resume possession when the buyer becomes insolvent." },
];

const costingQs: Question[] = [
  { id: 1, text: "Which costing method is most suitable for a construction company?", options: ["Process Costing", "Job Costing", "Contract Costing", "Batch Costing"], correctOptionIndex: 2, explanation: "Contract Costing (a variant of Job Costing) is used for long-term construction contracts where each contract is a separate cost unit." },
  { id: 2, text: "Fixed costs per unit:", options: ["Remain constant as output increases", "Decrease as output increases", "Increase as output increases", "Are always zero at zero output"], correctOptionIndex: 1, explanation: "Total fixed costs are constant, so fixed cost per unit decreases as output increases — they are spread over more units." },
  { id: 3, text: "The Break-Even Point is where:", options: ["Total revenue equals total variable cost", "Total revenue equals total fixed cost", "Total revenue equals total cost", "Contribution equals zero"], correctOptionIndex: 2, explanation: "BEP is the level of output/sales where Total Revenue = Total Cost (fixed + variable), resulting in neither profit nor loss." },
  { id: 4, text: "Contribution Margin =", options: ["Sales − Fixed Costs", "Sales − Variable Costs", "Fixed Costs − Variable Costs", "Sales − Total Costs"], correctOptionIndex: 1, explanation: "Contribution = Sales − Variable Costs. It contributes first to recovering fixed costs, then to profit." },
  { id: 5, text: "P/V Ratio (Profit-Volume Ratio) is calculated as:", options: ["Fixed Cost / Sales", "Contribution / Sales × 100", "Profit / Sales × 100", "Variable Cost / Sales × 100"], correctOptionIndex: 1, explanation: "P/V Ratio = (Contribution / Sales) × 100. It shows what percentage of each rupee of sales contributes to fixed costs and profit." },
  { id: 6, text: "Under standard costing, a favourable material price variance means:", options: ["More material was used than standard", "Actual price was higher than standard price", "Actual price was lower than standard price", "Less material was used than standard"], correctOptionIndex: 2, explanation: "Material Price Variance = (Standard Price − Actual Price) × Actual Quantity. If actual price < standard price, the variance is favourable." },
  { id: 7, text: "Idle time variance is always:", options: ["Favourable", "Adverse", "Zero", "Dependent on output"], correctOptionIndex: 1, explanation: "Idle time variance = Idle Hours × Standard Labour Rate. Since idle time represents wasted capacity, it is always an adverse variance." },
  { id: 8, text: "In process costing, the cost of normal loss is:", options: ["Treated as period cost", "Added to the cost of good output", "Separately disclosed", "Charged to a provision account"], correctOptionIndex: 1, explanation: "Normal loss is an expected, unavoidable loss. Its cost is absorbed into the cost of good output (i.e., cost per unit increases)." },
  { id: 9, text: "Which of the following is NOT included in prime cost?", options: ["Direct material", "Direct labour", "Direct expenses", "Factory overhead"], correctOptionIndex: 3, explanation: "Prime Cost = Direct Material + Direct Labour + Direct Expenses. Factory overhead (indirect costs) is part of works cost, not prime cost." },
  { id: 10, text: "Absorption costing differs from marginal costing in that:", options: ["Variable costs are excluded", "Fixed overheads are included in product cost", "It is used only for external reporting", "It ignores direct labour"], correctOptionIndex: 1, explanation: "Absorption costing includes both variable and fixed overheads in product cost. Marginal costing treats fixed overheads as period costs." },
];

const costingQsB: Question[] = [
  { id: 11, text: "A flexible budget is prepared:", options: ["At one level of activity only", "At multiple levels of activity", "Only for fixed costs", "Only for direct costs"], correctOptionIndex: 1, explanation: "A flexible budget is recast at different levels of activity to reflect how costs change with output, unlike a fixed (static) budget." },
  { id: 12, text: "Labour efficiency variance measures:", options: ["Difference in wage rate paid vs standard", "Difference in hours worked vs standard hours for actual output", "Difference in output vs budgeted output", "Difference in total labour cost"], correctOptionIndex: 1, explanation: "Labour Efficiency Variance = (Standard Hours − Actual Hours) × Standard Rate. It measures productive use of labour time." },
  { id: 13, text: "The cost of spoilage beyond the normal limit is called:", options: ["Normal loss", "Abnormal loss", "Scrap", "Waste"], correctOptionIndex: 1, explanation: "Abnormal loss arises from unexpected causes beyond the expected normal loss. It is debited to Abnormal Loss Account." },
  { id: 14, text: "Which method values inventory at the cost of the most recently purchased items?", options: ["FIFO", "LIFO", "Weighted Average", "Specific Identification"], correctOptionIndex: 1, explanation: "LIFO (Last In, First Out) assumes the most recently purchased inventory is sold first, so closing stock is valued at older prices." },
  { id: 15, text: "Margin of Safety =", options: ["Actual Sales − BEP Sales", "BEP Sales − Actual Sales", "Contribution − Fixed Costs", "Sales − Variable Costs"], correctOptionIndex: 0, explanation: "Margin of Safety = Actual Sales − Break-Even Sales. It shows how much sales can fall before the firm makes a loss." },
  { id: 16, text: "Cost-Volume-Profit (CVP) analysis assumes:", options: ["Costs are non-linear", "All costs are fixed within the relevant range", "Selling price is constant per unit", "Inventory levels change"], correctOptionIndex: 2, explanation: "CVP analysis assumes: selling price per unit is constant, costs are linear, and production equals sales within the relevant range." },
  { id: 17, text: "Selling overhead is classified as:", options: ["Prime cost", "Production overhead", "Period cost / Marketing cost", "Direct cost"], correctOptionIndex: 2, explanation: "Selling overheads (advertising, commissions, distribution) are period costs — not included in product cost under marginal or standard costing." },
  { id: 18, text: "Responsibility Accounting assigns costs and revenues to:", options: ["Products only", "Managers responsible for them", "Shareholders", "Customers"], correctOptionIndex: 1, explanation: "Responsibility Accounting holds managers accountable only for costs and revenues within their control, creating cost/profit/investment centres." },
  { id: 19, text: "In job costing, each job is assigned:", options: ["A common overhead rate", "Its own unique job cost sheet", "The average cost of all jobs", "Only direct material costs"], correctOptionIndex: 1, explanation: "Each job in Job Costing has a unique cost sheet accumulating all direct materials, direct labour, and overheads attributed to it." },
  { id: 20, text: "Batch costing is appropriate when:", options: ["Each unit is unique", "Identical items are produced in groups", "Production is continuous", "Cost per hour is needed"], correctOptionIndex: 1, explanation: "Batch costing treats each batch as a cost unit. It is suitable for pharmaceuticals, bakeries, and component manufacturers making standard items in lots." },
];

const costingQsC: Question[] = [
  { id: 21, text: "Overhead absorption rate is computed as:", options: ["Actual overhead / Actual base", "Budgeted overhead / Budgeted base", "Actual overhead / Budgeted base", "Budgeted overhead / Actual base"], correctOptionIndex: 1, explanation: "Pre-determined (budgeted) OAR = Budgeted Overhead / Budgeted Activity Base. This is set before the period to allow timely product costing." },
  { id: 22, text: "Under-absorption of overheads means:", options: ["Absorbed overheads > Actual overheads", "Absorbed overheads < Actual overheads", "Absorbed overheads = Actual overheads", "No overheads were absorbed"], correctOptionIndex: 1, explanation: "Under-absorption occurs when absorbed overhead < actual overhead incurred. The shortfall is written off to Costing P&L as additional cost." },
  { id: 23, text: "Transfer pricing is relevant in:", options: ["Job costing", "Divisionalised (decentralised) organisations", "Process costing", "Batch costing"], correctOptionIndex: 1, explanation: "Transfer pricing sets the price at which goods/services are exchanged between divisions of the same organisation, affecting divisional performance measurement." },
  { id: 24, text: "Which of the following best defines 'sunk cost'?", options: ["Future cost that can be avoided", "Cost that has already been incurred and cannot be recovered", "Variable cost per unit", "Opportunity cost of a decision"], correctOptionIndex: 1, explanation: "Sunk costs are past costs that have already been incurred and are irrelevant to future decisions since they cannot be changed." },
  { id: 25, text: "Opportunity cost is:", options: ["The actual cost of the best alternative foregone", "The value of the next best alternative foregone", "A type of fixed overhead", "Recorded in the cost accounts"], correctOptionIndex: 1, explanation: "Opportunity cost is the value of the benefit sacrificed when choosing one option over the next best alternative. It is not recorded in accounts." },
  { id: 26, text: "Which variance arises due to a change in the mix of materials used?", options: ["Material Price Variance", "Material Usage Variance", "Material Mix Variance", "Material Yield Variance"], correctOptionIndex: 2, explanation: "Material Mix Variance measures the cost impact of using a different proportion of materials than the standard mix, while keeping total usage constant." },
  { id: 27, text: "At BEP, contribution equals:", options: ["Zero", "Variable cost", "Fixed cost", "Total cost"], correctOptionIndex: 2, explanation: "At the Break-Even Point, Contribution = Fixed Costs exactly, leaving zero profit. Above BEP, every unit of contribution becomes profit." },
  { id: 28, text: "Service costing is used in:", options: ["Manufacturing companies", "Transport, hospitals, and hotels", "Mining companies", "Agricultural firms"], correctOptionIndex: 1, explanation: "Service (operating) costing applies to organisations providing intangible services — transport companies, hospitals, hotels." },
  { id: 29, text: "The main objective of cost accounting is:", options: ["Tax computation", "Ascertainment and control of costs", "Preparation of financial statements", "Dividend declaration"], correctOptionIndex: 1, explanation: "The primary objectives of cost accounting are: ascertaining the cost of products/services, controlling costs, and providing data for managerial decision-making." },
  { id: 30, text: "Profit under marginal costing vs absorption costing differs because:", options: ["Variable costs differ", "Fixed overhead treatment differs", "Direct labour rates differ", "Sales prices differ"], correctOptionIndex: 1, explanation: "The profit difference arises solely from how fixed overheads are treated: absorption costing defers fixed overhead in closing stock; marginal costing expenses all fixed overhead in the period." },
];

const auditQs: Question[] = [
  { id: 1, text: "The primary objective of an audit is:", options: ["Detection of fraud", "Preparation of financial statements", "Expression of an opinion on financial statements", "Tax computation"], correctOptionIndex: 2, explanation: "The primary objective is to enable the auditor to express an independent opinion on whether financial statements give a true and fair view." },
  { id: 2, text: "An audit conducted by an external independent auditor is called:", options: ["Internal Audit", "Statutory Audit", "Management Audit", "Operational Audit"], correctOptionIndex: 1, explanation: "Statutory Audit is mandated by law (e.g., Companies Act 2013) and is conducted by an independent external auditor." },
  { id: 3, text: "SA 200 deals with:", options: ["Audit Documentation", "Overall Objectives of the Independent Auditor", "Audit Sampling", "Going Concern"], correctOptionIndex: 1, explanation: "SA 200 'Overall Objectives of the Independent Auditor and the Conduct of an Audit in Accordance with Standards on Auditing' sets the auditor's primary objectives." },
  { id: 4, text: "Audit risk is the risk that:", options: ["The client commits fraud", "The auditor expresses an inappropriate opinion", "Financial statements contain errors", "The auditor charges excessive fees"], correctOptionIndex: 1, explanation: "Audit Risk = Risk that the auditor expresses an inappropriate audit opinion when the financial statements are materially misstated. AR = IR × CR × DR." },
  { id: 5, text: "Which of the following is NOT a component of audit risk?", options: ["Inherent Risk", "Control Risk", "Detection Risk", "Business Risk"], correctOptionIndex: 3, explanation: "Audit Risk has three components: Inherent Risk (IR), Control Risk (CR), and Detection Risk (DR). Business Risk is a separate concept." },
  { id: 6, text: "Audit evidence that is obtained directly by the auditor is considered:", options: ["More reliable", "Less reliable", "Not relevant", "Circumstantial"], correctOptionIndex: 0, explanation: "SA 500: Evidence obtained directly by the auditor (physical inspection, observation, recalculation) is generally more reliable than evidence provided by the client." },
  { id: 7, text: "The concept of materiality in auditing means:", options: ["All errors must be reported", "Only errors that could influence users' decisions need be reported", "Only quantitative errors matter", "Errors below ₹1,000 are ignored"], correctOptionIndex: 1, explanation: "Materiality: information is material if its omission or misstatement could reasonably influence the economic decisions of users of the financial statements." },
  { id: 8, text: "An auditor's working papers are:", options: ["Property of the client", "Property of the auditor", "Filed with the regulator", "Shared with shareholders"], correctOptionIndex: 1, explanation: "Working papers (audit documentation) are the property of the auditor. They may not be disclosed to third parties without client consent, except as required by law." },
  { id: 9, text: "Internal control is designed to provide:", options: ["Absolute assurance", "Reasonable assurance", "No assurance", "Legal protection"], correctOptionIndex: 1, explanation: "Internal controls provide reasonable, not absolute, assurance because of inherent limitations (human error, management override, cost constraints)." },
  { id: 10, text: "Vouching is the verification of:", options: ["Physical assets", "Accounting entries with supporting documents", "Bank balances only", "Only revenue transactions"], correctOptionIndex: 1, explanation: "Vouching is the examination of documentary evidence (vouchers, invoices, receipts) supporting accounting entries to verify their authenticity and accuracy." },
];

const auditQsB: Question[] = [
  { id: 11, text: "An 'Emphasis of Matter' paragraph in an audit report:", options: ["Modifies the audit opinion", "Draws attention to a matter properly disclosed in the financial statements", "Indicates a qualified opinion", "Replaces the opinion paragraph"], correctOptionIndex: 1, explanation: "SA 706: An Emphasis of Matter paragraph highlights a matter properly disclosed in the financial statements that the auditor considers fundamental. It does not modify the opinion." },
  { id: 12, text: "Which SA deals with audit sampling?", options: ["SA 315", "SA 500", "SA 530", "SA 560"], correctOptionIndex: 2, explanation: "SA 530 'Audit Sampling' provides guidance on designing, selecting, and evaluating a sample to draw conclusions about the population." },
  { id: 13, text: "Verification of assets involves checking their:", options: ["Existence only", "Existence, ownership, valuation, and disclosure", "Cost only", "Market value only"], correctOptionIndex: 1, explanation: "Asset verification covers: Existence (physically present), Ownership (belongs to entity), Valuation (correctly measured), and Disclosure (properly presented)." },
  { id: 14, text: "The going concern assumption means the entity will:", options: ["Cease operations within 12 months", "Continue operating for the foreseeable future", "Be liquidated at year end", "Only operate for one more year"], correctOptionIndex: 1, explanation: "SA 570: Going concern assumes the entity will continue to operate for the foreseeable future (at least 12 months from the reporting date)." },
  { id: 15, text: "Audit programme is:", options: ["A schedule of audit fees", "A detailed plan of audit procedures", "A report on internal control weaknesses", "The final audit report"], correctOptionIndex: 1, explanation: "An audit programme lists specific audit procedures (tests, checks, inquiries) to be performed, including their timing, extent, and responsible staff." },
  { id: 16, text: "Statistical sampling in auditing allows the auditor to:", options: ["Eliminate audit risk", "Quantify sampling risk", "Avoid testing altogether", "Guarantee accuracy"], correctOptionIndex: 1, explanation: "Statistical sampling uses probability theory to quantify sampling risk, allowing the auditor to make statistically valid inferences about the population." },
  { id: 17, text: "An adverse opinion is issued when:", options: ["There is a minor misstatement", "Misstatements are material but not pervasive", "Misstatements are material and pervasive", "The auditor cannot obtain sufficient evidence"], correctOptionIndex: 2, explanation: "SA 705: An adverse opinion is expressed when misstatements are both material AND pervasive to the financial statements as a whole." },
  { id: 18, text: "Substantive procedures are designed to:", options: ["Test the design of controls", "Detect material misstatements in account balances and transactions", "Evaluate management's competence", "Review audit committee minutes"], correctOptionIndex: 1, explanation: "Substantive procedures (tests of details and analytical procedures) directly test the accuracy and completeness of financial statement amounts and disclosures." },
  { id: 19, text: "SA 315 requires the auditor to understand:", options: ["Only the financial statements", "The entity and its environment, including internal controls", "Only the industry", "Only prior year audit findings"], correctOptionIndex: 1, explanation: "SA 315 'Identifying and Assessing the Risks of Material Misstatement' requires a thorough understanding of the entity, environment, and its internal controls." },
  { id: 20, text: "The standard audit report on financial statements includes:", options: ["A section on Management's Responsibility only", "Auditor's opinion, basis, and key audit matters (for listed entities)", "Only the auditor's signature", "Only the opinion paragraph"], correctOptionIndex: 1, explanation: "A modern audit report includes: title, addressee, opinion paragraph, basis for opinion, going concern, KAMs (listed entities), management/auditor responsibilities, and signature." },
];

const auditQsC: Question[] = [
  { id: 21, text: "Audit of accounts receivable would typically include:", options: ["Physical verification", "Confirmation from debtors, review of ageing, and cut-off tests", "Only examining invoices", "Re-performing the sales cycle"], correctOptionIndex: 1, explanation: "Receivables audit includes: external confirmation (circularisation), ageing analysis, cut-off testing, and reviewing subsequent receipts." },
  { id: 22, text: "When the auditor is unable to obtain sufficient appropriate evidence, they issue:", options: ["Adverse opinion", "Disclaimer of opinion", "Unmodified opinion", "Emphasis of Matter"], correctOptionIndex: 1, explanation: "SA 705: A Disclaimer of Opinion is issued when the auditor cannot obtain sufficient appropriate audit evidence and the possible effects could be material and pervasive." },
  { id: 23, text: "CARO 2020 applies to:", options: ["All companies", "Specified companies (excluding certain small companies and banking companies)", "Only listed companies", "Only government companies"], correctOptionIndex: 1, explanation: "CARO 2020 applies to companies registered under the Companies Act 2013, excluding certain small companies, private companies below specified thresholds, and banking/insurance companies." },
  { id: 24, text: "Rotation of statutory auditors for listed companies is required every:", options: ["3 years", "5 years", "10 years", "15 years"], correctOptionIndex: 1, explanation: "Section 139, Companies Act 2013: Listed companies must rotate their statutory auditor every 5 years (one term = 5 years, maximum 2 terms for a firm)." },
  { id: 25, text: "Test of controls is performed to:", options: ["Detect material misstatements in transactions", "Evaluate the operating effectiveness of internal controls", "Verify cash balances", "Assess management's integrity"], correctOptionIndex: 1, explanation: "Tests of controls evaluate whether internal controls were operating effectively throughout the period, allowing the auditor to reduce substantive testing." },
  { id: 26, text: "The auditor's independence is most important for:", options: ["Completing the audit quickly", "Ensuring the opinion is objective and unbiased", "Reducing audit fees", "Maintaining client confidentiality"], correctOptionIndex: 1, explanation: "Auditor independence (in mind and appearance) is the cornerstone of audit quality — it ensures the opinion is objective and not influenced by the client's management." },
  { id: 27, text: "Cut-off procedures ensure that:", options: ["All assets are physically verified", "Transactions are recorded in the correct accounting period", "Bank balances match the ledger", "Depreciation is correctly calculated"], correctOptionIndex: 1, explanation: "Cut-off testing verifies that transactions near the year-end are recorded in the correct period — preventing window dressing and ensuring period accuracy." },
  { id: 28, text: "An internal auditor is employed by:", options: ["The government", "The organisation being audited", "The ICAI", "External shareholders"], correctOptionIndex: 1, explanation: "Internal auditors are employees (or external consultants) of the organisation itself. Unlike external auditors, their primary accountability is to management/the audit committee." },
  { id: 29, text: "Which of the following is an example of analytical procedure?", options: ["Physically counting inventory", "Confirming balances with banks", "Comparing current year's gross margin % with prior year", "Inspecting title deeds"], correctOptionIndex: 2, explanation: "Analytical procedures involve evaluating financial information by studying plausible relationships — e.g., comparing ratios, trends, or prior year data to identify unusual fluctuations." },
  { id: 30, text: "The audit committee of a listed company must have at least:", options: ["Two independent directors", "Three directors with majority being independent", "Five members", "One external auditor"], correctOptionIndex: 1, explanation: "Section 177, Companies Act 2013: The audit committee must have minimum 3 directors, with a majority being independent directors. The chairperson must be independent." },
];

// ─── SERIES ────────────────────────────────────────────────────────────────
export const mcqSeries: MCQSeries[] = [
  { id: "accounting-foundation", title: "CA Foundation — Accounting",      subject: "Accounting", description: "Core accounting practice mapped to the CA Foundation syllabus.",           price: 0,    isLocked: false },
  { id: "law-foundation",        title: "CA Foundation — Business Laws",   subject: "Law",        description: "Act-wise practice for the CA Foundation Business Laws paper.",            price: 0,    isLocked: false },
  { id: "costing-intermediate",  title: "CA Intermediate — Costing",       subject: "Costing",    description: "Cost and management accounting drills for CA Intermediate.",              price: 2999, isLocked: true },
  { id: "audit-intermediate",    title: "CA Intermediate — Audit",         subject: "Audit",      description: "Standards and audit-procedure practice for CA Intermediate.",             price: 0,    isLocked: false },
  { id: "all-levels-comprehensive", title: "Test Series — All Levels",     subject: "All Subjects", description: "Comprehensive MCQ test series for CA Foundation, Intermediate, and Final. Unlocked via course purchase.", price: 2999, isLocked: true },
  { id: "quiz-practice-all",     title: "Quiz — Practice Bank",            subject: "All Subjects", description: "Subject-wise MCQ practice platform with instant feedback and performance analytics.", price: 999, isLocked: true },
];

// ─── SETS ─────────────────────────────────────────────────────────────────
// ⚠ topperStats below are MOCK SEED DATA ONLY — not aggregated from real student attempts.
// perQuestionTimes is ordered: section 0 questions first, then section 1, etc.
// Replace with backend aggregation before production.
export const mcqSets: MCQSet[] = [
  {
    id: "ca-accounting-free",
    seriesId: "accounting-foundation",
    title: "Accounting Fundamentals",
    isLocked: false,
    price: 0,
    description: "30 essential MCQs covering double-entry, financial statements, and partnership accounts — mapped to CA Foundation syllabus.",
    subject: "Accounting",
    sections: [
      { id: "acc-s1", title: "Section A — Accounting Concepts & Fundamentals", questions: accountingQs },
      { id: "acc-s2", title: "Section B — Depreciation, Capital & Financial Statements", questions: accountingQsB },
      { id: "acc-s3", title: "Section C — Partnership, Company Accounts & Ratios", questions: accountingQsC },
    ],
    topperStats: {
      score: 29,
      totalTimeSeconds: 960,
      perQuestionTimes: Array.from({ length: 30 }, (_, i) => 24 + (i % 5) * 3),
    },
  },
  {
    id: "ca-law-foundation",
    seriesId: "law-foundation",
    title: "Business Laws — Foundation",
    isLocked: true,
    price: 49,
    description: "30 MCQs on Indian Contract Act, Sale of Goods Act, and Partnership Act for CA Foundation aspirants.",
    subject: "Law",
    sections: [
      { id: "law-s1", title: "Section A — Indian Contract Act", questions: lawQs },
      { id: "law-s2", title: "Section B — Sale of Goods & Partnership Acts", questions: lawQsB },
      { id: "law-s3", title: "Section C — Discharge, Remedies & Agency", questions: lawQsC },
    ],
    topperStats: {
      score: 28,
      totalTimeSeconds: 1020,
      perQuestionTimes: Array.from({ length: 30 }, (_, i) => 27 + (i % 4) * 3),
    },
  },
  {
    id: "ca-costing-inter",
    seriesId: "costing-intermediate",
    title: "Cost & Management Accounting",
    isLocked: true,
    price: 49,
    description: "30 MCQs covering costing methods, marginal costing, standard costing, and budgeting for CA Intermediate.",
    subject: "Costing",
    sections: [
      { id: "cost-s1", title: "Section A — Costing Methods & BEP Analysis", questions: costingQs },
      { id: "cost-s2", title: "Section B — Budgeting, Variances & Overhead Absorption", questions: costingQsB },
      { id: "cost-s3", title: "Section C — Marginal Costing, Decision Making & Transfer Pricing", questions: costingQsC },
    ],
    topperStats: {
      score: 29,
      totalTimeSeconds: 1080,
      perQuestionTimes: Array.from({ length: 30 }, (_, i) => 29 + (i % 5) * 3),
    },
  },
  {
    id: "ca-audit-free",
    seriesId: "audit-intermediate",
    title: "Audit & Assurance — Free Paper",
    isLocked: false,
    price: 0,
    description: "30 free MCQs on SA standards, audit procedures, and internal controls for CA Intermediate aspirants.",
    subject: "Audit",
    sections: [
      { id: "aud-s1", title: "Section A — Audit Basics, Risk & Evidence", questions: auditQs },
      { id: "aud-s2", title: "Section B — Audit Reports, Sampling & Procedures", questions: auditQsB },
      { id: "aud-s3", title: "Section C — Substantive Testing, Controls & Legal Compliance", questions: auditQsC },
    ],
    topperStats: {
      score: 28,
      totalTimeSeconds: 990,
      perQuestionTimes: Array.from({ length: 30 }, (_, i) => 25 + (i % 6) * 3),
    },
  },
];

/** Flat list of all questions in a set, in section order — used by the quiz engine. */
export function flattenSetQuestions(set: MCQSet): { question: Question; sectionTitle: string; sectionId: string }[] {
  return set.sections.flatMap((section) =>
    section.questions.map((question) => ({ question, sectionTitle: section.title, sectionId: section.id }))
  );
}

/** @deprecated Use flattenSetQuestions. */
export const flattenPaperQuestions = flattenSetQuestions;

// ─── PAYMENT VERIFICATIONS ──────────────────────────────────────────────
export interface PaymentVerification {
  id: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  date: string;
  status: "pending" | "approved" | "rejected" | "refunded";
  utrNumber: string;
}

export const pendingVerifications: PaymentVerification[] = [
  { id: "pv-001", studentEmail: "aditya.sharma@gmail.com",  courseTitle: "CA Foundation — Accounting",                       amount: 1299, date: "2026-07-14", status: "pending",  utrNumber: "UTR4892019384" },
  { id: "pv-002", studentEmail: "priya.nair@gmail.com",     courseTitle: "CA Intermediate — Taxation (IT + GST)",            amount: 1899, date: "2026-07-15", status: "pending",  utrNumber: "UTR8812093412" },
  { id: "pv-003", studentEmail: "rohan.mehta@outlook.com",  courseTitle: "CA Intermediate — Cost & Management Accounting",   amount: 1499, date: "2026-07-15", status: "approved", utrNumber: "UTR2234819823" },
  { id: "pv-004", studentEmail: "sneha.gupta@yahoo.com",    courseTitle: "CA Final — Full Mock Test Series",                 amount:  799, date: "2026-07-16", status: "pending",  utrNumber: "UTR9920345102" },
  { id: "pv-005", studentEmail: "karthik.iyer@gmail.com",   courseTitle: "CA Foundation — Business Laws",                   amount:  999, date: "2026-07-16", status: "rejected", utrNumber: "UTR5567238902" },
  { id: "pv-006", studentEmail: "meera.pillai@gmail.com",   courseTitle: "CA Intermediate — Taxation (IT + GST)",            amount: 1899, date: "2026-07-12", status: "approved", utrNumber: "UTR1123445566" },
  { id: "pv-007", studentEmail: "vijay.singh@gmail.com",    courseTitle: "CA Foundation — Accounting",                       amount: 1299, date: "2026-07-10", status: "refunded", utrNumber: "UTR7788990011" },
];

// ─── MOCK REGISTERED USERS ─────────────────────────────────────────────
export interface RegisteredUser {
  id: string;
  email: string;
  joinDate: string;
  purchases: { courseTitle: string; amount: number; date: string }[];
  quizAttempts: { setTitle: string; score: number; total: number; date: string }[];
}

export const registeredUsers: RegisteredUser[] = [
  {
    id: "u-001", email: "aditya.sharma@gmail.com", joinDate: "2026-07-14",
    purchases: [{ courseTitle: "CA Foundation — Accounting", amount: 1299, date: "2026-07-14" }],
    quizAttempts: [{ setTitle: "Accounting Fundamentals", score: 22, total: 30, date: "2026-07-15" }],
  },
  {
    id: "u-002", email: "priya.nair@gmail.com", joinDate: "2026-07-15",
    purchases: [{ courseTitle: "CA Intermediate — Taxation (IT + GST)", amount: 1899, date: "2026-07-15" }],
    quizAttempts: [
      { setTitle: "Accounting Fundamentals", score: 18, total: 30, date: "2026-07-15" },
      { setTitle: "Audit & Assurance — Free Paper", score: 25, total: 30, date: "2026-07-16" },
    ],
  },
  {
    id: "u-003", email: "rohan.mehta@outlook.com", joinDate: "2026-07-10",
    purchases: [
      { courseTitle: "CA Intermediate — Cost & Management Accounting", amount: 1499, date: "2026-07-11" },
      { courseTitle: "CA Final — Full Mock Test Series", amount: 799, date: "2026-07-15" },
    ],
    quizAttempts: [
      { setTitle: "Cost & Management Accounting", score: 27, total: 30, date: "2026-07-12" },
      { setTitle: "Audit & Assurance — Free Paper", score: 20, total: 30, date: "2026-07-13" },
    ],
  },
  {
    id: "u-004", email: "sneha.gupta@yahoo.com", joinDate: "2026-07-16",
    purchases: [{ courseTitle: "CA Final — Full Mock Test Series", amount: 799, date: "2026-07-16" }],
    quizAttempts: [],
  },
  {
    id: "u-005", email: "meera.pillai@gmail.com", joinDate: "2026-07-01",
    purchases: [{ courseTitle: "CA Intermediate — Taxation (IT + GST)", amount: 1899, date: "2026-07-01" }],
    quizAttempts: [
      { setTitle: "Accounting Fundamentals", score: 29, total: 30, date: "2026-07-03" },
      { setTitle: "Business Laws — Foundation", score: 24, total: 30, date: "2026-07-05" },
    ],
  },
];

// ─── LEGACY ALIASES — kept for backward compatibility ─
/** @deprecated Use mcqSets instead. */
export const mcqPapers = mcqSets;
