from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import EmailStr

from app.core.config import settings
from app.db.database import get_database
from app.models.role import Role


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_context.hash(password)


def create_access_token(subject: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = subject.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


async def get_user_by_email(email: str) -> Optional[Role]:
    db = await get_database()
    doc = await db["role"].find_one({"email": str(email)})
    if not doc:
        return None
    return Role(**doc)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Role:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        email: str | None = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await get_user_by_email(email)
    if user is None:
        raise credentials_exception
    return user


async def create_initial_admin_if_missing(name: str, email: EmailStr, role: str, password: str) -> Role:
    db = await get_database()
    existing = await db["role"].find_one({"email": str(email)})
    if existing:
        return Role(**existing)
    hashed = get_password_hash(password)
    doc = {"name": name, "email": str(email), "role": role, "hashed_password": hashed}
    result = await db["role"].insert_one(doc)
    doc.update({"_id": result.inserted_id})
    return Role(**doc)

