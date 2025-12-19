"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building2,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { onboardingApi, type Onboarding, type OnboardingTask } from "@/lib/recruitment-api";

export default function OnboardingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "tasks">("overview");
  const [updatingTask, setUpdatingTask] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadOnboarding();
    }
  }, [id]);

  const loadOnboarding = async () => {
    try {
      setLoading(true);
      const data = await onboardingApi.getOnboardingById(id);
      setOnboarding(data);
    } catch (error) {
      console.error("Error loading onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskIndex: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    if (!onboarding) return;
    
    try {
      setUpdatingTask(taskIndex);
      const updateData: any = { status: newStatus };
      
      // If marking as completed, set completedAt
      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      
      await onboardingApi.updateOnboardingTask(onboarding._id, taskIndex.toString(), updateData);
      await loadOnboarding(); // Reload to get updated data
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    } finally {
      setUpdatingTask(null);
    }
  };

  const getTaskStatusBadge = (task: OnboardingTask) => {
    switch (task.status) {
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            In Progress
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-300 border border-slate-500/30">
            Pending
          </span>
        );
    }
  };

  const getProgress = () => {
    if (!onboarding || onboarding.tasks.length === 0) return 0;
    const completed = onboarding.tasks.filter((t: any) => t.status === "completed").length;
    return Math.round((completed / onboarding.tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading onboarding details...</div>
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-white mb-2">Onboarding Not Found</h1>
          <p className="text-slate-400 mb-6">The onboarding record you're looking for doesn't exist.</p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Onboarding
          </Link>
        </div>
      </div>
    );
  }

  const employee = onboarding.employeeId as any;
  const offer = onboarding.offerId as any;
  // Handle department - it could be an object (populated) or an ID string
  const department = employee?.primaryDepartmentId;
  const departmentName = typeof department === 'object' && department !== null 
    ? (department as any)?.name 
    : employee?.department || "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Onboarding
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Onboarding: {employee?.fullName || `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim() || "Unknown Employee"}
                </h1>
                <p className="text-slate-400">
                  Employee Number: {employee?.employeeNumber || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Progress</div>
                  <div className="text-2xl font-bold text-white">{getProgress()}%</div>
                </div>
                <div className="w-32 bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                    style={{ width: `${getProgress()}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "overview"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "tasks"
                  ? "text-white border-b-2 border-blue-500"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tasks ({onboarding.tasks.length})
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Employee Information */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Employee Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Full Name</div>
                    <div className="text-white font-medium">
                      {employee?.fullName || `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim() || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Employee Number</div>
                    <div className="text-white font-medium">{employee?.employeeNumber || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Work Email</div>
                    <div className="text-white font-medium">{employee?.workEmail || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Department</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {departmentName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Offer Information */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Offer Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Role</div>
                    <div className="text-white font-medium">{offer?.role || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Gross Salary</div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {offer?.grossSalary ? `$${offer.grossSalary.toLocaleString()}` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Status */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Onboarding Status
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Status</div>
                    <div>
                      {onboarding.completed ? (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                          Completed
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Started</div>
                    <div className="text-white font-medium">
                      {onboarding.createdAt ? new Date(onboarding.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400 mb-1">Completed</div>
                    <div className="text-white font-medium">
                      {onboarding.completedAt ? new Date(onboarding.completedAt).toLocaleDateString() : "Not completed"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Onboarding Tasks</h2>
              <div className="space-y-4">
                {onboarding.tasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tasks assigned</p>
                  </div>
                ) : (
                  onboarding.tasks.map((task: any, index: number) => (
                    <div
                      key={index}
                      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-medium">{task.name || `Task ${index + 1}`}</h3>
                            {getTaskStatusBadge(task)}
                          </div>
                          {task.department && (
                            <div className="text-sm text-slate-400 mb-2">
                              Department: {task.department}
                            </div>
                          )}
                          {task.deadline && (
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </div>
                          )}
                          {task.completedAt && (
                            <div className="text-sm text-green-400 flex items-center gap-2 mt-2">
                              <CheckCircle className="w-4 h-4" />
                              Completed: {new Date(task.completedAt).toLocaleDateString()}
                            </div>
                          )}
                          {task.notes && (
                            <div className="text-sm text-slate-300 mt-2 p-2 bg-white/5 rounded">
                              {task.notes}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="relative">
                            <select
                              value={task.status || 'pending'}
                              onChange={(e) => handleUpdateTaskStatus(index, e.target.value as 'pending' | 'in_progress' | 'completed')}
                              disabled={updatingTask === index}
                              className="appearance-none px-4 py-2 pr-8 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-slate-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-slate-900 [&>option]:text-white"
                              style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

