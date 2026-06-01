"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg)", fontFamily: "var(--font-dm-sans)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-bebas text-4xl tracking-widest mb-1" style={{ color: "var(--green)" }}>
            THE PE PLAYBOOK
          </div>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            Sign in to your account
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 tracking-wide uppercase" style={{ color: "var(--muted)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                  outline: "none",
                }}
                placeholder="teacher@school.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 tracking-wide uppercase" style={{ color: "var(--muted)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border2)",
                  color: "var(--text)",
                  outline: "none",
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold py-3 rounded-xl transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              style={{ background: "var(--green)", color: "#000" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
            No account?{" "}
            <a href="/signup" className="font-bold" style={{ color: "var(--green)" }}>
              Sign up free
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
