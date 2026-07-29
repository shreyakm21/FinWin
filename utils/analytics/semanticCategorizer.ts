// utils/analytics/semanticCategorizer.ts

import { pipeline } from "@xenova/transformers";

const DEFAULT_CATEGORY = "Others";

/* ✅ Prototype examples per FinWin category */
const CATEGORY_PROTOTYPES: Record<string, string[]> = {
  Food: ["Swiggy food order", "Milk purchase", "Restaurant lunch bill"],
  "Bills & Utilities": ["Electricity bill", "Gas bill payment", "WiFi recharge"],
  "Travel & Commute": ["Uber ride", "Metro ticket", "Cab fare payment"],
  Shopping: ["Amazon purchase", "Flipkart order", "Clothing shopping"],
  Entertainment: ["Netflix subscription", "Movie tickets", "Spotify premium"],
  "Health & Medical": ["Doctor consultation", "Gym membership fees", "Pharmacy bill"],
  "Insurance/EMI": ["LIC premium payment", "Loan EMI debit", "Car insurance renewal"],
  "Salary / Income": ["Salary credited", "Payroll deposit", "Bonus received"],
  Refund: ["Refund credited", "Cashback received", "Reversal transaction"],
};

/* Load embedding model once */
let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedder;
}

/* Cosine similarity */
function cosineSim(a: number[], b: number[]) {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* Main Categorizer */
export async function categorizeTransactionSemantic(narration: string) {
  if (!narration) return DEFAULT_CATEGORY;

  const model = await getEmbedder();

  // Embed narration
  const narrationVec = (await model(narration))[0][0];

  let bestCategory = DEFAULT_CATEGORY;
  let bestScore = 0;

  // Compare with prototypes
  for (const [category, examples] of Object.entries(CATEGORY_PROTOTYPES)) {
    for (const ex of examples) {
      const exVec = (await model(ex))[0][0];
      const score = cosineSim(narrationVec, exVec);

      if (score > bestScore) {
        bestScore = score;
        bestCategory = category;
      }
    }
  }

  // Confidence threshold
  if (bestScore < 0.35) return DEFAULT_CATEGORY;

  return bestCategory;
}