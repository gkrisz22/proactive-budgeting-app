from pydantic import BaseModel


class SafeToSpendResponse(BaseModel):
    amount: float
    currency: str
    remaining_days: int
    remaining_budget: float
    upcoming_costs: float
