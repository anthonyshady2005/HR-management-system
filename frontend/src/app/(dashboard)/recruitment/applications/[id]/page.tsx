"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Clock,
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Edit,
  Plus,
} from "lucide-react";
import {
  recruitmentApi,
  type Application,
} from "@/lib/recruitment-api";

export default function ApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "documents">("overview");
  const [showUpdateStageModal, setShowUpdateStageModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [showAssignHrModal, setShowAssignHrModal] = useState(false);
  const [newStage, setNewStage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [hrId, setHrId] = useState("");
  const [hrManagers, setHrManagers] = useState<Array<{
    _id: string;
    id: string;
    employeeNumber: string;
    name: string;
    firstName: string;
    lastName: string;
    fullName: string;
    workEmail?: string;
  }>>([]);
  const [loadingHrManagers, setLoadingHrManagers] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication();
      loadHistory();
    }
  }, [id]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getApplicationById(id);
      setApplication(data);
      setNewStage(data.currentStage);
      setNewStatus(data.status);
    } catch (error) {
      console.error("Error loading application:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await recruitmentApi.getApplicationHistory(id);
      setHistory(data || []);
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const handleUpdateStage = async () => {
    try {
      await recruitmentApi.updateApplicationStage(id, newStage);
      await loadApplication();
      await loadHistory();
      setShowUpdateStageModal(false);
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("Failed to update stage");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await recruitmentApi.updateApplicationStatus(id, newStatus);
      await loadApplication();
      await loadHistory();
      setShowUpdateStatusModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const loadHrManagers = async () => {
    try {
      setLoadingHrManagers(true);
      const data = await recruitmentApi.getHrManagers();
      setHrManagers(data || []);
    } catch (error) {
      console.error("Error loading HR Managers:", error);
    } finally {
      setLoadingHrManagers(false);
    }
  };

  const handleAssignHr = async () => {
    if (!hrId) {
      alert("Please select an HR representative");
      return;
    }
    try {
      await recruitmentApi.assignHrToApplication(id, hrId);
      await loadApplication();
      setShowAssignHrModal(false);
      setHrId("");
    } catch (error) {
      console.error("Error assigning HR:", error);
      alert("Failed to assign HR");
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage?.toLowerCase()) {
      case "screening":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "department_interview":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "hr_interview":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "offer":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "in_process":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "offer":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "hired":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading application...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Application not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/recruitment/applications"
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Application #{id.slice(-8)}</h1>
                    <p className="text-xs text-slate-400">View and manage application</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/recruitment/interviews/new?applicationId=${id}`}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Interview
                </Link>
                <Link
                  href={`/recruitment/offers/new?applicationId=${id}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Offer
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-2">Current Stage</p>
              <span
                className={`px-4 py-2 rounded-lg text-sm border inline-block ${getStageColor(
                  application.currentStage
                )}`}
              >
                {application.currentStage || "N/A"}
              </span>
              <button
                onClick={() => setShowUpdateStageModal(true)}
                className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Update Stage
              </button>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-2">Status</p>
              <span
                className={`px-4 py-2 rounded-lg text-sm border inline-block ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status || "N/A"}
              </span>
              <button
                onClick={() => setShowUpdateStatusModal(true)}
                className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Edit className="w-3 h-3" />
                Update Status
              </button>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-slate-400 mb-2">Assigned HR</p>
              <p className="text-white mb-4">
                {typeof application.assignedHr === 'object' && application.assignedHr !== null
                  ? (application.assignedHr as any).fullName || ((application.assignedHr as any).firstName && (application.assignedHr as any).lastName
                    ? `${(application.assignedHr as any).firstName} ${(application.assignedHr as any).lastName}`
                    : (application.assignedHr as any)._id?.toString().slice(-8) || "Unassigned")
                  : application.assignedHr
                    ? application.assignedHr.toString().slice(-8)
                    : "Unassigned"}
              </p>
              <button
                onClick={() => setShowAssignHrModal(true)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <User className="w-3 h-3" />
                {application.assignedHr ? "Reassign HR" : "Assign HR"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {(["overview", "timeline", "documents"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl transition-all capitalize ${
                  activeTab === tab
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Application ID</p>
                  <p className="text-white">{application._id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Candidate</p>
                  <p className="text-white">
                    {typeof application.candidateId === 'object' && application.candidateId !== null
                      ? (application.candidateId as any).firstName && (application.candidateId as any).lastName
                        ? `${(application.candidateId as any).firstName} ${(application.candidateId as any).lastName}`
                        : (application.candidateId as any)._id?.toString() || "N/A"
                      : application.candidateId?.toString() || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Job Requisition</p>
                  <Link
                    href={`/recruitment/job-requisitions/${
                      typeof application.requisitionId === 'object' && application.requisitionId !== null
                        ? (application.requisitionId as any)._id?.toString() || (application.requisitionId as any).toString()
                        : application.requisitionId?.toString() || ""
                    }`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {typeof application.requisitionId === 'object' && application.requisitionId !== null
                      ? (application.requisitionId as any).title || (application.requisitionId as any)._id?.toString() || "N/A"
                      : application.requisitionId?.toString() || "N/A"}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Created At</p>
                  <p className="text-white">
                    {application.createdAt
                      ? new Date(application.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Last Updated</p>
                  <p className="text-white">
                    {application.updatedAt
                      ? new Date(application.updatedAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Application History</h2>
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">
                          Stage: {entry.oldStage || "N/A"} → {entry.newStage || "N/A"}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">
                          Status: {entry.oldStatus || "N/A"} → {entry.newStatus || "N/A"}
                        </p>
                        <p className="text-slate-500 text-xs mt-2">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No history available
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Documents</h2>
              <p className="text-slate-400 text-center py-8">
                Document management coming soon
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Update Stage Modal */}
      {showUpdateStageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-xl mb-4">Update Application Stage</h3>
            <select
              value={newStage}
              onChange={(e) => setNewStage(e.target.value)}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50 mb-4"
            >
              <option value="screening">Screening</option>
              <option value="department_interview">Department Interview</option>
              <option value="hr_interview">HR Interview</option>
              <option value="offer">Offer</option>
            </select>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateStage}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all"
              >
                Update
              </button>
              <button
                onClick={() => setShowUpdateStageModal(false)}
                className="flex-1 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-xl mb-4">Update Application Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50 mb-4"
            >
              <option value="submitted">Submitted</option>
              <option value="in_process">In Process</option>
              <option value="offer">Offer</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all"
              >
                Update
              </button>
              <button
                onClick={() => setShowUpdateStatusModal(false)}
                className="flex-1 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign HR Modal */}
      {showAssignHrModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-xl mb-4">Assign HR Representative</h3>
            <select
              value={hrId}
              onChange={(e) => setHrId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50 [&>option]:bg-slate-900 [&>option]:text-white mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
              }}
              disabled={loadingHrManagers}
              onFocus={() => {
                if (hrManagers.length === 0) {
                  loadHrManagers();
                }
              }}
            >
              <option value="" className="bg-slate-900 text-white">
                {loadingHrManagers
                  ? "Loading HR Managers..."
                  : "Select an HR representative"}
              </option>
              {hrManagers.map((manager) => (
                <option key={manager._id} value={manager._id} className="bg-slate-900 text-white">
                  {manager.fullName} ({manager.employeeNumber})
                  {manager.workEmail ? ` - ${manager.workEmail}` : ""}
                </option>
              ))}
            </select>
            {hrManagers.length === 0 && !loadingHrManagers && (
              <p className="text-xs text-slate-400 mb-4">
                Click on the dropdown to load HR managers
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAssignHr}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all"
                disabled={!hrId || loadingHrManagers}
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setShowAssignHrModal(false);
                  setHrId("");
                }}
                className="flex-1 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

