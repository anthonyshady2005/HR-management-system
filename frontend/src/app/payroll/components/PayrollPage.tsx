import React from "react";
import { cn } from "@/lib/utils";

interface PayrollPageProps {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PayrollPage({
  title,
  description,
  children,
  actions,
  className,
}: PayrollPageProps) {
  return (
    <div className={cn("p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200 tracking-tight">{title}</h1>
          <p className="text-slate-400 mt-1">{description}</p>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
