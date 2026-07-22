"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ApiError,
  User,
  getAccessToken,
  login as apiLogin,
  logout as apiLogout,
  refreshSession,
  setAccessToken,
  setRefreshHandler,
  signup as apiSignup,
} from "@/lib/api/client";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// The real refresh token lives in an httpOnly cookie scoped to the backend's
// own origin (a different origin from this app in dev), so Next.js
// middleware running here can't read it. This is a plain, non-httpOnly hint
// cookie on the frontend's own origin so middleware can avoid rendering
// protected pages for definitely-logged-out users. It carries no token and
// is not itself the source of truth — the API is. Whenever it's stale
// (e.g. the real session expired), the client-side refresh-on-mount /
// refresh-on-401 flow corrects course and redirects to /login.
const SESSION_HINT_COOKIE = "verve_session_hint";

function setSessionHintCookie() {
  document.cookie = `${SESSION_HINT_COOKIE}=1; path=/; samesite=lax; max-age=${60 * 60 * 24 * 30}`;
}

function clearSessionHintCookie() {
  document.cookie = `${SESSION_HINT_COOKIE}=; path=/; samesite=lax; max-age=0`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Guards against overlapping refresh calls (e.g. two 401s firing at once).
  const refreshInFlight = useRef<Promise<string | null> | null>(null);

  const doRefresh = useCallback(async (): Promise<string | null> => {
    if (refreshInFlight.current) {
      return refreshInFlight.current;
    }

    const attempt = (async () => {
      try {
        const res = await refreshSession();
        setAccessToken(res.access_token);
        setUser(res.user);
        setStatus("authenticated");
        setSessionHintCookie();
        return res.access_token;
      } catch {
        setAccessToken(null);
        setUser(null);
        setStatus("unauthenticated");
        clearSessionHintCookie();
        return null;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = attempt;
    return attempt;
  }, []);

  // Register the refresh handler once so apiFetch can call it on a 401
  // without a circular import between client.ts and this provider.
  useEffect(() => {
    setRefreshHandler(doRefresh);
    return () => setRefreshHandler(null);
  }, [doRefresh]);

  // Restore the session once on mount — the access token only lives in
  // memory, so a hard refresh always starts here.
  useEffect(() => {
    doRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    setAccessToken(res.access_token);
    setUser(res.user);
    setStatus("authenticated");
    setSessionHintCookie();
  }, []);

  const signup = useCallback(
    async (email: string, password: string, displayName: string) => {
      const res = await apiSignup({
        email,
        password,
        display_name: displayName,
      });
      setAccessToken(res.access_token);
      setUser(res.user);
      setStatus("authenticated");
      setSessionHintCookie();
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Logout is best-effort client-side too — if the network call fails,
      // still drop local state so the UI reflects a logged-out session.
    }
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
    clearSessionHintCookie();
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

export { ApiError, getAccessToken };
