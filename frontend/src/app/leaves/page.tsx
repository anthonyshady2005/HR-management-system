"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, CheckCircle, Clock, Shield, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/providers/auth-provider";
import { useRequireRole } from "@/hooks/use-require-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ALLOWED_ROLES = [
  "department head",
  "HR Manager",
  "HR Admin",
  "System Admin",
  "department employee",
];

const mockLeaveStats = [
  { label: "Pending Requests", value: 12, icon: Clock, color: "from-amber-500 to-orange-500" },
  { label: "Approved", value: 34, icon: CheckCircle, color: "from-emerald-500 to-green-500" },
  { label: "Rejected", value: 5, icon: Shield, color: "from-rose-500 to-red-500" },
  { label: "Total This Month", value: 51, icon: Calendar, color: "from-blue-500 to-cyan-500" },
];

const mockTeam = [
  { name: "Sarah Johnson", role: "department employee", status: "Pending", days: 3 },
  { name: "Michael Chen", role: "department employee", status: "Approved", days: 2 },
  { name: "Emma Wilson", role: "department employee", status: "Rejected", days: 1 },
  { name: "James Brown", role: "department employee", status: "Pending", days: 4 },
];

export default function LeavesDashboard() {
  const { status, user, currentRole } = useAuth();
  const router = useRouter();

  useRequireRole(ALLOWED_ROLES, "/home");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  if (status !== "authenticated" || !user || !currentRole) {
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
            <h1 className="text-3xl font-semibold">Leaves Dashboard</h1>
            <p className="text-slate-400 text-sm">Active role: {currentRole}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {mockLeaveStats.map((stat) => (
            <Card key={stat.label} className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Team leave requests
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTeam.map((member) => (
              <div key={member.name} className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-slate-400">{member.role}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant="secondary"
                    className={
                      member.status === "Approved"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : member.status === "Rejected"
                          ? "bg-rose-500/20 text-rose-200"
                          : "bg-amber-500/20 text-amber-200"
                    }
                  >
                    {member.status}
                  </Badge>
                  <p className="text-sm text-slate-300 mt-1">{member.days} days</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
