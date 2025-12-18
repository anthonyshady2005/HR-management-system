import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building, Briefcase, Calendar } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { EmployeeProfile, Position, Department } from "../types";
import { getPopulatedValue } from "../api";

interface ProfileCardProps {
  employee: EmployeeProfile;
  onViewDetails?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function ProfileCard({
  employee,
  onViewDetails,
  showActions = false,
  compact = false,
}: ProfileCardProps) {
  const position = (employee.primaryPositionId || employee.positionId) as Position | undefined;
  const department = (employee.primaryDepartmentId || employee.departmentId) as Department | undefined;

  return (
    <Card className="bg-white/5 border-white/10 text-white hover:bg-white/8 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
            {employee.profilePictureUrl ? (
              <Image
                src={employee.profilePictureUrl}
                alt={employee.fullName}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-white">
                {employee.firstName?.[0]}
                {employee.lastName?.[0]}
              </div>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl mb-1 truncate">
              {employee.fullName}
            </CardTitle>
            <p className="text-sm text-slate-400 mb-2">
              ID: {employee.employeeNumber || employee.employeeId}
            </p>
            <StatusBadge status={employee.status} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!compact && (
          <>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <span>
                {position ? getPopulatedValue(position, "title") : (
                  <span className="text-amber-400 flex items-center gap-1">
                    Unassigned
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Building className="w-4 h-4 text-slate-500" />
              <span>
                {department ? getPopulatedValue(department, "name") : (
                  <span className="text-slate-500 italic">No Department</span>
                )}
              </span>
            </div>
            {employee.workEmail && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="truncate">{employee.workEmail}</span>
              </div>
            )}
            {employee.workPhone && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{employee.workPhone}</span>
              </div>
            )}
            {employee.dateOfHire && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>
                  Hired:{" "}
                  {new Date(employee.dateOfHire).toLocaleDateString()}
                </span>
              </div>
            )}
          </>
        )}
        {showActions && onViewDetails && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onViewDetails}
            className="w-full mt-4"
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
