"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

interface ReportFiltersProps {
  onFilterChange: (filters: {
    startDate: string;
    endDate: string;
    employeeId?: string;
    departmentId?: string;
  }) => void;
  onExport?: () => void;
  showExport?: boolean;
}

export function ReportFilters({
  onFilterChange,
  onExport,
  showExport = true,
}: ReportFiltersProps) {
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const handleApply = () => {
    onFilterChange({
      startDate,
      endDate,
      employeeId: employeeId || undefined,
      departmentId: departmentId || undefined,
    });
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(format(start, "yyyy-MM-dd"));
    setEndDate(format(end, "yyyy-MM-dd"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Report Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID (Optional)</Label>
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Filter by employee"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department ID (Optional)</Label>
              <Input
                id="departmentId"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                placeholder="Filter by department"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(7)}
            >
              Last 7 Days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(30)}
            >
              Last 30 Days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(90)}
            >
              Last 90 Days
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
                setEndDate(format(endOfMonth(new Date()), "yyyy-MM-dd"));
              }}
            >
              This Month
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply}>Apply Filters</Button>
            {showExport && onExport && (
              <Button variant="outline" onClick={onExport}>
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

