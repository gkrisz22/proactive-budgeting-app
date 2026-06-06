from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.category import Category
from app.models.transaction import Transaction
from app.core.dependencies import get_current_user
from app.schemas.goal import GoalProgress, GoalProgressList

router = APIRouter()


@router.get("/progress", response_model=GoalProgressList)
def get_goal_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = date.today()
    month_start = date(today.year, today.month, 1)

    savings_categories = (
        db.query(Category)
        .filter(
            Category.user_id == current_user.id,
            Category.is_savings_goal == True,
            Category.monthly_target.isnot(None),
        )
        .all()
    )

    goals = []
    for cat in savings_categories:
        contributed = (
            db.query(func.sum(Transaction.amount))
            .filter(
                Transaction.user_id == current_user.id,
                Transaction.category_id == cat.id,
                Transaction.transaction_date >= month_start,
                Transaction.transaction_date <= today,
            )
            .scalar()
            or 0.0
        )

        progress_pct = min(100.0, round((contributed / cat.monthly_target) * 100, 2)) if cat.monthly_target else 0.0

        goals.append(
            GoalProgress(
                category_id=cat.id,
                category_name=cat.name,
                monthly_target=cat.monthly_target,
                contributed=round(contributed, 2),
                progress_percentage=progress_pct,
            )
        )

    return GoalProgressList(goals=goals)
