-- SentinelX AI — migration 001: users table
-- Apply manually in the Neon SQL editor before testing auth endpoints.

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'analyst'
        CHECK (role IN ('analyst', 'ciso', 'ceo')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
