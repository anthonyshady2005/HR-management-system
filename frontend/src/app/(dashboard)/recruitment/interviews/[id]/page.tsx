"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Users,
  Edit,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { recruitmentApi, type Interview } from "@/lib/recruitment-api";

export default function InterviewDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editData, setEditData] = useState({
    scheduledDate: "",
    method: "",
    videoLink: "",
  });
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    if (id) {
      loadInterview();
    }
  }, [id]);

  const loadInterview = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getInterviewById(id);
      setInterview(data);
      setEditData({
        scheduledDate: data.scheduledDate
          ? new Date(data.scheduledDate).toISOString().slice(0, 16)
          : "",
        method: data.method || "",
        videoLink: data.videoLink || "",
      });
      setNewStatus(data.status);
    } catch (error) {
      console.error("Error loading interview:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await recruitmentApi.updateInterview(id, editData);
      await loadInterview();
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating interview:", error);
      alert("Failed to update interview");
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await recruitmentApi.updateInterviewStatus(id, newStatus);
      await loadInterview();
      setShowStatusModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading interview...</div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Interview not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/recruitment/interviews"
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">Interview #{id.slice(-8)}</h1>
                    <p className="text-xs text-slate-400">View interview details</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg text-white mb-4">Interview Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm border inline-block ${getStatusColor(
                      interview.status
                    )}`}
                  >
                    {interview.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Stage</p>
                  <p className="text-white capitalize">{interview.stage || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Application ID</p>
                  <Link
                    href={`/recruitment/applications/${
                      typeof interview.applicationId === 'object' && interview.applicationId?._id
                        ? interview.applicationId._id
                        : interview.applicationId
                    }`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {typeof interview.applicationId === 'object' && interview.applicationId?._id
                      ? interview.applicationId._id.toString()
                      : interview.applicationId?.toString() || "N/A"}
                  </Link>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg text-white mb-4">Schedule Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Scheduled Date</p>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4" />
                    {interview.scheduledDate
                      ? new Date(interview.scheduledDate).toLocaleString()
                      : "Not scheduled"}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Method</p>
                  <div className="flex items-center gap-2 text-white capitalize">
                    {interview.method === "video" ? (
                      <Video className="w-4 h-4" />
                    ) : interview.method === "phone" ? (
                      <Phone className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    {interview.method || "N/A"}
                  </div>
                </div>
                {interview.videoLink && (
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Video Link</p>
                    <a
                      href={interview.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {interview.videoLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {interview.panel && interview.panel.length > 0 && (
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-lg text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Panel Members
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {interview.panel.map((member: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <p className="text-white text-sm">
                      {typeof member === "string" ? member.slice(-8) : member.toString().slice(-8)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-xl mb-4">Edit Interview</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editData.scheduledDate}
                  onChange={(e) =>
                    setEditData({ ...editData, scheduledDate: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Method</label>
                <select
                  value={editData.method}
                  onChange={(e) =>
                    setEditData({ ...editData, method: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                >
                  <option value="">Select method</option>
                  <option value="in-person">In-Person</option>
                  <option value="video">Video</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              {editData.method === "video" && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Video Link
                  </label>
                  <input
                    type="text"
                    value={editData.videoLink}
                    onChange={(e) =>
                      setEditData({ ...editData, videoLink: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all"
              >
                Update
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-white text-xl mb-4">Update Interview Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50 mb-4"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all"
              >
                Update
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
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
