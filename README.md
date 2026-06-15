# SBI Saathi – Autonomous Financial Wellness Agent

## Transforming SBI from a Bank into a Lifelong Financial Advisor

### Overview

SBI Saathi is an Agentic AI-powered Financial Wellness Agent developed for the SBI Hackathon under the theme **Agentic AI & Emerging Tech** and the problem statement category **Digital Engagement**.

Traditional banking applications primarily display account information and transaction history. SBI Saathi goes beyond information delivery by acting as an intelligent financial companion that proactively analyzes financial behavior, predicts risks, recommends actions, and helps customers make better financial decisions.

The platform leverages Agentic AI to provide personalized financial guidance, improve customer engagement, and enhance overall financial wellness.

---

## Problem Statement

Millions of customers use digital banking daily, yet many struggle with:

* Overspending and poor budgeting
* Missed EMI and bill payments
* Lack of financial planning
* Low savings discipline
* Limited awareness of suitable financial products

Current banking applications are largely reactive. They show what happened but do not guide customers on what to do next.

---

## Solution

SBI Saathi acts as an autonomous financial wellness companion that:

* Analyzes spending behavior
* Generates financial health scores
* Predicts upcoming financial risks
* Creates goal-based savings plans
* Provides personalized recommendations
* Suggests suitable SBI products
* Delivers proactive financial insights

By combining Agentic AI with financial analytics, SBI Saathi transforms banking into an intelligent and engaging experience.

---

## Key Features

### Financial Health Score

Provides an overall financial wellness score based on spending, savings, and risk patterns.

### Smart Spending Analysis

Identifies overspending, unnecessary expenses, and spending trends.

### Goal Planning

Helps users create and achieve financial goals such as:

* Buying a vehicle
* Higher education
* Home purchase
* Emergency fund creation

### EMI & Bill Prediction

Predicts upcoming payments and warns users about possible balance shortages.

### Risk Detection

Detects unusual financial behavior and potential financial risks.

### Personalized Recommendations

Suggests relevant SBI products such as:

* Savings Accounts
* Fixed Deposits
* Loans
* Insurance Plans
* Investment Options

### AI Financial Assistant

Provides conversational financial guidance powered by GROQ.

---

## Agentic AI Architecture

The platform consists of multiple specialized AI agents:

### Financial Health Agent

Evaluates financial wellness and generates health scores.

### Spending Analysis Agent

Analyzes transaction patterns and identifies spending behavior.

### Goal Planning Agent

Creates personalized financial plans and savings strategies.

### Risk Detection Agent

Predicts financial risks and detects anomalies.

### Product Recommendation Agent

Suggests suitable SBI products based on customer profiles.

These agents collaborate using CrewAI orchestration to deliver intelligent recommendations.

---

## Technology Stack

### Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Recharts

### Backend

* Python
* FastAPI

### Database

* MongoDB

### AI Layer

* GROQ API
* LangChain
* CrewAI

### Analytics

* Pandas
* NumPy
* Scikit-learn

### Authentication

* JWT Authentication

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## System Architecture

User
↓
Next.js Frontend
↓
FastAPI Backend
↓
MongoDB
↓
CrewAI Agent Layer
↓
GROQ API
↓
Financial Insights & Recommendations
↓
User Dashboard & Notifications

---

## Project Workflow

1. User logs into SBI Saathi.
2. Transaction and financial data are processed.
3. AI agents analyze financial behavior.
4. Financial Health Score is generated.
5. Risks and opportunities are identified.
6. Personalized recommendations are created.
7. Goal plans are generated.
8. Insights are displayed on the dashboard.
9. User interacts with the AI financial assistant.

---

## Business Impact

### For Customers

* Better financial decision-making
* Improved savings habits
* Reduced financial stress
* Personalized financial guidance

### For SBI

* Increased customer engagement
* Higher digital adoption
* Improved customer retention
* Better product cross-selling opportunities
* Enhanced customer lifetime value

---

## Future Scope

* Voice-Based Banking Assistant
* Multilingual Financial Advisor
* Real-Time Banking Integration
* Hyper-Personalized Wealth Management
* AI-Powered Financial Inclusion Platform

---

## Hackathon Theme

Agentic AI & Emerging Tech

## Problem Statement Category

Digital Engagement

---

# Setup & Run Guide

Follow these steps to run the complete SBI Saathi application on your local system.

## Prerequisites

Ensure the following are installed globally:

* Python 3.10+
* Node.js 18+
* npm
* Git
* MongoDB (Local or Cloud Instance)

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd SBI-Saathi
```

---

## 2. Configure Environment Variables

Create a `.env` file in the project root directory and add:

```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=supersecretkeyforsbisaathihackathon2026
```

---

## 3. Setup the Python Backend

Open a terminal in the root directory.

### Windows

```bash
# Create virtual environment
python -m venv backend/venv

# Activate virtual environment
call backend/venv/Scripts/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### macOS / Linux

```bash
# Create virtual environment
python3 -m venv backend/venv

# Activate virtual environment
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be available at:

```text
http://localhost:8000
```

FastAPI Docs:

```text
http://localhost:8000/docs
```

---

## 4. Setup the Next.js Frontend

Open a second terminal in the project root.

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at:

```text
http://localhost:3000
```

---

## 5. View the Application

Open your browser and navigate to:

```text
http://localhost:3000
```

---

## Project Structure

```text
SBI-Saathi/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── venv/
│
├── .env
├── README.md
└── package.json
```

---

## AI Configuration

This project uses:

* GROQ API (Exclusive AI Provider)
* LangChain
* CrewAI

All AI-powered functionality including:

* Financial Health Analysis
* Spending Analysis
* Goal Planning
* Risk Detection
* Product Recommendations
* AI Financial Assistant

is powered entirely through the GROQ API.

---

## Demo Workflow

1. Login to SBI Saathi
2. View Financial Dashboard
3. Analyze Spending Patterns
4. Generate Financial Health Score
5. Receive Risk Alerts
6. Create Savings Goals
7. Get Personalized Recommendations
8. Chat with SBI Saathi AI Assistant

---

## Developed By

Rohith YP
2nd Year AIML Engineering Student
Vivekananda Institute of Technology, Bangalore

---

## Vision

"Banks today tell customers what happened to their money. SBI Saathi tells customers what will happen next and how they can make better financial decisions."
