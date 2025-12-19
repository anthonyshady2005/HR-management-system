"use client";

import { useEffect, useState } from "react";
import {
  Timer,
  Clock,
  Calendar,
  FileText,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Home,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { timeManagementService } from "../services/time-management.service";
import { useAuth } from "@/providers/auth-provider";
import { useRequireRole } from "@/hooks/use-require-role";

/* ===================== RBAC ===================== */
const ALLOWED_ROLES = ["HR Manager", "HR Admin", "System Admin"];

/* ===================== NAV CARDS ===================== */
const navigationCards = [
  {
    title: "Attendance Overview",
    description: "View daily, weekly, and monthly attendance records",
    href: "/time-management/attendance-overview",
    icon: Clock,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Shift Calendar",
    description: "Manage shifts and shift assignments",
    href: "/time-management/shift-calendar",
    icon: Calendar,
    color: "from-green-500 to-emerald-500",
  },
 {
  title: "Holiday Requests",
  description: "Request, view, and manage employee holidays and leave days",
  href: "/time-management/holiday-overview",
  icon: Calendar,
  color: "from-emerald-500 to-green-600",
},

  {
    title: "Report Generation",
    description: "Generate and download reports for various HR metrics",
    href: "/time-management/report-generation",
    icon: CheckCircle,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Overtime Summary",
    description: "View overtime hours and penalty breakdowns",
    href: "/time-management/overtime-summary",
    icon: TrendingUp,
    color: "from-amber-500 to-yellow-500",
  },
  {
    title: "Payroll Sync Status",
    description: "Monitor synchronization with payroll module",
    href: "/time-management/payroll-sync-status",
    icon: RefreshCw,
    color: "from-indigo-500 to-blue-500",
  },
];

/* ===================== TYPES ===================== */

type ShiftExpiryNotification = {
  _id: string;
  assignmentId: string;
  title: string;
  message: string;
  createdAt: string;
};

/* ===================== HELPERS ===================== */

function extractExpiryDate(message: string): Date | null {
  const match = message.match(/\d{4}-\d{2}-\d{2}/);
  return match ? new Date(match[0]) : null;
}

function calculateDaysRemaining(expiryDate: Date): number {
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgencyStyles(days: number) {
  if (days <= 3) {
    return {
      badge: "bg-red-500/20 text-red-400 border-red-500/50",
      icon: "text-red-400",
      label: "Urgent",
    };
  }
  if (days <= 7) {
    return {
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/50",
      icon: "text-amber-400",
      label: "Soon",
    };
  }
  return {
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    icon: "text-blue-400",
    label: "Upcoming",
  };
}

/* ===================== PAGE ===================== */

export default function TimeManagementPage() {
  const { status } = useAuth();
  useRequireRole(ALLOWED_ROLES, "/");
  
  const LIMIT = 5;

  const [notifications, setNotifications] = useState<ShiftExpiryNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);

  /* ===================== DATA ===================== */

  const refreshNotifications = async () => {
    setRefreshing(true);
    try {
      // This triggers the backend to create new notifications
      await timeManagementService.notifyUpcomingShiftExpiry(3);
      // Then reload the notifications list
      await loadNotifications(page);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadNotifications = async (pageIndex: number) => {
    setLoading(true);
    try {
      const data = await timeManagementService.getShiftExpiryNotifications(
        LIMIT,
        pageIndex * LIMIT
      );

      const normalized: ShiftExpiryNotification[] = Array.isArray(data)
        ? data.map((n: any) => ({
            _id: n._id,
            assignmentId: n.assignmentId,
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
          }))
        : [];

      setNotifications(normalized);
      setPage(pageIndex);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Only load existing notifications on mount, don't trigger notify endpoint
  useEffect(() => {
    if (status === "authenticated") {
      loadNotifications(0);
    }
  }, [status]);

  /* ===================== UI ===================== */

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* TOP NAV */}
      <div className="fixed top-4 left-4 z-50 flex gap-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 border-2 border-slate-500 rounded-xl text-white font-semibold hover:bg-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </a>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 border-2 border-slate-500 rounded-xl text-white font-semibold hover:bg-slate-700"
        >
          <Home className="w-5 h-5" />
          Home
        </a>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* HEADER */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
              Time Management
            </h1>
          </div>
          <p className="text-xl text-slate-400">
            Manage attendance, shifts, exceptions, and overtime tracking
          </p>
        </div>

        {/* NAV CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationCards.map((card) => (
            <a key={card.href} href={card.href}>
              <div className="group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-3xl p-6 hover:scale-105 transition-all cursor-pointer h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl text-white mb-3 font-semibold">
                  {card.title}
                </h3>
                <p className="text-slate-400 mb-6">{card.description}</p>
                <div className="flex items-center gap-2 text-slate-400">
                  Open <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* ===================== SHIFT EXPIRY NOTIFICATIONS ===================== */}
        <div className="mt-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-2xl text-white">Shift Expiry Notifications</h3>
            </div>
            <button
              onClick={refreshNotifications}
              disabled={refreshing}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No shift expiry notifications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n, index) => {
                const expiryDate = extractExpiryDate(n.message);
                const daysRemaining = expiryDate
                  ? calculateDaysRemaining(expiryDate)
                  : 0;
                const urgency = getUrgencyStyles(daysRemaining);

                return (
                  <div
                    key={`${n._id}-${index}`}
                    className="p-5 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className={urgency.icon} />
                      <h4 className="text-white font-semibold">{n.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${urgency.badge}`}>
                        {urgency.label}
                      </span>
                    </div>

                    <p className="text-slate-300 ml-8">{n.message}</p>

                    {expiryDate && (
                      <p className="text-slate-400 ml-8 mt-1">
                        Expires: {expiryDate.toLocaleDateString()} (
                        {daysRemaining} days remaining)
                      </p>
                    )}

                    <p className="text-xs text-slate-500 ml-8 mt-1">
                      Created: {new Date(n.createdAt).toLocaleString()}
                    </p>

                    <div className="mt-4 ml-8">
                      <a
                        href={`/time-management/shift-calendar?assignment=${n.assignmentId}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                      >
                        Manage Shift
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===================== QUICK STATS ===================== */}
        <div className="mt-12 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8">
          <h3 className="text-2xl text-white mb-4">Quick Stats</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              ["Present Today", CheckCircle, "text-green-400"],
              ["On Leave", Clock, "text-amber-400"],
              ["Pending Requests", FileText, "text-blue-400"],
              ["Overtime Hours", TrendingUp, "text-purple-400"],
            ].map(([label, Icon, color]: any) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
                <p className="text-2xl text-white">-</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}