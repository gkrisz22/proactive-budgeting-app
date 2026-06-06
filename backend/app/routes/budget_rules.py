from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.budget_rule import BudgetRule
from app.core.dependencies import get_current_user
from app.schemas.budget_rule import BudgetRuleCreate, BudgetRuleUpdate, BudgetRuleResponse, BudgetRuleBatchRequest

router = APIRouter()

_SUM_TOLERANCE = 0.01


def _validate_percentage_sum(user_id: str, db: Session, exclude_id: str = None):
    query = db.query(BudgetRule).filter(BudgetRule.user_id == user_id)
    if exclude_id:
        query = query.filter(BudgetRule.id != exclude_id)
    rules = query.all()
    total = sum(r.percentage for r in rules)
    if abs(total - 100.0) > _SUM_TOLERANCE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Rule percentages must sum to 100. Current sum: {round(total, 2)}",
        )


@router.get("", response_model=List[BudgetRuleResponse])
def list_rules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(BudgetRule).filter(BudgetRule.user_id == current_user.id).all()


@router.post("", response_model=BudgetRuleResponse, status_code=status.HTTP_201_CREATED)
def create_rule(
    data: BudgetRuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rule = BudgetRule(
        user_id=current_user.id,
        label=data.label,
        percentage=data.percentage,
        monthly_income=data.monthly_income,
        currency=data.currency,
    )
    db.add(rule)
    db.flush()  # get the ID before validation query
    _validate_percentage_sum(current_user.id, db)
    db.commit()
    db.refresh(rule)
    return rule


@router.put("/{rule_id}", response_model=BudgetRuleResponse)
def update_rule(
    rule_id: str,
    data: BudgetRuleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rule = db.query(BudgetRule).filter(
        BudgetRule.id == rule_id, BudgetRule.user_id == current_user.id
    ).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")

    if data.label is not None:
        rule.label = data.label
    if data.percentage is not None:
        rule.percentage = data.percentage
    if data.monthly_income is not None:
        rule.monthly_income = data.monthly_income
    if data.currency is not None:
        rule.currency = data.currency

    db.flush()
    _validate_percentage_sum(current_user.id, db)
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(
    rule_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rule = db.query(BudgetRule).filter(
        BudgetRule.id == rule_id, BudgetRule.user_id == current_user.id
    ).first()
    if not rule:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rule not found")
    db.delete(rule)
    db.commit()


@router.post("/batch", response_model=List[BudgetRuleResponse], status_code=status.HTTP_201_CREATED)
def batch_replace_rules(
    data: BudgetRuleBatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Replace all rules for the user atomically. Validates sum = 100 once at the end."""
    if not data.rules:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one rule is required.",
        )

    total_pct = sum(r.percentage for r in data.rules)
    if abs(total_pct - 100.0) > _SUM_TOLERANCE:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Rule percentages must sum to 100. Got: {round(total_pct, 2)}",
        )

    # Delete existing rules for this user
    db.query(BudgetRule).filter(BudgetRule.user_id == current_user.id).delete()

    new_rules = []
    for rule_data in data.rules:
        rule = BudgetRule(
            user_id=current_user.id,
            label=rule_data.label,
            percentage=rule_data.percentage,
            monthly_income=rule_data.monthly_income,
            currency=rule_data.currency,
        )
        db.add(rule)
        new_rules.append(rule)

    db.commit()
    for rule in new_rules:
        db.refresh(rule)

    return new_rules
