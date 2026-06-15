"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Sparkles, Key, Mail, User, AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const API_URL = "/api/v1";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Authentication failed.");
      }

      // Store token in LocalStorage
      localStorage.setItem("sbi_saathi_token", data.access_token);
      localStorage.setItem("sbi_saathi_user_name", data.user_name);
      localStorage.setItem("sbi_saathi_user_email", data.user_email);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* BACK TO HOME LINK */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center font-bold text-slate-950 relative overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.4)] mb-3">
            <span className="text-xl">S</span>
            <div className="absolute inset-2 bg-slate-950 rounded-full flex items-center justify-center">
              <div className="w-3.5 h-3.5 bg-sky-500 rounded-full" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            SBI <span className="text-sky-500 font-medium">Saathi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            {isLogin ? "Welcome Back" : "Create Demo Profile"}
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="E.g. Rohith Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:border-sky-500 focus:outline-none transition-all focus:ring-2 focus:ring-sky-500/10"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="E.g. customer@sbi.co.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:border-sky-500 focus:outline-none transition-all focus:ring-2 focus:ring-sky-500/10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-11 pr-4 text-slate-100 placeholder-slate-500 text-sm focus:border-sky-500 focus:outline-none transition-all focus:ring-2 focus:ring-sky-500/10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 text-slate-950 py-3.5 rounded-lg font-bold hover:bg-sky-400 transition transform active:scale-95 disabled:opacity-50 disabled:transform-none shadow-[0_4px_20px_rgba(14,165,233,0.25)] flex items-center justify-center gap-2 text-sm"
          >
            {loading ? "Authenticating..." : isLogin ? "Login to Dashboard" : "Register & Seed Demo Data"}
          </button>
        </form>

        {/* TOGGLE BUTTON */}
        <div className="mt-8 text-center text-sm text-slate-400 border-t border-slate-800/80 pt-6">
          {isLogin ? (
            <span>
              New to SBI Saathi?{" "}
              <button 
                onClick={() => setIsLogin(false)} 
                className="text-sky-400 hover:underline font-semibold"
              >
                Create an account
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button 
                onClick={() => setIsLogin(true)} 
                className="text-sky-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
