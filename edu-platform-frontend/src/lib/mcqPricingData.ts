export type MCQLevel = "FINAL" | "INTERMEDIATE" | "FOUNDATIONS";
export type PricingDuration = "1_month" | "3_months" | "6_months" | "1_year";

export interface DurationPriceMap {
  "1_month": number;
  "3_months": number;
  "6_months": number;
  "1_year": number;
}

export interface MCQSubject {
  id: string;
  level: MCQLevel;
  groupName: string; // "Group I" | "Group II" | "All"
  name: string;
  code: string;
  description: string;
  prices: DurationPriceMap;
  isPopular?: boolean;
  testCount?: number;
  questionCount?: number;
  accentGradient?: string;
}

export interface MCQBundle {
  id: string;
  title: string;
  level: MCQLevel;
  groupName: string;
  subjectIds: string[];
  prices: DurationPriceMap;
  badge?: string;
  isCustom?: boolean;
}

export const DURATION_LABELS: Record<PricingDuration, { label: string; tag: string; discountText?: string }> = {
  "1_month": { label: "1 Month", tag: "Flexible", discountText: "Standard Rate" },
  "3_months": { label: "3 Months", tag: "Popular", discountText: "Save ~20%" },
  "6_months": { label: "6 Months", tag: "Value", discountText: "Save ~35%" },
  "1_year": { label: "1 Year", tag: "Best Value", discountText: "Save ~50%" },
};

// ─── INITIAL PRICING MATRIX ──────────────────────────────────────────────────

export const INITIAL_MCQ_SUBJECTS: MCQSubject[] = [
  // FINAL
  {
    id: "final-g1-fr",
    level: "FINAL",
    groupName: "Group I",
    name: "Financial Reporting",
    code: "FR",
    description: "Complete Ind AS standards, corporate financial reporting & case scenario practice.",
    prices: { "1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500 },
    isPopular: true,
    testCount: 15,
    questionCount: 450,
    accentGradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
  },
  {
    id: "final-g1-afm",
    level: "FINAL",
    groupName: "Group I",
    name: "Advanced Financial Management",
    code: "AFM",
    description: "Derivatives, forex exposure, portfolio theory, security analysis & valuation.",
    prices: { "1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625 },
    testCount: 18,
    questionCount: 520,
    accentGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
  },
  {
    id: "final-g1-audit",
    level: "FINAL",
    groupName: "Group I",
    name: "Advanced Auditing & Professional Ethics",
    code: "Audit",
    description: "Engagement standards, professional ethics, CARO, internal controls & group audits.",
    prices: { "1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500 },
    testCount: 14,
    questionCount: 420,
    accentGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
  },
  {
    id: "final-g2-dt",
    level: "FINAL",
    groupName: "Group II",
    name: "Direct Tax Laws & International Taxation",
    code: "DT",
    description: "Comprehensive corporate taxation, transfer pricing, appeals & international tax treaties.",
    prices: { "1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500 },
    isPopular: true,
    testCount: 16,
    questionCount: 480,
    accentGradient: "from-purple-500/20 via-pink-500/10 to-transparent",
  },
  {
    id: "final-g2-idt",
    level: "FINAL",
    groupName: "Group II",
    name: "Indirect Tax Laws (GST & Customs)",
    code: "IDT",
    description: "GST input tax credit, assessment, refunds, customs valuation & Foreign Trade Policy.",
    prices: { "1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500 },
    testCount: 14,
    questionCount: 430,
    accentGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
  },
  {
    id: "final-g2-case",
    level: "FINAL",
    groupName: "Group II",
    name: "Law + SCMPE + IBS Case Studies",
    code: "Case Studies",
    description: "Integrated Business Solutions multi-disciplinary cases, strategic costing & business laws.",
    prices: { "1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625 },
    testCount: 20,
    questionCount: 600,
    accentGradient: "from-rose-500/20 via-orange-500/10 to-transparent",
  },

  // INTERMEDIATE
  {
    id: "inter-g1-adv-acc",
    level: "INTERMEDIATE",
    groupName: "Group I",
    name: "Advanced Accounting",
    code: "Adv Accounting",
    description: "Company accounts, accounting standards, consolidation, buybacks & internal reconstruction.",
    prices: { "1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400 },
    isPopular: true,
    testCount: 14,
    questionCount: 400,
    accentGradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
  },
  {
    id: "inter-g1-corp-law",
    level: "INTERMEDIATE",
    groupName: "Group I",
    name: "Corporate and Other Laws",
    code: "Corp Laws",
    description: "Companies Act 2013 provisions, LLP Act, interpretation of statutes & General Clauses.",
    prices: { "1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400 },
    testCount: 12,
    questionCount: 360,
    accentGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
  },
  {
    id: "inter-g1-tax",
    level: "INTERMEDIATE",
    groupName: "Group I",
    name: "Taxation",
    code: "Taxation",
    description: "Heads of income, total income computation, TDS/TCS & basics of Goods and Services Tax.",
    prices: { "1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400 },
    isPopular: true,
    testCount: 15,
    questionCount: 450,
    accentGradient: "from-purple-500/20 via-pink-500/10 to-transparent",
  },
  {
    id: "inter-g2-cost",
    level: "INTERMEDIATE",
    groupName: "Group II",
    name: "Cost and Management Accounting",
    code: "Costing",
    description: "Material, labor, overheads, marginal costing, standard costing & budgetary control.",
    prices: { "1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400 },
    testCount: 14,
    questionCount: 420,
    accentGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
  },
  {
    id: "inter-g2-audit",
    level: "INTERMEDIATE",
    groupName: "Group II",
    name: "Auditing and Ethics",
    code: "Audit & Ethics",
    description: "Nature, objective and scope of audit, internal controls, audit sampling & code of ethics.",
    prices: { "1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400 },
    testCount: 12,
    questionCount: 380,
    accentGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
  },
  {
    id: "inter-g2-fm-sm",
    level: "INTERMEDIATE",
    groupName: "Group II",
    name: "Financial Management & Strategic Management",
    code: "FM & SM",
    description: "Ratio analysis, cost of capital, capital budgeting, strategic choice & execution.",
    prices: { "1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400 },
    testCount: 14,
    questionCount: 410,
    accentGradient: "from-rose-500/20 via-orange-500/10 to-transparent",
  },

  // FOUNDATIONS
  {
    id: "found-quant",
    level: "FOUNDATIONS",
    groupName: "All",
    name: "Quantitative Aptitude",
    code: "Quant",
    description: "Business mathematics, ratios, equations, calculus, logical reasoning & statistics.",
    prices: { "1_month": 200, "3_months": 400, "6_months": 500, "1_year": 625 },
    isPopular: true,
    testCount: 16,
    questionCount: 500,
    accentGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
  },
  {
    id: "found-eco",
    level: "FOUNDATIONS",
    groupName: "All",
    name: "Business Economics",
    code: "Economics",
    description: "Demand and supply analysis, production and cost, market forms & Indian economic development.",
    prices: { "1_month": 150, "3_months": 300, "6_months": 400, "1_year": 500 },
    testCount: 14,
    questionCount: 420,
    accentGradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
  },
];

export const INITIAL_MCQ_BUNDLES: MCQBundle[] = [
  // FINAL
  {
    id: "final-bundle-g1",
    title: "Group I All Subjects",
    level: "FINAL",
    groupName: "Group I",
    subjectIds: ["final-g1-fr", "final-g1-afm", "final-g1-audit"],
    prices: { "1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500 },
    badge: "Group 1 Bundle",
  },
  {
    id: "final-bundle-g2",
    title: "Group II All Subjects",
    level: "FINAL",
    groupName: "Group II",
    subjectIds: ["final-g2-dt", "final-g2-idt", "final-g2-case"],
    prices: { "1_month": 450, "3_months": 900, "6_months": 1200, "1_year": 1500 },
    badge: "Group 2 Bundle",
  },
  {
    id: "final-bundle-both",
    title: "Both Groups Super Bundle",
    level: "FINAL",
    groupName: "Both Groups",
    subjectIds: ["final-g1-fr", "final-g1-afm", "final-g1-audit", "final-g2-dt", "final-g2-idt", "final-g2-case"],
    prices: { "1_month": 900, "3_months": 1800, "6_months": 2400, "1_year": 3000 },
    badge: "Super Saver Bundle",
  },

  // INTERMEDIATE
  {
    id: "inter-bundle-g1",
    title: "Group I All Subjects",
    level: "INTERMEDIATE",
    groupName: "Group I",
    subjectIds: ["inter-g1-adv-acc", "inter-g1-corp-law", "inter-g1-tax"],
    prices: { "1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000 },
    badge: "Group 1 Bundle",
  },
  {
    id: "inter-bundle-g2",
    title: "Group II All Subjects",
    level: "INTERMEDIATE",
    groupName: "Group II",
    subjectIds: ["inter-g2-cost", "inter-g2-audit", "inter-g2-fm-sm"],
    prices: { "1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000 },
    badge: "Group 2 Bundle",
  },
  {
    id: "inter-bundle-both",
    title: "Both Groups Super Bundle",
    level: "INTERMEDIATE",
    groupName: "Both Groups",
    subjectIds: ["inter-g1-adv-acc", "inter-g1-corp-law", "inter-g1-tax", "inter-g2-cost", "inter-g2-audit", "inter-g2-fm-sm"],
    prices: { "1_month": 500, "3_months": 1000, "6_months": 1600, "1_year": 2000 },
    badge: "Super Saver Bundle",
  },

  // FOUNDATIONS
  {
    id: "found-bundle-all",
    title: "All Subjects Complete Bundle",
    level: "FOUNDATIONS",
    groupName: "All",
    subjectIds: ["found-quant", "found-eco"],
    prices: { "1_month": 300, "3_months": 650, "6_months": 800, "1_year": 1000 },
    badge: "Complete Bundle",
  },
];

// ─── CART & SMART UPSELL CALCULATION ENGINE ─────────────────────────────────

export interface SmartUpsellData {
  type: "group_upgrade" | "both_groups_upgrade" | "custom_bundle";
  group: string;
  bundleId: string;
  bundleTitle: string;
  subjectIds: string[];
  bundlePrice: number;
  originalSum: number;
  savings: number;
  message: string;
}

export interface MCQCartCalculation {
  level: MCQLevel;
  duration: PricingDuration;
  selectedSubjectIds: string[];
  realTotalPrice: number;
  discountedPrice: number;
  savingsAmount: number;
  savingsPercentage: number;
  appliedBundle?: MCQBundle;
  upsellRecommendation?: SmartUpsellData;
}

export function normalizeMCQSubject(raw: any): MCQSubject {
  return {
    id: raw.id || "",
    level: ((raw.level || "FINAL").toUpperCase()) as MCQLevel,
    groupName: raw.groupName || raw.group_name || "All",
    name: raw.name || "",
    code: raw.code || "",
    description: raw.description || "",
    prices: raw.prices || { "1_month": 99, "3_months": 200, "6_months": 300, "1_year": 400 },
    isPopular: raw.isPopular ?? raw.is_popular ?? false,
    testCount: raw.testCount ?? raw.test_count ?? 15,
    questionCount: raw.questionCount ?? raw.question_count ?? 450,
    accentGradient: raw.accentGradient ?? raw.accent_gradient ?? "from-blue-500/20 via-indigo-500/10 to-transparent",
  };
}

export function normalizeMCQBundle(raw: any): MCQBundle {
  return {
    id: raw.id || "",
    title: raw.title || "",
    level: ((raw.level || "FINAL").toUpperCase()) as MCQLevel,
    groupName: raw.groupName || raw.group_name || "All",
    subjectIds: raw.subjectIds || raw.subject_ids || [],
    prices: raw.prices || { "1_month": 250, "3_months": 500, "6_months": 800, "1_year": 1000 },
    badge: raw.badge || "",
    isCustom: raw.isCustom ?? raw.is_custom ?? false,
  };
}

export function calculateMCQCartPrice(
  level: MCQLevel,
  selectedSubjectIds: string[],
  duration: PricingDuration = "1_month",
  customSubjects: MCQSubject[] = INITIAL_MCQ_SUBJECTS,
  customBundles: MCQBundle[] = INITIAL_MCQ_BUNDLES
): MCQCartCalculation {
  const normSubs = (customSubjects || []).map(normalizeMCQSubject);
  const normBundles = (customBundles || []).map(normalizeMCQBundle);

  const levelSubjects = normSubs.filter((s) => s.level === level);
  const subMap = new Map(levelSubjects.map((s) => [s.id, s]));
  const selected = selectedSubjectIds.map((id) => subMap.get(id)).filter(Boolean) as MCQSubject[];

  // Sum of individual selected subjects
  const realTotal = selected.reduce((sum, s) => sum + (s.prices?.[duration] || 0), 0);

  // Check matching bundles
  const selectedSet = new Set(selectedSubjectIds);
  const levelBundles = normBundles.filter((b) => b.level === level);

  let discountedPrice = realTotal;
  let bestBundle: MCQBundle | undefined = undefined;

  for (const b of levelBundles) {
    const bSubIds = b.subjectIds || [];
    const bundleSet = new Set(bSubIds);
    if (bundleSet.size > 0 && Array.from(bundleSet).every((id) => selectedSet.has(id))) {
      const bPrice = b.prices?.[duration] || 0;
      // Remaining subjects
      const remainingIds = selectedSubjectIds.filter((id) => !bundleSet.has(id));
      const remPrice = remainingIds.reduce((sum, id) => {
        const s = subMap.get(id);
        return sum + (s?.prices?.[duration] || 0);
      }, 0);
      const totalCandidate = bPrice + remPrice;

      if (totalCandidate < discountedPrice) {
        discountedPrice = totalCandidate;
        bestBundle = b;
      }
    }
  }

  const savings = Math.max(0, realTotal - discountedPrice);
  const savingsPct = realTotal > 0 ? Math.round((savings / realTotal) * 100) : 0;

  // Smart Upsell Logic
  let upsell: SmartUpsellData | undefined = undefined;

  if (selected.length > 0 && selected.length < levelSubjects.length) {
    const firstSub = selected[0];
    const group = firstSub.groupName;
    const groupSubjects = levelSubjects.filter((s) => s.groupName === group || group === "All");
    const groupSubIds = new Set(groupSubjects.map((s) => s.id));

    // If user has not selected the entire group, recommend the Group Bundle
    if (!Array.from(groupSubIds).every((id) => selectedSet.has(id))) {
      const gBundle = levelBundles.find((b) => b.groupName === group);
      if (gBundle) {
        const bPrice = gBundle.prices?.[duration] || 0;
        const fullBaseSum = groupSubjects.reduce((sum, s) => sum + (s.prices?.[duration] || 0), 0);
        upsell = {
          type: "group_upgrade",
          group: group,
          bundleId: gBundle.id,
          bundleTitle: gBundle.title,
          subjectIds: gBundle.subjectIds || [],
          bundlePrice: bPrice,
          originalSum: fullBaseSum,
          savings: Math.max(0, fullBaseSum - bPrice),
          message: `Get all ${group} subjects for just ₹${bPrice}${duration === "1_month" ? "/mo" : ""} (Normally ₹${fullBaseSum})`,
        };
      }
    } else if (level !== "FOUNDATIONS" && selectedSet.size < levelSubjects.length) {
      // User has selected full Group 1 or full Group 2, recommend Both Groups Super Bundle
      const bothBundle = levelBundles.find((b) => b.groupName === "Both Groups");
      if (bothBundle) {
        const bPrice = bothBundle.prices?.[duration] || 0;
        const fullBaseSum = levelSubjects.reduce((sum, s) => sum + (s.prices?.[duration] || 0), 0);
        upsell = {
          type: "both_groups_upgrade",
          group: "Both Groups",
          bundleId: bothBundle.id,
          bundleTitle: bothBundle.title,
          subjectIds: bothBundle.subjectIds || [],
          bundlePrice: bPrice,
          originalSum: fullBaseSum,
          savings: Math.max(0, fullBaseSum - bPrice),
          message: `Upgrade to Both Groups Super Bundle for just ₹${bPrice}${duration === "1_month" ? "/mo" : ""} (Normally ₹${fullBaseSum})`,
        };
      }
    }
  }

  return {
    level,
    duration,
    selectedSubjectIds,
    realTotalPrice: realTotal,
    discountedPrice,
    savingsAmount: savings,
    savingsPercentage: savingsPct,
    appliedBundle: bestBundle,
    upsellRecommendation: upsell,
  };
}
