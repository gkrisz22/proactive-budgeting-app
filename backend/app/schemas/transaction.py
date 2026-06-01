from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel


class TransactionCreate(BaseModel):
    amount: float
    currency: str = "HUF"
    description: Optional[str] = None
    category_id: Optional[str] = None
    transaction_date: Optional[date] = None


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    currency: str
    description: Optional[str]
    category_id: Optional[str]
    transaction_date: date
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedTransactions(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    pages: int
