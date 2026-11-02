from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Transaction, User
from app.schemas import TransactionIn, TransactionOut
from app.security import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = (
        select(Transaction)
        .where(Transaction.user_id == user.id)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
    )
    return db.scalars(stmt).all()


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(data: TransactionIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = Transaction(
        user_id=user.id,
        type=data.type,
        category_id=data.category_id,
        amount=data.amount,
        date=data.date,
        note=data.note,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: int, data: TransactionIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    tx = db.get(Transaction, tx_id)
    if tx is None or tx.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    tx.type = data.type
    tx.category_id = data.category_id
    tx.amount = data.amount
    tx.date = data.date
    tx.note = data.note
    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(tx_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.get(Transaction, tx_id)
    if tx is None or tx.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
