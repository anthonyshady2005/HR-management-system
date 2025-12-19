"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Edit,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  Users,
  Trash2,
} from "lucide-react";
import { recruitmentApi, type JobRequisition } from "@/lib/recruitment-api";

export default function JobRequisitionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [requisition, setRequisition] = useState<JobRequisition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    openings: 1,
    location: "",
    postingDate: "",
    expiryDate: "",
  });

  useEffect(() => {
    if (id) {
      loadRequisition();
    }
  }, [id]);

  const loadRequisition = async () => {
    try {
      setLoading(true);
      const data = await recruitmentApi.getJobRequisitionById(id);
      setRequisition(data);
      setEditData({
        title: data.title || "",
        openings: data.openings || 1,
        location: data.location || "",
        postingDate: data.postingDate
          ? new Date(data.postingDate).toISOString().slice(0, 10)
          : "",
        expiryDate: data.expiryDate
          ? new Date(data.expiryDate).toISOString().slice(0, 10)
          : "",
      });
    } catch (error) {
      console.error("Error loading requisition:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await recruitmentApi.updateJobRequisition(id, editData);
      await loadRequisition();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating requisition:", error);
      alert("Failed to update requisition");
    }
  };

  const handlePublish = async () => {
    try {
      await recruitmentApi.publishJobRequisition(id);
      await loadRequisition();
    } catch (error) {
      console.error("Error publishing requisition:", error);
      alert("Failed to publish requisition");
    }
  };

  const handleClose = async () => {
    try {
      await recruitmentApi.closeJobRequisition(id);
      await loadRequisition();
    } catch (error) {
      console.error("Error closing requisition:", error);
      alert("Failed to close requisition");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job requisition? This action cannot be undone.")) {
      return;
    }

    try {
      await recruitmentApi.deleteJobRequisition(id);
      router.push("/recruitment/job-requisitions");
    } catch (error: any) {
      console.error("Error deleting requisition:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete requisition";
      alert(errorMessage);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "closed":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case "draft":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading requisition...</div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Requisition not found</div>
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
                  href="/recruitment/job-requisitions"
                  className="w-10 h-10 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-white">
                      {requisition.title || requisition.requisitionId || "Job Requisition"}
                    </h1>
                    <p className="text-xs text-slate-400">View and manage requisition</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isEditing && (
                  <>
                    {requisition.publishStatus === "draft" && (
                      <button
                        onClick={handlePublish}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Publish
                      </button>
                    )}
                    {requisition.publishStatus === "published" && (
                      <button
                        onClick={handleClose}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        Close
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white">
                {isEditing ? "Edit Requisition" : "Requisition Details"}
              </h2>
              <span
                className={`px-4 py-2 rounded-lg text-sm border ${getStatusColor(
                  requisition.publishStatus || "draft"
                )}`}
              >
                {requisition.publishStatus || "Draft"}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      Number of Openings
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editData.openings}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          openings: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) =>
                        setEditData({ ...editData, location: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      Posting Date
                    </label>
                    <input
                      type="date"
                      value={editData.postingDate}
                      onChange={(e) =>
                        setEditData({ ...editData, postingDate: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={editData.expiryDate}
                      onChange={(e) =>
                        setEditData({ ...editData, expiryDate: e.target.value })
                      }
                      min={editData.postingDate || undefined}
                      className="w-full px-4 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-slate-500/50"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={handleUpdate}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      loadRequisition();
                    }}
                    className="px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Requisition ID</p>
                  <p className="text-white">
                    {requisition.requisitionId || requisition._id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Title</p>
                  <p className="text-white">{requisition.title || "Untitled"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Openings
                  </p>
                  <p className="text-white">{requisition.openings || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </p>
                  <p className="text-white">{requisition.location || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Posting Date
                  </p>
                  <p className="text-white">
                    {requisition.postingDate
                      ? new Date(requisition.postingDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Expiry Date</p>
                  <p className="text-white">
                    {requisition.expiryDate
                      ? new Date(requisition.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Department</p>
                  <p className="text-white">{requisition.department || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg text-white mb-4">Related Applications</h3>
            <Link
              href={`/recruitment/applications?requisitionId=${requisition._id}`}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View applications for this requisition →
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

