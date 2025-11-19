// app/signup/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabaseClient";

// --- Interfaces and Types ---
interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  city: string;
  pincode: string;
}

// Reusable Input Component with State Management
const FormInput = ({ id, label, type, placeholder, value, onChange, required }: {
  id: keyof FormData,
  label: string,
  type: string,
  placeholder?: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  required?: boolean
}) => (
  <div className="space-y-1">
    <label htmlFor={String(id)} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type={type}
      id={String(id)}
      name={String(id)}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm transition duration-150 ease-in-out"
      required={required}
    />
  </div>
);

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Small debug to ensure public env is injected
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.log("NEXT_PUBLIC_SUPABASE_URL (client):", process.env.NEXT_PUBLIC_SUPABASE_URL);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // keep values trimmed on the fly for email and names
    setFormData((prev) => ({ ...prev, [id as keyof FormData]: id === "email" || id === "first_name" || id === "last_name" ? value.trim() : value }));
  };

  const validateForm = () => {
    if (!formData.email) return "Email is required.";
    // basic email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Please enter a valid email address.";
    if (formData.password.length < 6) return "Password must be at least 6 characters long.";
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) return "Phone Number must be 10 digits.";
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) return "Pincode must be 6 digits.";
    if (!formData.first_name) return "First name is required.";
    if (!formData.last_name) return "Last name is required.";
    return null;
  };

  // Call server endpoint to create profile (server will run RPC with service role)
  const createProfileOnServer = async (userId: string | null) => {
    try {
      const resp = await fetch("/api/create-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, // may be null — server should accept and insert by email when possible
          email: formData.email,
          password: formData.password,  
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
        }),
      });

      let json: any = {};
      try {
        json = await resp.json();
      } catch (err) {
        // no json body
      }

      return { ok: resp.ok, json, status: resp.status };
    } catch (err: any) {
      return { ok: false, json: { error: err?.message ?? "Network error" }, status: 0 };
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // 1) Sign up with Supabase Auth (client)
      // Note: new supabase-js returns { data, error } where data may include user/session depending config
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      console.log("Supabase signUp response:", { authData, authError });

      if (authError) {
        setError(authError.message || "Signup failed.");
        setLoading(false);
        return;
      }

      // Try to grab user id (may be null if email confirmation required)
      const newUserId = (authData as any)?.user?.id ?? null;

      // Always attempt to create profile on server. Server should handle both:
      // - user_id provided (insert by id)
      // - user_id null (insert row keyed by email or queue until confirmation)
      const profileResult = await createProfileOnServer(newUserId);

      console.log("create-profile result:", profileResult);

      if (!profileResult.ok) {
        // if server returns JSON with error message include it
        const serverMsg = profileResult.json?.error || profileResult.json?.message || `HTTP ${profileResult.status}`;
        // Not fatal in the sense that auth account may still be created; surface a clear message
        setError(
          `Account created but saving profile failed on the server: ${serverMsg}. ` +
          `Please try logging in and completing your profile from the account page.`
        );
        setLoading(false);
        // redirect to login so user can attempt to sign in
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      // Success — show message and navigate to login (or account_detail depending flow)
      setSuccess("Account successfully created! Please check your email (if confirmation required) and log in.");
      setLoading(false);
      setTimeout(() => router.push("/login"), 1400);
    } catch (err: any) {
      console.error("Unexpected signup error:", err);
      setError(err?.message ?? "An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 font-[Inter]">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-800">BankFlow Sign-Up</h1>
          <p className="text-gray-500 mt-2 text-sm">Fill in your details to create a new customer account.</p>
        </div>

        {/* Status Messages */}
        {(error || success) && (
          <div
            className={`p-3 mb-4 rounded-lg font-medium ${
              error
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {error || success}
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSignUp} noValidate>
          {/* Email and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="email" label="Email (Login ID)" type="email" placeholder="user@bankflow.com" value={formData.email} onChange={handleInputChange} required />
            <FormInput id="password" label="Password (Min 6 Chars)" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="first_name" label="First Name" type="text" placeholder="John" value={formData.first_name} onChange={handleInputChange} required />
            <FormInput id="last_name" label="Last Name" type="text" placeholder="Doe" value={formData.last_name} onChange={handleInputChange} required />
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="phone_number" label="Phone Number (10 digits)" type="tel" placeholder="5551234567" value={formData.phone_number} onChange={handleInputChange} required />
            <FormInput id="pincode" label="Pincode (6 digits)" type="text" placeholder="123456" value={formData.pincode} onChange={handleInputChange} required />
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput id="address" label="Address" type="text" placeholder="123 Bank St" value={formData.address} onChange={handleInputChange} required />
            <FormInput id="city" label="City" type="text" placeholder="Anytown" value={formData.city} onChange={handleInputChange} required />
          </div>

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white transition duration-150 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              }`}
            >
              {loading ? "Creating Account..." : "Create Customer Account"}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Login here.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
