from __future__ import annotations
import asyncpg
import logging
import os

logger = logging.getLogger(__name__)
_pool: asyncpg.Pool | None = None

async def init_pool(database_url: str) -> asyncpg.Pool:
    global _pool
    # 🛡️ 3. Ensure DB URL is passed, but never hardcode it
    if not database_url:
        raise RuntimeError("DATABASE_URL is missing!")

    try:
        _pool = await asyncpg.create_pool(
            dsn=database_url,
            min_size=1,
            max_size=10,
            ssl="require"
        )
        logger.info("Database pool initialized securely.")
        return _pool
    except Exception as e:
        # 🛡️ 5. Log failure without exposing the actual connection string / password
        logger.error("Error initializing database pool. Check connection string and network.")
        raise RuntimeError("Failed to connect to the database") from e

async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    return _pool

async def get_db_pool() -> asyncpg.Pool:
    return get_pool()