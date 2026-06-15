from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from backend.app.core.auth import get_password_hash, verify_password, create_access_token, get_current_user
from backend.app.db.session import get_db
from backend.app.ai.agents import SBISaathiCrew

router = APIRouter()

# ==========================================
# PYDANTIC SCHEMAS
# ==========================================

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    user_email: str

class TransactionCreate(BaseModel):
    title: str
    amount: float
    category: str  # Income, EMI, Food, Shopping, Travel, Utilities, Other
    type: str      # credit, debit
    date: Optional[str] = None

class GoalCreate(BaseModel):
    title: str
    target_amount: float
    current_amount: float
    target_date: str  # YYYY-MM-DD
    monthly_contribution: float

class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/auth/register", response_model=Token)
async def register(user_in: UserRegister):
    db = get_db()
    existing_user = await db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    
    hashed_password = get_password_hash(user_in.password)
    user_id = None
    
    # Create user document
    user_doc = {
        "name": user_in.name,
        "email": user_in.email,
        "hashed_password": hashed_password,
        "current_balance": 11500.00,  # Starting Demo Balance
        "created_at": datetime.utcnow().isoformat()
    }
    
    res = await db.users.insert_one(user_doc)
    user_id = res.inserted_id
    user_doc["_id"] = user_id

    # SEED MOCK TRANSACTIONS AND GOALS FOR HACKATHON DEMO FLOW
    # Let's write standard realistic banking transactions
    today = datetime.now()
    mock_transactions = [
        {
            "user_id": user_id,
            "title": "Monthly Salary Credit - SBI Corp Account",
            "amount": 85000.00,
            "category": "Income",
            "type": "credit",
            "date": (today - timedelta(days=14)).strftime("%Y-%m-%d")
        },
        {
            "user_id": user_id,
            "title": "SBI Home Loan EMI Auto-debit",
            "amount": 25000.00,
            "category": "EMI",
            "type": "debit",
            "date": (today - timedelta(days=10)).strftime("%Y-%m-%d")
        },
        {
            "user_id": user_id,
            "title": "Amazon Online Shopping - HDFC credit card pay",
            "amount": 7500.00,
            "category": "Shopping",
            "type": "debit",
            "date": (today - timedelta(days=8)).strftime("%Y-%m-%d")
        },
        {
            "user_id": user_id,
            "title": "Zomato Dine-in & Food Delivery",
            "amount": 4200.00,
            "category": "Food",
            "type": "debit",
            "date": (today - timedelta(days=6)).strftime("%Y-%m-%d")
        },
        {
            "user_id": user_id,
            "title": "Uber Cab Rides - Travel",
            "amount": 3800.00,
            "category": "Travel",
            "type": "debit",
            "date": (today - timedelta(days=4)).strftime("%Y-%m-%d")
        },
        {
            "user_id": user_id,
            "title": "Tata Power Electricity Bill Pay",
            "amount": 3200.00,
            "category": "Utilities",
            "type": "debit",
            "date": (today - timedelta(days=2)).strftime("%Y-%m-%d")
        }
    ]
    
    for tx in mock_transactions:
        await db.transactions.insert_one(tx)

    # Seed mock Goals
    mock_goals = [
        {
            "user_id": user_id,
            "title": "SBI Mutual Fund SIP - Car Fund",
            "target_amount": 150000.00,
            "current_amount": 45000.00,
            "target_date": (today + timedelta(days=365)).strftime("%Y-%m-%d"),
            "monthly_contribution": 5000.00
        },
        {
            "user_id": user_id,
            "title": "Emergency Fund Reserve",
            "target_amount": 200000.00,
            "current_amount": 80000.00,
            "target_date": (today + timedelta(days=240)).strftime("%Y-%m-%d"),
            "monthly_contribution": 10000.00
        }
    ]
    for g in mock_goals:
        await db.goals.insert_one(g)

    # Seed mock upcoming alerts
    mock_alerts = [
        {
            "user_id": user_id,
            "title": "Upcoming SBI Home Loan EMI auto-debit",
            "amount": 25000.00,
            "due_date": (today + timedelta(days=5)).strftime("%Y-%m-%d"),
            "category": "EMI",
            "status": "pending"
        },
        {
            "user_id": user_id,
            "title": "Upcoming Tata Sky DTH Recharge",
            "amount": 750.00,
            "due_date": (today + timedelta(days=3)).strftime("%Y-%m-%d"),
            "category": "Utilities",
            "status": "pending"
        }
    ]
    for a in mock_alerts:
        await db.alerts.insert_one(a)

    access_token = create_access_token(subject=user_id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user_doc["name"],
        "user_email": user_doc["email"]
    }

@router.post("/auth/login", response_model=Token)
async def login(user_in: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": user_in.email})
    if not user or not verify_password(user_in.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password."
        )
    
    access_token = create_access_token(subject=user["_id"])
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_name": user["name"],
        "user_email": user["email"]
    }

# ==========================================
# DASHBOARD ENDPOINT
# ==========================================

@router.get("/dashboard")
async def get_dashboard_data(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]
    
    # Get all transactions, goals, alerts
    tx_cursor = db.transactions.find({"user_id": user_id})
    transactions = await tx_cursor.to_list(length=100)
    
    goal_cursor = db.goals.find({"user_id": user_id})
    goals = await goal_cursor.to_list(length=100)
    
    alert_cursor = db.alerts.find({"user_id": user_id})
    alerts = await alert_cursor.to_list(length=100)
    
    # Run the Wellness analysis crew logic (loads either Groq or fallback rule engine)
    crew = SBISaathiCrew()
    user_data = {
        "current_balance": current_user.get("current_balance", 11500.00),
        "transactions": transactions,
        "goals": goals
    }
    
    analysis = crew.run_crew_analysis(user_data)
    
    # Calculate totals
    income_total = sum(float(t["amount"]) for t in transactions if t["type"] == "credit")
    expense_total = sum(float(t["amount"]) for t in transactions if t["type"] == "debit")
    
    return {
        "user": {
            "name": current_user["name"],
            "email": current_user["email"],
            "current_balance": current_user.get("current_balance", 11500.00)
        },
        "totals": {
            "income": income_total,
            "expense": expense_total,
            "net_savings": income_total - expense_total
        },
        "health_scores": analysis["health_scores"],
        "spending_insights": analysis["spending_insights"],
        "goals_analysis": analysis["goals_analysis"],
        "risk_alerts": analysis["risk_alerts"],
        "sbi_recommendations": analysis["sbi_recommendations"],
        "alerts": alerts,
        "goals": goals,
        "transactions": transactions[:10]  # Return last 10 transactions
    }

# ==========================================
# TRANSACTIONS ENDPOINTS
# ==========================================

@router.get("/transactions")
async def get_transactions(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.transactions.find({"user_id": current_user["_id"]})
    # Sort transactions descending (mock sort in MockDB or DB query)
    tx_list = await cursor.to_list(length=200)
    # Perform manual reverse sorting in Python by date to ensure order
    try:
        tx_list.sort(key=lambda x: x.get("date", ""), reverse=True)
    except Exception:
        pass
    return tx_list

@router.post("/transactions")
async def add_transaction(tx_in: TransactionCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]
    
    tx_doc = {
        "user_id": user_id,
        "title": tx_in.title,
        "amount": tx_in.amount,
        "category": tx_in.category,
        "type": tx_in.type,
        "date": tx_in.date or datetime.now().strftime("%Y-%m-%d")
    }
    
    # Update user balance dynamically
    new_balance = current_user.get("current_balance", 0.0)
    if tx_in.type == "credit":
        new_balance += tx_in.amount
    else:
        new_balance -= tx_in.amount
        
    await db.users.update_one({"_id": user_id}, {"$set": {"current_balance": new_balance}})
    res = await db.transactions.insert_one(tx_doc)
    
    tx_doc["_id"] = res.inserted_id
    return tx_doc

# ==========================================
# GOALS ENDPOINTS
# ==========================================

@router.get("/goals")
async def get_goals(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.goals.find({"user_id": current_user["_id"]})
    return await cursor.to_list(length=100)

@router.post("/goals")
async def add_goal(goal_in: GoalCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    goal_doc = {
        "user_id": current_user["_id"],
        "title": goal_in.title,
        "target_amount": goal_in.target_amount,
        "current_amount": goal_in.current_amount,
        "target_date": goal_in.target_date,
        "monthly_contribution": goal_in.monthly_contribution
    }
    res = await db.goals.insert_one(goal_doc)
    goal_doc["_id"] = res.inserted_id
    return goal_doc

@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    res = await db.goals.delete_one({"_id": goal_id, "user_id": current_user["_id"]})
    if not res:
        raise HTTPException(status_code=404, detail="Goal not found.")
    return {"message": "Goal successfully deleted."}

# ==========================================
# ALERTS ENDPOINTS
# ==========================================

@router.get("/alerts")
async def get_alerts(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.alerts.find({"user_id": current_user["_id"]})
    return await cursor.to_list(length=100)

@router.post("/alerts/{alert_id}/pay")
async def pay_alert_bill(alert_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    alert = await db.alerts.find_one({"_id": alert_id, "user_id": current_user["_id"]})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    
    if alert.get("status") == "paid":
        return {"message": "Bill already paid."}
        
    amount = float(alert["amount"])
    balance = float(current_user.get("current_balance", 0))
    
    if balance < amount:
        raise HTTPException(status_code=400, detail="Insufficient account balance to pay this bill.")
        
    # Deduct balance
    new_balance = balance - amount
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": {"current_balance": new_balance}})
    
    # Mark alert as paid
    await db.alerts.update_one({"_id": alert_id}, {"$set": {"status": "paid"}})
    
    # Create corresponding transaction
    tx_doc = {
        "user_id": current_user["_id"],
        "title": f"Payment: {alert['title']}",
        "amount": amount,
        "category": alert.get("category", "Utilities"),
        "type": "debit",
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    await db.transactions.insert_one(tx_doc)
    
    return {"message": "Payment successful!", "new_balance": new_balance}

# ==========================================
# AI CHAT ASSISTANT ENDPOINT
# ==========================================

@router.post("/ai/chat")
async def ai_chat(payload: ChatMessage, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]
    
    tx_cursor = db.transactions.find({"user_id": user_id})
    transactions = await tx_cursor.to_list(length=100)
    
    goal_cursor = db.goals.find({"user_id": user_id})
    goals = await goal_cursor.to_list(length=100)
    
    crew = SBISaathiCrew()
    user_data = {
        "current_balance": current_user.get("current_balance", 11500.00),
        "transactions": transactions,
        "goals": goals
    }
    
    response_msg = await crew.chat_assistant(payload.message, payload.history, user_data)
    return {"response": response_msg}
