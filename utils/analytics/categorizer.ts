// utils/analytics/categorizer.ts

import modelData from "./category_model.json";
import { categorizeTransactionSemantic } from "./semanticCategorizer";

/* ---------------- In-Memory Cache ---------------- */

// narration+type → category
const semanticCache = new Map<string, string>();

// optional: prevent unlimited growth
const MAX_CACHE_SIZE = 1000;


/* ---------------- FinWin Categories ---------------- */
const DEFAULT_CATEGORY = "Others";

/* ---------------- Merchant Override Rules ---------------- */
const MERCHANT_RULES: [string, string[]][] = [
  [
    "Food",
    [
      "swiggy",
      "zomato",
      "domino",
      "pizza",
      "mcd",
      "kfc",
      "lunch",
      "dinner",
      "restaurant",
      "cafe",
      "meal",
      "snacks",
      "milk",
      "tea",
      "coffee",
    ],
  ],
  ["Travel & Commute", ["uber", "ola", "rapido", "metro", "bus", "train"]],
  ["Entertainment", ["netflix", "spotify", "prime", "hotstar", "movie"]],
  ["Shopping", ["amazon", "flipkart", "myntra", "zara"]],
  ["Bills & Utilities", ["electricity", "water bill", "gas bill", "wifi", "broadband"]],
  ["Recharge/Topup", ["recharge", "topup", "dth", "prepaid", "postpaid"]],
  ["Transfer/UPI", ["upi", "neft", "rtgs", "imps", "phonepe", "gpay", "paytm"]],
  ["Health & Medical", ["gym", "fitness", "yoga", "workout", "doctor", "pharmacy"]],
];

/* ---------------- Credit Keywords ---------------- */
const INCOME_KEYWORDS = ["salary", "payroll", "credited", "income", "stipend"];
const REFUND_KEYWORDS = ["refund", "reversal", "chargeback", "cashback"];

/* ---------------- Confidence Threshold ---------------- */
const CONFIDENCE_THRESHOLD = 0.15;

/* ---------------- Model JSON Type ---------------- */
type ModelJSON = {
  vocabulary: Record<string, number>;
  idf: number[];
  categories: string[];
  coefficients: number[][];
  intercepts: number[];
};

const model = modelData as ModelJSON;

/* ---------------- TF-IDF Vectorizer ---------------- */
function vectorize(text: string): number[] {
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  const vec = new Array(model.idf.length).fill(0);

  for (let i = 0; i < tokens.length; i++) {
    const unigram = tokens[i];
    const bigram = i < tokens.length - 1 ? `${tokens[i]} ${tokens[i + 1]}` : null;

    [unigram, bigram].forEach(term => {
      if (!term) return;
      const idx = model.vocabulary[term];
      if (idx !== undefined) vec[idx] += 1;
    });
  }

  return vec.map((tf, i) => tf * model.idf[i]);
}

/* ---------------- Linear SVM Prediction ---------------- */
function predictCategory(vec: number[]): { category: string; score: number } {
  let bestScore = -Infinity;
  let bestIndex = -1;

  for (let c = 0; c < model.categories.length; c++) {
    const weights = model.coefficients[c];
    const bias = model.intercepts[c];

    let score = bias;
    for (let i = 0; i < vec.length; i++) score += vec[i] * weights[i];

    if (score > bestScore) {
      bestScore = score;
      bestIndex = c;
    }
  }

  return {
    category: model.categories[bestIndex] ?? DEFAULT_CATEGORY,
    score: bestScore,
  };
}

/* ========================================================= */
/*   1️⃣ OLD SYNC VERSION (Backwards Compatible Everywhere)   */
/* ========================================================= */

export function categorizeTransaction(
  narration: string,
  trxtype: "credit" | "debit"
): string {
  if (!narration) return DEFAULT_CATEGORY;

  const n = narration.toLowerCase();

  // Merchant override first
  for (const [category, keywords] of MERCHANT_RULES) {
    if (keywords.some(k => n.includes(k))) return category;
  }

  // Credit rules
  if (trxtype === "credit") {
    if (INCOME_KEYWORDS.some(k => n.includes(k))) return "Salary / Income";
    if (REFUND_KEYWORDS.some(k => n.includes(k))) return "Refund";
    if (n.includes("recharge") || n.includes("topup")) return "Wallet Top-up Return";
    return "Transfer In";
  }

  // TF-IDF fallback (fast)
  const vec = vectorize(n);
  const result = predictCategory(vec);

  if (result.score < CONFIDENCE_THRESHOLD) return DEFAULT_CATEGORY;
  return result.category;
}

/* ========================================================= */
/*   2️⃣ SMART ASYNC VERSION (Semantic Embedding Power)        */
/* ========================================================= */

export async function categorizeTransactionSmart(
  narration: string,
  trxtype: "credit" | "debit"
): Promise<string> {
  if (!narration) return DEFAULT_CATEGORY;

  const n = narration.toLowerCase();

  /* ---------- 1. Merchant override always wins ---------- */
  for (const [category, keywords] of MERCHANT_RULES) {
    if (keywords.some(k => n.includes(k))) return category;
  }

  /* ---------- 2. Credit stays rule-based ---------- */
  if (trxtype === "credit") {
    return categorizeTransaction(narration, trxtype);
  }

  /* ---------- 3. Cache Lookup ---------- */
  const cacheKey = `${trxtype}:${n}`;

  if (semanticCache.has(cacheKey)) {
    return semanticCache.get(cacheKey)!;
  }

  /* ---------- 4. Semantic Model Prediction ---------- */
  console.log("⚡ Semantic model running:", narration);

  const semanticCategory = await categorizeTransactionSemantic(narration);

  let finalCategory = semanticCategory;

  /* ---------- 5. If semantic fails → TF-IDF fallback ---------- */
  if (semanticCategory === DEFAULT_CATEGORY) {
    finalCategory = categorizeTransaction(narration, trxtype);
  }

  /* ---------- 6. Store in Cache ---------- */
  if (semanticCache.size > MAX_CACHE_SIZE) {
    // simple eviction: clear all when full
    semanticCache.clear();
  }

  semanticCache.set(cacheKey, finalCategory);

  return finalCategory;
}