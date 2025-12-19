"use client";

import { AttendanceRecordListItem } from "../models";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

interface AttendanceTableProps {
  records: AttendanceRecordListItem[];
  onRecordClick?: (record: AttendanceRecordListItem) => void;
}

export function AttendanceTable({
  records,
  onRecordClick,
}: AttendanceTableProps) {
  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), "HH:mm");
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatWorkHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Present
          </Badge>
        );
      case "absent":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        );
      case "late":
        return (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            <AlertCircle className="w-3 h-3 mr-1" />
            Late
          </Badge>
        );
      case "early_leave":
        return (
          <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Early Leave
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Work Hours</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Missed Punch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No attendance records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              const clockIn = record.punches.find((p) => p.type === "IN");
              const clockOut = record.punches.find((p) => p.type === "OUT");

              return (
                <TableRow
                  key={record._id}
                  className={onRecordClick ? "cursor-pointer hover:bg-accent/50" : ""}
                  onClick={() => onRecordClick?.(record)}
                >
                  <TableCell className="font-medium">
                    {formatDate(record.date || new Date().toISOString())}
                  </TableCell>
                  <TableCell>{record.employeeName || "N/A"}</TableCell>
                  <TableCell>
                    {clockIn ? formatTime(clockIn.time) : "-"}
                  </TableCell>
                  <TableCell>
                    {clockOut ? formatTime(clockOut.time) : "-"}
                  </TableCell>
                  <TableCell>{formatWorkHours(record.totalWorkMinutes)}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    {record.hasMissedPunch ? (
                      <Badge variant="destructive" className="text-xs">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

