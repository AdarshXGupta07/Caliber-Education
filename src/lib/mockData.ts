// ─── MENTOR ───────────────────────────────────────────────────────────────
export interface Mentor {
  name: string;
  specialty: string;
  initials: string;
  color: string;
  bio: string;
}

// ─── COURSES ───────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  level: "Foundation" | "Intermediate" | "Final";
  duration: string;
  outcomes: string[];
  curriculum: { module: string; topics: string[] }[];
  enrolledCount: number;
  rating: number;
  tag?: string;
  mentors: Mentor[];
}

export const courses: Course[] = [
  {
    id: "ca-accounting-foundation",
    title: "CA Foundation — Accounting",
    description:
      "Master the principles of double-entry bookkeeping, financial statements, and partnership accounts with MCQ practice mapped to ICAI's Foundation syllabus.",
    price: 1299,
    level: "Foundation",
    duration: "8 weeks",
    tag: "Bestseller",
    enrolledCount: 1240,
    rating: 4.8,
    mentors: [
      {
        name: "Somya Deep",
        specialty: "[Somya's CA subject specialty — placeholder]",
        initials: "SD",
        color: "from-signal-emerald to-emerald-700",
        bio: "[Somya's bio — placeholder. Add your background, years of experience, and what makes your teaching style unique.]",
      },
    ],
    outcomes: [
      "Understand all ICAI Foundation Accounting chapters in depth",
      "Solve 500+ Accounting MCQs with timed practice",
      "Master journal entries, ledgers, and trial balance preparation",
      "Get WhatsApp access to live doubt sessions",
    ],
    curriculum: [
      {
        module: "Theoretical Framework",
        topics: ["Accounting Concepts & Conventions", "Double Entry System", "Books of Prime Entry"],
      },
      {
        module: "Financial Statements",
        topics: ["Trading & P&L Account", "Balance Sheet", "Adjustments in Final Accounts"],
      },
      {
        module: "Partnership Accounts",
        topics: ["Admission of a Partner", "Retirement & Death", "Dissolution of Firm"],
      },
      {
        module: "Company Accounts",
        topics: ["Issue of Shares & Debentures", "Forfeiture & Reissue", "Redemption of Debentures"],
      },
    ],
  },
  {
    id: "ca-law-foundation",
    title: "CA Foundation — Business Laws",
    description:
      "Crack Business Laws & Business Correspondence with structured MCQ banks, case-law summaries, and act-wise revision sets.",
    price: 999,
    level: "Foundation",
    duration: "6 weeks",
    enrolledCount: 876,
    rating: 4.6,
    mentors: [
      {
        name: "Aditya Kanal",
        specialty: "[Aditya's CA subject specialty — placeholder]",
        initials: "AK",
        color: "from-blue-500 to-blue-700",
        bio: "[Aditya's bio — placeholder. Add your background, years of experience, and what makes your teaching style unique.]",
      },
    ],
    outcomes: [
      "Cover all ICAI Foundation Law chapters",
      "Understand key provisions of Indian Contract Act & Sale of Goods Act",
      "Crack scenario-based MCQs in under 60 seconds",
      "Access daily practice sets on WhatsApp",
    ],
    curriculum: [
      {
        module: "Indian Contract Act 1872",
        topics: ["Offer & Acceptance", "Consideration", "Void & Voidable Contracts", "Discharge & Remedies"],
      },
      {
        module: "Sale of Goods Act 1930",
        topics: ["Conditions & Warranties", "Transfer of Property", "Unpaid Seller"],
      },
      {
        module: "Partnership Act 1932",
        topics: ["Nature of Partnership", "Rights & Duties of Partners", "Dissolution"],
      },
    ],
  },
  {
    id: "ca-inter-costing",
    title: "CA Intermediate — Cost & Management Accounting",
    description:
      "Full coverage of costing methods, budgeting, standard costing, and marginal costing with chapter-wise MCQ banks and formula flash cards.",
    price: 1499,
    level: "Intermediate",
    duration: "10 weeks",
    tag: "Popular",
    enrolledCount: 1050,
    rating: 4.7,
    mentors: [
      {
        name: "Somya Deep",
        specialty: "[Somya's CA subject specialty — placeholder]",
        initials: "SD",
        color: "from-signal-emerald to-emerald-700",
        bio: "[Somya's bio — placeholder.]",
      },
      {
        name: "Aditya Kanal",
        specialty: "[Aditya's CA subject specialty — placeholder]",
        initials: "AK",
        color: "from-blue-500 to-blue-700",
        bio: "[Aditya's bio — placeholder.]",
      },
    ],
    outcomes: [
      "Cover all CA Inter Costing chapters",
      "Master marginal costing and CVP analysis",
      "Solve standard costing variance problems step by step",
      "Attempt previous CA exam Costing papers",
    ],
    curriculum: [
      {
        module: "Cost Ascertainment",
        topics: ["Job Costing", "Process Costing", "Contract Costing", "Service Costing"],
      },
      {
        module: "Cost Control",
        topics: ["Standard Costing & Variance Analysis", "Budgetary Control", "Responsibility Accounting"],
      },
      {
        module: "Decision Making",
        topics: ["Marginal Costing", "CVP Analysis", "Relevant Costing", "Pricing Decisions"],
      },
    ],
  },
  {
    id: "ca-inter-taxation",
    title: "CA Intermediate — Taxation (IT + GST)",
    description:
      "Structured coverage of Income Tax and GST with exam-pattern MCQs, amendment trackers, and slab-rate summary sheets.",
    price: 1899,
    level: "Intermediate",
    duration: "12 weeks",
    tag: "Premium",
    enrolledCount: 620,
    rating: 4.9,
    mentors: [
      {
        name: "Aditya Kanal",
        specialty: "[Aditya's CA subject specialty — placeholder]",
        initials: "AK",
        color: "from-blue-500 to-blue-700",
        bio: "[Aditya's bio — placeholder.]",
      },
    ],
    outcomes: [
      "Master all heads of income under Income Tax Act",
      "Understand GST — supply, valuation, ITC, and returns",
      "Solve computation problems and MCQs independently",
      "Stay updated with Finance Act amendments",
    ],
    curriculum: [
      {
        module: "Income Tax — Core",
        topics: ["Residential Status", "Heads of Income", "Deductions u/s 80", "Assessment Procedures"],
      },
      {
        module: "Income Tax — Advanced",
        topics: ["Capital Gains", "Business & Profession", "TDS & TCS", "Appeals & Revision"],
      },
      {
        module: "GST",
        topics: ["Levy & Scope of Supply", "Input Tax Credit", "Returns & Payments", "Exemptions"],
      },
    ],
  },
  {
    id: "ca-final-mock-series",
    title: "CA Final — Full Mock Test Series",
    description:
      "Simulate actual CA Final exam conditions with 15 full-length timed mock tests, auto-scoring, and detailed performance analytics across all papers.",
    price: 799,
    level: "Final",
    duration: "4 weeks",
    tag: "Top Rated",
    enrolledCount: 2100,
    rating: 4.9,
    mentors: [
      {
        name: "Somya Deep",
        specialty: "[Somya's CA subject specialty — placeholder]",
        initials: "SD",
        color: "from-signal-emerald to-emerald-700",
        bio: "[Somya's bio — placeholder.]",
      },
    ],
    outcomes: [
      "Build exam-day stamina with timed full-length mocks",
      "Identify weak papers with performance analytics",
      "Get a personalised revision plan from your coach",
      "Attempt 15 CA Final-pattern full mocks",
    ],
    curriculum: [
      {
        module: "Full Mock Tests",
        topics: ["CA Final Pattern Mocks (×15)", "Paper-wise Analysis", "Time Management Drills"],
      },
      {
        module: "Revision Strategy",
        topics: ["Weak Area Identification", "Last-30-Days Plan", "Exam Day Checklist"],
      },
    ],
  },
  {
    id: "ca-audit-free-starter",
    title: "Audit & Assurance — Free Starter",
    description:
      "Free introductory Audit MCQ practice set covering SA standards and audit procedures. No sign-in required for preview.",
    price: 0,
    level: "Intermediate",
    duration: "1 week",
    tag: "Free",
    enrolledCount: 5400,
    rating: 4.5,
    mentors: [
      {
        name: "Aditya Kanal",
        specialty: "[Aditya's CA subject specialty — placeholder]",
        initials: "AK",
        color: "from-blue-500 to-blue-700",
        bio: "[Aditya's bio — placeholder.]",
      },
    ],
    outcomes: [
      "Attempt 30 curated free Audit MCQs",
      "Understand question formats used in CA exams",
      "Identify whether our platform fits your needs",
    ],
    curriculum: [
      {
        module: "Free Sample",
        topics: ["Nature & Objectives of Audit", "Audit Evidence", "Internal Control Overview"],
      },
    ],
  },
];

// ─── MCQ SETS ──────────────────────────────────────────────────────────────
export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface MCQSet {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  price?: number;
  subject: string;
  questions: Question[];
}

// Helper — CA Accounting 30 questions
const accountingQuestions: Question[] = [
  { id: 1, questionText: "Which accounting concept assumes the business will continue to operate for the foreseeable future?", options: ["Accrual Concept", "Going Concern Concept", "Consistency Concept", "Materiality Concept"], correctOptionIndex: 1, explanation: "The Going Concern Concept assumes the entity will continue operations indefinitely, so assets are recorded at cost rather than liquidation value." },
  { id: 2, questionText: "Under double-entry bookkeeping, every transaction affects at least:", options: ["One account", "Two accounts", "Three accounts", "Four accounts"], correctOptionIndex: 1, explanation: "The fundamental rule of double-entry: every transaction has equal debit and credit entries in at least two accounts." },
  { id: 3, questionText: "The accounting equation is:", options: ["Assets = Liabilities + Capital", "Assets + Liabilities = Capital", "Capital = Assets + Liabilities", "Liabilities = Capital + Assets"], correctOptionIndex: 0, explanation: "Assets = Liabilities + Capital (Equity). This equation must always balance." },
  { id: 4, questionText: "Which of the following is a real account?", options: ["Salary Account", "Debtor's Account", "Building Account", "Capital Account"], correctOptionIndex: 2, explanation: "Real accounts relate to tangible assets (Buildings, Machinery). Personal accounts relate to persons; nominal accounts to incomes and expenses." },
  { id: 5, questionText: "Goods returned by a customer should be debited to:", options: ["Sales Account", "Purchases Return Account", "Sales Return Account", "Customer Account"], correctOptionIndex: 2, explanation: "Sales Returns (Returns Inward) account is debited when goods are returned by customers, reducing net sales." },
  { id: 6, questionText: "Closing stock appears in:", options: ["Trial Balance only", "Trading Account and Balance Sheet", "P&L Account only", "Cash Flow Statement"], correctOptionIndex: 1, explanation: "Closing stock appears as a credit in the Trading Account (reducing COGS) and as a current asset on the Balance Sheet." },
  { id: 7, questionText: "Which convention requires that anticipated losses should be recorded but anticipated profits should not?", options: ["Consistency", "Conservatism", "Materiality", "Full Disclosure"], correctOptionIndex: 1, explanation: "The Conservatism (Prudence) convention: recognise losses when probable, but only recognise profits when realised." },
  { id: 8, questionText: "The balance of the Profit & Loss Account is transferred to:", options: ["Trading Account", "Capital Account", "Bank Account", "Reserves Account"], correctOptionIndex: 1, explanation: "Net profit/loss is transferred to the Capital Account (in a sole proprietorship/partnership) or Retained Earnings." },
  { id: 9, questionText: "Prepaid expenses are classified as:", options: ["Current Liabilities", "Non-current Assets", "Current Assets", "Revenue"], correctOptionIndex: 2, explanation: "Prepaid expenses represent a future economic benefit (expense paid in advance) and are shown as current assets on the balance sheet." },
  { id: 10, questionText: "Outstanding salaries are shown in the Balance Sheet as:", options: ["Asset", "Current Liability", "Non-current Liability", "Contingent Liability"], correctOptionIndex: 1, explanation: "Outstanding (accrued) expenses are obligations due but not yet paid — recorded as current liabilities." },
  { id: 11, questionText: "Which account is used to record small cash payments?", options: ["Cash Book", "Petty Cash Book", "Journal", "Ledger"], correctOptionIndex: 1, explanation: "A Petty Cash Book records small, frequent cash payments (stationery, postage, etc.) under the imprest system." },
  { id: 12, questionText: "Goodwill is an example of:", options: ["Tangible fixed asset", "Fictitious asset", "Intangible fixed asset", "Wasting asset"], correctOptionIndex: 2, explanation: "Goodwill is an intangible fixed asset representing the firm's reputation, customer relationships, and earning potential above normal profits." },
  { id: 13, questionText: "Depreciation charged under the Straight-Line Method is:", options: ["Variable each year", "Constant each year", "Reducing each year", "Increasing each year"], correctOptionIndex: 1, explanation: "Under SLM, depreciation = (Cost − Residual Value) / Useful Life. This amount is constant every year." },
  { id: 14, questionText: "Capital expenditure is recorded in:", options: ["P&L Account", "Balance Sheet", "Manufacturing Account", "Trading Account"], correctOptionIndex: 1, explanation: "Capital expenditure adds future economic benefit and is capitalised on the Balance Sheet as a non-current asset, not expensed." },
  { id: 15, questionText: "The excess of current assets over current liabilities is called:", options: ["Net Worth", "Working Capital", "Liquid Ratio", "Capital Employed"], correctOptionIndex: 1, explanation: "Working Capital = Current Assets − Current Liabilities. It measures a firm's short-term liquidity." },
  { id: 16, questionText: "In a partnership, interest on drawings is:", options: ["Income of the firm", "Expense of the firm", "Capital contribution", "Liability of the firm"], correctOptionIndex: 0, explanation: "Interest on drawings is charged to the partner and treated as income of the firm, credited to the Profit & Loss Appropriation Account." },
  { id: 17, questionText: "A Bank Reconciliation Statement is prepared to reconcile:", options: ["Cash book and passbook balances", "Trial balance totals", "P&L and Balance Sheet", "Capital and drawings"], correctOptionIndex: 0, explanation: "BRS explains the difference between the firm's cash book balance and the bank passbook balance due to timing differences." },
  { id: 18, questionText: "When a bill is dishonoured, the party who drew the bill debits:", options: ["Bills Payable Account", "Bills Receivable Account", "Bank Account", "Drawee Account"], correctOptionIndex: 3, explanation: "On dishonour, the drawer reverses the original entry by debiting the Drawee's (acceptor's) personal account and crediting Bills Receivable." },
  { id: 19, questionText: "The capital of a company is divided into small units called:", options: ["Bonds", "Debentures", "Shares", "Fixed deposits"], correctOptionIndex: 2, explanation: "A company's share capital is divided into shares, each representing a unit of ownership in the company." },
  { id: 20, questionText: "Debenture holders are:", options: ["Owners of the company", "Creditors of the company", "Preference shareholders", "Equity shareholders"], correctOptionIndex: 1, explanation: "Debenture holders are creditors who have lent money to the company. They earn fixed interest and have priority over shareholders in liquidation." },
  { id: 21, questionText: "Which of the following is NOT a current asset?", options: ["Debtors", "Inventories", "Goodwill", "Cash & Cash Equivalents"], correctOptionIndex: 2, explanation: "Goodwill is a non-current intangible asset. Current assets are expected to be converted to cash within 12 months." },
  { id: 22, questionText: "The process of recording a transaction first in the Journal is called:", options: ["Posting", "Journalising", "Balancing", "Casting"], correctOptionIndex: 1, explanation: "Journalising is the primary entry of transactions in the Journal (book of original entry) before posting to the ledger." },
  { id: 23, questionText: "Which financial statement shows the financial position at a point in time?", options: ["Income Statement", "Cash Flow Statement", "Balance Sheet", "Trial Balance"], correctOptionIndex: 2, explanation: "The Balance Sheet (Statement of Financial Position) shows assets, liabilities, and equity at a specific date." },
  { id: 24, questionText: "Accumulated depreciation is shown in the Balance Sheet as:", options: ["Addition to the asset", "Deduction from the asset", "Current liability", "Revenue reserve"], correctOptionIndex: 1, explanation: "Accumulated depreciation is a contra-asset account, shown as a deduction from the gross carrying amount of the related fixed asset." },
  { id: 25, questionText: "The matching concept requires that:", options: ["All cash receipts are income", "Expenses are matched with the revenues they help generate in the same period", "Assets equal liabilities", "All transactions are recorded at cost"], correctOptionIndex: 1, explanation: "The matching (accruals) concept: expenses should be recognised in the same period as the revenues they helped produce." },
  { id: 26, questionText: "A subsidiary book that records only credit purchases is:", options: ["Cash Book", "Sales Book", "Purchases Book", "Journal Proper"], correctOptionIndex: 2, explanation: "The Purchases Book (Day Book) records only credit purchases of goods. Cash purchases are recorded in the Cash Book." },
  { id: 27, questionText: "Forfeiture of shares increases:", options: ["Share Capital", "Forfeited Shares Account (Capital Reserve on reissue)", "General Reserve", "Debenture Redemption Reserve"], correctOptionIndex: 1, explanation: "On forfeiture, called-up amounts already paid are transferred to Forfeited Shares Account. On reissue, any surplus goes to Capital Reserve." },
  { id: 28, questionText: "Which ratio measures the ability to pay short-term obligations from liquid assets?", options: ["Current Ratio", "Quick Ratio", "Debt-Equity Ratio", "Gross Profit Ratio"], correctOptionIndex: 1, explanation: "Quick Ratio (Acid-Test) = (Current Assets − Inventories − Prepayments) / Current Liabilities. It excludes less liquid assets." },
  { id: 29, questionText: "Revaluation Account in partnership is opened when:", options: ["A new partner is admitted", "Goodwill is written off", "A partner retires", "Both A and C"], correctOptionIndex: 3, explanation: "Revaluation Account is prepared on admission or retirement of a partner to record changes in asset/liability values so all partners share gains/losses equitably." },
  { id: 30, questionText: "Which of the following best describes 'accrued income'?", options: ["Income received in advance", "Income earned but not yet received", "Income paid to employees", "Income from capital gains"], correctOptionIndex: 1, explanation: "Accrued income is income earned in the current period but not yet received in cash. It is shown as a current asset on the Balance Sheet." },
];

// CA Law 30 questions
const lawQuestions: Question[] = [
  { id: 1, questionText: "An offer becomes a promise when it is:", options: ["Made in writing", "Accepted by the offeree", "Communicated to the public", "Signed by both parties"], correctOptionIndex: 1, explanation: "When the offeree unconditionally accepts the offer, it becomes a promise — forming the basis of a contract under the Indian Contract Act 1872." },
  { id: 2, questionText: "Consideration in a contract must be:", options: ["Adequate", "Lawful", "Past", "Future"], correctOptionIndex: 1, explanation: "Consideration need not be adequate, but it must be lawful. Past consideration is valid in India (unlike English law)." },
  { id: 3, questionText: "A contract with a minor is:", options: ["Voidable", "Void ab initio", "Valid", "Unenforceable"], correctOptionIndex: 1, explanation: "Under the Indian Contract Act, a minor lacks capacity to contract. A contract with a minor is void ab initio (void from the start)." },
  { id: 4, questionText: "Which of the following is NOT an essential element of a valid contract?", options: ["Free consent", "Lawful consideration", "Registration", "Competency of parties"], correctOptionIndex: 2, explanation: "Registration is not essential for all contracts. The essentials are offer, acceptance, consideration, capacity, free consent, and lawful object." },
  { id: 5, questionText: "Coercion as defined in the Indian Contract Act means:", options: ["Undue influence", "Committing or threatening to commit an offence", "Misrepresentation", "Fraud"], correctOptionIndex: 1, explanation: "Section 15: Coercion means committing or threatening to commit any act forbidden by IPC, or unlawfully detaining property, to obtain consent." },
  { id: 6, questionText: "A contract made under undue influence is:", options: ["Void", "Voidable at the option of the influenced party", "Valid", "Illegal"], correctOptionIndex: 1, explanation: "A contract caused by undue influence is voidable at the option of the party whose consent was unduly influenced (Section 19A)." },
  { id: 7, questionText: "Acceptance of an offer must be:", options: ["Conditional", "Absolute and unqualified", "In writing only", "Communicated only to the offeror's agent"], correctOptionIndex: 1, explanation: "Section 7: Acceptance must be absolute and unqualified. A conditional acceptance is treated as a counter-offer." },
  { id: 8, questionText: "Which of the following contracts is valid even without consideration?", options: ["Contract with a minor", "Contract of agency", "Agreement to pay a time-barred debt in writing", "Agreement to do an impossible act"], correctOptionIndex: 2, explanation: "Section 25(3): A written and signed promise to pay a time-barred debt is enforceable without fresh consideration." },
  { id: 9, questionText: "In a contract of sale, when does property in specific goods pass to the buyer?", options: ["On delivery of goods", "When the contract is made, if goods are in deliverable state", "On payment of price", "On registration of sale"], correctOptionIndex: 1, explanation: "Section 20, Sale of Goods Act 1930: In an unconditional contract for specific goods in a deliverable state, property passes when the contract is made." },
  { id: 10, questionText: "Doctrine of Caveat Emptor means:", options: ["Seller beware", "Buyer beware", "Government beware", "Agent beware"], correctOptionIndex: 1, explanation: "Caveat Emptor ('buyer beware') — the buyer must examine goods before purchase. The seller is not liable for defects if the buyer could have discovered them." },
  { id: 11, questionText: "An unpaid seller's right of lien means:", options: ["Right to stop goods in transit", "Right to resell the goods", "Right to retain possession until price is paid", "Right to sue for damages"], correctOptionIndex: 2, explanation: "Lien is the right of the unpaid seller to retain possession of goods until the price is paid." },
  { id: 12, questionText: "A partnership is dissolved compulsorily by:", options: ["Death of a partner", "Insolvency of all partners", "Notice by a partner", "Agreement of partners"], correctOptionIndex: 1, explanation: "Section 41, Partnership Act: Compulsory dissolution occurs when all (or all but one) partners are adjudicated insolvent, or business becomes unlawful." },
  { id: 13, questionText: "Ostensible (apparent) authority of a partner means:", options: ["Authority given in the partnership deed", "Authority that third parties reasonably assume a partner has", "Authority to act in emergencies", "Authority delegated by all partners"], correctOptionIndex: 1, explanation: "Section 19: Ostensible authority is the implied authority a partner appears to have in the normal course of the firm's business." },
  { id: 14, questionText: "A contract becomes void if it becomes impossible to perform after its formation. This is called:", options: ["Rescission", "Frustration (Supervening Impossibility)", "Novation", "Accord and Satisfaction"], correctOptionIndex: 1, explanation: "Section 56: Frustration (Doctrine of Supervening Impossibility) renders a contract void when performance becomes impossible due to unforeseen events." },
  { id: 15, questionText: "Which of the following is an example of a voidable contract?", options: ["Agreement to do an illegal act", "Contract obtained by coercion", "Agreement by a minor", "Wagering agreement"], correctOptionIndex: 1, explanation: "A contract obtained by coercion, fraud, undue influence, or misrepresentation is voidable at the option of the aggrieved party." },
  { id: 16, questionText: "Consideration moving from a third party is valid in India:", options: ["Never", "Only if it is monetary", "Yes, under Indian Contract Act", "Only with court approval"], correctOptionIndex: 2, explanation: "In India (unlike English law), consideration can move from a third party. The Indian Contract Act does not require consideration to come from the promisee." },
  { id: 17, questionText: "The Sale of Goods Act, 1930 applies to:", options: ["All goods including immovable property", "Movable goods only (excluding money)", "Services and goods", "Immovable property only"], correctOptionIndex: 1, explanation: "The Sale of Goods Act applies to movable goods (excludes actionable claims and money). Immovable property is governed by the Transfer of Property Act." },
  { id: 18, questionText: "A condition in a contract of sale is:", options: ["Incidental to the main purpose", "Collateral to the main purpose", "Stipulation essential to the main purpose", "An implied term only"], correctOptionIndex: 2, explanation: "Section 12: A condition is a stipulation essential to the main purpose of the contract. Its breach gives the right to repudiate the contract." },
  { id: 19, questionText: "Which of the following best describes 'void agreement'?", options: ["Agreement that can be set aside by one party", "Agreement without legal enforceability from the beginning", "Agreement pending court approval", "Agreement between parties of unequal bargaining power"], correctOptionIndex: 1, explanation: "A void agreement (e.g., agreement with a minor, wagering agreement) has no legal effect from the outset. It cannot be enforced by either party." },
  { id: 20, questionText: "Maximum number of partners in a banking firm is:", options: ["10", "20", "50", "100"], correctOptionIndex: 0, explanation: "Section 464, Companies Act 2013 & Rule 10: Maximum partners in a banking partnership = 10; in any other partnership = 100." },
  { id: 21, questionText: "Novation means:", options: ["Extension of contract period", "Substitution of a new contract for the original one", "Part performance of contract", "Partial waiver of claims"], correctOptionIndex: 1, explanation: "Novation (Section 62) replaces the original contract with a new one — either with new parties or new terms — discharging the original obligations." },
  { id: 22, questionText: "Breach of warranty entitles the aggrieved party to:", options: ["Reject the goods and claim damages", "Claim damages only", "Rescind the contract", "Both reject goods and rescind contract"], correctOptionIndex: 1, explanation: "Breach of warranty (a lesser stipulation) only entitles the buyer to claim damages, not to reject the goods or repudiate the contract." },
  { id: 23, questionText: "An agency by ratification requires:", options: ["Prior authority from principal", "The act was done on behalf of principal", "Written ratification only", "Consideration from the agent"], correctOptionIndex: 1, explanation: "Ratification: the principal retrospectively adopts an unauthorised act done on his behalf. The act must have been done in his name at the time." },
  { id: 24, questionText: "A wagering agreement is:", options: ["Void", "Voidable", "Valid but unenforceable", "Legal in some states"], correctOptionIndex: 0, explanation: "Section 30: Wagering (betting) agreements are void and cannot be enforced. Transactions contingent on collateral matters may be valid." },
  { id: 25, questionText: "The Indian Partnership Act was enacted in:", options: ["1872", "1930", "1932", "1956"], correctOptionIndex: 2, explanation: "The Indian Partnership Act 1932 governs the formation, operation, and dissolution of partnership firms in India." },
  { id: 26, questionText: "Transfer of property in goods from seller to buyer is called:", options: ["Delivery", "Sale", "Agreement to sell", "Bailment"], correctOptionIndex: 1, explanation: "Section 4, Sale of Goods Act: A sale involves the immediate transfer of property in goods. If transfer is future/conditional, it is an agreement to sell." },
  { id: 27, questionText: "A partner's implied authority does NOT include:", options: ["Buying goods for the firm", "Selling firm's goods", "Submitting a dispute to arbitration", "Opening a bank account"], correctOptionIndex: 2, explanation: "Section 19(2)(e): Submitting a dispute to arbitration requires express authority. Implied authority covers ordinary business acts only." },
  { id: 28, questionText: "Free consent means consent free from:", options: ["Consideration", "Coercion, undue influence, fraud, misrepresentation, and mistake", "Registration requirements", "Witness requirements"], correctOptionIndex: 1, explanation: "Section 14: Consent is free when not caused by coercion, undue influence, fraud, misrepresentation, or mistake." },
  { id: 29, questionText: "Which of the following discharges a contract by agreement?", options: ["Breach by one party", "Impossibility of performance", "Novation", "Government intervention"], correctOptionIndex: 2, explanation: "Novation (Section 62) is a mode of discharge by agreement — the original contract is replaced with a new one, releasing all parties." },
  { id: 30, questionText: "The right of stoppage in transit belongs to:", options: ["The buyer", "The unpaid seller when the buyer is insolvent", "Any creditor of the buyer", "The carrier"], correctOptionIndex: 1, explanation: "Section 50, Sale of Goods Act: An unpaid seller can stop goods in transit and resume possession when the buyer becomes insolvent." },
];

// CA Costing 30 questions
const costingQuestions: Question[] = [
  { id: 1, questionText: "Which costing method is most suitable for a construction company?", options: ["Process Costing", "Job Costing", "Contract Costing", "Batch Costing"], correctOptionIndex: 2, explanation: "Contract Costing (a variant of Job Costing) is used for long-term construction contracts where each contract is a separate cost unit." },
  { id: 2, questionText: "Fixed costs per unit:", options: ["Remain constant as output increases", "Decrease as output increases", "Increase as output increases", "Are always zero at zero output"], correctOptionIndex: 1, explanation: "Total fixed costs are constant, so fixed cost per unit decreases as output increases — they are spread over more units." },
  { id: 3, questionText: "The Break-Even Point is where:", options: ["Total revenue equals total variable cost", "Total revenue equals total fixed cost", "Total revenue equals total cost", "Contribution equals zero"], correctOptionIndex: 2, explanation: "BEP is the level of output/sales where Total Revenue = Total Cost (fixed + variable), resulting in neither profit nor loss." },
  { id: 4, questionText: "Contribution Margin = ", options: ["Sales − Fixed Costs", "Sales − Variable Costs", "Fixed Costs − Variable Costs", "Sales − Total Costs"], correctOptionIndex: 1, explanation: "Contribution = Sales − Variable Costs. It contributes first to recovering fixed costs, then to profit." },
  { id: 5, questionText: "P/V Ratio (Profit-Volume Ratio) is calculated as:", options: ["Fixed Cost / Sales", "Contribution / Sales × 100", "Profit / Sales × 100", "Variable Cost / Sales × 100"], correctOptionIndex: 1, explanation: "P/V Ratio = (Contribution / Sales) × 100. It shows what percentage of each rupee of sales contributes to fixed costs and profit." },
  { id: 6, questionText: "Under standard costing, a favourable material price variance means:", options: ["More material was used than standard", "Actual price was higher than standard price", "Actual price was lower than standard price", "Less material was used than standard"], correctOptionIndex: 2, explanation: "Material Price Variance = (Standard Price − Actual Price) × Actual Quantity. If actual price < standard price, the variance is favourable." },
  { id: 7, questionText: "Idle time variance is always:", options: ["Favourable", "Adverse", "Zero", "Dependent on output"], correctOptionIndex: 1, explanation: "Idle time variance = Idle Hours × Standard Labour Rate. Since idle time represents wasted capacity, it is always an adverse variance." },
  { id: 8, questionText: "In process costing, the cost of normal loss is:", options: ["Treated as period cost", "Added to the cost of good output", "Separately disclosed", "Charged to a provision account"], correctOptionIndex: 1, explanation: "Normal loss is an expected, unavoidable loss. Its cost is absorbed into the cost of good output (i.e., cost per unit increases)." },
  { id: 9, questionText: "Which of the following is NOT included in prime cost?", options: ["Direct material", "Direct labour", "Direct expenses", "Factory overhead"], correctOptionIndex: 3, explanation: "Prime Cost = Direct Material + Direct Labour + Direct Expenses. Factory overhead (indirect costs) is part of works cost, not prime cost." },
  { id: 10, questionText: "Absorption costing differs from marginal costing in that:", options: ["Variable costs are excluded", "Fixed overheads are included in product cost", "It is used only for external reporting", "It ignores direct labour"], correctOptionIndex: 1, explanation: "Absorption costing includes both variable and fixed overheads in product cost. Marginal costing treats fixed overheads as period costs." },
  { id: 11, questionText: "A flexible budget is prepared:", options: ["At one level of activity only", "At multiple levels of activity", "Only for fixed costs", "Only for direct costs"], correctOptionIndex: 1, explanation: "A flexible budget is recast at different levels of activity to reflect how costs change with output, unlike a fixed (static) budget." },
  { id: 12, questionText: "Labour efficiency variance measures:", options: ["Difference in wage rate paid vs standard", "Difference in hours worked vs standard hours for actual output", "Difference in output vs budgeted output", "Difference in total labour cost"], correctOptionIndex: 1, explanation: "Labour Efficiency Variance = (Standard Hours − Actual Hours) × Standard Rate. It measures productive use of labour time." },
  { id: 13, questionText: "The cost of spoilage beyond the normal limit is called:", options: ["Normal loss", "Abnormal loss", "Scrap", "Waste"], correctOptionIndex: 1, explanation: "Abnormal loss arises from unexpected causes (accidents, poor quality materials) beyond the expected normal loss. It is debited to Abnormal Loss Account." },
  { id: 14, questionText: "Which method values inventory at the cost of the most recently purchased items?", options: ["FIFO", "LIFO", "Weighted Average", "Specific Identification"], correctOptionIndex: 1, explanation: "LIFO (Last In, First Out) assumes the most recently purchased inventory is sold first, so closing stock is valued at older prices." },
  { id: 15, questionText: "Margin of Safety = ", options: ["Actual Sales − BEP Sales", "BEP Sales − Actual Sales", "Contribution − Fixed Costs", "Sales − Variable Costs"], correctOptionIndex: 0, explanation: "Margin of Safety = Actual Sales − Break-Even Sales. It shows how much sales can fall before the firm makes a loss." },
  { id: 16, questionText: "Cost-Volume-Profit (CVP) analysis assumes:", options: ["Costs are non-linear", "All costs are fixed within the relevant range", "Selling price is constant per unit", "Inventory levels change"], correctOptionIndex: 2, explanation: "CVP analysis assumes: selling price per unit is constant, costs are linear, and production equals sales (no inventory changes) within the relevant range." },
  { id: 17, questionText: "Selling overhead is classified as:", options: ["Prime cost", "Production overhead", "Period cost / Marketing cost", "Direct cost"], correctOptionIndex: 2, explanation: "Selling overheads (advertising, commissions, distribution) are period costs — not included in product cost under marginal or standard costing." },
  { id: 18, questionText: "Responsibility Accounting assigns costs and revenues to:", options: ["Products only", "Managers responsible for them", "Shareholders", "Customers"], correctOptionIndex: 1, explanation: "Responsibility Accounting holds managers accountable only for costs and revenues within their control, creating cost centres, profit centres, or investment centres." },
  { id: 19, questionText: "In job costing, each job is assigned:", options: ["A common overhead rate", "Its own unique job cost sheet", "The average cost of all jobs", "Only direct material costs"], correctOptionIndex: 1, explanation: "Each job in Job Costing has a unique cost sheet accumulating all direct materials, direct labour, and overheads attributed to it." },
  { id: 20, questionText: "Batch costing is appropriate when:", options: ["Each unit is unique", "Identical items are produced in groups", "Production is continuous", "Cost per hour is needed"], correctOptionIndex: 1, explanation: "Batch costing treats each batch as a cost unit. It is suitable for pharmaceuticals, bakeries, and component manufacturers making standard items in lots." },
  { id: 21, questionText: "Overhead absorption rate is computed as:", options: ["Actual overhead / Actual base", "Budgeted overhead / Budgeted base", "Actual overhead / Budgeted base", "Budgeted overhead / Actual base"], correctOptionIndex: 1, explanation: "Pre-determined (budgeted) OAR = Budgeted Overhead / Budgeted Activity Base. This is set before the period to allow timely product costing." },
  { id: 22, questionText: "Under-absorption of overheads means:", options: ["Absorbed overheads > Actual overheads", "Absorbed overheads < Actual overheads", "Absorbed overheads = Actual overheads", "No overheads were absorbed"], correctOptionIndex: 1, explanation: "Under-absorption occurs when absorbed overhead < actual overhead incurred. The shortfall is written off to Costing P&L as additional cost." },
  { id: 23, questionText: "Transfer pricing is relevant in:", options: ["Job costing", "Divisionalised (decentralised) organisations", "Process costing", "Batch costing"], correctOptionIndex: 1, explanation: "Transfer pricing sets the price at which goods/services are exchanged between divisions of the same organisation, affecting divisional performance measurement." },
  { id: 24, questionText: "Which of the following best defines 'sunk cost'?", options: ["Future cost that can be avoided", "Cost that has already been incurred and cannot be recovered", "Variable cost per unit", "Opportunity cost of a decision"], correctOptionIndex: 1, explanation: "Sunk costs are past costs that have already been incurred and are irrelevant to future decisions since they cannot be changed." },
  { id: 25, questionText: "Opportunity cost is:", options: ["The actual cost of the best alternative foregone", "The value of the next best alternative foregone", "A type of fixed overhead", "Recorded in the cost accounts"], correctOptionIndex: 1, explanation: "Opportunity cost is the value of the benefit sacrificed when choosing one option over the next best alternative. It is not recorded in accounts." },
  { id: 26, questionText: "Which variance arises due to a change in the mix of materials used?", options: ["Material Price Variance", "Material Usage Variance", "Material Mix Variance", "Material Yield Variance"], correctOptionIndex: 2, explanation: "Material Mix Variance measures the cost impact of using a different proportion of materials than the standard mix, while keeping total usage constant." },
  { id: 27, questionText: "At BEP, contribution equals:", options: ["Zero", "Variable cost", "Fixed cost", "Total cost"], correctOptionIndex: 2, explanation: "At the Break-Even Point, Contribution = Fixed Costs exactly, leaving zero profit. Above BEP, every unit of contribution becomes profit." },
  { id: 28, questionText: "Service costing is used in:", options: ["Manufacturing companies", "Transport, hospitals, and hotels", "Mining companies", "Agricultural firms"], correctOptionIndex: 1, explanation: "Service (operating) costing applies to organisations providing intangible services — transport companies (cost per km), hospitals (cost per patient-day), hotels (cost per room-night)." },
  { id: 29, questionText: "The main objective of cost accounting is:", options: ["Tax computation", "Ascertainment and control of costs", "Preparation of financial statements", "Dividend declaration"], correctOptionIndex: 1, explanation: "The primary objectives of cost accounting are: ascertaining the cost of products/services, controlling costs, and providing data for managerial decision-making." },
  { id: 30, questionText: "Profit under marginal costing vs absorption costing differs because:", options: ["Variable costs differ", "Fixed overhead treatment differs", "Direct labour rates differ", "Sales prices differ"], correctOptionIndex: 1, explanation: "The profit difference arises solely from how fixed overheads are treated: absorption costing defers fixed overhead in closing stock; marginal costing expenses all fixed overhead in the period." },
];

// CA Audit 30 questions (free set)
const auditQuestions: Question[] = [
  { id: 1, questionText: "The primary objective of an audit is:", options: ["Detection of fraud", "Preparation of financial statements", "Expression of an opinion on financial statements", "Tax computation"], correctOptionIndex: 2, explanation: "The primary objective is to enable the auditor to express an independent opinion on whether financial statements give a true and fair view." },
  { id: 2, questionText: "An audit conducted by an external independent auditor is called:", options: ["Internal Audit", "Statutory Audit", "Management Audit", "Operational Audit"], correctOptionIndex: 1, explanation: "Statutory Audit is mandated by law (e.g., Companies Act 2013) and is conducted by an independent external auditor." },
  { id: 3, questionText: "SA 200 deals with:", options: ["Audit Documentation", "Overall Objectives of the Independent Auditor", "Audit Sampling", "Going Concern"], correctOptionIndex: 1, explanation: "SA 200 'Overall Objectives of the Independent Auditor and the Conduct of an Audit in Accordance with Standards on Auditing' sets the auditor's primary objectives." },
  { id: 4, questionText: "Audit risk is the risk that:", options: ["The client commits fraud", "The auditor expresses an inappropriate opinion", "Financial statements contain errors", "The auditor charges excessive fees"], correctOptionIndex: 1, explanation: "Audit Risk = Risk that the auditor expresses an inappropriate audit opinion when the financial statements are materially misstated. AR = IR × CR × DR." },
  { id: 5, questionText: "Which of the following is NOT a component of audit risk?", options: ["Inherent Risk", "Control Risk", "Detection Risk", "Business Risk"], correctOptionIndex: 3, explanation: "Audit Risk has three components: Inherent Risk (IR), Control Risk (CR), and Detection Risk (DR). Business Risk is a separate concept." },
  { id: 6, questionText: "Audit evidence that is obtained directly by the auditor is considered:", options: ["More reliable", "Less reliable", "Not relevant", "Circumstantial"], correctOptionIndex: 0, explanation: "SA 500: Evidence obtained directly by the auditor (physical inspection, observation, recalculation) is generally more reliable than evidence provided by the client." },
  { id: 7, questionText: "The concept of materiality in auditing means:", options: ["All errors must be reported", "Only errors that could influence users' decisions need be reported", "Only quantitative errors matter", "Errors below ₹1,000 are ignored"], correctOptionIndex: 1, explanation: "Materiality: information is material if its omission or misstatement could reasonably influence the economic decisions of users of the financial statements." },
  { id: 8, questionText: "An auditor's working papers are:", options: ["Property of the client", "Property of the auditor", "Filed with the regulator", "Shared with shareholders"], correctOptionIndex: 1, explanation: "Working papers (audit documentation) are the property of the auditor. They may not be disclosed to third parties without client consent, except as required by law." },
  { id: 9, questionText: "Internal control is designed to provide:", options: ["Absolute assurance", "Reasonable assurance", "No assurance", "Legal protection"], correctOptionIndex: 1, explanation: "Internal controls provide reasonable, not absolute, assurance because of inherent limitations (human error, management override, cost constraints)." },
  { id: 10, questionText: "Vouching is the verification of:", options: ["Physical assets", "Accounting entries with supporting documents", "Bank balances only", "Only revenue transactions"], correctOptionIndex: 1, explanation: "Vouching is the examination of documentary evidence (vouchers, invoices, receipts) supporting accounting entries to verify their authenticity and accuracy." },
  { id: 11, questionText: "An 'Emphasis of Matter' paragraph in an audit report:", options: ["Modifies the audit opinion", "Draws attention to a matter properly disclosed in the financial statements", "Indicates a qualified opinion", "Replaces the opinion paragraph"], correctOptionIndex: 1, explanation: "SA 706: An Emphasis of Matter paragraph highlights a matter properly disclosed in the financial statements that the auditor considers fundamental. It does not modify the opinion." },
  { id: 12, questionText: "Which SA deals with audit sampling?", options: ["SA 315", "SA 500", "SA 530", "SA 560"], correctOptionIndex: 2, explanation: "SA 530 'Audit Sampling' provides guidance on designing, selecting, and evaluating a sample to draw conclusions about the population." },
  { id: 13, questionText: "Verification of assets involves checking their:", options: ["Existence only", "Existence, ownership, valuation, and disclosure", "Cost only", "Market value only"], correctOptionIndex: 1, explanation: "Asset verification covers: Existence (physically present), Ownership (belongs to entity), Valuation (correctly measured), and Disclosure (properly presented)." },
  { id: 14, questionText: "The going concern assumption means the entity will:", options: ["Cease operations within 12 months", "Continue operating for the foreseeable future", "Be liquidated at year end", "Only operate for one more year"], correctOptionIndex: 1, explanation: "SA 570: Going concern assumes the entity will continue to operate for the foreseeable future (at least 12 months from the reporting date)." },
  { id: 15, questionText: "Audit programme is:", options: ["A schedule of audit fees", "A detailed plan of audit procedures", "A report on internal control weaknesses", "The final audit report"], correctOptionIndex: 1, explanation: "An audit programme lists specific audit procedures (tests, checks, inquiries) to be performed, including their timing, extent, and responsible staff." },
  { id: 16, questionText: "Statistical sampling in auditing allows the auditor to:", options: ["Eliminate audit risk", "Quantify sampling risk", "Avoid testing altogether", "Guarantee accuracy"], correctOptionIndex: 1, explanation: "Statistical sampling uses probability theory to quantify sampling risk, allowing the auditor to make statistically valid inferences about the population." },
  { id: 17, questionText: "An adverse opinion is issued when:", options: ["There is a minor misstatement", "Misstatements are material but not pervasive", "Misstatements are material and pervasive", "The auditor cannot obtain sufficient evidence"], correctOptionIndex: 2, explanation: "SA 705: An adverse opinion is expressed when misstatements are both material AND pervasive to the financial statements as a whole." },
  { id: 18, questionText: "Substantive procedures are designed to:", options: ["Test the design of controls", "Detect material misstatements in account balances and transactions", "Evaluate management's competence", "Review audit committee minutes"], correctOptionIndex: 1, explanation: "Substantive procedures (tests of details and analytical procedures) directly test the accuracy and completeness of financial statement amounts and disclosures." },
  { id: 19, questionText: "SA 315 requires the auditor to understand:", options: ["Only the financial statements", "The entity and its environment, including internal controls", "Only the industry", "Only prior year audit findings"], correctOptionIndex: 1, explanation: "SA 315 'Identifying and Assessing the Risks of Material Misstatement' requires a thorough understanding of the entity, environment, and its internal controls." },
  { id: 20, questionText: "The standard audit report on financial statements includes:", options: ["A section on Management's Responsibility only", "Auditor's opinion, basis, and key audit matters (for listed entities)", "Only the auditor's signature", "Only the opinion paragraph"], correctOptionIndex: 1, explanation: "A modern audit report includes: title, addressee, opinion paragraph, basis for opinion, going concern, KAMs (listed entities), management/auditor responsibilities, and signature." },
  { id: 21, questionText: "Audit of accounts receivable would typically include:", options: ["Physical verification", "Confirmation from debtors, review of ageing, and cut-off tests", "Only examining invoices", "Re-performing the sales cycle"], correctOptionIndex: 1, explanation: "Receivables audit includes: external confirmation (circularisation), ageing analysis, cut-off testing, and reviewing subsequent receipts." },
  { id: 22, questionText: "When the auditor is unable to obtain sufficient appropriate evidence, they issue:", options: ["Adverse opinion", "Disclaimer of opinion", "Unmodified opinion", "Emphasis of Matter"], correctOptionIndex: 1, explanation: "SA 705: A Disclaimer of Opinion is issued when the auditor cannot obtain sufficient appropriate audit evidence and the possible effects could be material and pervasive." },
  { id: 23, questionText: "CARO 2020 applies to:", options: ["All companies", "Specified companies (excluding certain small companies and banking companies)", "Only listed companies", "Only government companies"], correctOptionIndex: 1, explanation: "CARO 2020 applies to companies registered under the Companies Act 2013, excluding certain small companies, private companies below specified thresholds, and banking/insurance companies." },
  { id: 24, questionText: "Rotation of statutory auditors for listed companies is required every:", options: ["3 years", "5 years", "10 years", "15 years"], correctOptionIndex: 1, explanation: "Section 139, Companies Act 2013: Listed companies must rotate their statutory auditor (individual or firm) every 5 years (one term = 5 years, maximum 2 terms for a firm)." },
  { id: 25, questionText: "Test of controls is performed to:", options: ["Detect material misstatements in transactions", "Evaluate the operating effectiveness of internal controls", "Verify cash balances", "Assess management's integrity"], correctOptionIndex: 1, explanation: "Tests of controls evaluate whether internal controls were operating effectively throughout the period, allowing the auditor to rely on them and reduce substantive testing." },
  { id: 26, questionText: "The auditor's independence is most important for:", options: ["Completing the audit quickly", "Ensuring the opinion is objective and unbiased", "Reducing audit fees", "Maintaining client confidentiality"], correctOptionIndex: 1, explanation: "Auditor independence (in mind and appearance) is the cornerstone of audit quality — it ensures the opinion is objective and not influenced by the client's management." },
  { id: 27, questionText: "Cut-off procedures ensure that:", options: ["All assets are physically verified", "Transactions are recorded in the correct accounting period", "Bank balances match the ledger", "Depreciation is correctly calculated"], correctOptionIndex: 1, explanation: "Cut-off testing verifies that transactions near the year-end are recorded in the correct period — preventing window dressing and ensuring period accuracy." },
  { id: 28, questionText: "An internal auditor is employed by:", options: ["The government", "The organisation being audited", "The ICAI", "External shareholders"], correctOptionIndex: 1, explanation: "Internal auditors are employees (or external consultants) of the organisation itself. Unlike external auditors, their primary accountability is to management/the audit committee." },
  { id: 29, questionText: "Which of the following is an example of analytical procedure?", options: ["Physically counting inventory", "Confirming balances with banks", "Comparing current year's gross margin % with prior year", "Inspecting title deeds"], correctOptionIndex: 2, explanation: "Analytical procedures involve evaluating financial information by studying plausible relationships — e.g., comparing ratios, trends, or prior year data to identify unusual fluctuations." },
  { id: 30, questionText: "The audit committee of a listed company must have at least:", options: ["Two independent directors", "Three directors with majority being independent", "Five members", "One external auditor"], correctOptionIndex: 1, explanation: "Section 177, Companies Act 2013: The audit committee must have minimum 3 directors, with a majority being independent directors. The chairperson must be independent." },
];

export const mcqSets: MCQSet[] = [
  {
    id: "ca-accounting-free",
    title: "Accounting Fundamentals",
    description: "30 essential MCQs covering double-entry, financial statements, and partnership accounts — mapped to CA Foundation syllabus.",
    isFree: true,
    subject: "Accounting",
    questions: accountingQuestions,
  },
  {
    id: "ca-law-foundation",
    title: "Business Laws — Foundation",
    description: "30 MCQs on Indian Contract Act, Sale of Goods Act, and Partnership Act for CA Foundation aspirants.",
    isFree: false,
    price: 49,
    subject: "Law",
    questions: lawQuestions,
  },
  {
    id: "ca-costing-inter",
    title: "Cost & Management Accounting",
    description: "30 MCQs covering costing methods, marginal costing, standard costing, and budgeting for CA Intermediate.",
    isFree: false,
    price: 49,
    subject: "Costing",
    questions: costingQuestions,
  },
  {
    id: "ca-audit-free",
    title: "Audit & Assurance — Free Set",
    description: "30 free MCQs on SA standards, audit procedures, and internal controls for CA Intermediate aspirants.",
    isFree: true,
    subject: "Audit",
    questions: auditQuestions,
  },
];

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
  { id: "pv-001", studentEmail: "aditya.sharma@gmail.com", courseTitle: "CA Foundation — Accounting", amount: 1299, date: "2026-07-14", status: "pending", utrNumber: "UTR4892019384" },
  { id: "pv-002", studentEmail: "priya.nair@gmail.com", courseTitle: "CA Intermediate — Taxation (IT + GST)", amount: 1899, date: "2026-07-15", status: "pending", utrNumber: "UTR8812093412" },
  { id: "pv-003", studentEmail: "rohan.mehta@outlook.com", courseTitle: "CA Intermediate — Cost & Management Accounting", amount: 1499, date: "2026-07-15", status: "approved", utrNumber: "UTR2234819823" },
  { id: "pv-004", studentEmail: "sneha.gupta@yahoo.com", courseTitle: "CA Final — Full Mock Test Series", amount: 799, date: "2026-07-16", status: "pending", utrNumber: "UTR9920345102" },
  { id: "pv-005", studentEmail: "karthik.iyer@gmail.com", courseTitle: "CA Foundation — Business Laws", amount: 999, date: "2026-07-16", status: "rejected", utrNumber: "UTR5567238902" },
  { id: "pv-006", studentEmail: "meera.pillai@gmail.com", courseTitle: "CA Intermediate — Taxation (IT + GST)", amount: 1899, date: "2026-07-12", status: "approved", utrNumber: "UTR1123445566" },
  { id: "pv-007", studentEmail: "vijay.singh@gmail.com", courseTitle: "CA Foundation — Accounting", amount: 1299, date: "2026-07-10", status: "refunded", utrNumber: "UTR7788990011" },
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
    id: "u-001",
    email: "aditya.sharma@gmail.com",
    joinDate: "2026-07-14",
    purchases: [{ courseTitle: "CA Foundation — Accounting", amount: 1299, date: "2026-07-14" }],
    quizAttempts: [{ setTitle: "Accounting Fundamentals", score: 22, total: 30, date: "2026-07-15" }],
  },
  {
    id: "u-002",
    email: "priya.nair@gmail.com",
    joinDate: "2026-07-15",
    purchases: [{ courseTitle: "CA Intermediate — Taxation (IT + GST)", amount: 1899, date: "2026-07-15" }],
    quizAttempts: [
      { setTitle: "Accounting Fundamentals", score: 18, total: 30, date: "2026-07-15" },
      { setTitle: "Audit & Assurance — Free Set", score: 25, total: 30, date: "2026-07-16" },
    ],
  },
  {
    id: "u-003",
    email: "rohan.mehta@outlook.com",
    joinDate: "2026-07-10",
    purchases: [
      { courseTitle: "CA Intermediate — Cost & Management Accounting", amount: 1499, date: "2026-07-11" },
      { courseTitle: "CA Final — Full Mock Test Series", amount: 799, date: "2026-07-15" },
    ],
    quizAttempts: [
      { setTitle: "Cost & Management Accounting", score: 27, total: 30, date: "2026-07-12" },
      { setTitle: "Audit & Assurance — Free Set", score: 20, total: 30, date: "2026-07-13" },
    ],
  },
  {
    id: "u-004",
    email: "sneha.gupta@yahoo.com",
    joinDate: "2026-07-16",
    purchases: [{ courseTitle: "CA Final — Full Mock Test Series", amount: 799, date: "2026-07-16" }],
    quizAttempts: [],
  },
  {
    id: "u-005",
    email: "meera.pillai@gmail.com",
    joinDate: "2026-07-01",
    purchases: [{ courseTitle: "CA Intermediate — Taxation (IT + GST)", amount: 1899, date: "2026-07-01" }],
    quizAttempts: [
      { setTitle: "Accounting Fundamentals", score: 29, total: 30, date: "2026-07-03" },
      { setTitle: "Business Laws — Foundation", score: 24, total: 30, date: "2026-07-05" },
    ],
  },
];
