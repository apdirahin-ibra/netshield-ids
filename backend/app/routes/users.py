import re
import sqlite3
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, validator

from app.auth import require_admin
from app.db.database import (
    count_active_admins,
    create_user,
    delete_user,
    get_user_by_id,
    list_users,
    update_user,
)
from app.security import hash_password


router = APIRouter(prefix="/api/users", tags=["User Management"])
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class UserBase(BaseModel):
    name: str
    email: str
    role: Literal["ADMIN", "SECURITY_ANALYST"]
    status: Literal["Active", "Disabled"] = "Active"

    @validator("name")
    def validate_name(cls, value):
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Name must contain at least 2 characters.")
        if len(normalized) > 100:
            raise ValueError("Name must not exceed 100 characters.")
        return normalized

    @validator("email")
    def validate_email(cls, value):
        normalized = value.strip().lower()
        if len(normalized) > 254 or not EMAIL_PATTERN.match(normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class CreateUserRequest(UserBase):
    password: str
    confirm_password: str


class UpdateUserRequest(UserBase):
    password: Optional[str] = None
    confirm_password: Optional[str] = None


def validate_password_pair(password, confirmation, required):
    if not password and not confirmation and not required:
        return None
    if not password or len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least 8 characters.",
        )
    if password != confirmation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirmation do not match.",
        )
    return hash_password(password)


def ensure_admin_safety(existing_user, next_role=None, next_status=None):
    removes_active_admin = (
        existing_user["role"] == "ADMIN"
        and existing_user["status"] == "Active"
        and (next_role not in (None, "ADMIN") or next_status not in (None, "Active"))
    )
    if removes_active_admin and count_active_admins() <= 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one active administrator account must remain.",
        )


@router.get("")
def get_users(_current_user=Depends(require_admin)):
    return {"status": "success", "data": list_users()}


@router.post("", status_code=status.HTTP_201_CREATED)
def add_user(payload: CreateUserRequest, _current_user=Depends(require_admin)):
    password_hash = validate_password_pair(
        payload.password,
        payload.confirm_password,
        required=True,
    )
    try:
        user = create_user(
            payload.name,
            payload.email,
            password_hash,
            payload.role,
            payload.status,
        )
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        ) from exc
    return {"status": "success", "data": user}


@router.put("/{user_id}")
def edit_user(
    user_id: int,
    payload: UpdateUserRequest,
    current_user=Depends(require_admin),
):
    existing_user = get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if user_id == current_user["id"] and (
        payload.status != "Active" or payload.role != "ADMIN"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot disable or remove administrator access from your own account.",
        )

    ensure_admin_safety(existing_user, payload.role, payload.status)
    password_hash = validate_password_pair(
        payload.password,
        payload.confirm_password,
        required=False,
    )
    try:
        user = update_user(
            user_id,
            payload.name,
            payload.email,
            payload.role,
            payload.status,
            password_hash,
        )
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address already exists.",
        ) from exc
    return {"status": "success", "data": user}


@router.delete("/{user_id}")
def remove_user(user_id: int, current_user=Depends(require_admin)):
    existing_user = get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if user_id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account.",
        )

    ensure_admin_safety(existing_user, next_role="SECURITY_ANALYST")
    delete_user(user_id)
    return {"status": "success"}
