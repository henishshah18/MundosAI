from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import Token, UserDisplay
from app.services.security import (
    create_access_token,
    get_current_user,
    get_user_by_email,
    verify_password,
)


router = APIRouter(tags=["auth"])


@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    user = await get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    access_token = create_access_token({"email": user.email})
    return Token(access_token=access_token)


@router.get("/users/me", response_model=UserDisplay)
async def read_users_me(current_user=Depends(get_current_user)) -> UserDisplay:
    return UserDisplay(user_id=str(current_user.id), name=current_user.name, email=current_user.email, role=current_user.role)

