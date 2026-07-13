"""Pydantic models for auth requests and responses."""

from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

UserRole = Literal["analyst", "ciso", "ceo"]


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = "analyst"


class LoginRequest(BaseModel):
    email: EmailStr = Field(description="Must be a valid email.")
    password: str = Field(min_length=8, max_length=64, description="strict password bounds.")


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    role: UserRole
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
