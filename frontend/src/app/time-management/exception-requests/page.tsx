"use client";

import { useState, useEffect } from "react";
import { ExceptionForm } from "../components/exception-form";
import { exceptionRequestService } from "../services/exception-request.service";
import { AttendanceCorrectionRequest, TimeException } from "../models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

export default function ExceptionRequestsPage() {
  const router = useRouter();
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>([]);
  const [timeExceptions, setTimeExceptions] = useState<TimeException[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Get current user's employee ID from auth context
      const employeeId = "current-user-id"; // Replace with actual user ID
      const [corrections, exceptions] = await Promise.all([
        exceptionRequestService.getMyCorrectionRequests(employeeId),
        exceptionRequestService.getTimeExceptions({ employeeId }),
      ]);
      setCorrectionRequests(corrections);
      setTimeExceptions(exceptions);
    } catch (error) {
      console.error("Failed to load exception requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitException = async (data: {
    type: string;
    reason?: string;
  }) => {
    if (!selectedRecordId) return;

    try {
      // TODO: Get current user's employee ID from auth context
      const employeeId = "current-user-id"; // Replace with actual user ID
      await exceptionRequestService.createTimeException({
        employeeId,
        attendanceRecordId: selectedRecordId,
        type: data.type as any,
        reason: data.reason,
      });
      setShowForm(false);
      setSelectedRecordId(null);
      loadData();
    } catch (error) {
      console.error("Failed to submit exception:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" }> = {
      APPROVED: { label: "Approved", variant: "default" },
      REJECTED: { label: "Rejected", variant: "destructive" },
      PENDING: { label: "Pending", variant: "outline" },
      SUBMITTED: { label: "Submitted", variant: "outline" },
      IN_REVIEW: { label: "In Review", variant: "outline" },
      OPEN: { label: "Open", variant: "outline" },
    };

    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exception Requests</h1>
          <p className="text-muted-foreground mt-2">
            Submit and track your attendance exception requests
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {showForm && (
        <ExceptionForm
          employeeId="current-user-id" // Replace with actual user ID
          attendanceRecordId={selectedRecordId || ""}
          onSubmit={handleSubmitException}
          onCancel={() => {
            setShowForm(false);
            setSelectedRecordId(null);
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Correction Requests</CardTitle>
            <CardDescription>
              Your attendance correction requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : correctionRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No correction requests found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {correctionRequests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>{formatDate(request.createdAt || "")}</TableCell>
                      <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Exceptions</CardTitle>
            <CardDescription>
              Your time exception requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : timeExceptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No time exceptions found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeExceptions.map((exception) => (
                    <TableRow key={exception._id}>
                      <TableCell>{exception.type}</TableCell>
                      <TableCell>{getStatusBadge(exception.status)}</TableCell>
                      <TableCell>{formatDate(exception.createdAt || "")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

