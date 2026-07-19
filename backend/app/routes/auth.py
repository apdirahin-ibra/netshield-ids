from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.auth import bearer_scheme, get_current_user
from app.db.database import (
    change_user_password,
    create_auth_session,
    delete_auth_session,
    get_user_by_email,
    get_user_by_id,
    public_user,
)
from app.security import hash_password, new_session_token, verify_password


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str
    remember: bool = False


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str


@router.post("/login")
def login(payload: LoginRequest):
    user = get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password.",
        )
    if user["status"] != "Active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is disabled. Contact an administrator.",
        )

    token = new_session_token()
    created_at = datetime.now(timezone.utc).isoformat()
    expires_at = create_auth_session(user["id"], token, payload.remember)
    refreshed_user = public_user(get_user_by_id(user["id"]))

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": refreshed_user,
        "created_at": created_at,
        "expires_at": expires_at,
    }


@router.get("/me")
def current_session(current_user=Depends(get_current_user)):
    return {"user": current_user}


@router.post("/logout")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    if credentials is not None and credentials.scheme.lower() == "bearer":
        delete_auth_session(credentials.credentials)
    return {"status": "success"}


@router.post("/password")
def change_password(
    payload: ChangePasswordRequest,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    current_user=Depends(get_current_user),
):
    stored_user = get_user_by_id(current_user["id"])
    if not verify_password(payload.current_password, stored_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The current password is incorrect.",
        )
    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The new password must contain at least 8 characters.",
        )
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password and confirmation do not match.",
        )
    if payload.new_password == payload.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Choose a new password that is different from the current password.",
        )

    change_user_password(
        current_user["id"],
        hash_password(payload.new_password),
        credentials.credentials,
    )
    return {"status": "success"}
