import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  clearStoredToken,
  fetchMe,
  getStoredToken,
  login as loginRequest,
  setStoredToken,
  signup as signupRequest,
  type User,
  type UserRole,
} from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const activeToken = getStoredToken();
    if (!activeToken) {
      setUser(null);
      setToken(null);
      return;
    }

    const profile = await fetchMe(activeToken);
    setUser(profile);
    setToken(activeToken);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      setIsLoading(true);
      try {
        await refreshUser();
      } catch (err) {
        clearStoredToken();
        setUser(null);
        setToken(null);
        if (err instanceof ApiError && err.status !== 401) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    void bootstrap();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await loginRequest(email, password);
    setStoredToken(result.access_token);
    setToken(result.access_token);
    const profile = await fetchMe(result.access_token);
    setUser(profile);
  }, []);

  const signup = useCallback(
    async (email: string, password: string, role: UserRole = "analyst") => {
      setError(null);
      await signupRequest(email, password, role);
      await login(email, password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      error,
      login,
      signup,
      logout,
      refreshUser,
      clearError,
    }),
    [user, token, isLoading, error, login, signup, logout, refreshUser, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}