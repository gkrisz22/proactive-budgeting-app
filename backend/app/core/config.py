import os
from dotenv import load_dotenv

# Automatically searches for a .env file upwards from the current directory and loads it
load_dotenv()

class Settings:
    PROJECT_NAME: str = "Proactive Budgeting"
    
    # Database
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:Password1@db:5432/proactive_budgeting"
    )

settings = Settings()
