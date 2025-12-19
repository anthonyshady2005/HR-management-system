"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Briefcase,
  Users,
  Calendar,
  FileText,
  Globe,
} from "lucide-react";
import Navbar from "@/components/Navbar";

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
  { href: "/careers", label: "Careers", icon: Globe },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isRecruitment = pathname?.startsWith("/recruitment");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-foreground relative">
      {/* Navbar */}
      <Navbar />
      
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main content with floating sidebar */}
      <div className="relative z-10 mx-auto w-full px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr] gap-6">
          {/* Floating Sidebar */}
          <div className="rounded-2xl overflow-hidden">
            <aside className="h-full w-full backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 text-slate-200 shadow-lg shadow-black/20">
              <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Dashboards</p>
                  <p className="text-xs text-slate-400">HR Platform</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {NAV_LINKS.map((link) => {
                  // Fix: Use startsWith for recruitment to keep submenu open
                  const isActive = link.href === "/recruitment" 
                    ? pathname?.startsWith("/recruitment")
                    : pathname === link.href || pathname?.startsWith(link.href + "/");
                  const Icon = link.icon;
                  return (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/10 hover:text-white text-slate-300"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                      {isActive && isRecruitment && (
                        <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-4">
                          {RECRUITMENT_SUB_LINKS.map((subLink) => {
                            const SubIcon = subLink.icon;
                            // Dashboard should only be active when pathname is exactly /recruitment
                            // Other sub-links are active when pathname matches or starts with their href + "/"
                            const isSubActive = subLink.href === "/recruitment"
                              ? pathname === "/recruitment"
                              : pathname === subLink.href || pathname?.startsWith(subLink.href + "/");
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
            </aside>
          </div>
          
          {/* Main content area */}
          <main className="min-w-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-lg shadow-black/20">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
