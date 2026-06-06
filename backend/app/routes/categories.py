from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.user import User
from app.models.category import Category
from app.core.dependencies import get_current_user
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter()


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Category).filter(Category.user_id == current_user.id).all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    normalized_name = data.name.strip()
    existing = db.query(Category).filter(
        Category.user_id == current_user.id,
        func.lower(Category.name) == normalized_name.lower(),
        Category.is_savings_goal == data.is_savings_goal,
    ).first()
    if existing:
        return existing

    category = Category(
        user_id=current_user.id,
        name=normalized_name,
        icon=data.icon,
        is_savings_goal=data.is_savings_goal,
        monthly_target=data.monthly_target,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(
        Category.id == category_id, Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    if data.name is not None:
        category.name = data.name
    if data.icon is not None:
        category.icon = data.icon
    if data.is_savings_goal is not None:
        category.is_savings_goal = data.is_savings_goal
    if data.monthly_target is not None:
        category.monthly_target = data.monthly_target

    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = db.query(Category).filter(
        Category.id == category_id, Category.user_id == current_user.id
    ).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    db.delete(category)
    db.commit()
