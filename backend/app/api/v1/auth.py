"""Signup, login, and session endpoints."""

from __future__ import annotations

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status, Request
import logging

from app.auth.dependencies import get_current_user
from app.auth.schemas import LoginRequest, SignupRequest, TokenResponse, UserResponse
from app.auth.security import create_access_token, hash_password, verify_password
from app.database import get_db_pool

# 🛡️ IMPORT RATE LIMITER
from app.rate_limiter import check_auth_rate_limit, clear_auth_strikes

logger = logging.getLogger(__name__)
router = APIRouter(tags=["auth"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: Request, # 🛡️ Added Request for IP tracking
    body: SignupRequest,
    pool: asyncpg.Pool = Depends(get_db_pool),
) -> UserResponse:
    # 🛡️ 1. Rate Limiting Check
    check_auth_rate_limit(request, account=body.email.lower())
    
    hashed = hash_password(body.password)

    try:
        row = await pool.fetchrow(
            """
            INSERT INTO users (email, hashed_password, role)
            VALUES ($1, $2, $3)
            RETURNING id, email, role, created_at
            """,
            body.email.lower(),
            hashed,
            body.role,
        )
        # 🛡️ Clear strikes on successful signup
        clear_auth_strikes(request, account=body.email.lower())
        
    except asyncpg.UniqueViolationError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        ) from None
    except Exception as e:
        # 🛡️ 5. Error handling: Log internally, don't leak DB errors
        logger.error(f"Database error during signup: {e}")
        raise HTTPException(status_code=500, detail="Registration failed due to a system error.")

    return UserResponse.model_validate(dict(row))


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request, # 🛡️ Added Request for IP tracking
    body: LoginRequest,
    pool: asyncpg.Pool = Depends(get_db_pool),
) -> TokenResponse:
    # 🛡️ 1. Rate Limiting Check
    check_auth_rate_limit(request, account=body.email.lower())
    
    try:
        row = await pool.fetchrow(
            """
            SELECT id, email, role, created_at, hashed_password
            FROM users
            WHERE email = $1
            """,
            body.email.lower(),
        )
    except Exception as e:
        logger.error(f"Database error during login: {e}")
        raise HTTPException(status_code=500, detail="Authentication service unavailable.")

    if row is None or not verify_password(body.password, row["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # 🛡️ Clear strikes on successful login
    clear_auth_strikes(request, account=body.email.lower())

    token = create_access_token(
        subject=row["id"],
        email=row["email"],
        role=row["role"],
    )
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user