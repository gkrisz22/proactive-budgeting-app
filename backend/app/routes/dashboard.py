from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.dashboard import SafeToSpendResponse
from app.services.pace_service import get_safe_to_spend

router = APIRouter()


@router.get("/safe-to-spend", response_model=SafeToSpendResponse)
def safe_to_spend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_safe_to_spend(current_user.id, db)
