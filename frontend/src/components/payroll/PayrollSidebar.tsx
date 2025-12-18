"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlayCircle,
  FileText,
  AlertTriangle,
  UploadCloud,
  User,
  ReceiptText,
  LineChart,
  ShieldAlert,
  CreditCard,
  Scale,
  BarChart3,
  LayoutDashboard,
  Settings2,
  ClipboardList,
  Sigma,
  Clock4,
  Gift,
  DollarSign,
  Globe2,
  PlugZap,
  TrendingUpIcon,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: string[];
};

type Section = {
  title: string;
  items: Item[];
};

const sections: Section[] = [
  {
    title: "Payroll Configuration",
    items: [
      {
        label: "Payroll Policies",
        href: "/payroll/payroll-policies",
        icon: FileText,
        allowedRoles: ["Payroll Specialist", "Payroll Manager"],
      },
      {
        label: "Pay Grades",
        href: "/payroll/pay-grades",
        icon: TrendingUpIcon,
        allowedRoles: ["Payroll Specialist", "Payroll Manager"],
      },
      {
        label: "Pay Types",
        href: "/payroll/pay-types",
        icon: Clock4,
        allowedRoles: ["Payroll Specialist", "Payroll Manager"],
      },
      {
        label: "Allowances",
        href: "/payroll/allowances",
        icon: DollarSign,
        allowedRoles: ["Payroll Specialist", "Payroll Manager"],
      },
      {
        label: "Signing Bonuses",
        href: "/payroll/signing-bonuses",
        icon: Gift,
        allowedRoles: ["Payroll Specialist", "Payroll Manager"],
      },
      {
        label: "Termination Benefits",
        href: "/payroll/termination-benefits",
        icon: ClipboardList,
        allowedRoles: ["Payroll Specialist", "Payroll Manager"],
      },
      {
        label: "Tax Rules",
        href: "/payroll/tax-rules",
        icon: Scale,
        allowedRoles: ["Legal & Policy Admin", "Payroll Manager"],
      },
      {
        label: "Insurance Brackets",
        href: "/payroll/insurance-brackets",
        icon: DollarSign,
        allowedRoles: ["Payroll Specialist", "HR Manager"],
      },
      {
        label: "Company Settings",
        href: "/payroll/company-settings",
        icon: Settings2,
        allowedRoles: ["System Admin"],
      },
    ],
  },
  {
    title: "Payroll Runs",
    items: [
      {
        label: "All Runs",
        href: "/payroll/runs",
        icon: PlayCircle,
        allowedRoles: [
          "Payroll Specialist",
          "HR Manager",
          "Finance Staff",
          "HR Admin",
          "Payroll Manager",
        ],
      },
      {
        label: "Pending Items",
        href: "/payroll/pending-items",
        icon: ClipboardList,
        allowedRoles: [
          "Payroll Specialist",
          "HR Manager",
          "Finance Staff",
          "HR Admin",
          "Payroll Manager",
        ],
      },
      {
        label: "Payslips",
        href: "/payroll/finalized-payslips",
        icon: FileText,
        allowedRoles: [
          "Payroll Specialist",
          "HR Manager",
          "Finance Staff",
          "HR Admin",
          "Payroll Manager",
        ],
      },
      {
        label: "Exceptions",
        href: "/payroll/exceptions",
        icon: AlertTriangle,
        allowedRoles: [
          "Payroll Specialist",
          "HR Manager",
          "Finance Staff",
          "HR Admin",
          "Payroll Manager",
        ],
      },
      {
        label: "Bank Files",
        href: "/payroll/bank-files",
        icon: UploadCloud,
        allowedRoles: [
          "Payroll Specialist",
          "HR Manager",
          "Finance Staff",
          "HR Admin",
          "Payroll Manager",
        ],
      },
    ],
  },
  {
    title: "Employee Portal",
    items: [
      {
        label: "My Payslips",
        href: "/payroll/employee/payslips",
        icon: ReceiptText,
      },
      {
        label: "Disputes",
        href: "/payroll/employee/disputes",
        icon: ShieldAlert,
      },
      { label: "Claims", href: "/payroll/employee/claims", icon: CreditCard },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Reports",
        href: "/payroll/reports",
        icon: BarChart3,
        allowedRoles: ["Payroll Specialist", "Finance Staff"],
      },
    ],
  },
  {
    title: "Refunds",
    items: [
      {
        label: "Refunds",
        href: "/payroll/refunds",
        icon: RefreshCw,
        allowedRoles: ["Finance Staff"],
      },
    ],
  },
];

export function PayrollSidebar() {
  const pathname = usePathname();
  const { currentRole } = useAuth();

  return (
    <aside className="h-full w-full md:w-72 xl:w-80 backdrop-blur-xl bg-white/5 border-r border-white/10 p-4 md:p-6 text-slate-300">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-white">Payroll</p>
          <p className="text-xs text-slate-400">HR Platform</p>
        </div>
      </div>

      <nav className="space-y-6">
        {sections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (
              item.allowedRoles &&
              (!currentRole || !item.allowedRoles.includes(currentRole))
            )
              return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <div className="px-2 mb-2 text-slate-400 text-xs uppercase tracking-wide">
                {section.title}
              </div>
              <ul className="flex flex-col gap-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "hover:bg-white/10 text-slate-300"
                        }`}
                      >
                        <item.icon className="w-4 h-4 text-slate-300 group-hover:text-white" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

export default PayrollSidebar;