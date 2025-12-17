"use client";

import { useRequireRole } from "@/hooks/use-require-role";

export default function PayrollDashboardPage() {
  useRequireRole(["Payroll Specialist", "HR Manager", "Finance Staff", "HR Admin"]);
  return <div className="text-slate-300">Payroll dashboard (placeholder)</div>;
}
