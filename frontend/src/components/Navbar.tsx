
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Users, UserCircle, Mail, Building2, Briefcase, Home } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const { user, roles, currentRole, refreshRoles, setCurrentRoleSafe, status, clearAuth } = useAuth();
  const router = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (status !== "authenticated" || !user) {
    return null;
  }

  const uniqueRoles = Array.from(new Set(roles));

  return (
    <header className="w-full sticky top-0 z-40 pt-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-lg shadow-black/20">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-inner shadow-black/40">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-300">Edara HRMS</p>
              <p className="text-xs text-slate-500">Logged in as {user.fullName || user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm rounded-lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-sm rounded-lg"
                >
                  Switch role
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 backdrop-blur-xl bg-slate-900/95 border border-white/10 text-white rounded-xl shadow-lg shadow-black/20"
              >
                <DropdownMenuLabel className="text-slate-300">Your roles</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {roles.length === 0 && <DropdownMenuItem className="text-slate-400">No roles available</DropdownMenuItem>}
                {uniqueRoles.map((role, idx) => (
                  <DropdownMenuItem
                    key={`${role}-${idx}`}
                    className="cursor-pointer focus:bg-white/10 hover:bg-white/5 rounded-lg mx-1"
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
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/20 hover:border-white/40 hover:bg-slate-800 transition-all duration-200 flex items-center justify-center shadow-lg shadow-black/20 backdrop-blur-sm">
                  <UserCircle className="w-6 h-6 text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 backdrop-blur-xl bg-slate-900/95 border border-white/10 text-white rounded-xl shadow-lg shadow-black/20"
              >
                <div className="px-3 py-3 border-b border-white/10">
                  <DropdownMenuLabel className="text-slate-300 text-xs font-normal mb-1">Account</DropdownMenuLabel>
                  <p className="text-sm text-white font-medium">{user.fullName || "User"}</p>
                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                  {currentRole && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {currentRole}
                      </Badge>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="cursor-pointer focus:bg-white/10 hover:bg-white/5 rounded-lg mx-1"
                  onSelect={(e) => {
                    e.preventDefault();
                    setIsProfileModalOpen(true);
                  }}
                >
                  <UserCircle className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="text-red-300 cursor-pointer focus:bg-red-500/10 hover:bg-red-500/5 rounded-lg mx-1"
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
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="backdrop-blur-xl bg-slate-900/95 border border-white/10 text-white rounded-2xl shadow-lg shadow-black/20 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <UserCircle className="w-6 h-6" />
              Account Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              View your account information and profile details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Profile Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-white/10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-2 border-white/20">
                <UserCircle className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{user.fullName || "User"}</h3>
                <p className="text-sm text-slate-400 mt-1">{user.email}</p>
                {currentRole && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {currentRole}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Personal Information</h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-sm text-white">{user.email || "—"}</p>
                    </div>
                  </div>

                  {user.id && (
                    <div className="flex items-start gap-3">
                      <UserCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400">User ID</p>
                        <p className="text-sm text-white font-mono">{String(user.id).slice(0, 24)}...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Roles & Permissions</h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Current Role</p>
                      <p className="text-sm text-white">{currentRole || "No role assigned"}</p>
                    </div>
                  </div>

                  {uniqueRoles.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 mb-2">All Roles</p>
                        <div className="flex flex-wrap gap-2">
                          {uniqueRoles.map((role, idx) => (
                            <Badge
                              key={`${role}-${idx}`}
                              variant={currentRole === role ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex justify-end">
              <Button
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setIsProfileModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export default Navbar;
