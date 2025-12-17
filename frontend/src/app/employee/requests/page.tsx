/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useRequireRole } from "@/hooks/use-require-role";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
  MessageSquare,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import axios from "axios";
import {
  getPendingChangeRequests,
  processChangeRequest,
  formatFieldName,
  getAllChangeRequests,
  deactivateEmployee,
  deleteChangeRequest,
} from "../api";
import type {
  EmployeeProfileChangeRequest,
  EmployeeProfile,
  ProcessChangeRequestDto,
  Position,
  Department,
  DeactivationReason,
} from "../types";
import { CHANGE_STATUS_COLORS, ProfileChangeStatus } from "../types";
import { api } from "@/lib/api";

const ALLOWED_ROLES = ["HR Manager", "HR Admin", "System Admin"];

export default function ChangeRequestsPage() {
  const { status } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<EmployeeProfileChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<ProfileChangeStatus | "ALL">(
    ProfileChangeStatus.PENDING
  );
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<EmployeeProfileChangeRequest | null>(null);
  const [processData, setProcessData] = useState<ProcessChangeRequestDto>({
    status: "APPROVED",
    comments: "",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<EmployeeProfileChangeRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useRequireRole(ALLOWED_ROLES, "/employee/profile");

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAllChangeRequests(
        currentPage,
        20,
        filterStatus === "ALL" ? undefined : filterStatus
      );
      setRequests(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Failed to load change requests:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to load change requests";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  const loadPositionsAndDepartments = async () => {
    try {
      const [posRes, deptRes] = await Promise.all([
        api.get("/organization-structure/positions"),
        api.get("/organization-structure/departments"),
      ]);
      setPositions(posRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (error) {
      console.error("Failed to load positions/departments:", error);
    }
  };

  const formatFieldValue = (fieldName: string, value: any): string => {
    // Handle undefined, null, empty string, or the string "undefined"
    if (value === undefined || value === null || value === '' || value === 'undefined' || value === 'null') {
      return "—";
    }
    
    // Handle position IDs
    if (fieldName === "primaryPositionId") {
      const position = positions.find(p => p._id === value || String(p._id) === String(value));
      return position ? position.title : String(value);
    }
    
    // Handle department IDs
    if (fieldName === "primaryDepartmentId") {
      const dept = departments.find(d => d._id === value || String(d._id) === String(value));
      return dept ? dept.name : String(value);
    }
    
    // Handle dates
    if (fieldName === "dateOfBirth" || fieldName.includes("Date")) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch {
        // Fall through to return string value
      }
    }
    
    return String(value);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    if (status === "authenticated") {
      loadRequests();
      loadPositionsAndDepartments();
    }
  }, [status, loadRequests, router]);

  const handleProcessRequest = (
    request: EmployeeProfileChangeRequest,
    decision: "APPROVED" | "REJECTED"
  ) => {
    setSelectedRequest(request);
    setProcessData({
      status: decision,
      comments: "",
    });
    setShowProcessDialog(true);
  };

  const confirmProcess = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const identifier = selectedRequest.requestId || selectedRequest._id;
      await processChangeRequest(identifier, processData);
      
      toast.success(
        `Change request ${processData.status.toLowerCase()} successfully`
      );
      setShowProcessDialog(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      console.error("Failed to process change request:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to process change request";
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getEmployeeName = (emp: string | EmployeeProfile): string => {
    if (typeof emp === "string") return "Unknown";
    return emp.fullName || `${emp.firstName} ${emp.lastName}`;
  };

  const handleDeleteRequest = (request: EmployeeProfileChangeRequest) => {
    setRequestToDelete(request);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!requestToDelete) return;

    try {
      setDeleting(true);
      const identifier = requestToDelete.requestId || requestToDelete._id;
      await deleteChangeRequest(identifier);
      
      toast.success(`Change request deleted successfully`);
      setShowDeleteDialog(false);
      setRequestToDelete(null);
      loadRequests();
    } catch (error) {
      console.error("Failed to delete request:", error);
      const message = isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to delete request";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Change Requests</h1>
            <p className="text-slate-400 text-sm">
              Review and process employee profile change requests
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs
          value={filterStatus}
          onValueChange={(value) => {
            setFilterStatus(value as ProfileChangeStatus | "ALL");
            setCurrentPage(1);
          }}
          className="mb-6"
        >
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="PENDING" className="data-[state=active]:bg-amber-500/20">
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="APPROVED" className="data-[state=active]:bg-green-500/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="data-[state=active]:bg-red-500/20">
              <XCircle className="w-4 h-4 mr-2" />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="ALL">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="bg-white/5 border-white/10 h-32 animate-pulse"
              />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card className="bg-white/5 border-white/10 text-white">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                No {filterStatus !== "ALL" ? filterStatus.toLowerCase() : ""}{" "}
                change requests found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const isExpanded = expandedRequest === request._id;
              const isAutoApproved =
                request.status === "APPROVED" && !request.processedByEmployeeId;

              return (
                <Card
                  key={request._id}
                  className="bg-white/5 border-white/10 text-white overflow-hidden"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge
                            className={CHANGE_STATUS_COLORS[request.status]}
                            variant="outline"
                          >
                            {request.status}
                          </Badge>
                          {isAutoApproved && (
                            <Badge
                              className="bg-blue-500/20 text-blue-400 border-blue-500/50"
                              variant="outline"
                            >
                              Auto-Approved
                            </Badge>
                          )}
                          <span className="text-xs text-slate-500">
                            {request.requestId}
                          </span>
                        </div>
                        <CardTitle className="text-base mb-3">
                          {request.requestDescription}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span className="font-medium text-slate-300">
                              {getEmployeeName(request.employeeProfileId)}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(request.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                handleProcessRequest(request, "APPROVED")
                              }
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleProcessRequest(request, "REJECTED")
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRequest(request)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(request._id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 border-t border-white/10">
                      {/* Reason */}
                      <div className="mb-4 mt-4 bg-white/5 rounded-lg p-4 border border-white/10">
                        <Label className="text-slate-400 text-xs mb-2 block">
                          Reason for Change Request
                        </Label>
                        <p className="text-white text-sm leading-relaxed">{request.reason}</p>
                      </div>

                      {/* Field Changes */}
                      <div className="mb-4">
                        <Label className="text-slate-400 text-xs mb-3 block font-semibold">
                          Requested Changes ({request.fieldChanges.length})
                        </Label>
                        <div className="space-y-3">
                          {request.fieldChanges.map((change, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-r from-white/5 to-white/10 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors"
                            >
                              <p className="font-semibold mb-3 text-white flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center">
                                  {index + 1}
                                </span>
                                {formatFieldName(change.fieldName)}
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-black/20 rounded p-3">
                                  <p className="text-slate-400 mb-2 text-xs uppercase tracking-wider">
                                    Current Value
                                  </p>
                                  <p className="text-red-400 font-mono break-all">
                                    {formatFieldValue(change.fieldName, change.oldValue)}
                                  </p>
                                </div>
                                <div className="bg-black/20 rounded p-3">
                                  <p className="text-slate-400 mb-2 text-xs uppercase tracking-wider">
                                    Requested Value
                                  </p>
                                  <p className="text-green-400 font-mono break-all">
                                    {formatFieldValue(change.fieldName, change.newValue)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Review Info */}
                      {request.processedByEmployeeId && (
                        <div className="pt-4 border-t border-white/10">
                          <Label className="text-slate-400 text-xs mb-3 block font-semibold">
                            Review Information
                          </Label>
                          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-white/10 space-y-3">
                            <div className="flex items-start gap-3">
                              <User className="w-4 h-4 text-blue-400 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-slate-400 text-xs mb-1">Reviewed By</p>
                                <p className="text-white font-medium">
                                  {getEmployeeName(request.processedByEmployeeId)}
                                </p>
                              </div>
                            </div>
                            
                            {request.processedAt && (
                              <div className="flex items-start gap-3">
                                <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-slate-400 text-xs mb-1">Reviewed At</p>
                                  <p className="text-white font-medium">
                                    {new Date(request.processedAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}
                            
                            {request.processingComments && (
                              <div className="flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-slate-400 text-xs mb-1">Comments</p>
                                  <p className="text-white leading-relaxed">
                                    {request.processingComments}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Process Dialog */}
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent className="bg-slate-900 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {processData.status === "APPROVED" ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {processData.status === "APPROVED" ? "Approve" : "Reject"}{" "}
                Change Request
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {selectedRequest && (
                  <>
                    Request ID: {selectedRequest.requestId}
                    <br />
                    Employee: {getEmployeeName(selectedRequest.employeeProfileId)}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {processData.status === "APPROVED" && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 my-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-blue-300 mb-1">
                      Approval Impact
                    </p>
                    <p>
                      Approving this request will immediately apply all
                      requested changes to the employee&apos;s profile. This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Review Comments (Optional)
                </Label>
                <Textarea
                  value={processData.comments}
                  onChange={(e) =>
                    setProcessData({
                      ...processData,
                      comments: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  placeholder="Add any comments about this decision..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowProcessDialog(false)}
                disabled={processing}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmProcess}
                disabled={processing}
                className={
                  processData.status === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm{" "}
                    {processData.status === "APPROVED"
                      ? "Approval"
                      : "Rejection"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Employee Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-black border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <Trash className="w-5 h-5" />
                Delete Change Request
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                {requestToDelete && (
                  <>
                    Are you sure you want to delete this change request?
                    <br />
                    <br />
                    Request ID: <span className="font-semibold text-white">{requestToDelete.requestId}</span>
                    <br />
                    Employee: <span className="font-semibold text-white">{getEmployeeName(requestToDelete.employeeProfileId)}</span>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 my-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium text-red-300 mb-1">Warning</p>
                  <p>
                    This action cannot be undone. The change request record will be permanently removed.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleting}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
