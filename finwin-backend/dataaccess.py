"""
dataaccess.py
--------------
Real database access layer for the FinWin chatbot.
Connects directly to your Postgres database (the same one Prisma points at,
schema = "banking") using psycopg2. No Prisma client needed on the Python side.

Requires DATABASE_URL in your .env, e.g.:
DATABASE_URL=postgresql://user:password@host:5432/dbname

Table/column names come straight from your prisma/schema.prisma. Prisma keeps
the exact casing of model/field names in Postgres, so every identifier is
double-quoted here (e.g. "userId", "User") to match exactly.
"""

import os
import logging
from contextlib import contextmanager

import pandas as pd
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to your .env file, e.g.\n"
        "DATABASE_URL=postgresql://user:password@host:5432/dbname"
    )


@contextmanager
def get_connection():
    """Yields a psycopg2 connection, always closed afterward."""
    conn = psycopg2.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        conn.close()


def _dict_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


# -----------------------------------------------------------------------
# USERS
# -----------------------------------------------------------------------

def get_user_by_id(user_id: int):
    """Returns a dict of the user row, or None if not found.
    NOTE: real table is lowercase 'users' (not 'User'), and several columns
    are lowercase with no camelCase (firstname, lastname, lastlogin, phoneno,
    createdt) — confirmed directly from the live database, not the prisma file.
    """
    query = '''
        SELECT "userId", "email", "firstname", "lastname", "city",
               "address", "pincode", "phoneno", "roleId", "createdt", "lastlogin"
        FROM banking.users
        WHERE "userId" = %s
    '''
    with get_connection() as conn:
        with _dict_cursor(conn) as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()
            return dict(row) if row else None


def get_user_by_email(email: str):
    """Used at login time to resolve email -> user record."""
    query = '''
        SELECT "userId", "email", "password", "firstname", "lastname", "roleId"
        FROM banking.users
        WHERE "email" = %s
    '''
    with get_connection() as conn:
        with _dict_cursor(conn) as cur:
            cur.execute(query, (email,))
            row = cur.fetchone()
            return dict(row) if row else None


def get_user_role(user_id: int):
    """Returns the role name string (e.g. 'Admin', 'Customer') for a user."""
    query = '''
        SELECT r."name" AS role_name
        FROM banking.users u
        JOIN banking.role r ON u."roleId" = r."roleId"
        WHERE u."userId" = %s
    '''
    with get_connection() as conn:
        with _dict_cursor(conn) as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()
            return row["role_name"] if row else None


def get_total_users():
    query = 'SELECT COUNT(*) AS total FROM banking.users'
    with get_connection() as conn:
        with _dict_cursor(conn) as cur:
            cur.execute(query)
            return cur.fetchone()["total"]


# -----------------------------------------------------------------------
# ACCOUNTS
# -----------------------------------------------------------------------

def get_account_by_user_id(user_id: int):
    """Returns the primary account dict for a user. If a user has multiple
    accounts, this returns the most recently created one."""
    query = '''
        SELECT "accountId", "accNo", "acctype", "balance", "userId",
               "branchId", "createdAt"
        FROM banking.account
        WHERE "userId" = %s
        ORDER BY "createdAt" DESC
        LIMIT 1
    '''
    with get_connection() as conn:
        with _dict_cursor(conn) as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()
            return dict(row) if row else None


def get_all_accounts_by_user_id(user_id: int):
    query = '''
        SELECT "accountId", "accNo", "acctype", "balance", "userId",
               "branchId", "createdAt"
        FROM banking.account
        WHERE "userId" = %s
        ORDER BY "createdAt" DESC
    '''
    with get_connection() as conn:
        with _dict_cursor(conn) as cur:
            cur.execute(query, (user_id,))
            rows = cur.fetchall()
            return [dict(r) for r in rows]


# -----------------------------------------------------------------------
# TRANSACTIONS
# -----------------------------------------------------------------------

def get_last_n_transactions(account_id: int, n: int = 5) -> pd.DataFrame:
    """Returns a DataFrame of the last n transactions for an account,
    most recent first. Columns: transactionId, amount, trxtype, mode,
    status, narration, refNo, fromTo, createdAt.
    """
    query = '''
        SELECT "transactionId", "amount", "trxtype", "mode", "status",
               "narration", "refNo", "fromTo", "createdAt"
        FROM banking.transaction
        WHERE "accountId" = %s
        ORDER BY "createdAt" DESC
        LIMIT %s
    '''
    with get_connection() as conn:
        df = pd.read_sql(query, conn, params=(account_id, n))

    if not df.empty:
        df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
        df["amount"] = df["amount"].astype(float)

    return df


def get_transactions_in_range(account_id: int, start_date, end_date) -> pd.DataFrame:
    """Transactions for an account between two datetimes (inclusive)."""
    query = '''
        SELECT "transactionId", "amount", "trxtype", "mode", "status",
               "narration", "refNo", "fromTo", "createdAt"
        FROM banking.transaction
        WHERE "accountId" = %s
          AND "createdAt" BETWEEN %s AND %s
        ORDER BY "createdAt" DESC
    '''
    with get_connection() as conn:
        df = pd.read_sql(query, conn, params=(account_id, start_date, end_date))

    if not df.empty:
        df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
        df["amount"] = df["amount"].astype(float)

    return df
