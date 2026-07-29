// utils/analytics/mlCategorizer.ts

import modelData from "./category_model.json";

const DEFAULT_CATEGORY = "Others";

type ModelJSON = {
  vocabulary: Record<string, number>;
  idf: number[];
  categories: string[];
  coefficients: number[][];
  intercepts: number[];
};

const model = modelData as ModelJSON;

/* ---------- TF-IDF VECTORIZE ---------- */
function vectorize(text: string): number[] {
  const tokens = text
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean);

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

  // Apply IDF weighting
  return vec.map((tf, i) => tf * model.idf[i]);
}

/* ---------- LINEAR SVM PREDICT ---------- */
function predictCategory(vec: number[]): string {
  let bestScore = -Infinity;
  let bestIndex = -1;

  for (let c = 0; c < model.categories.length; c++) {
    const weights = model.coefficients[c];
    const bias = model.intercepts[c];

    let score = bias;
    for (let i = 0; i < vec.length; i++) {
      score += vec[i] * weights[i];
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = c;
    }
  }

  return model.categories[bestIndex] ?? DEFAULT_CATEGORY;
}

/* ---------- PUBLIC FUNCTION ---------- */
export function categorizeTransactionML(narration: string): string {
  if (!narration) return DEFAULT_CATEGORY;

  const vec = vectorize(narration);
  return predictCategory(vec);
}