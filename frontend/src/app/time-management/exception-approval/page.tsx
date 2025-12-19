"use client";

import { useState, useEffect } from "react";
import { ApprovalTimeline } from "../components/approval-timeline";
import { exceptionRequestService } from "../services/exception-request.service";
import { TimeException, AttendanceCorrectionRequest } from "../models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ExceptionApprovalPage() {
  const [pendingExceptions, setPendingExceptions] = useState<TimeException[]>([]);
  const [pendingCorrections, setPendingCorrections] = useState<AttendanceCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedException, setSelectedException] = useState<TimeException | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // TODO: Get current user's ID from auth context
      const reviewerId = "current-user-id"; // Replace with actual user ID
      const [exceptions, corrections] = await Promise.all([
        exceptionRequestService.getPendingTimeExceptions(reviewerId),
        exceptionRequestService.getPendingCorrectionRequests(),
      ]);
      setPendingExceptions(exceptions);
      setPendingCorrections(corrections);
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (
    id: string,
    type: "exception" | "correction",
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      // TODO: Get current user's ID from auth context
      const reviewerId = "current-user-id"; // Replace with actual user ID

      if (type === "exception") {
        await exceptionRequestService.reviewTimeException(id, {
          reviewerId,
          status: status as any,
        });
      } else {
        await exceptionRequestService.reviewCorrectionRequest(id, {
          reviewerId,
          status: status as any,
        });
      }
      loadData();
      setSelectedException(null);
    } catch (error) {
      console.error("Failed to review request:", error);
    }
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
      <div>
        <h1 className="text-3xl font-bold">Exception Approval</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve pending exception requests
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Time Exceptions</CardTitle>
            <CardDescription>
              {pendingExceptions.length} pending request(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingExceptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending exceptions
              </div>
            ) : (
              <div className="space-y-4">
                {pendingExceptions.map((exception) => (
                  <div
                    key={exception._id}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{exception.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Employee: {exception.employeeName || exception.employeeId}
                        </p>
                      </div>
                      <Badge variant="outline">{exception.status}</Badge>
                    </div>
                    {exception.reason && (
                      <p className="text-sm text-muted-foreground">{exception.reason}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(exception._id, "exception", "APPROVED")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(exception._id, "exception", "REJECTED")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedException(exception)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Correction Requests</CardTitle>
            <CardDescription>
              {pendingCorrections.length} pending request(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pendingCorrections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending corrections
              </div>
            ) : (
              <div className="space-y-4">
                {pendingCorrections.map((correction) => (
                  <div
                    key={correction._id}
                    className="p-4 rounded-lg border bg-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Correction Request</p>
                        <p className="text-sm text-muted-foreground">
                          Employee: {correction.employeeName || correction.employeeId}
                        </p>
                      </div>
                      <Badge variant="outline">{correction.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{correction.reason}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReview(correction._id, "correction", "APPROVED")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(correction._id, "correction", "REJECTED")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedException && (
        <Card>
          <CardHeader>
            <CardTitle>Exception Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalTimeline
              logs={[]} // TODO: Load approval logs for this exception
              currentStatus={selectedException.status}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

