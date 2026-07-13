const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "sentinelx_token";

export type UserRole = "analyst" | "ciso" | "ceo";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const authToken = token ?? getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const payload = (await response.json()) as { detail?: string | { msg: string }[] };
      if (typeof payload.detail === "string") {
        detail = payload.detail;
      } else if (Array.isArray(payload.detail) && payload.detail[0]?.msg) {
        detail = payload.detail[0].msg;
      }
    } catch {
      // Keep the generic message when the body is not JSON.
    }
    throw new ApiError(detail, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function signup(
  email: string,
  password: string,
  role: UserRole = "analyst",
): Promise<User> {
  return apiFetch<User>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(token?: string): Promise<User> {
  return apiFetch<User>("/api/v1/auth/me", {}, token);
}
