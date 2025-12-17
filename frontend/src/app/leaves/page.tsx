"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

// Main dispatcher: routes to the correct leaves experience based on the current role.
export default function LeavesRouter() {
  const { status, currentRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }
    if (!currentRole) return;

    if (currentRole === "department employee") {
      router.replace("/leaves/employee");
    } else {
      router.replace("/leaves/dashboard");
    }
  }, [status, currentRole, router]);

  return null;
}
