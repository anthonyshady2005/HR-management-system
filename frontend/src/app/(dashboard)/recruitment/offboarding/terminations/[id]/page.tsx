"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Building2,
  Shield,
  Laptop,
  DollarSign,
  Key,
  RefreshCw,
} from "lucide-react";
import { offboardingApi, type TerminationRequest, type ClearanceChecklist, type TerminationStatus } from "@/lib/recruitment-api";
import { useAuth } from "@/providers/auth-provider";
import ProtectedRoute from "@/components/protected-route";

export default function TerminationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { currentRole } = useAuth();
  const rawId = params.id;
  const id = typeof rawId === 'string' ? rawId : (rawId as any)?._id?.toString() || String(rawId);
  
  const [loading, setLoading] = useState(true);
  const [termination, setTermination] = useState<TerminationRequest | null>(null);
  const [clearance, setClearance] = useState<ClearanceChecklist | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "clearance">("overview");

  useEffect(() => {
    if (id && id !== '[object Object]' && id.length > 0) {
      loadTermination();
    } else {
      console.error("Invalid termination ID:", id);
      setLoading(false);
    }
  }, [id]);

  const loadTermination = async () => {
    try {
      setLoading(true);
      const [terminationData, clearanceData] = await Promise.all([
        offboardingApi.getTerminationById(id),
        offboardingApi.getClearanceChecklist(id).catch(() => null),
      ]);
      setTermination(terminationData);
      setClearance(clearanceData);
    } catch (error) {
      console.error("Error loading termination:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: TerminationStatus) => {
    switch (status) {
      case "pending":
        return { label: "Pending", color: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" };
      case "approved":
        return { label: "Approved", color: "bg-green-500/20 text-green-300 border border-green-500/30" };
      case "rejected":
        return { label: "Rejected", color: "bg-red-500/20 text-red-300 border border-red-500/30" };
      case "completed":
        return { label: "Completed", color: "bg-gray-500/20 text-gray-300 border border-gray-500/30" };
      default:
        return { label: "Unknown", color: "bg-gray-500/20 text-gray-300 border border-gray-500/30" };
    }
  };

  const getClearanceStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", color: "bg-green-500/20 text-green-300 border border-green-500/30" };
      case "not_applicable":
        return { label: "Not Applicable", color: "bg-gray-500/20 text-gray-300 border border-gray-500/30" };
      case "pending":
      default:
        return { label: "Pending", color: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" };
    }
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "IT":
        return <Laptop className="w-5 h-5" />;
      case "Finance":
        return <DollarSign className="w-5 h-5" />;
      case "Facilities":
        return <Building2 className="w-5 h-5" />;
      case "Line Manager":
        return <User className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["HR Manager", "HR Admin", "System Admin", "Department Employee"]}>
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!termination) {
    return (
      <ProtectedRoute allowedRoles={["HR Manager", "HR Admin", "System Admin", "Department Employee"]}>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/recruitment/offboarding/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Termination Request Not Found</h1>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-400">The termination request you're looking for doesn't exist.</p>
            <Link
              href="/recruitment/offboarding/dashboard"
              className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const statusBadge = getStatusBadge(termination.status);
  const employee = termination.employeeId as any;
  const employeeName = employee
    ? typeof employee === 'object'
      ? employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.employeeNumber || 'Unknown Employee'
      : 'Unknown Employee'
    : 'Unknown Employee';
  const employeeDepartment = employee
    ? typeof employee === 'object' && employee.primaryDepartmentId
      ? typeof employee.primaryDepartmentId === 'object'
        ? employee.primaryDepartmentId.name || 'Unknown'
        : 'Unknown'
      : 'Unknown'
    : 'Unknown';

  return (
    <ProtectedRoute allowedRoles={["HR Manager", "HR Admin", "System Admin", "Department Employee"]}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/recruitment/offboarding/dashboard"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Termination Request Details</h1>
              <p className="text-slate-400 text-sm mt-1">Request ID: {termination._id}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.color}`}>
            {statusBadge.label}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "overview"
                ? "text-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("clearance")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "clearance"
                ? "text-white border-b-2 border-blue-500"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Clearance Checklist
          </button>
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Employee Information */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Employee Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Employee Name</p>
                  <p className="text-white font-medium">{employeeName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Department</p>
                  <p className="text-white font-medium">{employeeDepartment}</p>
                </div>
                {employee && typeof employee === 'object' && employee.employeeNumber && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Employee Number</p>
                    <p className="text-white font-medium">{employee.employeeNumber}</p>
                  </div>
                )}
                {employee && typeof employee === 'object' && employee.workEmail && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Work Email</p>
                    <p className="text-white font-medium">{employee.workEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Termination Details */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Termination Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Initiator</p>
                  <p className="text-white font-medium capitalize">{termination.initiator || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Reason</p>
                  <p className="text-white font-medium">{termination.reason || "N/A"}</p>
                </div>
                {termination.requestDate && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Request Date</p>
                    <p className="text-white font-medium">
                      {new Date(termination.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {termination.terminationDate && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Termination Date</p>
                    <p className="text-white font-medium">
                      {new Date(termination.terminationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {termination.lastWorkingDay && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Last Working Day</p>
                    <p className="text-white font-medium">
                      {new Date(termination.lastWorkingDay).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {termination.noticePeriod !== undefined && (
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Notice Period</p>
                    <p className="text-white font-medium">{termination.noticePeriod} days</p>
                  </div>
                )}
              </div>
              {termination.employeeComments && (
                <div className="mt-4">
                  <p className="text-slate-400 text-sm mb-1">Employee Comments</p>
                  <p className="text-white">{termination.employeeComments}</p>
                </div>
              )}
              {termination.hrComments && (
                <div className="mt-4">
                  <p className="text-slate-400 text-sm mb-1">HR Comments</p>
                  <p className="text-white">{termination.hrComments}</p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </h2>
              <div className="space-y-4">
                {termination.createdAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-white font-medium">Request Created</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(termination.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                {termination.updatedAt && termination.updatedAt !== termination.createdAt && (
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <p className="text-white font-medium">Last Updated</p>
                      <p className="text-slate-400 text-sm">
                        {new Date(termination.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "clearance" && (
          <div className="space-y-6">
            {clearance ? (
              <>
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Department Clearances
                  </h2>
                  <div className="space-y-4">
                    {clearance.items && clearance.items.length > 0 ? (
                      clearance.items.map((item, index) => {
                        const statusBadge = getClearanceStatusBadge(item.status);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              {getDepartmentIcon(item.department)}
                              <div>
                                <p className="text-white font-medium">{item.department}</p>
                                {item.comments && (
                                  <p className="text-slate-400 text-sm mt-1">{item.comments}</p>
                                )}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-400 text-center py-8">No clearance items found</p>
                    )}
                  </div>
                </div>

                {clearance.equipmentList && clearance.equipmentList.length > 0 && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Laptop className="w-5 h-5" />
                      Equipment Return
                    </h2>
                    <div className="space-y-2">
                      {clearance.equipmentList.map((equipment: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div>
                            <p className="text-white font-medium">{equipment.name || "Equipment"}</p>
                            {equipment.condition && (
                              <p className="text-slate-400 text-sm">Condition: {equipment.condition}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            equipment.returned
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}>
                            {equipment.returned ? "Returned" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {clearance.cardReturned !== undefined && (
                  <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Key className="w-5 h-5" />
                      Access Card
                    </h2>
                    <div className="flex items-center justify-between">
                      <p className="text-white">Access Card Returned</p>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        clearance.cardReturned
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}>
                        {clearance.cardReturned ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-400">Clearance checklist not found or not yet initialized.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

