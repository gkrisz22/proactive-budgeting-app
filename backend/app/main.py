from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes import auth, budget_rules, categories, transactions, alerts, events, goals, dashboard
from app.services.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(
    title="Proactive Budgeting API",
    version="1.0.0",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api/v1"

app.include_router(auth.router,         prefix=f"{PREFIX}/auth",        tags=["Auth"])
app.include_router(budget_rules.router, prefix=f"{PREFIX}/rules",       tags=["Budget Rules"])
app.include_router(categories.router,   prefix=f"{PREFIX}/categories",   tags=["Categories"])
app.include_router(transactions.router, prefix=f"{PREFIX}/transactions", tags=["Transactions"])
app.include_router(alerts.router,       prefix=f"{PREFIX}/alerts",       tags=["Alerts"])
app.include_router(events.router,       prefix=f"{PREFIX}/events",       tags=["Events"])
app.include_router(goals.router,        prefix=f"{PREFIX}/goals",        tags=["Goals"])
app.include_router(dashboard.router,    prefix=f"{PREFIX}/dashboard",    tags=["Dashboard"])


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
