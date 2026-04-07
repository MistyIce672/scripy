"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

type Mode = "email" | "code" | "password";

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { sendOtp, verifyOtp, signInWithPassword, loading, session, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && session) router.replace("/");
  }, [initialized, session, router]);

  async function handleSendCode() {
    setError(null);
    if (!email.trim()) { setError("Please enter your email"); return; }
    const result = await sendOtp(email.trim());
    if (result.error) setError(result.error);
    else setMode("code");
  }

  async function handleVerifyCode() {
    setError(null);
    if (!code.trim()) { setError("Please enter the code"); return; }
    const result = await verifyOtp(email.trim(), code.trim());
    if (result.error) setError(result.error);
  }

  async function handlePasswordSignIn() {
    setError(null);
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password) { setError("Please enter your password"); return; }
    const result = await signInWithPassword(email.trim(), password);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-gray-900">Scripy</h1>
        <p className="text-base text-gray-500 text-center mt-2 mb-10">
          Create, share, and run HTML mini apps
        </p>

        {mode === "email" && (
          <div className="space-y-3">
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base disabled:opacity-50 hover:bg-blue-700 transition-colors"
              onClick={handleSendCode}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
            <button
              className="w-full text-blue-600 text-sm font-medium"
              onClick={() => { setError(null); setMode("password"); }}
            >
              Sign in with password instead
            </button>
          </div>
        )}

        {mode === "code" && (
          <div className="space-y-3">
            <p className="text-lg font-semibold text-center text-gray-900">Enter the code</p>
            <p className="text-sm text-gray-500 text-center">
              We sent an 8-digit code to {email}
            </p>
            <input
              type="text"
              inputMode="numeric"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="12345678"
              autoFocus
              maxLength={8}
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base disabled:opacity-50 hover:bg-blue-700 transition-colors"
              onClick={handleVerifyCode}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
            <button
              className="w-full text-blue-600 text-sm font-medium"
              onClick={() => { setError(null); setCode(""); setMode("email"); }}
            >
              Use a different email
            </button>
          </div>
        )}

        {mode === "password" && (
          <div className="space-y-3">
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              disabled={loading}
            />
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base bg-gray-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={loading}
              onKeyDown={(e) => e.key === "Enter" && handlePasswordSignIn()}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base disabled:opacity-50 hover:bg-blue-700 transition-colors"
              onClick={handlePasswordSignIn}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <button
              className="w-full text-blue-600 text-sm font-medium"
              onClick={() => { setError(null); setPassword(""); setMode("email"); }}
            >
              Sign in with verification code instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
