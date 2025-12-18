"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Calendar, Star, Target, Award } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface AppraisalRecord {
  _id: string;
  totalScore?: number;
  overallRatingLabel?: string;
  status: string;
  hrPublishedAt?: string;
  cycleId: {
    _id: string;
    name: string;
    cycleType: string;
    startDate: string;
    endDate: string;
  };
  templateId: {
    name: string;
    templateType: string;
  };
  managerProfileId: {
    employeeNumber: string;
  };
}

interface TrendData {
  cycleName: string;
  score: number;
  rating: string;
  date: string;
  cycleType: string;
}

export default function PerformanceHistoryPage() {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<AppraisalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'table' | 'trends'>('table');

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user?.id]);

  const fetchHistory = async () => {
    try {
      const response = await api.get(`/performance/employee/${user!.id}/history`);
      setAppraisals(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendData = (): TrendData[] => {
    return appraisals
      .filter(app => app.totalScore && app.status === 'HR_PUBLISHED')
      .map(app => ({
        cycleName: app.cycleId.name,
        score: app.totalScore!,
        rating: app.overallRatingLabel || 'N/A',
        date: app.cycleId.endDate,
        cycleType: app.cycleId.cycleType
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const calculateTrends = () => {
    const data = getTrendData();
    if (data.length < 2) return null;

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const scoreChange = latest.score - previous.score;
    const isImproving = scoreChange > 0;

    return {
      latestScore: latest.score,
      previousScore: previous.score,
      scoreChange: Math.abs(scoreChange),
      isImproving,
      trendDirection: isImproving ? 'up' : scoreChange < 0 ? 'down' : 'stable'
    };
  };

  const trends = calculateTrends();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-slate-400">Loading performance history...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["department employee", "HR Employee", "HR Manager", "department head"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">

        {/* Background Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-slate-800/10 rounded-full blur-3xl animate-pulse delay-2000 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="mb-8">
            <Link href="/performance" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back to Performance
            </Link>
            <h1 className="text-3xl text-white mb-2">Performance History & Trends</h1>
            <p className="text-slate-400">View your complete appraisal history and performance trends across cycles</p>
          </div>

          {/* View Toggle */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
              <button
                onClick={() => setSelectedView('table')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedView === 'table'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Detailed View
              </button>
              <button
                onClick={() => setSelectedView('trends')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedView === 'trends'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Trend Analysis
              </button>
            </div>
          </div>

          {selectedView === 'table' ? (
            /* Detailed Table View */
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Appraisal History</h2>

              {appraisals.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No appraisal records found.</p>
              ) : (
                <div className="space-y-4">
                  {appraisals.map((appraisal) => (
                    <div
                      key={appraisal._id}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg text-white mb-1">{appraisal.cycleId.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(parseISO(appraisal.cycleId.startDate), 'MMM dd, yyyy')} - {' '}
                                {format(parseISO(appraisal.cycleId.endDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>{appraisal.cycleId.cycleType}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500">
                            Manager: {appraisal.managerProfileId.employeeNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          {appraisal.totalScore && (
                            <div className="text-2xl text-white font-medium mb-1">
                              {appraisal.totalScore}/100
                            </div>
                          )}
                          {appraisal.overallRatingLabel && (
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-slate-300">{appraisal.overallRatingLabel}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="text-xs text-slate-500">
                          Published: {appraisal.hrPublishedAt ? format(parseISO(appraisal.hrPublishedAt), 'MMM dd, yyyy') : "N/A"}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          appraisal.status === "HR_PUBLISHED"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                        }`}>
                          {appraisal.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Trend Analysis View */
            <div className="space-y-6">
              {/* Trend Summary Card */}
              {trends && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl text-white mb-4">Performance Trend Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl text-white font-bold mb-1">{trends.latestScore}/100</div>
                      <p className="text-sm text-slate-400">Latest Score</p>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 flex items-center justify-center gap-2 ${
                        trends.isImproving ? 'text-green-400' : trends.scoreChange === 0 ? 'text-slate-400' : 'text-red-400'
                      }`}>
                        {trends.isImproving ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {trends.scoreChange > 0 ? '+' : ''}{trends.scoreChange}
                      </div>
                      <p className="text-sm text-slate-400">Change from Previous</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg text-white font-medium mb-1">
                        {trends.trendDirection === 'up' ? 'Improving' : trends.trendDirection === 'down' ? 'Declining' : 'Stable'}
                      </div>
                      <p className="text-sm text-slate-400">Overall Trend</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trend Chart Visualization */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl text-white mb-6">Score Progression</h2>

                {getTrendData().length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No trend data available. Complete more appraisal cycles to see trends.</p>
                ) : (
                  <div className="space-y-4">
                    {getTrendData().map((data, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{data.cycleName}</h3>
                          <p className="text-sm text-slate-400">{data.cycleType} • {format(parseISO(data.date), 'MMM yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg text-white font-medium">{data.score}/100</div>
                            <div className="text-sm text-slate-400">{data.rating}</div>
                          </div>
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-800 transition-all duration-500"
                              style={{ width: `${data.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}