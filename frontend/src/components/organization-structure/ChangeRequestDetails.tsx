"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { canApproveChangeRequests } from "@/lib/organization-role-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  StructureRequestType,
  StructureRequestStatus,
  ChangeRequest,
} from "./ChangeRequests";
import { CheckCircle, XCircle, Clock, User, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ChangeRequestDetailsProps {
  request: ChangeRequest;
  onClose: () => void;
}

interface ApprovalHistoryItem {
  _id: string;
  decision: string;
  comments?: string;
  approverEmployeeId: string | { _id: string; firstName?: string; lastName?: string; employeeNumber?: string };
  decidedAt: string;
  approverName?: string;
}

export function ChangeRequestDetails({
  request,
  onClose,
}: ChangeRequestDetailsProps) {
  const { currentRole } = useAuth();
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [approveComments, setApproveComments] = useState("");
  const [rejectComments, setRejectComments] = useState("");

  useEffect(() => {
    fetchApprovalHistory();
  }, [request._id]);

  const fetchApprovalHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/organization-structure/change-requests/${request._id}/approval-history`
      );
      // Map backend response to frontend interface
      const mappedHistory = (response.data || []).map((item: any) => ({
        _id: item._id,
        decision: item.decision,
        comments: item.comments,
        approverEmployeeId: item.approverEmployeeId,
        decidedAt: item.decidedAt,
        approverName: item.approverEmployeeId
          ? typeof item.approverEmployeeId === 'object'
            ? `${item.approverEmployeeId.firstName || ''} ${item.approverEmployeeId.lastName || ''}`.trim() ||
              item.approverEmployeeId.employeeNumber ||
              'Unknown'
            : undefined
          : undefined,
      }));
      setApprovalHistory(mappedHistory);
    } catch (err: any) {
      console.error("Failed to fetch approval history:", err);
      // If endpoint fails, just show empty history
      setApprovalHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    try {
      await api.post(`/organization-structure/change-requests/${request._id}/approve`, {
        comments: approveComments || undefined,
      });
      toast.success("Change request approved successfully");
      setIsApproveDialogOpen(false);
      setApproveComments("");
      onClose();
      // Refresh the parent component
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve change request");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectComments.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setRejecting(true);
    try {
      await api.post(`/organization-structure/change-requests/${request._id}/reject`, {
        comments: rejectComments,
      });
      toast.success("Change request rejected");
      setIsRejectDialogOpen(false);
      setRejectComments("");
      onClose();
      // Refresh the parent component
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject change request");
    } finally {
      setRejecting(false);
    }
  };

  const getStatusBadge = (status: StructureRequestStatus) => {
    const variants: Record<StructureRequestStatus, { className: string; label: string }> = {
      [StructureRequestStatus.DRAFT]: {
        className: "bg-slate-500/20 text-slate-300",
        label: "Draft",
      },
      [StructureRequestStatus.SUBMITTED]: {
        className: "bg-blue-500/20 text-blue-300",
        label: "Submitted",
      },
      [StructureRequestStatus.UNDER_REVIEW]: {
        className: "bg-yellow-500/20 text-yellow-300",
        label: "Under Review",
      },
      [StructureRequestStatus.APPROVED]: {
        className: "bg-green-500/20 text-green-300",
        label: "Approved",
      },
      [StructureRequestStatus.REJECTED]: {
        className: "bg-red-500/20 text-red-300",
        label: "Rejected",
      },
      [StructureRequestStatus.CANCELED]: {
        className: "bg-gray-500/20 text-gray-300",
        label: "Canceled",
      },
      [StructureRequestStatus.IMPLEMENTED]: {
        className: "bg-emerald-500/20 text-emerald-300",
        label: "Implemented",
      },
    };

    const variant = variants[status];
    return (
      <Badge variant="secondary" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: StructureRequestType) => {
    const labels: Record<StructureRequestType, string> = {
      [StructureRequestType.NEW_DEPARTMENT]: "New Department",
      [StructureRequestType.UPDATE_DEPARTMENT]: "Update Department",
      [StructureRequestType.NEW_POSITION]: "New Position",
      [StructureRequestType.UPDATE_POSITION]: "Update Position",
      [StructureRequestType.CLOSE_POSITION]: "Close Position",
    };
    return labels[type];
  };

  const canApprove = () => {
    return (
      canApproveChangeRequests(currentRole) &&
      (request.status === StructureRequestStatus.SUBMITTED ||
        request.status === StructureRequestStatus.UNDER_REVIEW)
    );
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Change Request: {request.requestNumber}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              View change request details and approval history
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Request Information */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">Request Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Type</p>
                  <p className="text-white font-medium">{getTypeLabel(request.requestType)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  {getStatusBadge(request.status)}
                </div>
                <div>
                  <p className="text-sm text-slate-400">Request Number</p>
                  <p className="text-white font-medium">{request.requestNumber}</p>
                </div>
                {request.submittedAt && (
                  <div>
                    <p className="text-sm text-slate-400">Submitted At</p>
                    <p className="text-white">
                      {new Date(request.submittedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-400">Created At</p>
                  <p className="text-white">
                    {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {request.details && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Details</p>
                  <p className="text-white whitespace-pre-wrap">{request.details}</p>
                </div>
              )}

              {request.reason && (
                <div>
                  <p className="text-sm text-slate-400 mb-2">Reason</p>
                  <p className="text-white whitespace-pre-wrap">{request.reason}</p>
                </div>
              )}
            </div>

            {/* Approval Actions */}
            {canApprove() && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsApproveDialogOpen(true)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => setIsRejectDialogOpen(true)}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {/* Approval History */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Approval History
              </h3>
              {loading ? (
                <p className="text-slate-400 text-center py-4">Loading approval history...</p>
              ) : approvalHistory.length === 0 ? (
                <p className="text-slate-400 text-center py-4">
                  No approval history available
                </p>
              ) : (
                <div className="space-y-3">
                  {approvalHistory.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white/5 border border-white/10 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {item.decision === "APPROVED" ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : item.decision === "REJECTED" ? (
                            <XCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-400" />
                          )}
                          <Badge
                            variant="secondary"
                            className={
                              item.decision === "APPROVED"
                                ? "bg-green-500/20 text-green-300"
                                : item.decision === "REJECTED"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                            }
                          >
                            {item.decision}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {item.decidedAt
                            ? new Date(item.decidedAt).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                      {item.comments && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-sm text-slate-400 mb-1">Comments:</p>
                          <p className="text-white text-sm">{item.comments}</p>
                        </div>
                      )}
                      {item.approverName && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                          <User className="w-3 h-3" />
                          <span>Approved by: {item.approverName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Change Request</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to approve "{request.requestNumber}"? This will apply the
              requested changes to the organizational structure.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approve-comments" className="text-slate-300">
                Comments (Optional)
              </Label>
              <Textarea
                id="approve-comments"
                value={approveComments}
                onChange={(e) => setApproveComments(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-slate-500"
                placeholder="Add any comments about this approval..."
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={approving}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {approving ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Change Request</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Please provide a reason for rejecting "{request.requestNumber}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reject-comments" className="text-slate-300">
                Reason for Rejection <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="reject-comments"
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder-slate-500"
                placeholder="Explain why this request is being rejected..."
                rows={4}
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={rejecting || !rejectComments.trim()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {rejecting ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
