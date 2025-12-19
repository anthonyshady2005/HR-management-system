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
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/protected-route";

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

const OFFBOARDING_SUB_LINKS = [
  { href: "/recruitment/offboarding/dashboard", label: "Dashboard", icon: Briefcase },
  { href: "/recruitment/offboarding/clearances", label: "Pending Clearances", icon: CheckCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  // Exclude onboarding/offboarding routes from recruitment check
  const isRecruitment = pathname?.startsWith("/recruitment") 
    && !pathname?.startsWith("/recruitment/onboarding")
    && !pathname?.startsWith("/recruitment/offboarding");
  const isOnboarding = pathname?.startsWith("/onboarding") || pathname?.startsWith("/recruitment/onboarding");
  const isOffboarding = pathname?.startsWith("/offboarding") || pathname?.startsWith("/recruitment/offboarding");
  const showSidebar = isRecruitment || isOnboarding || isOffboarding;

  // Define allowed roles for recruitment module (matching backend SystemRole enum values)
  const recruitmentRoles = [
    "HR Manager",
    "HR Admin",
    "HR Employee",
    "Recruiter",
    "department head",
    "System Admin",
  ];

  // Only apply ProtectedRoute for recruitment/onboarding/offboarding routes
  const content = (
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
        <div className={showSidebar ? "grid grid-cols-1 md:grid-cols-[18rem_1fr] xl:grid-cols-[20rem_1fr] gap-6" : ""}>
          {/* Floating Sidebar - Only show for recruitment/onboarding/offboarding */}
          {showSidebar && (
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
                  // Fix: Handle active states properly, excluding onboarding/offboarding from recruitment
                  let isActive = false;
                  if (link.href === "/recruitment") {
                    // Active if pathname starts with /recruitment but NOT onboarding/offboarding
                    isActive = pathname?.startsWith("/recruitment") 
                      && !pathname?.startsWith("/recruitment/onboarding")
                      && !pathname?.startsWith("/recruitment/offboarding");
                  } else if (link.href === "/onboarding") {
                    // Active if pathname is /onboarding or starts with /recruitment/onboarding
                    isActive = pathname === "/onboarding" || pathname?.startsWith("/recruitment/onboarding");
                  } else if (link.href === "/offboarding") {
                    // Active if pathname is /offboarding or starts with /recruitment/offboarding
                    isActive = pathname === "/offboarding" || pathname?.startsWith("/recruitment/offboarding");
                  } else {
                    isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                  }
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
                      {isActive && link.href === "/offboarding" && (
                        <div className="ml-4 mt-2 space-y-1 border-l border-white/10 pl-4">
                          {OFFBOARDING_SUB_LINKS.map((subLink) => {
                            const SubIcon = subLink.icon;
                            const isSubActive = subLink.href === "/recruitment/offboarding/dashboard"
                              ? pathname === "/recruitment/offboarding/dashboard" || pathname === "/offboarding" || pathname === "/recruitment/offboarding"
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
          )}
          
          {/* Main content area */}
          <main className={showSidebar ? "min-w-0 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-lg shadow-black/20" : "w-full"}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );

  // Only wrap with ProtectedRoute for recruitment/onboarding/offboarding routes
  if (showSidebar) {
    return <ProtectedRoute allowedRoles={recruitmentRoles}>{content}</ProtectedRoute>;
  }

  // For admin and other routes, render without ProtectedRoute wrapper
  return content;
}
