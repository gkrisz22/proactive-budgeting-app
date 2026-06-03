from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: str
    user_id: str
    category_id: Optional[str]
    alert_type: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
