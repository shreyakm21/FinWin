"""
main.py
-------
FinWin chatbot backend. Single source of truth (merges your old main.py
and api.py). Fetches real data from Postgres via dataaccess.py — no more
hardcoded user, no more mismatched function signatures.

Run with:
    uvicorn main:app --reload --port 8000
"""

import re
import logging
from datetime import datetime, timedelta

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from dataaccess import (
    get_user_by_id,
    get_account_by_user_id,
    get_last_n_transactions,
    get_user_role,
    get_total_users,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FinWin Chatbot API")

# In production, replace "*" with your actual frontend origin(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    user_id: int  # sent by the frontend, taken from the logged-in session


class ChatResponse(BaseModel):
    reply: str
    intent: Optional[str] = None
    suggestions: Optional[list] = None
    chart: Optional[dict] = None


@app.get("/")
def read_root():
    return {"status": "ok", "message": "FinWin Chatbot API is running"}


# -----------------------------------------------------------------------
# INTENT DETECTION
# -----------------------------------------------------------------------

def detect_intent_and_entity(user_input: str):
    """Returns (intent, entity, number).
    entity is currently only used to filter transactions by type
    (credit/debit) when the user mentions it.
    """
    text = user_input.lower()
    intent = "unknown"
    entity = None
    number = None

    match = re.search(r"\b(\d+)\b", text)
    if match:
        number = int(match.group(1))

    if re.search(r"\bcredit\b", text):
        entity = "credit"
    elif re.search(r"\bdebit\b", text):
        entity = "debit"

    if re.search(r"\b(hi|hello|hey)\b", text):
        intent = "greeting"
    elif re.search(r"(exit|bye|goodbye)", text):
        intent = "exit"
    elif re.search(r"(total users|how many users)", text):
        intent = "admin_users"
    elif "balance" in text or re.search(r"(how much money|how much do i have)", text):
        intent = "balance"
    elif "account" in text and "accounts" not in text:
        intent = "account"
    elif "last transaction" in text:
        intent = "last_transaction"
    elif "above" in text or "greater than" in text:
        intent = "high_transactions"
    elif "below" in text or "less than" in text:
        intent = "low_transactions"
    elif re.search(r"\b(today|todays|today's)\b", text):
        intent = "today_spending"
    elif re.search(r"(previous 1 week|last week|last 7 days)", text):
        intent = "week_spending"
    elif re.search(r"(monthly summary|this month)", text):
        intent = "monthly_summary"
    elif re.search(r"(expense category|spending breakdown|category|where did i spend)", text):
        intent = "expense_category"
    elif re.search(r"(trend|monthly trend)", text):
        intent = "trend"
    elif re.search(r"(predict|next month)", text):
        intent = "prediction"
    elif re.search(r"(salary|earnings|earn|income)", text):
        intent = "income"
    elif re.search(r"(saving suggestion|how can i save|savings tip)", text):
        intent = "saving_suggestion"
    elif re.search(r"\b(saving|savings|saved)\b", text):
        intent = "savings"
    elif re.search(r"(overspending|am i spending too much|how is my spending)", text):
        intent = "overspending"
    elif "transaction" in text:
        intent = "transactions"
    elif entity and (number is not None or re.search(r"(show|list|give me|recent|last|my)", text)):
        # catches phrasing like "give me my 5 credits", "show my debits",
        # "list last 3 credit entries" — without needing the word "transaction"
        intent = "transactions"
    elif "top expense" in text:
        intent = "top_expense"
    elif "afford" in text:
        intent = "affordability"
    elif "loan" in text:
        intent = "loan"
    elif "interest" in text:
        intent = "interest"
    elif re.search(r"(lost.*card|block.*card)", text):
        intent = "block_card"
    elif "fraud" in text:
        intent = "fraud"
    elif "pin" in text:
        intent = "change_pin"
    elif "health" in text:
        intent = "health_score"

    return intent, entity, number


SUGGESTIONS = [
    "Check balance",
    "Show recent transactions",
    "What is my income",
    "Am I overspending",
    "Show expense categories",
    "Predict next month expense",
]

# -----------------------------------------------------------------------
# STATIC FAQ ANSWERS
# These don't need the database — general banking info / policy questions.
# Each entry: (list of trigger phrases, answer). Checked in order; first
# match wins. Add more tuples here any time you want a new canned answer.
# -----------------------------------------------------------------------

STATIC_FAQS = [
    (["working hours", "branch timing", "open time", "bank hours"],
     "Branches are open Mon–Fri, 9:30 AM to 4:30 PM, and Saturdays 9:30 AM to 1:00 PM. Closed on Sundays and public holidays."),

    (["customer care", "helpline", "support number", "contact number", "toll free"],
     "You can reach our 24x7 customer care at 1800-123-4567, or email support@finwin.com."),

    (["minimum balance", "min balance", "maintain balance"],
     "Savings accounts require a minimum average balance of ₹2,000/month. Current accounts require ₹10,000/month."),

    (["atm limit", "withdrawal limit", "cash withdrawal limit"],
     "You can withdraw up to ₹40,000 per day from an ATM using your debit card, subject to your card's tier."),

    (["net banking", "internet banking", "online banking"],
     "Net banking can be activated from the login page using 'Register for Net Banking', or at any branch with your debit card."),

    (["mobile banking", "banking app", "mobile app"],
     "Our mobile app is available on the App Store and Google Play. Search 'FinWin Mobile Banking' to download."),

    (["kyc", "know your customer", "update kyc"],
     "KYC can be updated online via the app under Profile > KYC Update, or by visiting any branch with a valid ID and address proof."),

    (["nominee", "add nominee", "change nominee"],
     "You can add or update a nominee from Account Settings > Nominee Details, or by submitting Form DA1 at your branch."),

    (["fixed deposit", "fd rate", "fd interest"],
     "Fixed Deposits currently earn 6.5% to 7.25% p.a. depending on tenure. You can open one from the Deposits section."),

    (["recurring deposit", "rd interest"],
     "Recurring Deposits earn 6.0% p.a. with monthly installments starting at ₹500."),

    (["neft", "what is neft"],
     "NEFT (National Electronic Funds Transfer) is used for transferring money between banks, usually settled within a few hours."),

    (["rtgs", "what is rtgs"],
     "RTGS (Real Time Gross Settlement) is for high-value transfers (₹2 lakh+), settled in real time."),

    (["upi", "what is upi", "upi limit"],
     "UPI transfers are instant and free, with a daily limit of ₹1,00,000 per UPI ID for most banks."),

    (["ifsc", "branch code"],
     "Your branch's IFSC code is shown in your passbook/account statement, and also in the Account Details section of the app."),

    (["statement", "download statement", "passbook"],
     "You can download your account statement from Account > Statements, choosing any custom date range."),

    (["close account", "close my account"],
     "To close your account, visit your home branch with a written request and your passbook/debit card. Ensure your balance is zero or to be refunded."),

    (["debit card apply", "new debit card", "request debit card"],
     "A new debit card can be requested from Cards > Apply for Debit Card in the app, delivered within 7-10 business days."),

    (["credit card apply", "new credit card", "apply credit card"],
     "You can check credit card eligibility and apply from the Cards section, subject to income and credit score criteria."),

    (["swift code"],
     "Our SWIFT code for international transfers is FWINXXYY — confirm the exact branch suffix on your statement."),

    (["tax", "tds", "form 16a"],
     "TDS certificates (Form 16A) for deposit interest are available under Account > Tax Documents, usually by June each year."),
]


def check_static_faq(user_input: str) -> Optional[str]:
    text = user_input.lower()
    for triggers, answer in STATIC_FAQS:
        if any(t in text for t in triggers):
            return answer
    return None


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    try:
        user_input = req.message
        user_id = req.user_id
        logger.info(f"User {user_id} | Input: {user_input}")

        user = get_user_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid user session")

        user_role = get_user_role(user_id)
        intent, entity, number = detect_intent_and_entity(user_input)
        logger.info(f"Intent: {intent} | Entity: {entity} | Number: {number}")

        # --- Greeting / exit ---
        if intent == "greeting":
            return ChatResponse(reply=f"Hello {user['firstname']} 👋 How can I help you?", intent=intent)

        if intent == "exit":
            return ChatResponse(reply="Thank you! Have a nice day.", intent=intent)

        # --- Admin-only ---
        if intent == "admin_users":
            if user_role != "Admin":
                return ChatResponse(reply="You are not authorized to access this information.", intent=intent)
            total = get_total_users()
            return ChatResponse(reply=f"Total registered users in the system: {total}", intent=intent)

        # --- Everything below requires a Customer role + an account ---
        customer_intents = {
            "balance", "account", "transactions", "last_transaction",
            "high_transactions", "low_transactions", "today_spending",
            "week_spending", "monthly_summary", "expense_category",
            "trend", "prediction", "income", "saving_suggestion",
            "savings", "overspending", "affordability", "health_score",
        }
        if intent in customer_intents and user_role not in ("Customer",):
            return ChatResponse(reply="Access denied for this feature. You need to be a Customer.", intent=intent)

        account = get_account_by_user_id(user_id) if intent in customer_intents else None
        if intent in customer_intents and account is None:
            return ChatResponse(reply="No account found for your profile.", intent=intent)

        if intent == "balance":
            return ChatResponse(reply=f"Your current balance is ₹{account['balance']:.2f}", intent=intent)

        if intent == "account":
            return ChatResponse(
                reply=f"You have a {account['acctype']} account (Account No: {account['accNo']})",
                intent=intent,
            )

        if intent in ("transactions", "high_transactions", "low_transactions", "last_transaction"):
            limit = number if (number and intent != "last_transaction") else (1 if intent == "last_transaction" else 5)
            fetch_limit = 100 if intent in ("high_transactions", "low_transactions") else max(limit, 100 if entity else limit)
            txns = get_last_n_transactions(account["accountId"], fetch_limit)

            if entity:
                txns = txns[txns["trxtype"] == entity]
                if intent == "transactions":
                    txns = txns.head(limit)

            if intent == "high_transactions" and number:
                txns = txns[txns["amount"] > number]
            elif intent == "low_transactions" and number:
                txns = txns[txns["amount"] < number]

            if txns.empty:
                label = f"{entity} " if entity else ""
                return ChatResponse(reply=f"No {label}transactions found.", intent=intent)

            label = f"{entity} " if entity else ""
            reply = f"Here are your last {len(txns)} {label}transactions:\n"
            for _, row in txns.iterrows():
                reply += f"- {row['createdAt']:%d %b %Y} | {row['trxtype']} | ₹{row['amount']:.2f} | {row['narration']}\n"
            return ChatResponse(reply=reply.strip(), intent=intent)

        if intent == "today_spending":
            txns = get_last_n_transactions(account["accountId"], 200)
            if txns.empty:
                return ChatResponse(reply="No transactions found.", intent=intent)
            today = datetime.now().date()
            total = txns[(txns["trxtype"] == "debit") & (txns["createdAt"].dt.date == today)]["amount"].sum()
            return ChatResponse(reply=f"Today's spending is ₹{total:.2f}", intent=intent)

        if intent == "week_spending":
            txns = get_last_n_transactions(account["accountId"], 200)
            if txns.empty:
                return ChatResponse(reply="No transactions found.", intent=intent)
            last_week = datetime.now() - timedelta(days=7)
            total = txns[(txns["trxtype"] == "debit") & (txns["createdAt"] >= last_week)]["amount"].sum()
            return ChatResponse(reply=f"Last 7 days spending: ₹{total:.2f}", intent=intent)

        if intent == "monthly_summary":
            txns = get_last_n_transactions(account["accountId"], 200)
            if txns.empty:
                return ChatResponse(reply="No expenses recorded this month.", intent=intent)
            now = datetime.now()
            monthly = txns[
                (txns["trxtype"] == "debit")
                & (txns["createdAt"].dt.month == now.month)
                & (txns["createdAt"].dt.year == now.year)
            ]
            if monthly.empty:
                return ChatResponse(reply="No expenses recorded this month.", intent=intent)
            total = monthly["amount"].sum()
            return ChatResponse(reply=f"Total spending this month is ₹{total:.2f}", intent=intent)

        if intent == "expense_category":
            txns = get_last_n_transactions(account["accountId"], 200)
            expenses = txns[txns["trxtype"] == "debit"] if not txns.empty else txns
            if expenses.empty:
                return ChatResponse(reply="No expense data available.", intent=intent)
            summary = expenses.groupby("narration")["amount"].sum().sort_values(ascending=False)
            reply = "Your spending breakdown:\n" + "\n".join(f"- {cat}: ₹{amt:.2f}" for cat, amt in summary.items())
            return ChatResponse(
                reply=reply,
                intent=intent,
                chart={"labels": summary.index.tolist(), "values": summary.values.tolist()},
            )

        if intent == "trend":
            txns = get_last_n_transactions(account["accountId"], 300)
            if txns.empty:
                return ChatResponse(reply="Not enough data for a trend yet.", intent=intent)
            monthly = txns.groupby(txns["createdAt"].dt.to_period("M"))["amount"].sum()
            labels = [str(p) for p in monthly.index]
            return ChatResponse(
                reply="Here's your monthly spending trend.",
                intent=intent,
                chart={"labels": labels, "values": monthly.values.tolist()},
            )

        if intent == "prediction":
            txns = get_last_n_transactions(account["accountId"], 200)
            expenses = txns[txns["trxtype"] == "debit"]["amount"] if not txns.empty else pd.Series(dtype=float)
            if expenses.empty:
                return ChatResponse(reply="Not enough data to predict next month's expense.", intent=intent)
            return ChatResponse(reply=f"Estimated expense next month: ₹{expenses.mean():.2f}", intent=intent)

        if intent == "income":
            txns = get_last_n_transactions(account["accountId"], 200)
            income = txns[txns["trxtype"] == "credit"]["amount"].sum() if not txns.empty else 0
            return ChatResponse(reply=f"Your total income (recent activity) is ₹{income:.2f}", intent=intent)

        if intent in ("savings", "saving_suggestion"):
            txns = get_last_n_transactions(account["accountId"], 200)
            income = txns[txns["trxtype"] == "credit"]["amount"].sum() if not txns.empty else 0
            expense = txns[txns["trxtype"] == "debit"]["amount"].sum() if not txns.empty else 0

            if intent == "savings":
                return ChatResponse(reply=f"You have saved ₹{(income - expense):.2f} recently.", intent=intent)

            if income == 0:
                return ChatResponse(reply="Not enough income data to suggest savings.", intent=intent)
            ratio = expense / income
            if ratio < 0.5:
                msg = "Your spending is healthy. Keep it up!"
            elif ratio < 0.75:
                msg = "You can reduce discretionary expenses to save more."
            else:
                msg = "High expense ratio detected. Immediate savings advised."
            return ChatResponse(reply=msg, intent=intent)

        if intent == "overspending":
            txns = get_last_n_transactions(account["accountId"], 200)
            income = txns[txns["trxtype"] == "credit"]["amount"].sum() if not txns.empty else 0
            expense = txns[txns["trxtype"] == "debit"]["amount"].sum() if not txns.empty else 0
            msg = "⚠️ You are overspending" if expense > income else "✅ Your spending is under control"
            return ChatResponse(reply=msg, intent=intent)

        if intent == "affordability":
            if number is None:
                return ChatResponse(reply="Please tell me an amount, e.g. 'can I afford 5000'", intent=intent)
            can_afford = number <= account["balance"]
            reply = f"Yes ✅ You can afford ₹{number}" if can_afford else "No ❌ You don't have enough balance"
            return ChatResponse(reply=reply, intent=intent)

        if intent == "health_score":
            txns = get_last_n_transactions(account["accountId"], 200)
            income = txns[txns["trxtype"] == "credit"]["amount"].sum() if not txns.empty else 0
            expense = txns[txns["trxtype"] == "debit"]["amount"].sum() if not txns.empty else 0
            score = max(0, 100 - (expense / income * 100)) if income else 0
            return ChatResponse(reply=f"Financial health score: {score:.0f}/100", intent=intent)

        # --- Static / informational intents ---
        if intent == "loan":
            return ChatResponse(reply="Loans are available up to ₹5,00,000. Visit the Loans section to apply.", intent=intent)
        if intent == "interest":
            return ChatResponse(reply="Savings accounts earn 3.5% p.a. interest, credited quarterly.", intent=intent)
        if intent == "block_card":
            return ChatResponse(reply="🚨 Your card has been blocked. A replacement will be issued within 5-7 business days.", intent=intent)
        if intent == "fraud":
            return ChatResponse(reply="If you suspect fraud, please call our 24x7 helpline immediately or use 'block card'.", intent=intent)
        if intent == "change_pin":
            return ChatResponse(reply="You can change your PIN from the mobile app under Settings > Security.", intent=intent)
        if intent == "top_expense":
            txns = get_last_n_transactions(account["accountId"], 200) if account else pd.DataFrame()
            expenses = txns[txns["trxtype"] == "debit"] if not txns.empty else txns
            if expenses.empty:
                return ChatResponse(reply="No expense data available.", intent=intent)
            top = expenses.groupby("narration")["amount"].sum().idxmax()
            return ChatResponse(reply=f"Your top expense category is: {top}", intent=intent)

        # --- Static FAQ fallback (working hours, KYC, NEFT, UPI, etc.) ---
        faq_answer = check_static_faq(user_input)
        if faq_answer:
            return ChatResponse(reply=faq_answer, intent="faq")

        # --- Fallback ---
        return ChatResponse(
            reply="I'm not sure I understood that 🤔",
            intent="unknown",
            suggestions=SUGGESTIONS,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong processing your message.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
