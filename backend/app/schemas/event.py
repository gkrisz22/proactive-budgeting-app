from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, field_validator


class EventCreate(BaseModel):
    name: str
    estimated_cost: float
    event_date: date
    category_id: Optional[str] = None

    @field_validator("event_date")
    @classmethod
    def date_must_be_future(cls, v: date) -> date:
        if v <= date.today():
            raise ValueError("event_date must be in the future")
        return v

    @field_validator("estimated_cost")
    @classmethod
    def cost_must_be_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("estimated_cost must be positive")
        return v


class EventUpdate(BaseModel):
    name: Optional[str] = None
    estimated_cost: Optional[float] = None
    event_date: Optional[date] = None
    category_id: Optional[str] = None


class EventResponse(BaseModel):
    id: str
    user_id: str
    name: str
    estimated_cost: float
    event_date: date
    category_id: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
