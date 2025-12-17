"use client";

import { ReactNode } from "react";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, Search, FileText } from "lucide-react";
import { cn } from "@/components/ui/utils";
import NotificationBell from "./components/NotificationBell";

interface EmployeeLayoutProps {
  children: ReactNode;
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const { currentRole } = useAuth();
  const pathname = usePathname();

  const tabs = [
    {
      label: "My Profile",
      href: "/employee/profile",
      icon: User,
      roles: ["*"], // All authenticated users
    },
    {
      label: "My Team",
      href: "/employee/team",
      icon: Users,
      roles: ["department head"],
    },
    {
      label: "Directory",
      href: "/employee/directory",
      icon: Search,
      roles: ["HR Employee", "HR Manager", "HR Admin", "System Admin"],
    },
    {
      label: "Change Requests",
      href: "/employee/requests",
      icon: FileText,
      roles: ["HR Manager", "HR Admin", "System Admin"],
    },
  ];

  const visibleTabs = tabs.filter(
    (tab) =>
      tab.roles.includes("*") ||
      (currentRole && tab.roles.includes(currentRole))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Sub-navigation */}
        <div className="mb-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <nav className="flex gap-1 overflow-x-auto flex-1">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-all whitespace-nowrap",
                      isActive
                        ? "bg-white/10 text-white border-b-2 border-blue-500"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
            <NotificationBell />
          </div>
        </div>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
