import { DashboardProps } from "./types";
import { UserCheck, MessageSquare, Trophy, Calendar, Star, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ProtectedRoute from "@/components/protected-route";
import Link from "next/link";

type AppraisalRecord = {
  _id: string;
  assignmentId: {
    _id: string;
    employeeProfileId: {
      firstName: string;
      lastName: string;
      employeeNumber: string;
    };
  };
  totalScore?: number;
  overallRatingLabel?: string;
  improvementAreas?: string;
  strengths?: string;
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
    ratingScale?: {
      type: string;
    };
  };
  managerProfileId: {
    employeeNumber: string;
  };
};

export function EmployeeDashboard({ currentRole }: DashboardProps) {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState<AppraisalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppraisal, setSelectedAppraisal] = useState<AppraisalRecord | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchAppraisals();
    }
  }, [user?.id]);

  const fetchAppraisals = async () => {
    try {
      const response = await api.get(`/performance/employee/${user!.id}/history`);
      setAppraisals(response.data);
    } catch (error) {
      console.error("Failed to fetch appraisals:", error);
    } finally {
      setLoading(false);
    }
  };

  const isWithinDisputeWindow = (publishedAt?: string) => {
    if (!publishedAt) return false;
    const publishedDate = new Date(publishedAt);
    const now = new Date();
    const daysSincePublished = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSincePublished <= 7;
  };

  const handleRaiseDispute = (appraisal: AppraisalRecord) => {
    setSelectedAppraisal(appraisal);
  };

  const submitDispute = async () => {
    if (!selectedAppraisal || !disputeReason.trim()) return;

    setSubmitting(true);
    try {
      await api.post("/performance/dispute", {
        appraisalId: selectedAppraisal._id,
        assignmentId: selectedAppraisal.assignmentId._id,
        cycleId: selectedAppraisal.cycleId._id,
        raisedByEmployeeId: user!.id,
        reason: disputeReason,
        status: "OPEN",
      });
      alert("Dispute submitted successfully!");
      setSelectedAppraisal(null);
      setDisputeReason("");
      fetchAppraisals(); // Refresh to update status if needed
    } catch (error) {
      console.error("Failed to submit dispute:", error);
      alert("Failed to submit dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Loading your appraisals...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["department employee"]}>
      <div className="space-y-6">
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl text-white">My Performance History</h3>
          </div>
          <Link
            href="/performance/history"
            className="px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-300 hover:bg-blue-600/40 transition-all duration-300 text-sm"
          >
            View Trends & Analysis
          </Link>
        </div>

        {appraisals.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No appraisal records found yet. Your performance reviews will appear here once published.
          </p>
        ) : (
          <div className="space-y-4">
            {appraisals.map((appraisal) => (
              <div
                key={appraisal._id}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg text-white mb-1">{appraisal.cycleId.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(appraisal.cycleId.startDate).toLocaleDateString()} -{" "}
                          {new Date(appraisal.cycleId.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        <span>Manager: {appraisal.managerProfileId.employeeNumber}</span>
                      </div>
                    </div>
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

                {appraisal.strengths && (
                  <div className="mb-4">
                    <h5 className="text-sm text-slate-300 mb-2">Strengths:</h5>
                    <p className="text-slate-400 text-sm">{appraisal.strengths}</p>
                  </div>
                )}

                {appraisal.improvementAreas && (
                  <div className="mb-4">
                    <h5 className="text-sm text-slate-300 mb-2">Development Areas:</h5>
                    <p className="text-slate-400 text-sm">{appraisal.improvementAreas}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-xs text-slate-500">
                    Published: {appraisal.hrPublishedAt ? new Date(appraisal.hrPublishedAt).toLocaleDateString() : "N/A"}
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

      {/* Dispute Form Modal */}
      {selectedAppraisal && (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg text-white">Raise Dispute</h3>
          </div>
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">
              Appraisal: <span className="text-white">{selectedAppraisal.cycleId.name}</span>
            </p>
            <p className="text-sm text-slate-400">
              Rating: <span className="text-white">{selectedAppraisal.overallRatingLabel}</span>
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-2">Reason for Dispute</label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500/50"
              rows={4}
              placeholder="Please explain your concern about this appraisal..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={submitDispute}
              disabled={submitting || !disputeReason.trim()}
              className="px-4 py-2 bg-rose-600/20 border border-rose-500/40 rounded-xl text-white hover:bg-rose-600/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Dispute"}
            </button>
            <button
              onClick={() => setSelectedAppraisal(null)}
              className="px-4 py-2 bg-slate-600/20 border border-slate-500/40 rounded-xl text-white hover:bg-slate-600/40 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Raise Objection Card */}
      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg text-white">Raise Objection</h3>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Submit feedback or disputes about your published appraisals within 7 days
        </p>
        {appraisals.filter(a => a.status === "HR_PUBLISHED" && isWithinDisputeWindow(a.hrPublishedAt)).length > 0 && (
          <div className="space-y-2">
            {appraisals
              .filter(a => a.status === "HR_PUBLISHED" && isWithinDisputeWindow(a.hrPublishedAt))
              .map((appraisal) => (
                <button
                  key={appraisal._id}
                  onClick={() => handleRaiseDispute(appraisal)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600/20 transition-all duration-300"
                >
                  <div className="text-sm text-white">{appraisal.cycleId.name}</div>
                  <div className="text-xs text-slate-400">
                    {appraisal.overallRatingLabel} - Click to raise dispute
                  </div>
                </button>
              ))}
          </div>
        )}
        {appraisals.filter(a => a.status === "HR_PUBLISHED" && isWithinDisputeWindow(a.hrPublishedAt)).length === 0 && (
          <p className="text-xs text-slate-500">No appraisals available for dispute (must be published within 7 days)</p>
        )}
      </div>
      </div>
    </ProtectedRoute>
  );
}
