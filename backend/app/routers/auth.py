from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.ratelimit import login_limiter, wait_message
from app.schemas import (
    AuthOut,
    AvatarIn,
    ChangePasswordIn,
    DeleteAccountIn,
    LoginIn,
    NextMoneyIn,
    RegisterIn,
    UpdateMeIn,
    UserOut,
)
from app.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def auth_response(user: User, remember: bool) -> AuthOut:
    return AuthOut(access_token=create_access_token(user.id, remember), user=UserOut.model_validate(user))


@router.post("/register", response_model=AuthOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(User.email == data.email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists")
    user = User(name=data.name, email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return auth_response(user, data.remember)


@router.post("/login", response_model=AuthOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    wait = login_limiter.seconds_left(data.email)
    if wait:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=wait_message(wait),
            headers={"Retry-After": str(wait)},
        )
    user = db.scalar(select(User).where(User.email == data.email))
    if user is None or not verify_password(data.password, user.password_hash):
        login_limiter.record_failure(data.email)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Wrong email or password")
    login_limiter.reset(data.email)
    return auth_response(user, data.remember)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(data: UpdateMeIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.name = data.name
    db.commit()
    db.refresh(user)
    return user


@router.put("/me/next-money", response_model=UserOut)
def set_next_money(data: NextMoneyIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.next_money_date = data.next_money_date
    db.commit()
    db.refresh(user)
    return user


@router.put("/me/avatar", response_model=UserOut)
def set_avatar(data: AvatarIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.avatar = data.image
    db.commit()
    db.refresh(user)
    return user


@router.delete("/me/avatar", response_model=UserOut)
def remove_avatar(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.avatar = None
    db.commit()
    db.refresh(user)
    return user


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(data: ChangePasswordIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is wrong")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be different")
    user.password_hash = hash_password(data.new_password)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/delete-account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(data: DeleteAccountIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is wrong")
    db.delete(user)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
