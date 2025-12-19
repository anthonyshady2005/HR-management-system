"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

// Route mapping for time management:
// - Admin/HR Manager → /time-management/admin
// - Department Head → /time-management/department-head
// - Everyone else (employees) → /time-management/employee
export default function TimeManagementRouter() {
  const { status, currentRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Still checking auth → do nothing yet
    if (status === "loading") return;

    // Not logged in → go to login
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    // Authenticated but role not loaded yet
    if (!currentRole) return;

    // Group 1: Admin + HR Manager
    if (
      currentRole === "System Admin" ||
      currentRole === "HR Admin" ||
      currentRole === "HR Manager"
    ) {
      router.replace("/time-management/admin-pannel");
      return;
    }

    // Group 2: Department Head
    if (currentRole === "department head") {
      router.replace("/time-management/department-head-pannel");
      return;
    }

    // Group 3: Default → Employee view
    // (department employee, HR Employee, or anything else)
    router.replace("/time-management/employee-pannel");
  }, [status, currentRole, router]);

  // We don't render anything here; this component only redirects.
  return null;
}
