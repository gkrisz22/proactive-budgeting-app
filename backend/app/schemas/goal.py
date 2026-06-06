from typing import List
from pydantic import BaseModel


class GoalProgress(BaseModel):
    category_id: str
    category_name: str
    monthly_target: float
    contributed: float
    progress_percentage: float


class GoalProgressList(BaseModel):
    goals: List[GoalProgress]
