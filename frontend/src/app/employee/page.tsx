"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import Navbar from "@/components/Navbar";

/**
 * Main Employee module router
 * Redirects to appropriate view based on user's current role
 */
export default function EmployeePage() {
  const { status, currentRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    if (status === "authenticated") {
      // Route based on current role (if user has no role, go to profile)
      if (!currentRole) {
        router.replace("/employee/profile");
        return;
      }

      switch (currentRole) {
        case "department head":
          router.replace("/employee/team");
          break;
        case "HR Employee":
        case "HR Manager":
        case "HR Admin":
        case "System Admin":
          router.replace("/employee/directory");
          break;
        default:
          // All other employees go to their profile
          router.replace("/employee/profile");
          break;
      }
    }
  }, [status, currentRole, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    </div>
  );
}
