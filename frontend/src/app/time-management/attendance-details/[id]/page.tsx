"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { attendanceService } from "../../services/attendance.service";
import { AttendanceRecord } from "../../models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowLeft, AlertCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AttendanceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadRecord(params.id as string);
    }
  }, [params.id]);

  const loadRecord = async (id: string) => {
    setLoading(true);
    try {
      const data = await attendanceService.getAttendanceRecordById(id);
      setRecord(data);
    } catch (error) {
      console.error("Failed to load attendance record:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return format(parseISO(timeString), "HH:mm:ss");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Attendance record not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Attendance Details</h1>
          <p className="text-muted-foreground mt-2">
            Detailed view of attendance record
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{record.employeeId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Work Time</p>
              <p className="font-medium text-lg">{formatWorkHours(record.totalWorkMinutes)}</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Missed Punch:</p>
              {record.hasMissedPunch ? (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Yes
                </Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Finalized for Payroll:</p>
              {record.finalisedForPayroll ? (
                <Badge variant="default">Yes</Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Punch History</CardTitle>
            <CardDescription>
              All clock in/out events for this record
            </CardDescription>
          </CardHeader>
          <CardContent>
            {record.punches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No punches recorded</p>
            ) : (
              <div className="space-y-3">
                {record.punches.map((punch, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{punch.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(punch.time)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={punch.type === "IN" ? "default" : "outline"}>
                      {punch.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {record.exceptionIds && record.exceptionIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Exceptions</CardTitle>
            <CardDescription>
              {record.exceptionIds.length} exception(s) associated with this record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {record.exceptionIds.map((exceptionId) => (
                <Badge key={exceptionId} variant="outline">
                  {exceptionId}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

