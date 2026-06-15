import os
import json
import logging
from typing import Dict, Any, List
from langchain_groq import ChatGroq
from crewai import Agent, Task, Crew, Process
from backend.app.core.config import settings

logger = logging.getLogger("sbi_saathi_agents")

# ==========================================
# AGENT DEFINITIONS & ORCHESTRATION
# ==========================================

class SBISaathiCrew:
    def __init__(self, groq_api_key: str = None):
        self.api_key = groq_api_key or settings.GROQ_API_KEY
        self.llm = None
        if self.api_key:
            try:
                # Initialize ChatGroq LLM
                self.llm = ChatGroq(
                    temperature=0.2,
                    groq_api_key=self.api_key,
                    model_name="mixtral-8x7b-32768"
                )
                logger.info("ChatGroq LLM initialized successfully.")
            except Exception as e:
                logger.error(f"Error initializing ChatGroq: {e}. AI features will use fallback engine.")
        else:
            logger.warning("No GROQ_API_KEY configured. CrewAI will run with local analytical fallback.")

    def run_crew_analysis(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the CrewAI financial wellness orchestration crew."""
        if not self.llm:
            return self.run_local_fallback_analysis(user_data)
            
        try:
            # Formulate the context payload for the agents
            context_str = json.dumps(user_data, indent=2, default=str)
            
            # 1. Financial Health Agent
            health_agent = Agent(
                role="Financial Health Analyst",
                goal="Assess overall financial wellness, compute sub-scores (Savings, Spending, Risk), and write a clear calculation breakdown.",
                backstory="You are an expert financial advisor at SBI. You look at a user's transactions, cash flows, and balance to evaluate their overall financial status.",
                verbose=True,
                allow_delegation=False,
                llm=self.llm
            )
            
            # 2. Spending Analysis Agent
            spending_agent = Agent(
                role="Spending Behavior Specialist",
                goal="Identify category-wise spending patterns, detect overspending, pinpoint money leaks, and compare vs the 50/30/20 budgeting rule.",
                backstory="You are a certified budgeting coach. You find out where money is leaking, highlight high-frequency transactions, and suggest categories to trim down.",
                verbose=True,
                allow_delegation=False,
                llm=self.llm
            )
            
            # 3. Goal Planning Agent
            goal_agent = Agent(
                role="Financial Goal Planner",
                goal="Examine savings goals, check progress, estimate completion timelines, and flag if they are on-track or at-risk.",
                backstory="You are a goal-driven financial planner. You calculate necessary monthly allocations and project completion dates using mathematical logic.",
                verbose=True,
                allow_delegation=False,
                llm=self.llm
            )

            # 4. Risk Detection Agent
            risk_agent = Agent(
                role="Risk Mitigation Officer",
                goal="Scan upcoming obligations like EMIs and bills, check balance coverage, flag unusual expenses, and produce safety warnings.",
                backstory="You are a bank risk analyst. You alert users before they fall into cash flow gaps, negative balances, or default on EMIs.",
                verbose=True,
                allow_delegation=False,
                llm=self.llm
            )

            # 5. Product Recommendation Agent
            product_agent = Agent(
                role="SBI Product Advisor",
                goal="Recommend matching State Bank of India products (savings schemes, fixed/recurring deposits, mutual funds, home loans) based on the user's details.",
                backstory="You are a customer relationship manager at SBI. You know all SBI products (SBI MODS, SBI Flexi Savings, SBI Mutual Funds, SBI Maxgain) and recommend them specifically to maximize user return and engagement.",
                verbose=True,
                allow_delegation=False,
                llm=self.llm
            )

            # Define Tasks
            task_health = Task(
                description=f"Analyze this banking profile: {context_str}. Provide an overall Wellness Score (0-100), along with Savings, Spending, and Risk sub-scores. Write a clear calculation breakdown explanation.",
                expected_output="JSON structure containing 'overall_score', 'savings_score', 'spending_score', 'risk_score', and 'breakdown_text'.",
                agent=health_agent
            )

            task_spending = Task(
                description="Categorize spending, list top 3 money leaks (e.g. food delivery, ride shares), and outline spending habits compared to the 50/30/20 budget format.",
                expected_output="JSON structure containing 'category_breakdown', 'money_leaks' (list), and 'budgeting_compliance'.",
                agent=spending_agent
            )

            task_goals = Task(
                description="Review all target financial goals in the user data. Calculate completion dates based on current net monthly savings, and recommend monthly savings adjustments.",
                expected_output="JSON structure containing goal progress assessments, list of goals with estimated dates, and status ('On-Track', 'At-Risk', 'Off-Track').",
                agent=goal_agent
            )

            task_risk = Task(
                description="Identify financial threats such as low balance for future EMIs, large unexpected shopping spikes, or credit cards reaching limits.",
                expected_output="JSON structure containing a list of active risks, risk levels ('High', 'Medium', 'Low'), and recommendations to avoid issues.",
                agent=risk_agent
            )

            task_product = Task(
                description="Suggest up to 3 custom SBI products that directly benefit the user based on their savings, spending patterns, or active goals.",
                expected_output="JSON structure containing list of product recommendations, each with product_name, benefits, and how to apply.",
                agent=product_agent
            )

            # Run Crew in Series
            crew = Crew(
                agents=[health_agent, spending_agent, goal_agent, risk_agent, product_agent],
                tasks=[task_health, task_spending, task_goals, task_risk, task_product],
                process=Process.sequential,
                verbose=2
            )
            
            result = crew.kickoff()
            logger.info("CrewAI execution completed successfully.")
            
            # Since CrewAI returns text/markdown, we will write a parsing wrapper.
            # To ensure it always returns a clean JSON schema, we fall back to a parser or structured prompts.
            # For simplicity, we can let our crew return JSON, but we will wrap it with a fallback parser.
            return self.parse_crew_output(result, user_data)
            
        except Exception as e:
            logger.error(f"Error running CrewAI: {e}. Falling back to rule-based engine.")
            return self.run_local_fallback_analysis(user_data)

    def parse_crew_output(self, result_text: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Tries to extract clean JSON from CrewAI outputs, falling back to local analysis if invalid."""
        # CrewAI output might contain conversational wrappers or separate task outputs.
        # If we cannot parse it easily, we will build a composite object using the LLM directly, 
        # or enrich our local fallback analytics using the LLM's raw text.
        # For a bulletproof hackathon demo, we will combine the structured calculation logic of our 
        # local engine with the text insights generated by the LLM.
        
        # Let's extract raw insights and plug them into the structured dashboard payload:
        base_payload = self.run_local_fallback_analysis(user_data)
        
        # We can run a quick direct LLM call to get structured JSON if CrewAI sequential text parsing is complex
        try:
            prompt = f"""
            You are SBI Saathi AI agent. Review the following raw text report from our CrewAI financial agent crew:
            ===
            {result_text}
            ===
            
            Convert this report into a strict JSON payload matching this schema:
            {{
              "health_scores": {{
                "overall": 82,
                "savings": 75,
                "spending": 80,
                "risk": 90,
                "explanation": "Explanation..."
              }},
              "spending_insights": {{
                "leaks": ["leak 1", "leak 2"],
                "compliance_50_30_20": "Your essential expenses are..."
              }},
              "goals_analysis": [
                {{
                  "goal_id": "1",
                  "title": "Goal Title",
                  "predicted_completion_date": "YYYY-MM-DD",
                  "status": "On-Track"
                }}
              ],
              "risk_alerts": [
                {{
                  "title": "Alert Title",
                  "severity": "High",
                  "description": "Details..."
                }}
              ],
              "sbi_recommendations": [
                {{
                  "product_name": "SBI Maxgain",
                  "category": "Loans / Investments",
                  "reason": "Why this fits...",
                  "benefit_score": 95
                }}
              ]
            }}
            
            Return ONLY the valid JSON object. No conversational prefix, no markdown blocks.
            """
            
            response = self.llm.predict(prompt)
            # Remove markdown code blocks if any
            clean_response = response.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()
            
            parsed = json.loads(clean_response)
            # Ensure correct keys exist, otherwise merge with base payload
            if "health_scores" in parsed:
                base_payload["health_scores"].update(parsed["health_scores"])
            if "spending_insights" in parsed:
                base_payload["spending_insights"].update(parsed["spending_insights"])
            if "goals_analysis" in parsed:
                base_payload["goals_analysis"] = parsed["goals_analysis"]
            if "risk_alerts" in parsed:
                base_payload["risk_alerts"] = parsed["risk_alerts"]
            if "sbi_recommendations" in parsed:
                base_payload["sbi_recommendations"] = parsed["sbi_recommendations"]
                
            logger.info("Successfully parsed and integrated CrewAI LLM insights.")
        except Exception as e:
            logger.warning(f"Error parsing LLM response, using rule-based metrics with text insights: {e}")
            
        return base_payload

    # ==========================================
    # PYTHON LOCAL ANALYTICAL FALLBACK ENGINE
    # ==========================================
    
    def run_local_fallback_analysis(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates precise metrics and generates insights locally using rules & templates."""
        transactions = user_data.get("transactions", [])
        goals = user_data.get("goals", [])
        
        # 1. Spend Analysis
        income = 0
        expenses = 0
        categories = {}
        
        for tx in transactions:
            amount = float(tx.get("amount", 0))
            category = tx.get("category", "Other")
            tx_type = tx.get("type", "debit")
            
            if tx_type == "credit":
                income += amount
            else:
                expenses += amount
                categories[category] = categories.get(category, 0) + amount

        net_savings = income - expenses
        savings_ratio = (net_savings / income) if income > 0 else 0

        # Category percentages
        cat_percentages = {}
        for cat, amt in categories.items():
            cat_percentages[cat] = round((amt / expenses * 100), 1) if expenses > 0 else 0

        # 2. Score Calculation
        # Savings Score (0-100): 20% or more savings is 100, linear down to 0
        if savings_ratio >= 0.25:
            savings_score = 95
        elif savings_ratio >= 0.20:
            savings_score = 85
        elif savings_ratio >= 0.10:
            savings_score = 65
        elif savings_ratio > 0:
            savings_score = 45
        else:
            savings_score = 25

        # Spending Score: based on non-essential spending.
        # Non-essential = Shopping, Food, Travel. Essential = Utilities, EMI.
        non_essential = categories.get("Shopping", 0) + categories.get("Food", 0) + categories.get("Travel", 0)
        non_essential_ratio = (non_essential / expenses) if expenses > 0 else 0
        
        if non_essential_ratio < 0.30:
            spending_score = 90
        elif non_essential_ratio < 0.45:
            spending_score = 75
        elif non_essential_ratio < 0.60:
            spending_score = 55
        else:
            spending_score = 35

        # Risk Score: based on Balance vs monthly EMIs
        balance = float(user_data.get("current_balance", 10000))
        monthly_emi = categories.get("EMI", 0)
        
        if balance < monthly_emi:
            risk_score = 30  # High Risk
        elif balance < (monthly_emi * 2):
            risk_score = 60  # Medium Risk
        else:
            risk_score = 90  # Low Risk / Healthy

        overall_score = int(round(savings_score * 0.4 + spending_score * 0.3 + risk_score * 0.3))

        # Explanation template
        explanation = f"Your overall wellness score is {overall_score}/100. "
        if overall_score >= 80:
            explanation += "Excellent financial health! Your savings rate is healthy, and you maintain a strong balance cushion relative to your recurring EMI obligations."
        elif overall_score >= 60:
            explanation += "Good standing, but there's room for improvement. Reducing discretionary spending in Shopping and Dining out could increase your savings rate."
        else:
            explanation += "Action required! Your upcoming monthly EMI obligations are high compared to your liquid balance. We recommend setting aside a buffer."

        # Money leaks detection
        leaks = []
        if categories.get("Food", 0) > (expenses * 0.25):
            leaks.append("High Dining & Food delivery expenses (exceeds 25% of total spend)")
        if categories.get("Shopping", 0) > (expenses * 0.20):
            leaks.append("Excessive shopping spending. Consider setting a monthly limit.")
        if categories.get("Travel", 0) > (expenses * 0.15):
            leaks.append("High cab rides/travel expenses. Try pooling rides or utilizing public transport.")
        if not leaks:
            leaks.append("No critical leaks found! Discretionary spending is well within standard limits.")

        # 50/30/20 Budgeting Compliance
        essential_spend = categories.get("Utilities", 0) + categories.get("EMI", 0)
        essential_pct = (essential_spend / income * 100) if income > 0 else 0
        wants_spend = non_essential
        wants_pct = (wants_spend / income * 100) if income > 0 else 0
        savings_pct = (net_savings / income * 100) if income > 0 else 0

        compliance_text = (
            f"50/30/20 Rule Analysis: Needs/Essentials are at {essential_pct:.1f}% (Target: 50%), "
            f"Wants are at {wants_pct:.1f}% (Target: 30%), and Savings are at {savings_pct:.1f}% (Target: 20%)."
        )

        # 3. Goals Analysis
        goals_analysis = []
        for g in goals:
            target = float(g.get("target_amount", 100000))
            current = float(g.get("current_amount", 0))
            target_date = g.get("target_date", "2026-12-31")
            g_id = g.get("_id", g.get("id", "1"))
            title = g.get("title", "Goal")

            remaining = target - current
            monthly_allocation = float(g.get("monthly_contribution", 1000))
            
            # Use current contribution rate to predict completion date
            if monthly_allocation > 0:
                months_needed = int(round(remaining / monthly_allocation))
                from datetime import datetime, timedelta
                predicted_date = (datetime.now() + timedelta(days=months_needed * 30.5)).strftime("%Y-%m-%d")
                
                # Check status
                try:
                    tgt_datetime = datetime.strptime(target_date, "%Y-%m-%d")
                    pred_datetime = datetime.strptime(predicted_date, "%Y-%m-%d")
                    status_val = "On-Track" if pred_datetime <= tgt_datetime else "At-Risk"
                except Exception:
                    status_val = "On-Track"
            else:
                predicted_date = "Indefinite"
                status_val = "Off-Track"

            goals_analysis.append({
                "goal_id": g_id,
                "title": title,
                "predicted_completion_date": predicted_date,
                "status": status_val
            })

        # 4. Risk Alerts
        risk_alerts = []
        if balance < monthly_emi:
            risk_alerts.append({
                "title": "EMI Payment Risk",
                "severity": "High",
                "description": f"Your current balance (₹{balance:,.2f}) is lower than your upcoming EMI (₹{monthly_emi:,.2f}). Add funds to avoid bounce charges."
            })
        if expenses > income:
            risk_alerts.append({
                "title": "Negative Monthly Cashflow",
                "severity": "Medium",
                "description": f"You have spent ₹{expenses - income:,.2f} more than your income this month. Consider reducing discretionary spending."
            })
        
        # Add a default info alert if none exists
        if not risk_alerts:
            risk_alerts.append({
                "title": "Buffer Balance Check",
                "severity": "Low",
                "description": "Cash reserves are stable. Keep regular track of your EMI schedules."
            })

        # 5. SBI Product Recommendations
        sbi_recs = []
        if net_savings > 10000:
            sbi_recs.append({
                "product_name": "SBI Multi Option Deposit Scheme (MODS)",
                "category": "Investments",
                "reason": f"Earn higher term deposit rates on your excess savings of ₹{net_savings:,.2f} with full liquidity.",
                "benefit_score": 92
            })
        
        # If active savings goals exist
        if goals:
            sbi_recs.append({
                "product_name": "SBI Flexi Recurring Deposit",
                "category": "Savings",
                "reason": "Automate monthly savings towards your goals and earn attractive interest rates starting from 6.8% p.a.",
                "benefit_score": 88
            })

        sbi_recs.append({
            "product_name": "SBI Mutual Fund - Equity Hybrid Fund",
            "category": "Wealth Management",
            "reason": "Start a SIP with ₹1,000/month to combat inflation and build long term capital appreciation.",
            "benefit_score": 85
        })

        if monthly_emi > 0:
            sbi_recs.append({
                "product_name": "SBI Maxgain Home Loan",
                "category": "Loans",
                "reason": "Park surplus savings in your Home Loan overdraft account to save massive interest payments.",
                "benefit_score": 90
            })

        return {
            "health_scores": {
                "overall": overall_score,
                "savings": savings_score,
                "spending": spending_score,
                "risk": risk_score,
                "explanation": explanation
            },
            "spending_insights": {
                "leaks": leaks,
                "compliance_50_30_20": compliance_text
            },
            "goals_analysis": goals_analysis,
            "risk_alerts": risk_alerts,
            "sbi_recommendations": sbi_recs[:3] # top 3
        }

    # ==========================================
    # CONVERSATIONAL CHATBOT FUNCTIONALITY
    # ==========================================
    
    async def chat_assistant(self, message: str, history: List[Dict[str, str]], user_data: Dict[str, Any]) -> str:
        """Handles chatbot dialogue with 'SBI Saathi AI', answering financial queries using GROQ."""
        if not self.llm:
            return self.local_chat_assistant(message, history, user_data)
            
        try:
            # Build conversation history context
            history_str = ""
            for msg in history[-5:]: # Keep last 5 messages for context
                role = "User" if msg["role"] == "user" else "SBI Saathi AI"
                history_str += f"{role}: {msg['content']}\n"
                
            context_str = json.dumps(self.run_local_fallback_analysis(user_data), indent=2, default=str)
            
            prompt = f"""
            You are "SBI Saathi AI", an autonomous financial wellness chatbot designed for State Bank of India customers.
            Your tone is professional, friendly, supportive, and banking-compliant. You help customers manage budgets, build savings, and understand financial wellness scores.
            
            Here is the customer's financial dashboard summary context:
            {context_str}
            
            Current Conversation History:
            {history_str}
            
            User's message: "{message}"
            
            Write your response. Do not exceed 3 paragraphs. Refer to specific numbers or calculations from the dashboard context if applicable. Highlight relevant SBI banking products (like SBI MODS or Flexi RD) if helpful.
            """
            
            response = await self.llm.apredict(prompt)
            return response.strip()
            
        except Exception as e:
            logger.error(f"Error in Groq chat assistant: {e}. Using local response.")
            return self.local_chat_assistant(message, history, user_data)

    def local_chat_assistant(self, message: str, history: List[Dict[str, str]], user_data: Dict[str, Any]) -> str:
        """Rules-based fallback chatbot responses for offline/no-api-key operations."""
        msg = message.lower()
        analysis = self.run_local_fallback_analysis(user_data)
        score = analysis["health_scores"]["overall"]
        leaks = ", ".join(analysis["spending_insights"]["leaks"])
        
        # Simple pattern matching
        if "score" in msg or "health" in msg or "wellness" in msg:
            return (
                f"Hello! I am SBI Saathi AI. Your Overall Financial Wellness Score is **{score}/100**. "
                f"This is calculated from your Savings Score ({analysis['health_scores']['savings']}), "
                f"Spending Score ({analysis['health_scores']['spending']}), and Risk Score ({analysis['health_scores']['risk']}). "
                f"Here is why: {analysis['health_scores']['explanation']}"
            )
        elif "leak" in msg or "spending" in msg or "shopping" in msg or "food" in msg:
            return (
                f"Analyzing your transaction ledger, here are the main items: {leaks}. "
                f"Also, {analysis['spending_insights']['compliance_50_30_20']}. "
                "I recommend setting a weekly limit on discretionary categories via your SBI Internet Banking app to boost your savings rate!"
            )
        elif "product" in msg or "recommend" in msg or "invest" in msg or "savings" in msg:
            recs = analysis["sbi_recommendations"]
            recs_text = "\n".join([f"• **{r['product_name']}** ({r['category']}): {r['reason']}" for r in recs])
            return (
                f"Based on your cash flow profile, here are the customized **SBI Financial Products** I recommend:\n\n"
                f"{recs_text}\n\nYou can easily activate these products in a few clicks through the SBI YONO app!"
            )
        elif "goal" in msg or "saving plan" in msg:
            goals_text = "\n".join([f"• **{g['title']}**: Predicted completion date: {g['predicted_completion_date']} ({g['status']})" for g in analysis["goals_analysis"]])
            return (
                f"Here is a status check on your active financial goals:\n\n"
                f"{goals_text}\n\nTo fast-track your savings, consider opening an **SBI Flexi Recurring Deposit**!"
            )
        else:
            return (
                "Hello! I am SBI Saathi AI, your autonomous financial wellness agent. "
                "I can analyze your spending behavior, predict risks, update you on EMI schedules, track savings goals, "
                "or recommend suitable SBI accounts and investments. "
                "Ask me about: \n- 'What is my financial health score?'\n- 'Where am I leaking money?'\n- 'What products do you recommend for me?'"
            )
