"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

type User = {
  id: string;
  fullName?: string;
  email?: string;
};

type AuthState = {
  user: User | null;
  roles: string[];
  currentRole: string | null;
  status: AuthStatus;
};

type AuthContextValue = AuthState & {
  hydrateFromLogin: (user: User, roles: string[]) => Promise<void>;
  refreshRoles: () => Promise<void>;
  setCurrentRoleSafe: (role: string) => Promise<boolean>;
  clearAuth: () => Promise<void>;
};

const ROLE_REFRESH_COOLDOWN_MS = 60_000; // prevent hammering backend

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [lastRolesFetch, setLastRolesFetch] = useState<number | null>(null);
  const [rolesRefreshing, setRolesRefreshing] = useState(false);

  // Keep the API instance aligned with the selected current role for logging/auditing.
  useEffect(() => {
    if (currentRole) {
      api.defaults.headers.common["X-Current-Role"] = currentRole;
    } else {
      delete api.defaults.headers.common["X-Current-Role"];
    }
  }, [currentRole]);

  // Hydrate from backend on first load
  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    setStatus("loading");

    try {
      // Fetch user roles from backend (validates JWT cookie)
      const meRes = await api.get("/auth/me");
      const backendUser = meRes.data; // { id, roles }

      if (!backendUser?.id || !backendUser?.roles?.length) {
        // No user or roles from backend
        setStatus("unauthenticated");
        return;
      }

      // Fetch current role from backend cookie
      const roleRes = await api.get("/auth/current-role");
      const currentRoleValue = roleRes.data?.currentRole || backendUser.roles[0];

      // Set authenticated state
      setUser({ id: backendUser.id });
      setRoles(backendUser.roles);
      setCurrentRole(currentRoleValue);
      setStatus("authenticated");
    } catch (err: any) {
      // If 401/403, user not authenticated
      if (err.response?.status === 401 || err.response?.status === 403) {
        setStatus("unauthenticated");
      } else {
        // Network error - treat as unauthenticated for safety
        console.error("Failed to initialize auth:", err);
        setStatus("unauthenticated");
      }
    }
  }

  const hydrateFromLogin = async (nextUser: User, nextRoles: string[]) => {
    const defaultRole = nextRoles?.[0] || null;

    // Update state (no localStorage)
    setUser(nextUser);
    setRoles(nextRoles);
    setCurrentRole(defaultRole);
    setStatus("authenticated");

    // Sync current role to backend cookie
    if (defaultRole) {
      try {
        await api.post("/auth/select-role", { role: defaultRole });
      } catch (err) {
        console.warn("Failed to sync current role to backend:", err);
      }
    }
  };

  const setCurrentRoleSafe = async (role: string): Promise<boolean> => {
    // Quick validation
    if (!roles.includes(role)) return false;

    try {
      // Call backend to store in cookie (validates role)
      await api.post("/auth/select-role", { role });

      // Only update state if backend accepts
      setCurrentRole(role);
      return true;
    } catch (err: any) {
      console.error("Failed to set current role:", err);
      return false;
    }
  };

  const refreshRoles = async () => {
    if (!user?.id) return;

    // Throttle to avoid excessive backend requests
    const now = Date.now();
    if (rolesRefreshing) return;
    if (lastRolesFetch && now - lastRolesFetch < ROLE_REFRESH_COOLDOWN_MS) {
      return;
    }

    setRolesRefreshing(true);
    setStatus((prev) => (prev === "idle" ? "loading" : prev));

    try {
      // Use new /auth/me endpoint (accessible to all authenticated users)
      const res = await api.get("/auth/me");
      const backendRoles: string[] = res.data?.roles || [];

      if (Array.isArray(backendRoles) && backendRoles.length > 0) {
        setRoles(backendRoles);

        // Ensure currentRole stays valid
        if (!backendRoles.includes(currentRole || "")) {
          const fallback = backendRoles[0];
          setCurrentRole(fallback);

          // Sync to backend cookie
          try {
            await api.post("/auth/select-role", { role: fallback });
          } catch (err) {
            console.warn("Failed to sync fallback role:", err);
          }
        }
      }

      setLastRolesFetch(now);
      setStatus("authenticated");
    } catch (err) {
      setStatus(user ? "authenticated" : "unauthenticated");
      console.warn("refreshRoles failed", err);
    } finally {
      setRolesRefreshing(false);
    }
  };

  const clearAuth = async () => {
    try {
      // Call backend logout to clear HTTP-only cookies
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Failed to call logout endpoint:", err);
      // Continue clearing state even if request fails
    }

    // Clear state (no localStorage to clear)
    setUser(null);
    setRoles([]);
    setCurrentRole(null);
    setStatus("unauthenticated");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      roles,
      currentRole,
      status,
      hydrateFromLogin,
      refreshRoles,
      setCurrentRoleSafe,
      clearAuth,
    }),
    [user, roles, currentRole, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
