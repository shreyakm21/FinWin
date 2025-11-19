"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient"; // PUBLIC/browser client only

// Optional: server route to update last login (not critical)
const updateLastLogin = async (userEmail: string): Promise<void> => {
  try {
    await fetch("/api/update-last-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
  } catch (err) {
    console.warn("update-last-login failed:", err);
  }
};

const GET_USERID_API = "/api/get-userid"; // route to check if user already has an account

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fixed login logic
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 🔹 Attempt login
      const signInRes = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // handle Supabase auth error
      if ((signInRes as any).error) {
        setError((signInRes as any).error?.message ?? "Login failed");
        setLoading(false);
        return;
      }

      // 🔹 Try to extract user safely
      let user: any = null;

      // handle supabase response shapes
      if (signInRes && (signInRes as any).data && (signInRes as any).data.user) {
        user = (signInRes as any).data.user;
      } else if ((signInRes as any).user) {
        user = (signInRes as any).user;
      }

      // fallback to getUser() if still not found
      if (!user) {
        const getUserRes = await supabase.auth.getUser();
        if (getUserRes && (getUserRes as any).data && (getUserRes as any).data.user) {
          user = (getUserRes as any).data.user;
        } else if ((getUserRes as any).user) {
          user = (getUserRes as any).user;
        }
      }

      if (!user?.email) {
        setError("Unable to retrieve user information after login.");
        setLoading(false);
        return;
      }

      // update last login silently
      updateLastLogin(user.email).catch(() => {});

      // 🔹 Check if user already has an account in DB
      const res = await fetch(GET_USERID_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      if (!res.ok) {
        console.warn("GET_USERID non-OK:", res.status);
        router.push("/account_detail"); // fallback
        return;
      }

      const json = await res.json();

      // ✅ Redirect based on account existence
      const hasAccount = !!json?.hasAccount;
      if (hasAccount) {
        router.push("/finwin_dashboard");
      } else {
        router.push("/account_detail");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message ?? "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#e0f2fe",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: "370px",
          padding: "30px",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        <h3
          style={{
            marginBottom: "25px",
            fontWeight: 600,
            fontSize: "28px",
            color: "#222",
          }}
        >
          LOGIN
        </h3>

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "15px",
              border: "1px solid #f5c6cb",
              textAlign: "left",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ textAlign: "left", marginBottom: "18px" }}>
            <label
              htmlFor="email"
              style={{ fontSize: "16px", fontWeight: 500 }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                height: "40px",
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "6px",
                border: "1px solid #ced4da",
                marginTop: "4px",
              }}
            />
          </div>

          <div style={{ textAlign: "left", marginBottom: "18px" }}>
            <label
              htmlFor="password"
              style={{ fontSize: "16px", fontWeight: 500 }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                height: "40px",
                padding: "8px 12px",
                fontSize: "14px",
                borderRadius: "6px",
                border: "1px solid #ced4da",
                marginTop: "4px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "45px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: loading ? "#6c757d" : "#0d6efd",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s",
            }}
          >
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "20px" }}>
          <a
            href="/forgot_password"
            style={{
              display: "block",
              fontSize: "15px",
              fontWeight: 600,
              margin: "6px 0",
              color: "#007bff",
              textDecoration: "none",
            }}
          >
            Forgot Password?
          </a>
          <a
            href="/signup"
            style={{
              display: "block",
              fontSize: "15px",
              fontWeight: 600,
              margin: "6px 0",
              color: "#007bff",
              textDecoration: "none",
            }}
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
