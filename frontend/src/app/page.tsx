"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import Navbar from "@/components/Navbar";
import {
    ArrowRight,
    CheckCircle,
    Shield,
    Users,
    Zap,
    Briefcase,
    UserPlus,
    UserMinus,
    ChevronRight,
    Calendar,
    TrendingUp,
    Clock,
    FileText,
    DollarSign,
    Timer,
    Building2,
    Trophy,
    Settings,
} from "lucide-react";
import {
    canAccessRecruitment,
    canAccessOnboarding,
    canAccessOffboarding,
    canAccessEmployeeManagement,
    canAccessPayroll,
    canAccessTimeManagement,
    canAccessLeaves,
    canAccessPerformance,
    canAccessOrganizationStructure,
    canAccessAdmin,
} from "@/lib/module-access-utils";

function ProtectedLink({ href, children, className, onClick }: { href: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
    const { status } = useAuth();
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        // Only prevent navigation if explicitly unauthenticated
        // Let the link work normally if authenticated or still loading
        if (status === "unauthenticated") {
            e.preventDefault();
            router.push("/auth/login");
            return;
        }
        // Allow normal navigation for authenticated users or those still loading
        if (onClick) onClick();
    };

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {children}
        </Link>
    );
}

// Helper component for inactive cards
function InactiveCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`${className} opacity-40 grayscale relative cursor-not-allowed`}>
            <div className="absolute inset-0 bg-slate-900/60 rounded-inherit z-10" />
            <div className="relative z-0 pointer-events-none">
                {children}
            </div>
        </div>
    );
}

export default function LandingPage() {
    const { status, user, currentRole } = useAuth();
    const isAuthenticated = status === "authenticated" && user;

    // Show loading state while checking auth
    if (status === "idle" || status === "loading") {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // If authenticated, show dashboard content
    if (isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 text-white selection:bg-slate-700 selection:text-white overflow-hidden relative">
                <Navbar />
                <main className="pt-24 pb-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12 text-center">
                            <h2 className="text-5xl text-white mb-4 bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
                                Welcome to HR Hub
                            </h2>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                                Manage recruitment, onboarding, and offboarding processes seamlessly with our integrated platform
                            </p>
                            {currentRole && (
                                <p className="text-sm text-slate-500 mt-2">Active role: {currentRole}</p>
                            )}
                        </div>

                        {/* Quick Links Section */}
                        <div className="mb-16">
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="w-5 h-5 text-slate-400" />
                                <h3 className="text-2xl text-white">Quick Links</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {/* For regular employees, only show Profile and Org Structure */}
                                {currentRole?.toLowerCase() === "department employee" ? (
                                    <>
                                        <Link
                                            href="/employee/profile"
                                            className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 text-center"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <Users className="w-5 h-5 text-white" />
                                            </div>
                                            <p className="text-sm text-white font-medium">My Profile</p>
                                        </Link>
                                        {canAccessOrganizationStructure(currentRole) && (
                                            <ProtectedLink
                                                href="/organization-structure"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Building2 className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Org Structure</p>
                                            </ProtectedLink>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {canAccessRecruitment(currentRole) && (
                                            <ProtectedLink
                                                href="/recruitment"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Briefcase className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Recruitment</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessOnboarding(currentRole) && (
                                            <ProtectedLink
                                                href="/onboarding"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-green-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <UserPlus className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Onboarding</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessOffboarding(currentRole) && (
                                            <ProtectedLink
                                                href="/offboarding"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <UserMinus className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Offboarding</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessEmployeeManagement(currentRole) && (
                                            <Link
                                                href="/employee"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Users className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Employees</p>
                                            </Link>
                                        )}

                                        {canAccessPayroll(currentRole) && (
                                            <ProtectedLink
                                                href="/payroll"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <DollarSign className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Payroll</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessTimeManagement(currentRole) && (
                                            <ProtectedLink
                                                href="/time-management"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Timer className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Time</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessLeaves(currentRole) && (
                                            <ProtectedLink
                                                href={currentRole === "department employee" ? "/leaves/employee" : "/leaves/dashboard"}
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-teal-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Leaves</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessPerformance(currentRole) && (
                                            <ProtectedLink
                                                href="/performance"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-indigo-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Trophy className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Performance</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessOrganizationStructure(currentRole) && (
                                            <ProtectedLink
                                                href="/organization-structure"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Building2 className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Org Structure</p>
                                            </ProtectedLink>
                                        )}

                                        {canAccessAdmin(currentRole) && (
                                            <ProtectedLink
                                                href="/admin/users"
                                                className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-rose-400/50 transition-all duration-300 hover:scale-105 text-center"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                    <Settings className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-sm text-white font-medium">Admin</p>
                                            </ProtectedLink>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="mb-16">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: "Active Jobs", value: "12", icon: Briefcase, color: "from-blue-500 to-cyan-500" },
                                    { label: "New Hires", value: "8", icon: UserPlus, color: "from-green-500 to-emerald-500" },
                                    { label: "In Progress", value: "24", icon: Clock, color: "from-slate-500 to-slate-700" },
                                    { label: "Completed", value: "156", icon: CheckCircle, color: "from-orange-500 to-red-500" },
                                ].map((stat) => {
                                    const isEmployee = currentRole?.toLowerCase() === "department employee";
                                    return (
                                        <div
                                            key={stat.label}
                                            className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 ${
                                                isEmployee ? "opacity-40 grayscale" : "hover:bg-white/10 hover:scale-105"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                                    <stat.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <TrendingUp className="w-5 h-5 text-green-400" />
                                            </div>
                                            <p className="text-3xl text-white mb-1">{isEmployee ? "—" : stat.value}</p>
                                            <p className="text-sm text-slate-400">{stat.label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main Modules Section */}
                        <div className="mb-16">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {canAccessRecruitment(currentRole) ? (
                                    <ProtectedLink
                                        href="/recruitment"
                                        className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-slate-500/50 text-left"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Briefcase className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl text-white mb-3">Recruitment</h3>
                                        <p className="text-slate-400 mb-6">
                                            Manage job postings, track candidates, schedule interviews, and streamline your hiring process
                                        </p>
                                        <div className="space-y-2 mb-6">
                                            {[
                                                "Job Requisitions & Templates",
                                                "Candidate Pipeline Management",
                                                "Interview Scheduling & Feedback",
                                            ].map((item) => (
                                                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300 group-hover:gap-3 transition-all">
                                            <span>Open Dashboard</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </ProtectedLink>
                                ) : (
                                    <InactiveCard className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 text-left">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mb-6">
                                            <Briefcase className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl text-white mb-3">Recruitment</h3>
                                        <p className="text-slate-400 mb-6">
                                            Manage job postings, track candidates, schedule interviews, and streamline your hiring process
                                        </p>
                                        <div className="space-y-2 mb-6">
                                            {[
                                                "Job Requisitions & Templates",
                                                "Candidate Pipeline Management",
                                                "Interview Scheduling & Feedback",
                                            ].map((item) => (
                                                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span>Access Restricted</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </InactiveCard>
                                )}

                                {canAccessOnboarding(currentRole) ? (
                                    <ProtectedLink
                                        href="/onboarding"
                                        className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-green-500/50 text-left"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <UserPlus className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl text-white mb-3">Onboarding</h3>
                                        <p className="text-slate-400 mb-6">
                                            Welcome new hires with structured checklists, document collection, and resource provisioning
                                        </p>
                                        <div className="space-y-2 mb-6">
                                            {["Onboarding Checklists", "Document Verification", "Resource Provisioning"].map((item) => (
                                                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-green-400 group-hover:text-green-300 group-hover:gap-3 transition-all">
                                            <span>Open Dashboard</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </ProtectedLink>
                                ) : (
                                    <InactiveCard className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 text-left">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6">
                                            <UserPlus className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl text-white mb-3">Onboarding</h3>
                                        <p className="text-slate-400 mb-6">
                                            Welcome new hires with structured checklists, document collection, and resource provisioning
                                        </p>
                                        <div className="space-y-2 mb-6">
                                            {["Onboarding Checklists", "Document Verification", "Resource Provisioning"].map((item) => (
                                                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span>Access Restricted</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </InactiveCard>
                                )}

                                {canAccessOffboarding(currentRole) ? (
                                    <ProtectedLink
                                        href="/offboarding"
                                        className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:border-orange-500/50 text-left"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <UserMinus className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl text-white mb-3">Offboarding</h3>
                                        <p className="text-slate-400 mb-6">
                                            Handle resignations and terminations with clearance checklists and final settlements
                                        </p>
                                        <div className="space-y-2 mb-6">
                                            {[
                                                "Clearance Checklists",
                                                "Multi-Department Sign-offs",
                                                "Access Revocation",
                                            ].map((item) => (
                                                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-orange-400 group-hover:text-orange-300 group-hover:gap-3 transition-all">
                                            <span>Open Dashboard</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </ProtectedLink>
                                ) : (
                                    <InactiveCard className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-3xl p-8 text-left">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-6">
                                            <UserMinus className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-2xl text-white mb-3">Offboarding</h3>
                                        <p className="text-slate-400 mb-6">
                                            Handle resignations and terminations with clearance checklists and final settlements
                                        </p>
                                        <div className="space-y-2 mb-6">
                                            {[
                                                "Clearance Checklists",
                                                "Multi-Department Sign-offs",
                                                "Access Revocation",
                                            ].map((item) => (
                                                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span>Access Restricted</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </InactiveCard>
                                )}
                            </div>
                        </div>

                        {/* Additional Modules Section */}
                        <div className="mb-16">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-2xl text-white">Modules</h3>
                                <p className="text-sm text-slate-400 ml-auto">Payment, Time Management, & Payroll Tracking</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {canAccessEmployeeManagement(currentRole) ? (
                                    <Link
                                        href="/employee"
                                        className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:border-blue-400/50 text-left"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl text-white">Employee Management</h4>
                                                    <p className="text-sm text-slate-400">Workforce oversight & analytics</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">248</p>
                                                <p className="text-xs text-slate-400">Total Employees</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">12</p>
                                                <p className="text-xs text-slate-400">Departments</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">95%</p>
                                                <p className="text-xs text-slate-400">Retention Rate</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Engineering</span>
                                                <span className="text-white">85 employees</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: "70%" }} />
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Sales & Marketing</span>
                                                <span className="text-white">62 employees</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: "50%" }} />
                                            </div>
                                        </div>
                                    </Link>
                                ) : (
                                    <InactiveCard className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 text-left">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl text-white">Employee Management</h4>
                                                    <p className="text-sm text-slate-400">Workforce oversight & analytics</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-500" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">—</p>
                                                <p className="text-xs text-slate-400">Total Employees</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">—</p>
                                                <p className="text-xs text-slate-400">Departments</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">—</p>
                                                <p className="text-xs text-slate-400">Retention Rate</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Engineering</span>
                                                <span className="text-white">—</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-600" style={{ width: "0%" }} />
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Sales & Marketing</span>
                                                <span className="text-white">—</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-600" style={{ width: "0%" }} />
                                            </div>
                                        </div>
                                    </InactiveCard>
                                )}

                                {canAccessPayroll(currentRole) ? (
                                    <ProtectedLink
                                        href="/payroll"
                                        className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400/50 text-left"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <DollarSign className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl text-white">Payroll Management</h4>
                                                    <p className="text-sm text-slate-400">Compensation & benefits tracking</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">$2.4M</p>
                                                <p className="text-xs text-slate-400">Monthly Payroll</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">5</p>
                                                <p className="text-xs text-slate-400">Days Until Payroll</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">248</p>
                                                <p className="text-xs text-slate-400">Processed</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                    <span className="text-sm text-slate-300">Regular Salaries</span>
                                                </div>
                                                <span className="text-sm text-white">$1.8M</span>
                                            </div>
                                            <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                                                    <span className="text-sm text-slate-300">Bonuses & Incentives</span>
                                                </div>
                                                <span className="text-sm text-white">$420K</span>
                                            </div>
                                            <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                                    <span className="text-sm text-slate-300">Benefits & Deductions</span>
                                                </div>
                                                <span className="text-sm text-white">$180K</span>
                                            </div>
                                        </div>
                                    </ProtectedLink>
                                ) : (
                                    <InactiveCard className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 text-left">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
                                                    <DollarSign className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl text-white">Payroll Management</h4>
                                                    <p className="text-sm text-slate-400">Compensation & benefits tracking</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-500" />
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">—</p>
                                                <p className="text-xs text-slate-400">Monthly Payroll</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">—</p>
                                                <p className="text-xs text-slate-400">Days Until Payroll</p>
                                            </div>
                                            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3">
                                                <p className="text-2xl text-white mb-1">—</p>
                                                <p className="text-xs text-slate-400">Processed</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                                                    <span className="text-sm text-slate-300">Regular Salaries</span>
                                                </div>
                                                <span className="text-sm text-white">—</span>
                                            </div>
                                            <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                                                    <span className="text-sm text-slate-300">Bonuses & Incentives</span>
                                                </div>
                                                <span className="text-sm text-white">—</span>
                                            </div>
                                            <div className="flex items-center justify-between backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-slate-500" />
                                                    <span className="text-sm text-slate-300">Benefits & Deductions</span>
                                                </div>
                                                <span className="text-sm text-white">—</span>
                                            </div>
                                        </div>
                                    </InactiveCard>
                                )}
                                <div className="lg:col-span-2">
                                    {canAccessTimeManagement(currentRole) ? (
                                        <ProtectedLink
                                            href="/time-management"
                                            className="group backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.01] hover:border-amber-400/50 text-left block"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Timer className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl text-white">Time Management</h4>
                                                        <p className="text-sm text-slate-400">Attendance, shifts & leave management</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                                        <p className="text-xs text-slate-400">Present Today</p>
                                                    </div>
                                                    <p className="text-2xl text-white">234</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-4 h-4 text-amber-400" />
                                                        <p className="text-xs text-slate-400">On Leave</p>
                                                    </div>
                                                    <p className="text-2xl text-white">8</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="w-4 h-4 text-blue-400" />
                                                        <p className="text-xs text-slate-400">Leave Requests</p>
                                                    </div>
                                                    <p className="text-2xl text-white">14</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TrendingUp className="w-4 h-4 text-purple-400" />
                                                        <p className="text-xs text-slate-400">Avg. Hours/Week</p>
                                                    </div>
                                                    <p className="text-2xl text-white">42.5</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Calendar className="w-4 h-4 text-cyan-400" />
                                                        <p className="text-xs text-slate-400">Overtime Hours</p>
                                                    </div>
                                                    <p className="text-2xl text-white">124</p>
                                                </div>
                                            </div>
                                        </ProtectedLink>
                                    ) : (
                                        <InactiveCard className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 text-left block">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                                                        <Timer className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl text-white">Time Management</h4>
                                                        <p className="text-sm text-slate-400">Attendance, shifts & leave management</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-slate-500" />
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle className="w-4 h-4 text-slate-500" />
                                                        <p className="text-xs text-slate-400">Present Today</p>
                                                    </div>
                                                    <p className="text-2xl text-white">NaN</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="w-4 h-4 text-slate-500" />
                                                        <p className="text-xs text-slate-400">On Leave</p>
                                                    </div>
                                                    <p className="text-2xl text-white">NaN</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FileText className="w-4 h-4 text-slate-500" />
                                                        <p className="text-xs text-slate-400">Leave Requests</p>
                                                    </div>
                                                    <p className="text-2xl text-white">NaN</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TrendingUp className="w-4 h-4 text-slate-500" />
                                                        <p className="text-xs text-slate-400">Avg. Hours/Week</p>
                                                    </div>
                                                    <p className="text-2xl text-white">NaN</p>
                                                </div>
                                                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Calendar className="w-4 h-4 text-slate-500" />
                                                        <p className="text-xs text-slate-400">Overtime Hours</p>
                                                    </div>
                                                    <p className="text-2xl text-white">NaN</p>
                                                </div>
                                            </div>
                                        </InactiveCard>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // If not authenticated, show landing page
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-slate-700 selection:text-white overflow-hidden relative">
            {/* Background Gradients & Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-slate-700/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-slate-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                {/* Header */}
                <header className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-slate-950/50 border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-black/20 border border-white/10">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                HR Hub
                            </span>
                        </div>
                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
                                Features
                            </Link>
                            <Link href="#about" className="text-sm text-slate-400 hover:text-white transition-colors">
                                About
                            </Link>
                            <div className="flex items-center gap-4 ml-4">
                                <Link
                                    href="/auth/login"
                                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/auth/signup"
                                    className="group relative px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                >
                                    Sign up
                                    <ArrowRight className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="pt-32 pb-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-8 backdrop-blur-xl">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    v2.0 is now live
                                </div>
                                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8">
                                    <span className="block text-slate-400 text-3xl lg:text-4xl mb-2 font-medium">Welcome to</span>
                                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">
                                        HR Management System
                                    </span>
                                </h1>
                                <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                    A comprehensive platform designed to streamline your workforce operations.
                                    From recruitment to offboarding, we provide the tools you need to build
                                    and manage exact high-performance teams.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <Link
                                        href="/auth/signup"
                                        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-950 font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.4)]"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>

                            {/* Visual Element / Grid */}
                            <div className="flex-1 w-full max-w-lg lg:max-w-none">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl blur opacity-30" />
                                    <div className="relative grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/50 backdrop-blur-xl border border-white/10">
                                        <div className="col-span-2 p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                                                <Users className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Employee Analytics</h3>
                                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-3/4 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                                                <Zap className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">Fast Actions</h3>
                                        </div>
                                        <div className="p-6 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                                                <Shield className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">Secure Data</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features / About Section */}
                        <div id="about" className="mt-32">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">
                                    Why choose HR Hub?
                                </h2>
                                <p className="text-slate-400 max-w-2xl mx-auto">
                                    Experience a modern approach to human resource management with our cutting-edge features.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        title: "Modern Interface",
                                        description: "Clean, dark-themed glassmorphic design that reduces eye strain and looks professional.",
                                        icon: Zap,
                                        color: "from-amber-500 to-orange-500",
                                    },
                                    {
                                        title: "Secure & Reliable",
                                        description: "Built with industry-standard security protocols to keep your employee data safe.",
                                        icon: Shield,
                                        color: "from-blue-500 to-cyan-500",
                                    },
                                    {
                                        title: "Complete Suite",
                                        description: "Everything from detailed analytics to simple leave management in one place.",
                                        icon: CheckCircle,
                                        color: "from-emerald-500 to-green-500",
                                    },
                                ].map((feature, i) => (
                                    <div
                                        key={i}
                                        className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-white/10 bg-slate-950">
                    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-slate-500 text-sm">
                            © 2025 HR Hub System. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                            <Link href="#" className="text-slate-500 hover:text-white transition-colors text-sm">Terms of Service</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
