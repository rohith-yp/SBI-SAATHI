"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  LogOut, 
  RefreshCw, 
  Send, 
  Plus, 
  Trash2, 
  IndianRupee, 
  CheckCircle, 
  MessageSquare, 
  X,
  CreditCard,
  User,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid,
  Legend
} from "recharts";

interface Transaction {
  _id?: string;
  id?: string;
  title: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

interface Goal {
  _id?: string;
  id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  monthly_contribution: number;
}

interface Alert {
  _id?: string;
  id?: string;
  title: string;
  amount: number;
  due_date: string;
  category: string;
  status: string;
}

interface Recommend {
  product_name: string;
  category: string;
  reason: string;
  benefit_score: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("Valued Customer");
  const [balance, setBalance] = useState<number>(0);
  
  // Dashboard Metrics
  const [income, setIncome] = useState<number>(0);
  const [expense, setExpense] = useState<number>(0);
  const [netSavings, setNetSavings] = useState<number>(0);
  const [scores, setScores] = useState({
    overall: 50,
    savings: 50,
    spending: 50,
    risk: 50,
    explanation: ""
  });
  
  const [leaks, setLeaks] = useState<string[]>([]);
  const [compliance, setCompliance] = useState<string>("");
  const [recommendations, setRecommendations] = useState<Recommend[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [goalsAnalysis, setGoalsAnalysis] = useState<any[]>([]);

  // Dialog / Form States
  const [showTxModal, setShowTxModal] = useState<boolean>(false);
  const [txTitle, setTxTitle] = useState<string>("");
  const [txAmount, setTxAmount] = useState<string>("");
  const [txCategory, setTxCategory] = useState<string>("Shopping");
  const [txType, setTxType] = useState<string>("debit");

  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [goalTitle, setGoalTitle] = useState<string>("");
  const [goalTarget, setGoalTarget] = useState<string>("");
  const [goalCurrent, setGoalCurrent] = useState<string>("");
  const [goalDate, setGoalDate] = useState<string>("");
  const [goalContribution, setGoalContribution] = useState<string>("");

  // Chatbot State
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hello! I am SBI Saathi AI, your autonomous financial wellness agent. How can I help you improve your savings rate or optimize your investments today?" }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const API_URL = "/api/v1";

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatOpen]);

  const getHeaders = () => {
    const token = localStorage.getItem("sbi_saathi_token");
    if (!token) {
      router.push("/auth");
      return null;
    }
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
  };

  const fetchData = async () => {
    const headers = getHeaders();
    if (!headers) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/dashboard`, { headers });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
        throw new Error("Failed to load dashboard data");
      }
      
      const data = await res.json();
      
      setUserName(data.user.name);
      setBalance(data.user.current_balance);
      setIncome(data.totals.income);
      setExpense(data.totals.expense);
      setNetSavings(data.totals.net_savings);
      
      setScores({
        overall: data.health_scores.overall,
        savings: data.health_scores.savings,
        spending: data.health_scores.spending,
        risk: data.health_scores.risk,
        explanation: data.health_scores.explanation
      });
      
      setLeaks(data.spending_insights.leaks);
      setCompliance(data.spending_insights.compliance_50_30_20);
      setRecommendations(data.sbi_recommendations);
      setTransactions(data.transactions);
      setGoals(data.goals);
      setAlerts(data.alerts);
      setGoalsAnalysis(data.goals_analysis);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Pay Bill Action
  const handlePayBill = async (alertId: string) => {
    const headers = getHeaders();
    if (!headers) return;

    try {
      const res = await fetch(`${API_URL}/alerts/${alertId}/pay`, {
        method: "POST",
        headers
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Payment failed");
        return;
      }
      // Re-fetch data to update numbers and transactions
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Add Transaction
  const handleAddTx = async (e: FormEvent) => {
    e.preventDefault();
    const headers = getHeaders();
    if (!headers) return;

    const payload = {
      title: txTitle,
      amount: parseFloat(txAmount),
      category: txCategory,
      type: txType,
      date: new Date().toISOString().split("T")[0]
    };

    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowTxModal(false);
        setTxTitle("");
        setTxAmount("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Goal
  const handleAddGoal = async (e: FormEvent) => {
    e.preventDefault();
    const headers = getHeaders();
    if (!headers) return;

    const payload = {
      title: goalTitle,
      target_amount: parseFloat(goalTarget),
      current_amount: parseFloat(goalCurrent),
      target_date: goalDate,
      monthly_contribution: parseFloat(goalContribution)
    };

    try {
      const res = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowGoalModal(false);
        setGoalTitle("");
        setGoalTarget("");
        setGoalCurrent("");
        setGoalDate("");
        setGoalContribution("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (goalId: string) => {
    const headers = getHeaders();
    if (!headers) return;

    if (!confirm("Are you sure you want to delete this savings goal?")) return;

    try {
      const res = await fetch(`${API_URL}/goals/${goalId}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat Submission
  const handleSendChat = async (e?: FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatMessage;
    if (!textToSend.trim()) return;

    const token = localStorage.getItem("sbi_saathi_token");
    if (!token) return;

    const newHistory = [...chatHistory, { role: "user", content: textToSend }];
    setChatHistory(newHistory);
    if (!customText) setChatMessage("");
    
    setChatLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        })
      });

      const data = await res.json();
      if (res.ok) {
        setChatHistory([...newHistory, { role: "assistant", content: data.response }]);
      } else {
        setChatHistory([...newHistory, { role: "assistant", content: "Apologies, I encountered an issue accessing the GROQ client." }]);
      }
    } catch (err) {
      console.error(err);
      setChatHistory([...newHistory, { role: "assistant", content: "Failed to connect to the backend agent server." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sbi_saathi_token");
    localStorage.removeItem("sbi_saathi_user_name");
    localStorage.removeItem("sbi_saathi_user_email");
    router.push("/");
  };

  // Dynamic Chart Prep
  const categoryData = Object.entries(
    transactions
      .filter((t) => t.type === "debit")
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ["#0054a6", "#00a4e4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

  // Monthly Spending Trend (Simulated using existing transactions)
  const spendingTrend = [
    { month: "Jan", spending: expense * 0.8, savings: income * 0.15 },
    { month: "Feb", spending: expense * 0.9, savings: income * 0.12 },
    { month: "Mar", spending: expense * 1.1, savings: income * 0.08 },
    { month: "Apr", spending: expense * 0.95, savings: income * 0.18 },
    { month: "May", spending: expense * 1.05, savings: income * 0.14 },
    { month: "Jun", spending: expense, savings: netSavings > 0 ? netSavings : 0 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
        <RefreshCw className="w-10 h-10 text-sky-500 animate-spin mb-4" />
        <p className="text-sm tracking-widest text-slate-400 font-semibold uppercase">
          Orchestrating AI Agent Crew...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center font-bold text-slate-950 relative overflow-hidden shadow-[0_0_10px_rgba(14,165,233,0.3)]">
            <span className="text-sm">S</span>
            <div className="absolute inset-1.5 bg-slate-950 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-sky-500 rounded-full" />
            </div>
          </Link>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">
              SBI <span className="text-sky-500 font-medium">Saathi</span>
            </h1>
            <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold -mt-1">
              Demo Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300">Welcome, {userName}</span>
          </div>
          
          <button
            onClick={fetchData}
            title="Force Agent Re-Analysis"
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden md:inline">Analyze</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 rounded-lg text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD CORE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* ROW 1: BALANCE & WELLNESS CARD */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* BALANCE METRICS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                SBI Net Ledger Balance
              </span>
              <h3 className="text-4xl font-extrabold text-white mt-2 flex items-center gap-1">
                ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-4 mt-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Inflows</span>
                <p className="text-sm font-bold text-emerald-400 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                  ₹{income.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Outflows</span>
                <p className="text-sm font-bold text-rose-400 flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                  ₹{expense.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Savings</span>
                <p className="text-sm font-bold text-sky-400">
                  ₹{netSavings.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* FINANCIAL HEALTH SCORE CARD */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 grid md:grid-cols-3 gap-6 relative overflow-hidden">
            <div className="md:border-r border-slate-800/80 pr-2 flex flex-col items-center justify-center text-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG Radial Score */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="#00a4e4" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * scores.overall) / 100}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{scores.overall}</span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Wellness</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                    AI Agent Health Calculation
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  &ldquo;{scores.explanation}&rdquo;
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Savings Score</span>
                  <p className="text-base font-extrabold text-white">{scores.savings}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Spending Score</span>
                  <p className="text-base font-extrabold text-white">{scores.spending}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Risk Score</span>
                  <p className="text-base font-extrabold text-white">{scores.risk}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ROW 2: ACTIVE AGENTS & PRODUCT ADVISOR */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* AI RECOMMENDATIONS PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400">
              SBI Tailored Recommendations
            </h4>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-1 relative glow-card">
                  <span className="text-[9px] font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-2 py-0.5 rounded">
                    {rec.category}
                  </span>
                  <h5 className="font-bold text-white text-sm mt-1">{rec.product_name}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec.reason}</p>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-800/40 text-[10px]">
                    <span className="text-slate-500">Benefit Fit Score:</span>
                    <span className="text-emerald-400 font-bold">{rec.benefit_score}% Match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI AGENTS STATUS CARDS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400 mb-4">
                CrewAI Agent Status
              </h4>
              <div className="space-y-3.5">
                {[
                  { name: "Financial Health Agent", role: "Wellness Assessor" },
                  { name: "Spending Analysis Agent", role: "Leak Inspector" },
                  { name: "Goal Planning Agent", role: "Forecast Predictor" },
                  { name: "Risk Detection Agent", role: "Liabilities Controller" },
                  { name: "Product Recommendation Agent", role: "Offer Optimizer" }
                ].map((agent, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                      <div>
                        <p className="font-bold text-slate-200">{agent.name}</p>
                        <p className="text-[10px] text-slate-500">{agent.role}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold text-[10px]">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-800/80 pt-4 mt-6 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">Orchestration Protocol:</span>
              <span className="text-sky-400 font-bold font-mono">CrewAI sequential</span>
            </div>
          </div>

          {/* EMI & BILL ALERTS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400 mb-4">
                Upcoming EMI & Bill Alerts
              </h4>
              <div className="space-y-3">
                {alerts.map((alertItem) => (
                  <div key={alertItem._id || alertItem.id} className="bg-slate-950 border border-slate-800 p-4 rounded-lg flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-200">{alertItem.title}</p>
                      <div className="flex gap-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> Due: {alertItem.due_date}</span>
                        <span className="uppercase text-slate-400 font-bold">{alertItem.category}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1.5">
                      <p className="font-extrabold text-white">₹{alertItem.amount.toLocaleString("en-IN")}</p>
                      {alertItem.status === "pending" ? (
                        <button
                          onClick={() => handlePayBill(alertItem._id || alertItem.id || "")}
                          className="px-2.5 py-1 bg-sky-500 text-slate-950 font-bold rounded hover:bg-sky-400 transition"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-bold">
                          <CheckCircle className="w-2.5 h-2.5" /> PAID
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {leaks.length > 0 && (
              <div className="mt-4 p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-rose-400 leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Discretionary Leaks Spotted:</span>
                  {leaks.map((leak, idx) => <p key={idx}>• {leak}</p>)}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ROW 3: VISUAL CHARTS */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* INCOME VS EXPENSE & MONTHLY TREND */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400">
              Spending vs Savings Trend
            </h4>
            <div className="h-64">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={spendingTrend}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00a4e4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00a4e4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                    <Legend verticalAlign="top" height={36} />
                    <Area name="Monthly Spending" type="monotone" dataKey="spending" stroke="#ef4444" fillOpacity={1} fill="url(#colorSpend)" />
                    <Area name="Monthly Savings" type="monotone" dataKey="savings" stroke="#00a4e4" fillOpacity={1} fill="url(#colorSave)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CATEGORY BREAKDOWN PIE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400">
              Debit Outflows Category Breakdown
            </h4>
            <div className="h-64 grid md:grid-cols-2 gap-4 items-center">
              <div className="h-full">
                {mounted && categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No debit transactions to map.
                  </div>
                )}
              </div>
              <div className="space-y-2.5">
                {categoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">₹{item.value.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                {compliance && (
                  <p className="text-[10px] text-slate-500 mt-4 border-t border-slate-800/80 pt-3 italic">
                    {compliance}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* ROW 4: GOAL TRACKER & TRANSACTION LEDGER */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* GOAL PROGRESS TRACKER */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400">
                  Goal Progress Tracker
                </h4>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Goal
                </button>
              </div>

              <div className="space-y-5">
                {goals.map((g) => {
                  const progressPct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
                  const analysisItem = goalsAnalysis.find((a) => a.goal_id === g._id || a.goal_id === g.id);
                  
                  return (
                    <div key={g._id || g.id} className="space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <p className="font-bold text-slate-200">{g.title}</p>
                          <span className="text-[10px] text-slate-500">
                            Contribution: ₹{g.monthly_contribution.toLocaleString("en-IN")}/mo
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-bold text-white">{progressPct}% ({g.current_amount.toLocaleString("en-IN")} / {g.target_amount.toLocaleString("en-IN")})</p>
                            {analysisItem && (
                              <span className={`text-[9px] font-bold ${
                                analysisItem.status === "On-Track" ? "text-emerald-400" : "text-rose-400"
                              }`}>
                                {analysisItem.status} • Finish: {analysisItem.predicted_completion_date}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(g._id || g.id || "")}
                            className="text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2">
                        <div 
                          className="bg-sky-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-extrabold text-sm uppercase tracking-widest text-slate-400">
                  Recent Ledger Transactions
                </h4>
                <button
                  onClick={() => setShowTxModal(true)}
                  className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition flex items-center gap-1 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Tx
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {transactions.map((tx) => (
                  <div key={tx._id || tx.id} className="bg-slate-950 border border-slate-800/80 p-3 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{tx.title}</p>
                        <span className="text-[10px] text-slate-500 font-medium">{tx.date} • {tx.category}</span>
                      </div>
                    </div>
                    <span className={`font-extrabold ${tx.type === "credit" ? "text-emerald-400" : "text-slate-300"}`}>
                      {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 1 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* FLOATABLE CHAT PANEL: SBI SAATHI AI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {chatOpen ? (
          <div className="w-[360px] h-[480px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* CHAT HEADER */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1">
                    SBI <span className="text-sky-500 font-medium">Saathi AI</span>
                  </h4>
                  <span className="block text-[8px] uppercase tracking-widest text-slate-400 font-bold -mt-0.5">
                    Powered by GROQ
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CHAT BODY MESSAGES */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-900/40 text-xs">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === "user" 
                      ? "bg-sky-500 text-slate-950 font-medium rounded-tr-none" 
                      : "bg-slate-950 text-slate-300 border border-slate-800/80 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 text-slate-400 border border-slate-800/80 rounded-xl rounded-tl-none px-3.5 py-3 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full typing-dot" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full typing-dot" />
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full typing-dot" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* QUICK ACTIONS SUGGESTIONS */}
            <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-900/10 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
              <button 
                onClick={() => handleSendChat(undefined, "What is my financial health score?")}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-[10px] text-slate-400 hover:text-slate-200 transition"
              >
                Explain Score
              </button>
              <button 
                onClick={() => handleSendChat(undefined, "Where am I leaking money?")}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-[10px] text-slate-400 hover:text-slate-200 transition"
              >
                Money Leaks
              </button>
              <button 
                onClick={() => handleSendChat(undefined, "What products do you recommend for me?")}
                className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded hover:border-slate-700 text-[10px] text-slate-400 hover:text-slate-200 transition"
              >
                SBI Products
              </button>
            </div>

            {/* CHAT INPUT */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="Ask financial question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="p-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-sky-500 text-slate-950 rounded-full flex items-center justify-center hover:bg-sky-400 shadow-[0_4px_25px_rgba(14,165,233,0.45)] transition duration-200 transform hover:scale-105"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ==========================================
          MODALS & FORM POPUPS
          ========================================== */}
      
      {/* 1. TRANSACTION MODAL */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button 
              onClick={() => setShowTxModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-base font-extrabold text-white mb-4 uppercase tracking-wider">
              Record Transaction Entry
            </h4>
            <form onSubmit={handleAddTx} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description / Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. SBI Debit ATM withdrawal"
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g. 1500"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Transaction Flow</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="debit">Debit Outflow</option>
                    <option value="credit">Credit Inflow</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Financial Category</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="Shopping">Shopping / Lifestyle</option>
                  <option value="Food">Food & Dining</option>
                  <option value="Travel">Travel & Cabs</option>
                  <option value="Utilities">Utilities & Phone</option>
                  <option value="EMI">EMI & Loans</option>
                  <option value="Income">Salary / Credits</option>
                  <option value="Other">Other Category</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500 text-slate-950 py-3 rounded-lg font-bold hover:bg-sky-400 transition"
              >
                Log Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. GOAL MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
            <button 
              onClick={() => setShowGoalModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-base font-extrabold text-white mb-4 uppercase tracking-wider">
              Establish Savings Goal
            </h4>
            <form onSubmit={handleAddGoal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. SBI SIP Car Purchase Fund"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g. 100000"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Current Savings (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g. 5000"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Date</label>
                  <input
                    type="date"
                    required
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Allocation (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="E.g. 2500"
                    value={goalContribution}
                    onChange={(e) => setGoalContribution(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500 text-slate-950 py-3 rounded-lg font-bold hover:bg-sky-400 transition"
              >
                Create Savings Goal
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
