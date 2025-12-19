/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Shield, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import ProtectedRoute from "@/components/protected-route";

type RatingEntry = {
  key: string;
  title: string;
  ratingValue: number;
  ratingLabel?: string;
};

type Dispute = {
  _id: string;
  appraisalId: {
    totalScore?: number;
    overallRatingLabel?: string;
    ratings?: RatingEntry[];
    originalTotalScore?: number;
    originalRatingLabel?: string;
  };
  assignmentId: {
    employeeProfileId: {
      firstName: string;
      lastName: string;
      employeeNumber: string;
    };
  };
  cycleId: {
    name: string;
  };
  raisedByEmployeeId: {
    employeeNumber: string;
  };
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionSummary?: string;
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState("");
  const [resolving, setResolving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [adjustedRatings, setAdjustedRatings] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    if (selectedDispute?.appraisalId.ratings) {
      const initialRatings: Record<string, number> = {};
      selectedDispute.appraisalId.ratings.forEach((r) => {
        initialRatings[r.key] = r.ratingValue;
      });
      setAdjustedRatings(initialRatings);
    } else {
      setAdjustedRatings({});
    }
  }, [selectedDispute]);

  const fetchDisputes = async () => {
    try {
      const response = await api.get("/performance/disputes");
      setDisputes(response.data);
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (
    disputeId: string,
    newStatus: string,
    ratings?: Record<string, number>
  ) => {
    if (newStatus === "RESOLVED_ADJUSTED" && (!resolution.trim() || !ratings)) return;

    setResolving(true);
    try {
      await api.put(`/performance/dispute/${disputeId}`, {
        status: newStatus,
        resolutionSummary: resolution.trim() || undefined,
        resolvedAt: new Date(),
        ...(ratings ? { adjustedRatings: ratings } : {}),
      });

      setSuccessMessage(
        `Dispute ${newStatus === "RESOLVED_UPHELD" ? "upheld" : "adjusted"
        } successfully!`
      );
      setShowSuccess(true);
      setSelectedDispute(null);
      setResolution("");
      setAdjustedRatings({});
      fetchDisputes();

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      alert("Failed to resolve dispute. Please try again.");
    } finally {
      setResolving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Clock className="w-5 h-5 text-amber-400" />;
      case "RESOLVED_UPHELD":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "RESOLVED_ADJUSTED":
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case "CLOSED":
        return <XCircle className="w-5 h-5 text-slate-400" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs border";
    switch (status) {
      case "OPEN":
        return `${baseClasses} bg-amber-500/20 text-amber-300 border-amber-500/30`;
      case "RESOLVED_UPHELD":
        return `${baseClasses} bg-green-500/20 text-green-300 border-green-500/30`;
      case "RESOLVED_ADJUSTED":
        return `${baseClasses} bg-blue-500/20 text-blue-300 border-blue-500/30`;
      case "CLOSED":
        return `${baseClasses} bg-slate-500/20 text-slate-300 border-slate-500/30`;
      default:
        return `${baseClasses} bg-slate-500/20 text-slate-300 border-slate-500/30`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-slate-400">Loading disputes...</div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["HR Manager"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-slate-700/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          {showSuccess && (
            <div className="backdrop-blur-xl bg-green-500/20 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-300" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium">Success!</h4>
                <p className="text-sm text-green-300">{successMessage}</p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 shadow-lg shadow-amber-900/20">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Dispute Resolution</h1>
                <p className="text-slate-400">Review and resolve employee appraisal disputes</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {disputes.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <Shield className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl text-white mb-2">No Disputes Found</h3>
                  <p className="text-slate-400">All appraisal disputes will appear here.</p>
                </div>
              ) : (
                disputes.map((dispute) => (
                  <div
                    key={dispute._id}
                    className={`backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 cursor-pointer ${selectedDispute?._id === dispute._id
                      ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    onClick={() => setSelectedDispute(dispute)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg text-white font-medium">
                              {dispute.assignmentId.employeeProfileId.firstName}{" "}
                              {dispute.assignmentId.employeeProfileId.lastName}
                            </h3>
                            <p className="text-xs text-slate-400">
                              Employee #{dispute.assignmentId.employeeProfileId.employeeNumber}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">
                          <span className="text-slate-300 font-medium">{dispute.cycleId.name}</span>
                        </p>

                        <div className="flex items-center gap-4 mb-3">
                          {dispute.appraisalId.originalTotalScore !== undefined && (
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-white">
                                {dispute.appraisalId.originalTotalScore}
                              </div>
                              <span className="text-sm text-slate-400">/100</span>
                              <span className="text-xs text-slate-300 ml-2">Original</span>
                            </div>
                          )}

                          {dispute.appraisalId.totalScore !== undefined && (
                            <div className="flex items-center gap-2">
                              <div className="text-2xl font-bold text-white">
                                {dispute.appraisalId.totalScore}
                              </div>
                              <span className="text-sm text-slate-400">/100</span>
                              <span className="text-xs text-slate-300 ml-2">Current</span>
                            </div>
                          )}

                          {dispute.appraisalId.overallRatingLabel && (
                            <div className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {dispute.appraisalId.overallRatingLabel}
                            </div>
                          )}
                        </div>

                        {dispute.appraisalId.ratings && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {dispute.appraisalId.ratings.map((rating) => (
                              <div
                                key={rating.key}
                                className="px-2 py-1 bg-white/10 text-white text-xs rounded-full"
                              >
                                {rating.title}: {rating.ratingValue}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="mb-2">{getStatusIcon(dispute.status)}</div>
                        <div className={getStatusBadge(dispute.status)}>
                          {dispute.status.replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>

                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 mb-3">
                      <p className="text-xs text-slate-400 mb-1">Employee's Concern:</p>
                      <p className="text-sm text-slate-200 line-clamp-2">{dispute.reason}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <p className="text-xs text-slate-500">
                        Raised on {new Date(dispute.createdAt).toLocaleDateString()}
                      </p>
                      {selectedDispute?._id === dispute._id && (
                        <span className="text-xs text-indigo-300 font-medium">Selected</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Resolution Panel */}
            <div className="space-y-4">
              {selectedDispute ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl text-white mb-4">Resolve Dispute</h3>
                  <div className="mb-4">
                    <h4 className="text-sm text-slate-300 mb-2">Dispute Details</h4>
                    <p className="text-sm text-slate-400 mb-2">
                      <strong>Employee:</strong>{" "}
                      {selectedDispute.assignmentId.employeeProfileId.firstName}{" "}
                      {selectedDispute.assignmentId.employeeProfileId.lastName}
                    </p>
                    <p className="text-sm text-slate-400 mb-2">
                      <strong>Cycle:</strong> {selectedDispute.cycleId.name}
                    </p>
                    <p className="text-sm text-slate-400 mb-4">
                      <strong>Reason:</strong> {selectedDispute.reason}
                    </p>
                  </div>

                  {selectedDispute.status === "OPEN" && (
                    <>
                      {/* Resolution Notes */}
                      <div className="mb-4">
                        <label className="block text-sm text-slate-300 mb-2">
                          Resolution Notes (Optional)
                        </label>
                        <textarea
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                          rows={3}
                          placeholder="Add notes about your decision..."
                        />
                      </div>

                      {/* Rating Adjustment Inputs */}
                      {selectedDispute.appraisalId.ratings && (
                        <div className="mb-4">
                          <h4 className="text-sm text-slate-300 mb-2">Adjust Ratings</h4>
                          <div className="space-y-3">
                            {selectedDispute.appraisalId.ratings.map((rating) => (
                              <div key={rating.key} className="flex items-center justify-between gap-4">
                                <span className="text-sm text-white">{rating.title}</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={5}
                                  value={adjustedRatings[rating.key] ?? 1} // <-- provide fallback
                                  onChange={(e) =>
                                    setAdjustedRatings({
                                      ...adjustedRatings,
                                      [rating.key]: Math.min(5, Math.max(1, Number(e.target.value))),
                                    })
                                  }
                                  className="w-16 px-2 py-1 rounded-xl text-black text-center"
                                />

                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <button
                          onClick={() =>
                            resolveDispute(selectedDispute._id, "RESOLVED_UPHELD")
                          }
                          disabled={resolving}
                          className="w-full px-4 py-2 bg-green-600/20 border border-green-500/40 rounded-xl text-white hover:bg-green-600/40 transition-all duration-300 disabled:opacity-50"
                        >
                          {resolving ? "Resolving..." : "Uphold Original Rating"}
                        </button>

                        <button
                          onClick={() =>
                            resolveDispute(selectedDispute._id, "RESOLVED_ADJUSTED", adjustedRatings)
                          }
                          disabled={
                            resolving ||
                            resolution.trim() === "" ||
                            Object.values(adjustedRatings).some((val) => val < 1 || val > 5)
                          }
                          className="w-full px-4 py-2 bg-blue-600/20 border border-blue-500/40 rounded-xl text-white hover:bg-blue-600/40 transition-all duration-300 disabled:opacity-50"
                        >
                          {resolving ? "Resolving..." : "Adjust Rating"}
                        </button>

                        <button
                          onClick={() => setSelectedDispute(null)}
                          className="w-full px-4 py-2 bg-slate-600/20 border border-slate-500/40 rounded-xl text-white hover:bg-slate-600/40 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}

                  {selectedDispute.status !== "OPEN" && (
                    <div className="text-center">
                      <p className="text-slate-400 mb-2">This dispute has been resolved.</p>
                      {selectedDispute.resolutionSummary && (
                        <p className="text-sm text-slate-300">
                          <strong>Resolution:</strong> {selectedDispute.resolutionSummary}
                        </p>
                      )}
                      <button
                        onClick={() => setSelectedDispute(null)}
                        className="mt-4 px-4 py-2 bg-slate-600/20 border border-slate-500/40 rounded-xl text-white hover:bg-slate-600/40 transition-all duration-300"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Select a dispute to review and resolve</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
