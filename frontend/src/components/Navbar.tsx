"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Users } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, roles, currentRole, refreshRoles, setCurrentRoleSafe, status, clearAuth } = useAuth();
  const router = useRouter();

  if (status !== "authenticated" || !user) {
    return null;
  }

  return (
    <header className="w-full backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-inner shadow-black/40">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-slate-300">HR Hub</p>
            <p className="text-xs text-slate-500">Logged in as {user.fullName || user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentRole ? <Badge variant="secondary">Role: {currentRole}</Badge> : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30"
              >
                Switch role
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-slate-900 border border-white/10 text-white"
            >
              <DropdownMenuLabel>Your roles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roles.length === 0 && <DropdownMenuItem className="text-slate-400">No roles available</DropdownMenuItem>}
              {roles.map((role) => (
                <DropdownMenuItem
                  key={role}
                  className="cursor-pointer focus:bg-white/10"
                  onSelect={(e) => {
                    e.preventDefault();
                    setCurrentRoleSafe(role);
                  }}
                >
                  <span className="flex-1">{role}</span>
                  {currentRole === role ? (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  ) : null}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-300 cursor-pointer focus:bg-white/10"
                onSelect={(e) => {
                  e.preventDefault();
                  clearAuth();
                  router.replace("/auth/login");
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/dashboard"
            className="px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
