import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { User } from "../types";
import { logoutApi, refreshAccessToken } from "../api/api";

interface AuthContextValue {
  user: User | null;
  isLoggedIn: boolean;
  authReady: boolean;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "sec101_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);

  // On mount: try to restore access token via refresh_token cookie.
  // If refresh fails and we had a stored user, clear it — session is invalid.
  useEffect(() => {
    const storedRaw = localStorage.getItem(STORAGE_KEY);
    if (!storedRaw) {
      setAuthReady(true);
      return;
    }

    refreshAccessToken().then((token) => {
      if (!token) {
        setUserState(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    }).finally(() => setAuthReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setUser = useCallback((nextUser: User) => {
    setUserState(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUserState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoggedIn: user !== null, authReady, setUser, logout }),
    [user, authReady, setUser, logout]
  );

  if (!authReady) {
    return (
      <div className="app-loading">
        <div className="app-loading__mark">SEC101</div>
        <p>세션을 확인하는 중입니다...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
