"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Eye, RefreshCw, Search, Calendar } from "lucide-react";
import { ChangeRequestDetails } from "./ChangeRequestDetails";
import { toast } from "sonner";
import { StructureRequestStatus, StructureRequestType } from "./ChangeRequests";

interface ChangeRequest {
  _id: string;
  requestNumber: string;
  requestType: StructureRequestType;
  status: StructureRequestStatus;
  details?: string;
  reason?: string;
  targetDepartmentId?: string | { _id: string; name: string; code: string };
  targetPositionId?: string | { _id: string; title: string; code: string };
  requestedByEmployeeId: string | { _id: string; firstName?: string; lastName?: string; employeeNumber?: string };
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function ChangeLog() {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<ChangeRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StructureRequestStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | StructureRequestType>("all");

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/organization-structure/change-requests/all");
      setChangeRequests(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch change requests";
      setError(errorMessage);
      console.error("Error fetching change requests:", err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: StructureRequestStatus) => {
    const statusConfig: Record<StructureRequestStatus, { label: string; className: string }> = {
      [StructureRequestStatus.DRAFT]: {
        label: "Draft",
        className: "bg-slate-500/20 text-slate-400 border-slate-500/30",
      },
      [StructureRequestStatus.SUBMITTED]: {
        label: "Submitted",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      },
      [StructureRequestStatus.UNDER_REVIEW]: {
        label: "Under Review",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      [StructureRequestStatus.APPROVED]: {
        label: "Approved",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      },
      [StructureRequestStatus.REJECTED]: {
        label: "Rejected",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      },
      [StructureRequestStatus.CANCELED]: {
        label: "Canceled",
        className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      },
      [StructureRequestStatus.IMPLEMENTED]: {
        label: "Implemented",
        className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      },
    };

    const config = statusConfig[status] || statusConfig[StructureRequestStatus.DRAFT];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRequestTypeLabel = (type: StructureRequestType) => {
    const typeLabels: Record<StructureRequestType, string> = {
      [StructureRequestType.NEW_DEPARTMENT]: "New Department",
      [StructureRequestType.UPDATE_DEPARTMENT]: "Update Department",
      [StructureRequestType.NEW_POSITION]: "New Position",
      [StructureRequestType.UPDATE_POSITION]: "Update Position",
      [StructureRequestType.CLOSE_POSITION]: "Close Position",
    };
    return typeLabels[type] || type;
  };

  const getRequesterName = (requester: string | { _id: string; firstName?: string; lastName?: string; employeeNumber?: string }) => {
    if (typeof requester === 'string') return requester;
    if (requester.firstName || requester.lastName) {
      return `${requester.firstName || ''} ${requester.lastName || ''}`.trim();
    }
    return requester.employeeNumber || 'Unknown';
  };

  const getTargetName = (target?: string | { _id: string; name?: string; code?: string; title?: string }) => {
    if (!target) return "—";
    if (typeof target === 'string') return target;
    return target.name || target.title || target.code || 'Unknown';
  };

  // Filter change requests
  const filteredRequests = changeRequests.filter((req) => {
    const matchesSearch =
      req.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRequesterName(req.requestedByEmployeeId).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesType = typeFilter === "all" || req.requestType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading change log...</span>
      </div>
    );
  }

  if (error && changeRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchChangeRequests} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Change Log</h2>
          <p className="text-slate-400 text-sm mt-1">
            Complete history of all organizational structure change requests
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchChangeRequests}
          className="bg-white/5 border-white/10 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search by request number or requester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/5 border-white/10 text-white pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | StructureRequestStatus)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
        >
          <option value="all">All Status</option>
          {Object.values(StructureRequestStatus).map((status) => {
            const statusLabels: Record<StructureRequestStatus, string> = {
              [StructureRequestStatus.DRAFT]: "Draft",
              [StructureRequestStatus.SUBMITTED]: "Submitted",
              [StructureRequestStatus.UNDER_REVIEW]: "Under Review",
              [StructureRequestStatus.APPROVED]: "Approved",
              [StructureRequestStatus.REJECTED]: "Rejected",
              [StructureRequestStatus.CANCELED]: "Canceled",
              [StructureRequestStatus.IMPLEMENTED]: "Implemented",
            };
            return (
              <option key={status} value={status}>
                {statusLabels[status] || status}
              </option>
            );
          })}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "all" | StructureRequestType)}
          className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white"
        >
          <option value="all">All Types</option>
          {Object.values(StructureRequestType).map((type) => (
            <option key={type} value={type}>
              {getRequestTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>

      {/* Change Requests Table */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 border-b border-white/10">
              <TableHead className="text-slate-300">Request #</TableHead>
              <TableHead className="text-slate-300">Type</TableHead>
              <TableHead className="text-slate-300">Target</TableHead>
              <TableHead className="text-slate-300">Requester</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Submitted</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                  No change requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request._id} className="border-b border-white/5">
                  <TableCell className="font-mono text-sm text-white">
                    {request.requestNumber}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {getRequestTypeLabel(request.requestType)}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {request.targetDepartmentId
                      ? getTargetName(request.targetDepartmentId)
                      : request.targetPositionId
                      ? getTargetName(request.targetPositionId)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {getRequesterName(request.requestedByEmployeeId)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {request.submittedAt
                      ? new Date(request.submittedAt).toLocaleDateString()
                      : new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingRequest(request)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Details Dialog */}
      {viewingRequest && (
        <ChangeRequestDetails 
          request={viewingRequest as any} 
          onClose={() => setViewingRequest(null)} 
        />
      )}
    </div>
  );
}
