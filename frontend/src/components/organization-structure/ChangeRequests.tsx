"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import {
  canViewChangeRequestsTab,
  canSubmitChangeRequests,
  canApproveChangeRequests,
} from "@/lib/organization-role-utils";
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
  DialogTrigger,
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
import { Plus, Eye, Edit, Send, X, CheckCircle, XCircle, FileText } from "lucide-react";
import { ChangeRequestForm } from "./ChangeRequestForm";
import { ChangeRequestDetails } from "./ChangeRequestDetails";
import { toast } from "sonner";

export enum StructureRequestType {
  NEW_DEPARTMENT = "NEW_DEPARTMENT",
  UPDATE_DEPARTMENT = "UPDATE_DEPARTMENT",
  NEW_POSITION = "NEW_POSITION",
  UPDATE_POSITION = "UPDATE_POSITION",
  CLOSE_POSITION = "CLOSE_POSITION",
}

export enum StructureRequestStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELED = "CANCELED",
  IMPLEMENTED = "IMPLEMENTED",
}

export interface ChangeRequest {
  _id: string;
  requestNumber: string;
  requestType: StructureRequestType;
  status: StructureRequestStatus;
  details?: string;
  reason?: string;
  targetDepartmentId?: string;
  targetPositionId?: string;
  requestedByEmployeeId: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function ChangeRequests() {
  const { currentRole, user } = useAuth();

  // Security: Early return if user doesn't have permission
  if (!canViewChangeRequestsTab(currentRole)) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Access denied. You do not have permission to view change requests.</p>
      </div>
    );
  }
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ChangeRequest | null>(null);
  const [viewingRequest, setViewingRequest] = useState<ChangeRequest | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState<ChangeRequest | null>(null);
  const [cancelingRequest, setCancelingRequest] = useState<ChangeRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | StructureRequestStatus>("all");
  const [filterType, setFilterType] = useState<"all" | StructureRequestType>("all");

  // Fetch change requests based on role
  useEffect(() => {
    fetchChangeRequests();
  }, [currentRole, user?.id]);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      if (canSubmitChangeRequests(currentRole) && user?.id) {
        // All roles that can submit can see their own requests
        const response = await api.get("/organization-structure/change-requests/my-requests");
        setChangeRequests(response.data || []);
      } else {
        setChangeRequests([]);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch change requests";
      setError(errorMessage);
      console.error("Error fetching change requests:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchChangeRequests();
    toast.success("Change request created successfully");
  };

  const handleUpdateSuccess = () => {
    setEditingRequest(null);
    fetchChangeRequests();
    toast.success("Change request updated successfully");
  };

  const handleSubmit = async () => {
    if (!submittingRequest) return;

    try {
      await api.patch(`/organization-structure/change-requests/${submittingRequest._id}/submit`);
      toast.success("Change request submitted for approval");
      setSubmittingRequest(null);
      fetchChangeRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit change request");
    }
  };

  const handleCancel = async () => {
    if (!cancelingRequest) return;

    try {
      await api.delete(`/organization-structure/change-requests/${cancelingRequest._id}`);
      toast.success("Change request canceled successfully");
      setCancelingRequest(null);
      fetchChangeRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel change request");
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

  // Filter change requests
  const filteredRequests = changeRequests.filter((req) => {
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    const matchesType = filterType === "all" || req.requestType === filterType;
    return matchesStatus && matchesType;
  });

  const canEdit = (request: ChangeRequest) => {
    // Only can edit if it's DRAFT and you're the owner
    return (
      request.status === StructureRequestStatus.DRAFT &&
      request.requestedByEmployeeId === user?.id
    );
  };

  const canSubmit = (request: ChangeRequest) => {
    // Can submit if it's DRAFT and you're the owner
    return (
      request.status === StructureRequestStatus.DRAFT &&
      request.requestedByEmployeeId === user?.id
    );
  };

  const canCancel = (request: ChangeRequest) => {
    // Can cancel if DRAFT or SUBMITTED and you're the owner
    return (
      (request.status === StructureRequestStatus.DRAFT ||
        request.status === StructureRequestStatus.SUBMITTED) &&
      request.requestedByEmployeeId === user?.id
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">Loading change requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={fetchChangeRequests} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Change Requests</h2>
          <p className="text-slate-400">
            Create and manage organizational structure change requests
          </p>
        </div>
        {canSubmitChangeRequests(currentRole) && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                <Plus className="w-4 h-4 mr-2" />
                Create Request
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Change Request</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Create a new organizational structure change request
                </DialogDescription>
              </DialogHeader>
              <ChangeRequestForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as "all" | StructureRequestType)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="all">All Types</option>
          {Object.values(StructureRequestType).map((type) => (
            <option key={type} value={type}>
              {getTypeLabel(type)}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | StructureRequestStatus)}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <option value="all">All Status</option>
          {Object.values(StructureRequestStatus).map((status) => (
            <option key={status} value={status}>
              {getStatusBadge(status).props.children}
            </option>
          ))}
        </select>
      </div>

      {/* Change Requests Table */}
      {filteredRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border border-white/10 rounded-xl bg-white/5">
          <FileText className="w-12 h-12 text-slate-500 mb-4" />
          <p className="text-slate-400">No change requests found</p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-slate-300">Request #</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Details</TableHead>
                <TableHead className="text-slate-300">Submitted</TableHead>
                <TableHead className="text-slate-300 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow
                  key={request._id}
                  className="border-white/10 hover:bg-white/5"
                >
                  <TableCell className="font-medium text-white">
                    {request.requestNumber}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {getTypeLabel(request.requestType)}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-slate-300 max-w-xs truncate">
                    {request.details || "—"}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {request.submittedAt
                      ? new Date(request.submittedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingRequest(request)}
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canEdit(request) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingRequest(request)}
                          className="h-8 w-8 text-slate-400 hover:text-blue-400 hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canSubmit(request) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSubmittingRequest(request)}
                          className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-white/10"
                          title="Submit for approval"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      {canCancel(request) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCancelingRequest(request)}
                          className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-white/10"
                          title="Cancel request"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {editingRequest && (
        <Dialog
          open={!!editingRequest}
          onOpenChange={(open) => !open && setEditingRequest(null)}
        >
          <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Change Request</DialogTitle>
              <DialogDescription className="text-slate-400">
                Update change request details (DRAFT only)
              </DialogDescription>
            </DialogHeader>
            <ChangeRequestForm
              request={editingRequest}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setEditingRequest(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Details Dialog */}
      {viewingRequest && (
        <ChangeRequestDetails
          request={viewingRequest}
          onClose={() => setViewingRequest(null)}
        />
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog
        open={!!submittingRequest}
        onOpenChange={(open) => !open && setSubmittingRequest(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Change Request</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to submit "{submittingRequest?.requestNumber}" for
              approval? Once submitted, you won't be able to edit it without canceling
              first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={!!cancelingRequest}
        onOpenChange={(open) => !open && setCancelingRequest(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Change Request</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to cancel "{cancelingRequest?.requestNumber}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              No, Keep It
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
