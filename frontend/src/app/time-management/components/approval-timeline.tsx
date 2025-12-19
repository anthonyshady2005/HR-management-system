"use client";

import { ApprovalLog, TimeExceptionStatus, CorrectionRequestStatus } from "../models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowUp, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ApprovalTimelineProps {
  logs: ApprovalLog[];
  currentStatus: TimeExceptionStatus | CorrectionRequestStatus;
}

export function ApprovalTimeline({ logs, currentStatus }: ApprovalTimelineProps) {
  const getStatusIcon = (action: string) => {
    switch (action) {
      case "approve":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "reject":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "escalate":
        return <ArrowUp className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" }> = {
      APPROVED: { label: "Approved", variant: "default" },
      REJECTED: { label: "Rejected", variant: "destructive" },
      ESCALATED: { label: "Escalated", variant: "outline" },
      PENDING: { label: "Pending", variant: "outline" },
      OPEN: { label: "Open", variant: "outline" },
      IN_REVIEW: { label: "In Review", variant: "outline" },
    };

    const config = statusMap[status] || { label: status, variant: "outline" as const };
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), "MMM dd, yyyy HH:mm");
    } catch {
      return timestamp;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Current Status:</span>
            {getStatusBadge(currentStatus)}
          </div>

          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approval history available</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div key={log._id} className="relative flex gap-4">
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-border">
                      {getStatusIcon(log.action)}
                    </div>
                    <div className="flex-1 space-y-1 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {log.reviewerName || "Unknown Reviewer"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(log.timestamp)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs capitalize">
                          {log.action}
                        </Badge>
                      </div>
                      {log.comment && (
                        <p className="text-sm text-muted-foreground mt-1">{log.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

