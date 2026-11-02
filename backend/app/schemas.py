import re
from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel

from app.categories import EXPENSE_CATEGORIES, category_matches_type

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def check_password(v: str) -> str:
    if not re.search(r"[A-Za-z]", v) or not re.search(r"\d", v):
        raise ValueError("Password must have at least one letter and one number")
    return v


def check_name(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError("Name is required")
    return v


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class RegisterIn(CamelModel):
    name: str = Field(min_length=1, max_length=80)
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=128)
    remember: bool = True

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        return check_name(v)

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return check_password(v)

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_PATTERN.match(v):
            raise ValueError("Enter a valid email address")
        return v


class LoginIn(CamelModel):
    email: str
    password: str
    remember: bool = False

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        return v.strip().lower()


class UserOut(CamelModel):
    id: int
    name: str
    email: str
    avatar: str | None = None


AVATAR_PATTERN = re.compile(r"^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$")
AVATAR_MAX_LENGTH = 400_000


class AvatarIn(CamelModel):
    image: str

    @field_validator("image")
    @classmethod
    def check_image(cls, v: str) -> str:
        if len(v) > AVATAR_MAX_LENGTH:
            raise ValueError("Photo is too big. Use a smaller photo")
        if not AVATAR_PATTERN.match(v):
            raise ValueError("Photo must be a JPG, PNG or WebP image")
        return v


class UpdateMeIn(CamelModel):
    name: str = Field(min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        return check_name(v)


class ChangePasswordIn(CamelModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return check_password(v)


class DeleteAccountIn(CamelModel):
    password: str


class AuthOut(CamelModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TransactionIn(CamelModel):
    type: Literal["income", "expense"]
    category_id: str
    amount: int = Field(gt=0, le=100_000_000)
    date: date
    note: str = Field(default="", max_length=80)

    @field_validator("note")
    @classmethod
    def clean_note(cls, v: str) -> str:
        return v.strip()

    @model_validator(mode="after")
    def check_category(self):
        if not category_matches_type(self.category_id, self.type):
            raise ValueError("Category does not match transaction type")
        return self


class TransactionOut(CamelModel):
    id: int
    type: str
    category_id: str
    amount: int
    date: date
    note: str
    created_at: datetime


class BudgetIn(CamelModel):
    limit: int = Field(gt=0, le=100_000_000)


class BudgetOut(CamelModel):
    category_id: str
    limit: int


def is_expense_category(category_id: str) -> bool:
    return category_id in EXPENSE_CATEGORIES
