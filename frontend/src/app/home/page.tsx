"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Shield, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LEAVE_ALLOWED_ROLES = [
  "department head",
  "HR Manager",
  "HR Admin",
  "System Admin",
  "department employee",
];

export default function HomePage() {
  const { status, user, currentRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated" || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Welcome back, {user.fullName || "User"}</h1>
            <p className="text-slate-400 text-sm">Active role: {currentRole || "None selected"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-300">
              <p>Email: {user.email || "—"}</p>
              <p>User ID: {user.id}</p>
              <p>Current role: {currentRole || "None"}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Quick links
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button variant="secondary" onClick={() => router.push("/employee")}>
                Employee Module
              </Button>
              <Button variant="secondary" onClick={() => router.push("/payroll")}>
                Payroll
              </Button>
              {currentRole && LEAVE_ALLOWED_ROLES.includes(currentRole) && (
                <Button variant="secondary" onClick={() => router.push("/leaves")}>
                  Leaves
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
