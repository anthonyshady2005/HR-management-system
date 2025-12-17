"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { canApproveChangeRequests } from "@/lib/organization-role-utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { ChangeRequestDetails } from "./ChangeRequestDetails";
import { toast } from "sonner";
import {
  StructureRequestType,
  StructureRequestStatus,
  ChangeRequest,
} from "./ChangeRequests";

export function Approvals() {
  const { currentRole, user } = useAuth();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<ChangeRequest | null>(null);
  const [approvingRequest, setApprovingRequest] = useState<ChangeRequest | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<ChangeRequest | null>(null);
  const [approveComments, setApproveComments] = useState("");
  const [rejectComments, setRejectComments] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | StructureRequestStatus>("all");
  const [filterType, setFilterType] = useState<"all" | StructureRequestType>("all");

  // Fetch pending change requests
  useEffect(() => {
    if (canApproveChangeRequests(currentRole)) {
      fetchPendingRequests();
    }
  }, [currentRole]);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      if (canApproveChangeRequests(currentRole)) {
        const response = await api.get("/organization-structure/change-requests/pending");
        setChangeRequests(response.data || []);
      } else {
        setChangeRequests([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch pending requests";
      setError(errorMessage);
      console.error("Error fetching pending requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approvingRequest) return;

    try {
      await api.post(`/organization-structure/change-requests/${approvingRequest._id}/approve`, {
        comments: approveComments || undefined,
      });
      toast.success("Change request approved successfully");
      setApprovingRequest(null);
      setApproveComments("");
      fetchPendingRequests();
      if (viewingRequest?._id === approvingRequest._id) {
        setViewingRequest(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to approve request";
      toast.error(errorMessage);
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest) return;

    try {
      await api.post(`/organization-structure/change-requests/${rejectingRequest._id}/reject`, {
        comments: rejectComments || undefined,
      });
      toast.success("Change request rejected");
      setRejectingRequest(null);
      setRejectComments("");
      fetchPendingRequests();
      if (viewingRequest?._id === rejectingRequest._id) {
        setViewingRequest(null);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to reject request";
      toast.error(errorMessage);
      console.error("Error rejecting request:", err);
    }
  };

  const getStatusBadge = (status: StructureRequestStatus) => {
    const variants: Record<StructureRequestStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      [StructureRequestStatus.DRAFT]: { variant: "outline", label: "Draft" },
      [StructureRequestStatus.SUBMITTED]: { variant: "default", label: "Submitted" },
      [StructureRequestStatus.UNDER_REVIEW]: { variant: "secondary", label: "Under Review" },
      [StructureRequestStatus.APPROVED]: { variant: "default", label: "Approved" },
      [StructureRequestStatus.REJECTED]: { variant: "destructive", label: "Rejected" },
      [StructureRequestStatus.CANCELED]: { variant: "outline", label: "Canceled" },
      [StructureRequestStatus.IMPLEMENTED]: { variant: "default", label: "Implemented" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeLabel = (type: StructureRequestType): string => {
    const labels: Record<StructureRequestType, string> = {
      [StructureRequestType.NEW_DEPARTMENT]: "New Department",
      [StructureRequestType.UPDATE_DEPARTMENT]: "Update Department",
      [StructureRequestType.NEW_POSITION]: "New Position",
      [StructureRequestType.UPDATE_POSITION]: "Update Position",
      [StructureRequestType.CLOSE_POSITION]: "Close Position",
    };
    return labels[type] || type;
  };

  const filteredRequests = changeRequests.filter((req) => {
    const statusMatch = filterStatus === "all" || req.status === filterStatus;
    const typeMatch = filterType === "all" || req.requestType === filterType;
    // Only show SUBMITTED and UNDER_REVIEW requests
    const pendingMatch = req.status === StructureRequestStatus.SUBMITTED || req.status === StructureRequestStatus.UNDER_REVIEW;
    return statusMatch && typeMatch && pendingMatch;
  });

  // Check if user can approve (not their own request)
  // Handle both string ID and populated object cases
  const canApproveRequest = (request: ChangeRequest): boolean => {
    if (!user?.id) return false;
    const requesterId = typeof request.requestedByEmployeeId === 'string' 
      ? request.requestedByEmployeeId 
      : (request.requestedByEmployeeId as any)?._id?.toString() || (request.requestedByEmployeeId as any)?.toString();
    return requesterId !== user.id?.toString();
  };

  if (!canApproveChangeRequests(currentRole)) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">You don't have permission to view approvals.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading pending requests...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchPendingRequests} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Pending Approvals</h2>
          <p className="text-slate-400">
            Review and approve or reject organizational structure change requests
          </p>
        </div>
        <Button onClick={fetchPendingRequests} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Label htmlFor="status-filter" className="text-slate-300 mb-2 block">
            Filter by Status
          </Label>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as "all" | StructureRequestStatus)}
          >
            <SelectTrigger id="status-filter" className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={StructureRequestStatus.SUBMITTED}>Submitted</SelectItem>
              <SelectItem value={StructureRequestStatus.UNDER_REVIEW}>Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="type-filter" className="text-slate-300 mb-2 block">
            Filter by Type
          </Label>
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as "all" | StructureRequestType)}
          >
            <SelectTrigger id="type-filter" className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={StructureRequestType.NEW_DEPARTMENT}>New Department</SelectItem>
              <SelectItem value={StructureRequestType.UPDATE_DEPARTMENT}>Update Department</SelectItem>
              <SelectItem value={StructureRequestType.NEW_POSITION}>New Position</SelectItem>
              <SelectItem value={StructureRequestType.UPDATE_POSITION}>Update Position</SelectItem>
              <SelectItem value={StructureRequestType.CLOSE_POSITION}>Close Position</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 border border-white/10 rounded-xl bg-white/5">
          <p className="text-slate-400">No pending change requests found</p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-white/5 border-b border-white/10">
                <TableHead className="text-slate-300">Request #</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Submitted</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request._id} className="border-b border-white/10 hover:bg-white/5">
                  <TableCell className="font-mono text-sm text-slate-300">
                    {request.requestNumber}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {getTypeLabel(request.requestType)}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {request.submittedAt
                      ? new Date(request.submittedAt).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingRequest(request)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {canApproveRequest(request) && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setApprovingRequest(request)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRejectingRequest(request)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Details Dialog */}
      {viewingRequest && (
        <ChangeRequestDetails
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
        />
      )}

      {/* Approve Dialog */}
      <Dialog open={!!approvingRequest} onOpenChange={(open) => !open && setApprovingRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Change Request</DialogTitle>
            <DialogDescription>
              Approve this change request and apply the changes to the organizational structure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-comments">Comments (Optional)</Label>
              <Textarea
                id="approve-comments"
                placeholder="Add any comments about this approval..."
                value={approveComments}
                onChange={(e) => setApproveComments(e.target.value)}
                className="mt-2 bg-white/5 border-white/10"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setApprovingRequest(null);
                  setApproveComments("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectingRequest} onOpenChange={(open) => !open && setRejectingRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Change Request</DialogTitle>
            <DialogDescription>
              Reject this change request. Please provide a reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-comments">Reason for Rejection *</Label>
              <Textarea
                id="reject-comments"
                placeholder="Explain why this request is being rejected..."
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                className="mt-2 bg-white/5 border-white/10"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectComments("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectComments.trim()}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}