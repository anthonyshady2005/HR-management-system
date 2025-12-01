import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EmployeeProfileController } from './employee-profile.controller';
import { ActiveEmployeeGuard } from './guards/active-employee.guard';
import { EmployeeProfileService } from './employee-profile.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Candidate, CandidateSchema } from './models/candidate.schema';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from './models/employee-profile.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleSchema,
} from './models/employee-system-role.schema';
import {
  EmployeeProfileChangeRequest,
  EmployeeProfileChangeRequestSchema,
} from './models/ep-change-request.schema';
import {
  ProfileAuditLog,
  ProfileAuditLogSchema,
} from './models/profile-audit-log.schema';
import {
  Department,
  DepartmentSchema,
} from '../organization-structure/models/department.schema';
import {
  EmployeeQualification,
  EmployeeQualificationSchema,
} from './models/qualification.schema';
import {
  Position,
  PositionSchema,
} from '../organization-structure/models/position.schema';
import {
  AppraisalRecord,
  AppraisalRecordSchema,
} from '../performance/models/appraisal-record.schema';
import {
  ChangeWorkflowRule,
  ChangeWorkflowRuleSchema,
} from './workflow-rule.schema';
import { ProfileSyncService } from './profile-sync.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
      {
        name: EmployeeProfileChangeRequest.name,
        schema: EmployeeProfileChangeRequestSchema,
      },
      { name: EmployeeQualification.name, schema: EmployeeQualificationSchema },
      { name: ProfileAuditLog.name, schema: ProfileAuditLogSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      { name: AppraisalRecord.name, schema: AppraisalRecordSchema },
      { name: ChangeWorkflowRule.name, schema: ChangeWorkflowRuleSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'DEFAULT_SECRET',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [EmployeeProfileController],
  providers: [
    EmployeeProfileService,
    JwtAuthGuard,
    RolesGuard,
    ProfileSyncService,
    ActiveEmployeeGuard,
  ],
  exports: [EmployeeProfileService, MongooseModule],
})
export class EmployeeProfileModule {}
