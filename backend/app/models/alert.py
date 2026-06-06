import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base

ALERT_TYPE_BREACH_PREDICTED = "BREACH_PREDICTED"
ALERT_TYPE_PACE_ELEVATED = "PACE_ELEVATED"
ALERT_TYPE_EVENT_REMINDER = "EVENT_REMINDER"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    alert_type: Mapped[str] = mapped_column(String, nullable=False)
    message: Mapped[str] = mapped_column(String, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
