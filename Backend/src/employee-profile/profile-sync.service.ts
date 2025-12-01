/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ProfileSyncService {
  private readonly logger = new Logger(ProfileSyncService.name);

  emitStatusChanged(employeeId: string, oldStatus: string, newStatus: string) {
    this.logger.log(`SYNC statusChanged employeeId=${employeeId} ${oldStatus}->${newStatus}`);
    // TODO integrate with Payroll & Time Management
  }

  emitPayGradeChanged(employeeId: string, oldPayGrade: string | undefined, newPayGrade: string | undefined) {
    this.logger.log(`SYNC payGradeChanged employeeId=${employeeId} ${oldPayGrade}=>${newPayGrade}`);
    // TODO integrate with Payroll Configuration
  }

  emitHierarchyChanged(employeeId: string, positionId?: string, departmentId?: string) {
    this.logger.log(`SYNC hierarchyChanged employeeId=${employeeId} position=${positionId} department=${departmentId}`);
    // TODO integrate with Org Structure module
  }
}
