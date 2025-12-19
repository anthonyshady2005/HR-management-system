"use client";

import { useState } from "react";
import { TimeExceptionType } from "../models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ExceptionFormProps {
  employeeId: string;
  attendanceRecordId: string;
  onSubmit: (data: {
    type: TimeExceptionType;
    reason?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ExceptionForm({
  employeeId,
  attendanceRecordId,
  onSubmit,
  onCancel,
  isLoading = false,
}: ExceptionFormProps) {
  const [type, setType] = useState<TimeExceptionType | "">("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;

    await onSubmit({
      type: type as TimeExceptionType,
      reason: reason || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Exception Request</CardTitle>
        <CardDescription>
          Request an exception for your attendance record
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Exception Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as TimeExceptionType)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select exception type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TimeExceptionType.MISSED_PUNCH}>
                  Missed Punch
                </SelectItem>
                <SelectItem value={TimeExceptionType.LATE}>Late Arrival</SelectItem>
                <SelectItem value={TimeExceptionType.EARLY_LEAVE}>
                  Early Leave
                </SelectItem>
                <SelectItem value={TimeExceptionType.SHORT_TIME}>
                  Short Time
                </SelectItem>
                <SelectItem value={TimeExceptionType.OVERTIME_REQUEST}>
                  Overtime Request
                </SelectItem>
                <SelectItem value={TimeExceptionType.MANUAL_ADJUSTMENT}>
                  Manual Adjustment
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for this exception..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!type || isLoading}>
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

