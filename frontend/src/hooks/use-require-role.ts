"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

/**
 * Frontend guard: checks only the selected currentRole (not the whole roles array).
 * If invalid or not allowed, refresh roles once and redirect away.
 */
export function useRequireRole(allowedRoles: string[], fallbackPath = "/") {
  const { currentRole, roles, status, refreshRoles } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      // If we haven't loaded auth yet, wait.
      if (status === "idle" || status === "loading") return;

      // Ensure we have a currentRole that belongs to the user.
      if (!currentRole || !roles.includes(currentRole)) {
        try {
          await refreshRoles();
        } catch {
          // ignore
        }
      }

      const activeRole = currentRole && roles.includes(currentRole) ? currentRole : null;
      if (!activeRole || (allowedRoles.length > 0 && !allowedRoles.includes(activeRole))) {
        if (!cancelled) {
          router.replace(fallbackPath);
        }
      }
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles, currentRole, roles, status, refreshRoles, router, fallbackPath]);
}
