"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import { ArrowLeft, Download, FileText, BarChart3, Users, TrendingUp, Calendar, Award, Target } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface Cycle {
  _id: string;
  name: string;
  cycleType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface ReportData {
  cycleId: string;
  cycleName: string;
  cycleType: string;
  startDate: string;
  endDate: string;
  totalAppraisals: number;
  publishedAppraisals: number;
  averageScore: number;
  scoreDistribution: {
    excellent: number;
    good: number;
    satisfactory: number;
    needsImprovement: number;
  };
  records: Array<{
    employeeId: string;
    score: number;
    rating: string;
    status: string;
  }>;
}

export default function PerformanceReportsPage() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const response = await api.get('/performance/cycles');
      // Filter for completed cycles
      const completedCycles = response.data.filter((cycle: Cycle) =>
        cycle.status === 'CLOSED' || cycle.status === 'ARCHIVED'
      );
      setCycles(completedCycles);
    } catch (error) {
      console.error("Failed to fetch cycles:", error);
    }
  };

  const generateReport = async () => {
    if (!selectedCycle) return;

    setLoading(true);
    try {
      const response = await api.get(`/performance/report/${selectedCycle}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'csv') => {
    if (!reportData) return;

    setGenerating(true);
    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance-report-${reportData.cycleName.replace(/\s+/g, '-')}.json`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        // Generate CSV content
        const csvHeaders = ['Employee ID', 'Score', 'Rating', 'Status'];
        const csvRows = reportData.records.map(record => [
          record.employeeId,
          record.score || 'N/A',
          record.rating || 'N/A',
          record.status
        ]);

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(csvBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance-report-${reportData.cycleName.replace(/\s+/g, '-')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export report:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["HR Employee", "HR Manager"]}>
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
            <h1 className="text-3xl text-white mb-2">Performance Reports</h1>
            <p className="text-slate-400">Generate and export comprehensive appraisal outcome reports</p>
          </div>

          {/* Cycle Selection */}
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-xl text-white mb-4">Select Appraisal Cycle</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm text-slate-300 mb-2">Choose Cycle</label>
                <select
                  value={selectedCycle}
                  onChange={(e) => setSelectedCycle(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
                >
                  <option value="">Select a cycle...</option>
                  {cycles.map((cycle) => (
                    <option key={cycle._id} value={cycle._id}>
                      {cycle.name} ({cycle.cycleType}) - {format(parseISO(cycle.startDate), 'MMM yyyy')} to {format(parseISO(cycle.endDate), 'MMM yyyy')}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateReport}
                disabled={!selectedCycle || loading}
                className="px-6 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-white hover:bg-blue-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {/* Report Display */}
          {reportData && (
            <div className="space-y-6">

              {/* Report Header */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl text-white mb-2">{reportData.cycleName}</h2>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(parseISO(reportData.startDate), 'MMM dd, yyyy')} - {format(parseISO(reportData.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{reportData.cycleType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => exportReport('json')}
                      disabled={generating}
                      className="px-4 py-2 bg-green-600/20 border border-green-500/40 rounded-xl text-white hover:bg-green-600/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      JSON
                    </button>
                    <button
                      onClick={() => exportReport('csv')}
                      disabled={generating}
                      className="px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-white hover:bg-blue-600/40 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <span className="text-sm text-slate-400">Total Appraisals</span>
                    </div>
                    <div className="text-2xl text-white font-bold">{reportData.totalAppraisals}</div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-slate-400">Published</span>
                    </div>
                    <div className="text-2xl text-white font-bold">{reportData.publishedAppraisals}</div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-slate-400">Average Score</span>
                    </div>
                    <div className="text-2xl text-white font-bold">{reportData.averageScore}/100</div>
                  </div>

                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <BarChart3 className="w-5 h-5 text-orange-400" />
                      <span className="text-sm text-slate-400">Completion Rate</span>
                    </div>
                    <div className="text-2xl text-white font-bold">
                      {reportData.totalAppraisals > 0 ? Math.round((reportData.publishedAppraisals / reportData.totalAppraisals) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Score Distribution */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl text-white mb-6">Score Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <div className="text-2xl text-green-400 font-bold mb-1">{reportData.scoreDistribution.excellent}</div>
                    <div className="text-sm text-slate-400">Excellent (90-100)</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="text-2xl text-blue-400 font-bold mb-1">{reportData.scoreDistribution.good}</div>
                    <div className="text-sm text-slate-400">Good (70-89)</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <div className="text-2xl text-yellow-400 font-bold mb-1">{reportData.scoreDistribution.satisfactory}</div>
                    <div className="text-sm text-slate-400">Satisfactory (50-69)</div>
                  </div>
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="text-2xl text-red-400 font-bold mb-1">{reportData.scoreDistribution.needsImprovement}</div>
                    <div className="text-sm text-slate-400">Needs Improvement (&lt;50)</div>
                  </div>
                </div>
              </div>

              {/* Individual Records */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl text-white mb-6">Individual Records</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Employee ID</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Score</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Rating</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.records.map((record, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3 px-4 text-white">{record.employeeId}</td>
                          <td className="py-3 px-4 text-white">{record.score || 'N/A'}</td>
                          <td className="py-3 px-4 text-white">{record.rating || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.status === 'HR_PUBLISHED'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-slate-500/20 text-slate-300'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {cycles.length === 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg text-white mb-2">No Completed Cycles</h3>
              <p className="text-slate-400">Complete appraisal cycles to generate reports.</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}