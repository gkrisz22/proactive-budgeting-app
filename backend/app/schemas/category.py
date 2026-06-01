from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None
    is_savings_goal: bool = False
    monthly_target: Optional[float] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    is_savings_goal: Optional[bool] = None
    monthly_target: Optional[float] = None


class CategoryResponse(BaseModel):
    id: str
    user_id: str
    name: str
    icon: Optional[str]
    is_savings_goal: bool
    monthly_target: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}
