import os
from dotenv import load_dotenv

# Load env variables from a .env file if it exists
load_dotenv()

class Settings:
    PROJECT_NAME: str = "SBI Saathi – Autonomous Financial Wellness Agent"
    API_V1_STR: str = "/api/v1"
    
    # AI Engine Config
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    
    # MongoDB Config
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DB_NAME: str = "sbi_saathi"
    
    # JWT Auth Config
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretkeyforsbisaathihackathon2026")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Mock Data DB file for fallback demo mode
    MOCK_DB_FILE: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        "mock_db.json"
    )

settings = Settings()
