"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Briefcase,
  Users,
  Calendar,
  FileText,
  ChevronRight,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/recruitment", label: "Recruitment", icon: Briefcase },
  { href: "/onboarding", label: "Onboarding", icon: Users },
  { href: "/offboarding", label: "Offboarding", icon: Users },
];

const RECRUITMENT_SUB_LINKS = [
  { href: "/recruitment", label: "Dashboard", icon: Briefcase },
  { href: "/recruitment/job-requisitions", label: "Job Requisitions", icon: Briefcase },
  { href: "/recruitment/applications", label: "Applications", icon: Users },
  { href: "/recruitment/interviews", label: "Interviews", icon: Calendar },
  { href: "/recruitment/offers", label: "Offers", icon: FileText },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isRecruitment = pathname?.startsWith("/recruitment");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-foreground">
      <aside className="flex w-72 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl text-slate-200">
        <div className="px-6 pb-4 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Dashboards
          </p>
          <nav className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                  {isActive && isRecruitment && (
                    <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-4">
                      {RECRUITMENT_SUB_LINKS.map((subLink) => {
                        const SubIcon = subLink.icon;
                        const isSubActive = pathname === subLink.href || pathname?.startsWith(subLink.href + "/");
                        return (
                          <Link
                            key={subLink.href}
                            href={subLink.href}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                              isSubActive
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <SubIcon className="w-3 h-3" />
                            {subLink.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
