"""
Spending-pace service.

Pure calculation functions (no DB) are kept separate from the DB-aware
wrappers so that unit tests can call them without a database.
"""

import calendar
from datetime import date
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.budget_rule import BudgetRule
from app.models.category import Category
from app.models.event import Event
from app.models.transaction import Transaction
from app.schemas.dashboard import SafeToSpendResponse

# ---------------------------------------------------------------------------
# Pure calculation helpers (unit-testable without a DB)
# ---------------------------------------------------------------------------

PACE_ELEVATED_THRESHOLD = 1.05  # spend rate > 5% above daily budget
BREACH_PREDICTED_THRESHOLD = 1.0  # projected spend exceeds budget


def calculate_pace_for_category(
    budget_amount: float,
    spent: float,
    elapsed_days: int,
    total_days: int,
    upcoming_event_costs: float = 0.0,
) -> dict:
    """
    Calculate spending pace for a single category.

    Args:
        budget_amount:        monthly budget for this category
        spent:                amount already spent this month
        elapsed_days:         days elapsed in the current month (>= 1)
        total_days:           total days in the current month
        upcoming_event_costs: sum of event costs still due this month

    Returns:
        {
            "spend_rate":      float,   # average daily spend so far
            "projected":       float,   # projected total spend by month end
            "daily_budget":    float,   # ideal daily spend to stay on budget
            "remaining":       float,   # budget remaining after current spend
            "status":          str,     # "ON_TRACK" | "PACE_ELEVATED" | "BREACH_PREDICTED"
        }
    """
    if elapsed_days <= 0:
        elapsed_days = 1

    spend_rate = spent / elapsed_days
    projected = spend_rate * total_days + upcoming_event_costs
    daily_budget = budget_amount / total_days if total_days > 0 else 0.0
    remaining = budget_amount - spent

    if projected > budget_amount * BREACH_PREDICTED_THRESHOLD:
        status = "BREACH_PREDICTED"
    elif daily_budget > 0 and spend_rate > daily_budget * PACE_ELEVATED_THRESHOLD:
        status = "PACE_ELEVATED"
    else:
        status = "ON_TRACK"

    return {
        "spend_rate": round(spend_rate, 4),
        "projected": round(projected, 4),
        "daily_budget": round(daily_budget, 4),
        "remaining": round(remaining, 4),
        "status": status,
    }


def compute_safe_to_spend(
    rules: List[dict],
    monthly_income: float,
    category_spending: dict,  # {category_label: spent_amount}
    upcoming_costs: float,
    today: date,
) -> dict:
    """
    Pure function to compute safe-to-spend.

    Args:
        rules:             list of {"label": str, "percentage": float, "is_savings_goal": bool}
        monthly_income:    monthly income
        category_spending: dict mapping rule label to amount spent this month
        upcoming_costs:    sum of event costs remaining this month
        today:             the current date (for remaining days)

    Returns:
        {"amount": float, "remaining_budget": float, "upcoming_costs": float, "remaining_days": int}
    """
    total_days = calendar.monthrange(today.year, today.month)[1]
    remaining_days = total_days - today.day + 1

    total_remaining = 0.0
    for rule in rules:
        if rule.get("is_savings_goal", False):
            continue
        budget = monthly_income * rule["percentage"] / 100.0
        spent = category_spending.get(rule["label"], 0.0)
        total_remaining += max(0.0, budget - spent)

    if remaining_days <= 0:
        remaining_days = 1

    amount = (total_remaining - upcoming_costs) / remaining_days

    return {
        "amount": round(amount, 2),
        "remaining_budget": round(total_remaining, 2),
        "upcoming_costs": round(upcoming_costs, 2),
        "remaining_days": remaining_days,
    }


# ---------------------------------------------------------------------------
# DB-aware wrappers
# ---------------------------------------------------------------------------

def get_safe_to_spend(user_id: str, db: Session) -> SafeToSpendResponse:
    today = date.today()
    total_days = calendar.monthrange(today.year, today.month)[1]
    month_start = date(today.year, today.month, 1)

    rules = db.query(BudgetRule).filter(BudgetRule.user_id == user_id).all()
    if not rules:
        return SafeToSpendResponse(
            amount=0.0,
            currency="HUF",
            remaining_days=total_days - today.day + 1,
            remaining_budget=0.0,
            upcoming_costs=0.0,
        )

    monthly_income = rules[0].monthly_income or 0.0
    currency = rules[0].currency or "HUF"

    # Fetch all categories for the user
    categories = db.query(Category).filter(Category.user_id == user_id).all()
    cat_by_name = {c.name: c for c in categories}

    # Sum spending per rule label
    category_spending: dict = {}
    for rule in rules:
        cat = cat_by_name.get(rule.label)
        if cat:
            spent = (
                db.query(func.sum(Transaction.amount))
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.category_id == cat.id,
                    Transaction.transaction_date >= month_start,
                    Transaction.transaction_date <= today,
                )
                .scalar()
                or 0.0
            )
        else:
            spent = 0.0
        category_spending[rule.label] = spent

    # Upcoming event costs for the rest of this month
    month_end = date(today.year, today.month, total_days)
    upcoming_costs = (
        db.query(func.sum(Event.estimated_cost))
        .filter(
            Event.user_id == user_id,
            Event.event_date >= today,
            Event.event_date <= month_end,
        )
        .scalar()
        or 0.0
    )

    rule_dicts = [
        {
            "label": r.label,
            "percentage": r.percentage,
            "is_savings_goal": cat_by_name.get(r.label, Category()).is_savings_goal
            if r.label in cat_by_name
            else False,
        }
        for r in rules
    ]

    result = compute_safe_to_spend(rule_dicts, monthly_income, category_spending, upcoming_costs, today)

    return SafeToSpendResponse(
        amount=result["amount"],
        currency=currency,
        remaining_days=result["remaining_days"],
        remaining_budget=result["remaining_budget"],
        upcoming_costs=result["upcoming_costs"],
    )
