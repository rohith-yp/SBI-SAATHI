"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  ArrowRight, 
  Cpu, 
  Database, 
  Layers, 
  Activity,
  Maximize2
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<string>("health");

  const agents = {
    health: {
      name: "Financial Health Agent",
      role: "Score Generation & Explanation",
      desc: "Autonomously audits account books to compute comprehensive metrics (Savings Score, Spending Score, Risk Score) and outputs a detailed plain-text rationale explaining the score.",
      color: "from-blue-600 to-indigo-600",
      details: ["Real-time health auditing", "Automated score reasoning", "Comparative score tracking"]
    },
    spending: {
      name: "Spending Analysis Agent",
      role: "Leak Detection & Budgeting",
      desc: "Pinpoints category-wise outflows, detects critical money leaks (e.g. food delivery frequency spikes), and evaluates compliance against the classic 50/30/20 budget framework.",
      color: "from-teal-500 to-emerald-600",
      details: ["Automatic expense categorization", "Alerts on recurring money drains", "50/30/20 budget tracking"]
    },
    goals: {
      name: "Goal Planning Agent",
      role: "Savings & Completion Forecast",
      desc: "Monitors target goals, schedules monthly contributions, and performs calculations to predict completion dates based on live savings dynamics.",
      color: "from-purple-500 to-pink-500",
      details: ["Custom financial goal tracking", "Dynamic projection algorithms", "Optimized deposit suggestions"]
    },
    risk: {
      name: "Risk Detection Agent",
      role: "Predictive Warning System",
      desc: "Scans upcoming liabilities, recurring utility payments, and EMIs to cross-check them against cash buffers, warning users before any transaction defaults.",
      color: "from-rose-500 to-red-600",
      details: ["Low-balance warnings", "Spike in discretionary spend flags", "Bounce protection reminders"]
    },
    product: {
      name: "Product Recommendation Agent",
      role: "SBI Account & Wealth Advisory",
      desc: "Recommends high-yielding, relevant SBI offerings (such as SBI MODS, Flexi RDs, or low-cost overdraft loans) mapped strictly to the user's cash standing.",
      color: "from-amber-500 to-orange-600",
      details: ["Sovereign interest optimization", "Custom SIP recommendations", "Smart home loan overdraft parking"]
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-slate-950">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* NAVIGATION HEADER */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* SBI Circle Icon Logo */}
            <div className="w-9 h-9 bg-sky-500 rounded-full flex items-center justify-center font-bold text-slate-950 relative overflow-hidden shadow-[0_0_15px_rgba(14,165,233,0.4)]">
              <span className="z-10 text-lg">S</span>
              <div className="absolute inset-1.5 bg-slate-950 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                SBI <span className="text-sky-500 font-medium">Saathi</span>
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
                AI Wellness Agent
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth" 
              className="px-5 py-2.5 bg-sky-500 text-slate-950 font-semibold rounded-lg hover:bg-sky-400 transition shadow-[0_4px_20px_rgba(14,165,233,0.25)] flex items-center gap-2 text-sm"
            >
              Launch Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 border border-blue-500/20 text-sky-400 rounded-full text-xs font-semibold uppercase tracking-wider mb-8">
          <Sparkles className="w-4 h-4 animate-pulse" /> SBI Hackathon 2026 – Digital Engagement Theme
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-400 bg-clip-text text-transparent mb-6 max-w-5xl mx-auto leading-tight">
          Empower Your Banking with Autonomous Financial Wellness
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Most banking apps simply display ledger statements. **SBI Saathi** acts as an active companion, powered by autonomous **CrewAI Agents** and the **GROQ API**, to analyze cash flow, detect money leaks, and automatically optimize your savings.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link 
            href="/auth" 
            className="w-full sm:w-auto px-8 py-4 bg-sky-500 text-slate-950 font-bold rounded-lg hover:bg-sky-400 transition-all transform hover:scale-[1.02] shadow-[0_8px_30px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2"
          >
            Launch Demo Workspace <ArrowRight className="w-5 h-5" />
          </Link>

        </div>
      </section>

      {/* INTERACTIVE AGENT SHOWCASE */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/80 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Autonomous CrewAI Financial Agents
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              SBI Saathi features five independent AI agents operating collaboratively under a unified CrewAI orchestrator to manage your financial security and growth.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-3 mb-10 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
            {Object.entries(agents).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-3.5 px-4 rounded-lg font-semibold text-sm transition-all duration-250 ${
                  activeTab === key 
                    ? "bg-slate-800 text-sky-400 shadow-md border border-slate-700/50" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {val.name.split(" ")[0]} {val.name.split(" ")[1]}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 rounded-xl border border-slate-800 p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[80px]" />
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block mb-2">
                  Agent Responsibility
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {agents[activeTab as keyof typeof agents].name}
                </h3>
                <p className="text-sm text-slate-500 font-semibold mb-6 uppercase tracking-wider">
                  Role: {agents[activeTab as keyof typeof agents].role}
                </p>
                <p className="text-slate-400 leading-relaxed mb-8">
                  {agents[activeTab as keyof typeof agents].desc}
                </p>
                <ul className="space-y-3">
                  {agents[activeTab as keyof typeof agents].details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                      <div className="w-5 h-5 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-400">
                        ✓
                      </div>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-64 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col items-center justify-center text-center p-6 relative">
                <div className="absolute top-4 left-4 flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500/40 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500/40 rounded-full" />
                  <div className="w-3 h-3 bg-green-500/40 rounded-full" />
                </div>
                <Cpu className="w-16 h-16 text-sky-400 animate-pulse mb-4" />
                <span className="text-sm font-semibold tracking-wider uppercase text-slate-500">
                  Agent Orchestration Active
                </span>
                <span className="text-xs text-sky-500/70 font-mono mt-1">
                  GROQ LLM Client Mode Running
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* CALL TO ACTION */}
      <section className="py-24 px-6 text-center max-w-5xl mx-auto relative">
        <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-2xl pointer-events-none" />
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 md:p-16 relative overflow-hidden">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Empower SBI Customers Today
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-10 text-base md:text-lg">
            Experience the next step in banking digital engagement. Run the full simulation with transactional mock credits, upcoming bills, and AI recommendations.
          </p>
          <Link 
            href="/auth" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 text-slate-950 font-bold rounded-lg hover:bg-sky-400 transition transform hover:scale-[1.02] shadow-[0_8px_30px_rgba(14,165,233,0.35)]"
          >
            Get Started with Demo Mode <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-10 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 State Bank of India – Autonomous Financial Wellness Initiative. Hackathon Demonstration Prototype.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
