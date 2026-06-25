// utils/analytics/categorizer.ts

const CATEGORY_PRIORITY: [string, string[]][] = [
  ["Rent", ["rent", "lease"]],
  ["Entertainment", ["movie", "cinema", "theatre", "netflix", "spotify", "amusement", "theme park"]],
  ["Food", ["grocery", "restaurant", "swiggy", "zomato", "cafe", "food", "hotel"]],
  ["Groceries / Daily Needs", ["milk", "vegetable", "fruits", "ration", "mart", "supermarket"]],
  ["Shopping", ["shopping", "amazon", "flipkart", "purchase", "zara", "myntra", "mall", "store"]],
  ["Bills & Utilities", ["bill", "gas", "wifi", "electricity", "internet", "water", "utility", "broadband", "mobile"]],
  ["Recharge/Topup", ["recharge", "topup", "dth", "prepaid", "postpaid"]],
  ["Transfer/UPI", ["upi", "transfer", "neft", "rtgs", "imps", "phonepe", "gpay", "paytm"]],
  ["Insurance/EMI", ["insurance", "premium", "emi", "loan", "sip"]],
  ["Health & Medical", ["hospital", "clinic", "pharmacy", "doctor", "medicine", "health"]],
  ["Travel & Commute", ["taxi", "uber", "ola", "rapido", "metro", "bus", "train", "flight", "airline", "travel"]],
  ["Education", ["fees", "exam", "school", "college", "tuition", "course", "education", "books"]],
  ["Clothing & Apparel", ["clothes", "dress", "tshirt", "jeans", "winter wear", "fashion", "zara", "hm"]],
  ["Refund", ["refund", "reversal", "cashback"]]
];

const INCOME_KEYWORDS = [
  "salary",
  "payroll",
  "salary credit",
  "credited",
  "income",
  "stipend"
];

const DEFAULT_CATEGORY = "Others";

// Simple fuzzy match (lighter than rapidfuzz but sufficient)
function fuzzyMatch(text: string, keywords: string[]): boolean {
  return keywords.some(k => text.includes(k));
}

export function categorizeTransaction(
  narration: string,
  trxtype: "credit" | "debit"
): string {
  if (!narration) return DEFAULT_CATEGORY;

  const n = narration.toLowerCase();

  // ---------- EXT-* MERCHANT HANDLING ----------
  if (n.startsWith("ext-")) {
    const merchant = n.replace("ext-", "");

    if (["swiggy", "zomato", "domino", "pizza", "mcd", "burger", "kfc"].some(x => merchant.includes(x)))
      return "Food";

    if (["uber", "ola", "rapido", "metro"].some(x => merchant.includes(x)))
      return "Travel & Commute";

    if (["netflix", "spotify", "prime", "hotstar"].some(x => merchant.includes(x)))
      return "Entertainment";

    if (["amazon", "flipkart", "myntra", "zara"].some(x => merchant.includes(x)))
      return "Shopping";

    if (["electric", "water", "gas", "jio", "airtel"].some(x => merchant.includes(x)))
      return "Bills & Utilities";
  }

  // ---------- CREDIT ----------
  if (trxtype === "credit") {
    if (fuzzyMatch(n, INCOME_KEYWORDS)) return "Salary / Income";
    if (fuzzyMatch(n, ["refund", "reversal", "chargeback"])) return "Refund";
    if (fuzzyMatch(n, ["recharge", "topup"])) return "Wallet Top-up Return";
    return "Transfer In";
  }

  // ---------- DEBIT ----------
  for (const [category, keys] of CATEGORY_PRIORITY) {
    if (fuzzyMatch(n, keys)) {
      return category;
    }
  }

  if (n.includes("salary")) return "Transfer/Self-transfer";

  return DEFAULT_CATEGORY;
}
