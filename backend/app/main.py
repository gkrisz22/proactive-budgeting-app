from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize APScheduler here
    print("Starting APScheduler...")
    yield
    # Shutdown: Clean up scheduler
    print("Shutting down APScheduler...")

app = FastAPI(
    title="Proactive Budgeting API",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    lifespan=lifespan
)

# Example router prefix setup
# from app.api import auth, rules
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
# app.include_router(rules.router, prefix="/api/v1/rules", tags=["rules"])

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}