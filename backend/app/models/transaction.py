import uuid
from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, DateTime, Float, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String, default="HUF", nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    category_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    transaction_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
