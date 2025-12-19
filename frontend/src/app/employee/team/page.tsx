/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import ProtectedRoute from "@/components/protected-route";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Briefcase, AlertCircle, Calendar, Clock, FileText, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { ProfileCard } from "../components/ProfileCard";
import { AddEmployeeToTeamDialog } from "../components/AddEmployeeToTeamDialog";
import { getMyTeam, getTeamSummary } from "../api";
import type { TeamMember, TeamSummary } from "../types";

const ALLOWED_ROLES = ["department head"];

export default function TeamPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [summary, setSummary] = useState<TeamSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      loadTeamData();
    }
  }, [status]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      const [teamData, summaryData] = await Promise.all([
        getMyTeam(),
        getTeamSummary(),
      ]);
      setTeam(teamData);
      setSummary(summaryData);
    } catch (error: any) {
      console.error("Failed to load team data:", error);
      toast.error(
        error.response?.data?.message || "Failed to load team data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (employeeId: string) => {
    router.push(`/employee/${employeeId}`);
  };

  return (
    <ProtectedRoute allowedRoles={ALLOWED_ROLES}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">My Team</h1>
              <p className="text-slate-400 text-sm">
                Manage and view your direct reports
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Showing employees who directly report to you
              </p>
            </div>
          </div>
          <AddEmployeeToTeamDialog onSuccess={loadTeamData} />
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/70 transition-colors text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Total Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">{summary.totalCount}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.department}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/70 transition-colors text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Active Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">
                  {summary.byStatus.find((s) => s.status === "ACTIVE")?.count || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Currently working</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/70 transition-colors text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">
                  Unique Positions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">
                  {summary.byPosition.length}
                </div>
                <p className="text-xs text-slate-500 mt-1">Different roles</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600/70 transition-colors text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300">
                  On Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-100">
                  {summary.byStatus.find((s) => s.status === "ON_LEAVE")?.count || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1">Temporarily away</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Cards */}
        {summary?.analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  New Hires (1 Year)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{summary.analytics.newHires}</div>
                <p className="text-xs text-blue-400/70 mt-1">Joined in past 12 months</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Recent Hires (6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{summary.analytics.recentHires}</div>
                <p className="text-xs text-green-400/70 mt-1">Joined in past 6 months</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Average Tenure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{summary.analytics.avgTenureMonths}</div>
                <p className="text-xs text-purple-400/70 mt-1">Months with the company</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-300 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Team Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {summary.analytics.recentHires > 0 ? `${Math.round((summary.analytics.recentHires / summary.totalCount) * 100)}%` : '0%'}
                </div>
                <p className="text-xs text-orange-400/70 mt-1">Growth rate (6 months)</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Breakdown Charts */}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* By Position */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Team by Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.byPosition.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.position}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(item.count / summary.totalCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Status */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Team by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {summary.byStatus.map((item, index) => {
                    const statusColors: Record<string, string> = {
                      ACTIVE: "bg-green-500",
                      INACTIVE: "bg-gray-500",
                      ON_LEAVE: "bg-blue-500",
                      SUSPENDED: "bg-yellow-500",
                      PROBATION: "bg-purple-500",
                      RETIRED: "bg-slate-500",
                      TERMINATED: "bg-red-500",
                    };
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.status.replace("_", " ")}
                          </span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`${
                              statusColors[item.status] || "bg-gray-500"
                            } h-2 rounded-full transition-all`}
                            style={{
                              width: `${
                                (item.count / summary.totalCount) * 100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Reports */}
        {summary?.analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contract Type Distribution */}
            {summary.analytics.byContractType.length > 0 && (
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Contract Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.analytics.byContractType.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.type.replace(/_/g, ' ').replace(/FULL TIME|PART TIME/g, match => match.charAt(0) + match.slice(1).toLowerCase())}
                          </span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(item.count / summary.totalCount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work Type Distribution */}
            {summary.analytics.byWorkType.length > 0 && (
              <Card className="bg-white/5 border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {summary.analytics.byWorkType.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">
                            {item.type.replace(/_/g, ' ').replace(/FULL TIME|PART TIME/g, match => match.charAt(0) + match.slice(1).toLowerCase())}
                          </span>
                          <span className="font-medium">{item.count}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className="bg-teal-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(item.count / summary.totalCount) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Hire Year Trend */}
        {summary?.analytics?.byHireYear && summary.analytics.byHireYear.length > 0 && (
          <Card className="bg-white/5 border-white/10 text-white mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Hiring Trend by Year
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.analytics.byHireYear.map((item, index) => {
                  const maxCount = Math.max(...summary.analytics!.byHireYear.map(h => h.count));
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-300 font-medium">{item.year}</span>
                        <span className="font-bold text-white">{item.count} {item.count === 1 ? 'hire' : 'hires'}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${(item.count / maxCount) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Card className="bg-slate-800/50 border-slate-700/50 text-white mb-6">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-300 mb-1">
                  Privacy-Protected View
                </p>
                <p className="text-sm text-slate-400">
                  As a manager, you can view basic work information about your
                  team members. Sensitive personal data (national ID, salary,
                  personal contact details, date of birth, marital status) are
                  not displayed in compliance with BR 18b and BR 41b.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid */}
        {team.length === 0 ? (
          <Card className="bg-white/5 border-white/10 text-white">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No team members found</p>
              <p className="text-sm text-slate-500 mt-2">
                You currently have no direct reports assigned.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">
              Team Members ({team.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member) => (
                <ProfileCard
                  key={member._id}
                  employee={member as any}
                  onViewDetails={() => handleViewDetails(member._id)}
                  showActions={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
