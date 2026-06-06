from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.alert import Alert
from app.core.dependencies import get_current_user
from app.schemas.alert import AlertResponse

router = APIRouter()


@router.get("", response_model=List[AlertResponse])
def list_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Alert)
        .filter(Alert.user_id == current_user.id)
        .order_by(Alert.created_at.desc())
        .all()
    )


@router.put("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_read(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.query(Alert).filter(
        Alert.id == alert_id, Alert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return alert
