from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, field_validator


class BudgetRuleCreate(BaseModel):
    label: str
    percentage: float
    monthly_income: Optional[float] = None
    currency: str = "HUF"

    @field_validator("percentage")
    @classmethod
    def percentage_must_be_positive(cls, v: float) -> float:
        if v <= 0 or v > 100:
            raise ValueError("percentage must be between 0 and 100")
        return v


class BudgetRuleUpdate(BaseModel):
    label: Optional[str] = None
    percentage: Optional[float] = None
    monthly_income: Optional[float] = None
    currency: Optional[str] = None

    @field_validator("percentage")
    @classmethod
    def percentage_must_be_positive(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v <= 0 or v > 100):
            raise ValueError("percentage must be between 0 and 100")
        return v


class BudgetRuleResponse(BaseModel):
    id: str
    user_id: str
    label: str
    percentage: float
    monthly_income: Optional[float]
    currency: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BudgetRuleBatchRequest(BaseModel):
    rules: List[BudgetRuleCreate]
