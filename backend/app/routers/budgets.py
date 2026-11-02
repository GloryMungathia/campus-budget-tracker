from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Budget, User
from app.schemas import BudgetIn, BudgetOut, is_expense_category
from app.security import get_current_user

router = APIRouter(prefix="/api/budgets", tags=["budgets"])


def find_budget(db: Session, user_id: int, category_id: str) -> Budget | None:
    return db.scalar(select(Budget).where(Budget.user_id == user_id, Budget.category_id == category_id))


@router.get("", response_model=list[BudgetOut])
def list_budgets(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.scalars(select(Budget).where(Budget.user_id == user.id).order_by(Budget.id)).all()


@router.put("/{category_id}", response_model=BudgetOut)
def set_budget(category_id: str, data: BudgetIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not is_expense_category(category_id):
        raise HTTPException(status_code=422, detail="Budgets can only be set for expense categories")
    budget = find_budget(db, user.id, category_id)
    if budget is None:
        budget = Budget(user_id=user.id, category_id=category_id, limit=data.limit)
        db.add(budget)
    else:
        budget.limit = data.limit
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(category_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    budget = find_budget(db, user.id, category_id)
    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)