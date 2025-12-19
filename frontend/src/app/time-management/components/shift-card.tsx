"use client";

import { Shift, ShiftAssignment } from "../models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Users } from "lucide-react";
import { format, parseISO } from "date-fns";

interface ShiftCardProps {
  shift: Shift;
  assignments?: ShiftAssignment[];
  onEdit?: (shift: Shift) => void;
  onAssign?: (shift: Shift) => void;
}

export function ShiftCard({ shift, assignments = [], onEdit, onAssign }: ShiftCardProps) {
  const activeAssignments = assignments.filter(
    (a) => a.shiftId === shift._id && a.status === "APPROVED"
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{shift.name}</CardTitle>
            <CardDescription className="mt-1">
              {shift.shiftTypeName || "Shift Type"}
            </CardDescription>
          </div>
          <Badge variant={shift.active ? "default" : "outline"}>
            {shift.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{shift.startTime}</span>
            <span className="text-muted-foreground">-</span>
            <span className="font-medium">{shift.endTime}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{activeAssignments.length} active assignment(s)</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline" className="text-xs">
              Grace: {shift.graceInMinutes}m
            </Badge>
            <Badge variant="outline" className="text-xs">
              Policy: {shift.punchPolicy}
            </Badge>
            {shift.requiresApprovalForOvertime && (
              <Badge variant="outline" className="text-xs">
                OT Approval Required
              </Badge>
            )}
          </div>

          {(onEdit || onAssign) && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(shift)}
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </button>
              )}
              {onAssign && (
                <button
                  onClick={() => onAssign(shift)}
                  className="text-sm text-primary hover:underline"
                >
                  Assign
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

