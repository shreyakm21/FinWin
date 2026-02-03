// scripts/testCategorizer.ts

import { categorizeTransaction } from "../utils/analytics/categorizer";

const testTransactions = [
  { narration: "gym fees", trxtype: "debit" },
  { narration: "fruits shopping", trxtype: "debit" },
  { narration: "lunch bill", trxtype: "debit" },
  { narration: "milk bill", trxtype: "debit" },
  { narration: "Doctor consultation fee", trxtype: "debit" },
  { narration: "Gym membership renewal", trxtype: "debit" },
  { narration: "Car insurance premium", trxtype: "debit" },

  // Merchant override tests
  { narration: "Uber ride to college", trxtype: "debit" },
  { narration: "Amazon shopping order", trxtype: "debit" },
  { narration: "Mobile recharge via Paytm", trxtype: "debit" },

  // Credit-side tests
  { narration: "Salary credited from company", trxtype: "credit" },
  { narration: "Refund received from Amazon", trxtype: "credit" },
  { narration: "UPI transfer received", trxtype: "credit" },

  // Unknown narration → should fallback
  { narration: "Random xyz transaction", trxtype: "debit" },
];

console.log("\n========= FinWin Category Prediction Test =========\n");

for (const tx of testTransactions) {
  const category = categorizeTransaction(
    tx.narration,
    tx.trxtype as "credit" | "debit"
  );

  console.log(
    `"${tx.narration}" [${tx.trxtype.toUpperCase()}] → ${category}`
  );
}

console.log("\n=================================================\n");