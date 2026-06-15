import sys
import os
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def run_tests():
    print("Waiting 2 seconds for server to stand up...")
    time.sleep(2)
    
    print("\n--- TEST 1: Health Check ---")
    try:
        res = requests.get("http://127.0.0.1:8000/")
        print("Status Code:", res.status_code)
        print("Response:", res.json())
    except Exception as e:
        print("Failed to connect to backend server:", e)
        return False

    email = f"test_{int(time.time())}@sbi.co.in"
    password = "SecurePassword123"
    name = "Hackathon Judge"

    print("\n--- TEST 2: User Registration ---")
    payload = {
        "name": name,
        "email": email,
        "password": password
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=payload)
    print("Status Code:", res.status_code)
    if res.status_code != 200:
        print("Error Details:", res.text)
        return False
    data = res.json()
    token = data["access_token"]
    print("Token generated successfully.")

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- TEST 3: Fetch Dashboard Data ---")
    res = requests.get(f"{BASE_URL}/dashboard", headers=headers)
    print("Status Code:", res.status_code)
    if res.status_code != 200:
        print("Error:", res.text)
        return False
    dash = res.json()
    print("User Name:", dash["user"]["name"])
    print("Wellness Score:", dash["health_scores"]["overall"])
    print("Savings Score:", dash["health_scores"]["savings"])
    print("Spending Score:", dash["health_scores"]["spending"])
    print("Risk Score:", dash["health_scores"]["risk"])
    print("Insights:", dash["spending_insights"]["compliance_50_30_20"])
    print("SBI Recommendations:", len(dash["sbi_recommendations"]), "found.")
    for rec in dash["sbi_recommendations"]:
        print(f"  - {rec['product_name']}: {rec['reason']}")

    print("\n--- TEST 4: Fetch Transactions List ---")
    res = requests.get(f"{BASE_URL}/transactions", headers=headers)
    print("Status Code:", res.status_code)
    print("Transactions:", len(res.json()), "transactions retrieved.")

    print("\n--- TEST 5: Add New Transaction ---")
    new_tx = {
        "title": "Starbucks Coffee Refuel",
        "amount": 450.00,
        "category": "Food",
        "type": "debit"
    }
    res = requests.post(f"{BASE_URL}/transactions", json=new_tx, headers=headers)
    print("Status Code:", res.status_code)
    tx_res = res.json()
    print("Created TX:", tx_res["title"], "Amount:", tx_res["amount"])

    print("\n--- TEST 6: AI Chat Assistant ---")
    chat_payload = {
        "message": "Why is my spending score lower than my savings score?",
        "history": []
    }
    res = requests.post(f"{BASE_URL}/ai/chat", json=chat_payload, headers=headers)
    print("Status Code:", res.status_code)
    chat_res = res.json()
    print("SBI Saathi AI Response:\n", chat_res["response"])

    print("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---")
    return True

if __name__ == "__main__":
    run_tests()
