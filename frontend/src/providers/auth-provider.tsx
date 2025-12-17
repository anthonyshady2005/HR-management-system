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
  hydrateFromLogin: (user: User, roles: string[]) => void;
  refreshRoles: () => Promise<void>;
  setCurrentRoleSafe: (role: string) => boolean;
  clearAuth: () => void;
};

const STORAGE_KEY = "hrhub_auth_state";
const ROLE_REFRESH_COOLDOWN_MS = 60_000; // prevent hammering backend

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadFromStorage(): Pick<AuthState, "user" | "roles" | "currentRole"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Pick<AuthState, "user" | "roles" | "currentRole">;
  } catch (err) {
    console.warn("Failed to parse stored auth state", err);
    return null;
  }
}

function persist(state: Pick<AuthState, "user" | "roles" | "currentRole">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

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

  // Hydrate from storage on first load.
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setUser(stored.user);
      setRoles(stored.roles || []);
      setCurrentRole(stored.currentRole || stored.roles?.[0] || null);
      setStatus(stored.user ? "authenticated" : "unauthenticated");
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const hydrateFromLogin = (nextUser: User, nextRoles: string[]) => {
    const defaultRole = nextRoles?.[0] || null;
    setUser(nextUser);
    setRoles(nextRoles);
    setCurrentRole(defaultRole);
    setStatus("authenticated");
    persist({ user: nextUser, roles: nextRoles, currentRole: defaultRole });
  };

  const setCurrentRoleSafe = (role: string) => {
    if (!roles.includes(role)) return false;
    setCurrentRole(role);
    persist({ user, roles, currentRole: role });
    return true;
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
      // Attempt to re-fetch roles from a protected endpoint.
      // If access is denied (e.g., user lacks permission), we keep the existing roles.
      const res = await api.get(`/employee-profile/${user.id}/roles`);
      const backendRoles: string[] = res.data?.roles || [];
      if (Array.isArray(backendRoles) && backendRoles.length > 0) {
        setRoles(backendRoles);
        // Ensure currentRole stays valid.
        if (!backendRoles.includes(currentRole || "")) {
          const fallback = backendRoles[0];
          setCurrentRole(fallback);
          persist({ user, roles: backendRoles, currentRole: fallback });
        } else {
          persist({ user, roles: backendRoles, currentRole: currentRole });
        }
      }
      setLastRolesFetch(now);
      setStatus("authenticated");
    } catch (err) {
      // If the re-fetch fails (forbidden/not allowed), keep existing roles but stay authenticated.
      setStatus(user ? "authenticated" : "unauthenticated");
      console.warn("refreshRoles failed; keeping existing roles", err);
    } finally {
      setRolesRefreshing(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setRoles([]);
    setCurrentRole(null);
    setStatus("unauthenticated");
    persist({ user: null, roles: [], currentRole: null });
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
