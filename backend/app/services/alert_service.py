"""
Alert generation service.

Called by the APScheduler job every 6 hours (pace alerts) and
once daily (event reminder alerts).
"""

import calendar
from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.alert import Alert, ALERT_TYPE_BREACH_PREDICTED, ALERT_TYPE_PACE_ELEVATED, ALERT_TYPE_EVENT_REMINDER
from app.models.budget_rule import BudgetRule
from app.models.category import Category
from app.models.event import Event
from app.models.transaction import Transaction
from app.models.user import User
from app.services.pace_service import calculate_pace_for_category

MAX_ALERTS_PER_CATEGORY_PER_DAY = 1
EVENT_REMINDER_MIN_DAYS = 14
EVENT_REMINDER_MAX_DAYS = 28


def _already_alerted_today(db: Session, user_id: str, category_id: str, alert_type: str) -> bool:
    today = date.today()
    today_start = date(today.year, today.month, today.day)
    count = (
        db.query(Alert)
        .filter(
            Alert.user_id == user_id,
            Alert.category_id == category_id,
            Alert.alert_type == alert_type,
            func.date(Alert.created_at) == today_start,
        )
        .count()
    )
    return count >= MAX_ALERTS_PER_CATEGORY_PER_DAY


def check_pace_alerts(user_id: str, db: Session) -> None:
    """
    Evaluate spending pace for every budget rule of a user.
    Write BREACH_PREDICTED or PACE_ELEVATED alerts where thresholds are exceeded.
    At most one alert per category per alert type per day.
    """
    today = date.today()
    total_days = calendar.monthrange(today.year, today.month)[1]
    elapsed_days = today.day
    month_start = date(today.year, today.month, 1)

    rules = db.query(BudgetRule).filter(BudgetRule.user_id == user_id).all()
    if not rules:
        return

    monthly_income = rules[0].monthly_income or 0.0
    if monthly_income <= 0:
        return

    categories = db.query(Category).filter(Category.user_id == user_id).all()
    cat_by_name = {c.name: c for c in categories}

    month_end = date(today.year, today.month, total_days)

    for rule in rules:
        cat = cat_by_name.get(rule.label)
        if cat is None:
            continue

        # Budget for this category
        budget_amount = monthly_income * rule.percentage / 100.0

        # Spent this month
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

        # Upcoming event costs for this category
        upcoming = (
            db.query(func.sum(Event.estimated_cost))
            .filter(
                Event.user_id == user_id,
                Event.category_id == cat.id,
                Event.event_date >= today,
                Event.event_date <= month_end,
            )
            .scalar()
            or 0.0
        )

        pace = calculate_pace_for_category(budget_amount, spent, elapsed_days, total_days, upcoming)

        if pace["status"] == "BREACH_PREDICTED":
            if not _already_alerted_today(db, user_id, cat.id, ALERT_TYPE_BREACH_PREDICTED):
                db.add(Alert(
                    user_id=user_id,
                    category_id=cat.id,
                    alert_type=ALERT_TYPE_BREACH_PREDICTED,
                    message=(
                        f"'{cat.name}' is projected to exceed budget by month end. "
                        f"Projected: {round(pace['projected'], 0)}, Budget: {round(budget_amount, 0)}."
                    ),
                ))

        elif pace["status"] == "PACE_ELEVATED":
            if not _already_alerted_today(db, user_id, cat.id, ALERT_TYPE_PACE_ELEVATED):
                db.add(Alert(
                    user_id=user_id,
                    category_id=cat.id,
                    alert_type=ALERT_TYPE_PACE_ELEVATED,
                    message=(
                        f"'{cat.name}' spending rate is elevated. "
                        f"Daily spend: {round(pace['spend_rate'], 0)}, Daily budget: {round(pace['daily_budget'], 0)}."
                    ),
                ))

    db.commit()


def check_event_reminders(user_id: str, db: Session) -> None:
    """
    Write EVENT_REMINDER alerts for events 14–28 days away that haven't been reminded yet.
    """
    today = date.today()
    reminder_start = today + timedelta(days=EVENT_REMINDER_MIN_DAYS)
    reminder_end = today + timedelta(days=EVENT_REMINDER_MAX_DAYS)

    upcoming_events = (
        db.query(Event)
        .filter(
            Event.user_id == user_id,
            Event.event_date >= reminder_start,
            Event.event_date <= reminder_end,
        )
        .all()
    )

    for event in upcoming_events:
        # Check if a reminder alert already exists for this event
        already_sent = (
            db.query(Alert)
            .filter(
                Alert.user_id == user_id,
                Alert.category_id == event.category_id,
                Alert.alert_type == ALERT_TYPE_EVENT_REMINDER,
                Alert.message.contains(event.name),
            )
            .count()
        ) > 0

        if not already_sent:
            days_away = (event.event_date - today).days
            db.add(Alert(
                user_id=user_id,
                category_id=event.category_id,
                alert_type=ALERT_TYPE_EVENT_REMINDER,
                message=(
                    f"Upcoming event '{event.name}' in {days_away} days "
                    f"(estimated cost: {round(event.estimated_cost, 0)})."
                ),
            ))

    db.commit()


def run_all_alerts_for_all_users(db: Session) -> None:
    """Entry point called by the every-6-hours APScheduler job."""
    users = db.query(User).all()
    for user in users:
        check_pace_alerts(user.id, db)


def run_event_reminders_for_all_users(db: Session) -> None:
    """Entry point called by the daily APScheduler job."""
    users = db.query(User).all()
    for user in users:
        check_event_reminders(user.id, db)
