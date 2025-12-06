import Link from "next/link";
import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/recruitment", label: "Recruitment" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/offboarding", label: "Offboarding" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-foreground">
      <aside className="flex w-72 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl text-slate-200">
        <div className="px-6 pb-4 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Dashboards
          </p>
          <nav className="mt-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
