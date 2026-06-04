from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.event import Event
from app.core.dependencies import get_current_user
from app.schemas.event import EventCreate, EventUpdate, EventResponse

router = APIRouter()


@router.get("", response_model=List[EventResponse])
def list_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Event)
        .filter(Event.user_id == current_user.id)
        .order_by(Event.event_date.asc())
        .all()
    )


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = Event(
        user_id=current_user.id,
        name=data.name,
        estimated_cost=data.estimated_cost,
        event_date=data.event_date,
        category_id=data.category_id,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    data: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(
        Event.id == event_id, Event.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    if data.name is not None:
        event.name = data.name
    if data.estimated_cost is not None:
        event.estimated_cost = data.estimated_cost
    if data.event_date is not None:
        event.event_date = data.event_date
    if data.category_id is not None:
        event.category_id = data.category_id

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(
        Event.id == event_id, Event.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    db.delete(event)
    db.commit()
