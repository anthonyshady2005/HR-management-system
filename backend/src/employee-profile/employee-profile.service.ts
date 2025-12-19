/* eslint-disable no-self-assign */
/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, Document } from 'mongoose';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from './models/employee-profile.schema';
import {
  EmployeeProfileChangeRequest,
} from './models/ep-change-request.schema';
import { ProfileAuditLog } from './models/profile-audit-log.schema';
import { Position } from '../organization-structure/models/position.schema';
import { Department } from '../organization-structure/models/department.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from '../organization-structure/models/position-assignment.schema';
import { AppraisalRecord } from '../performance/models/appraisal-record.schema';
import { UpdateSelfEmployeeProfileDto } from './dto/update-self-profile.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { HrUpdateEmployeeProfileDto } from './dto/hr-update-employee-profile.dto';
import { CreateEmployeeProfileDto } from './dto/create-employee-profile.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { DeactivateEmployeeDto } from './dto/deactivate-employee.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { EmployeeQualification } from './models/qualification.schema';
import { ChangeWorkflowRule } from './workflow-rule.schema';
import { Notification, NotificationType } from './models/notification.schema';
import { ProfileSyncService } from './profile-sync.service';

export interface SearchEmployeeDto {
  name?: string;
  employeeNumber?: string;
  departmentId?: string;
  positionId?: string;
  status?: string;
  page?: number;
  limit?: number;
}
import {
  ProfileChangeStatus,
  SystemRole,
  EmployeeStatus,
} from './enums/employee-profile.enums';
import { EmployeeSystemRole } from './models/employee-system-role.schema';

// Fields employees can directly update (non-critical)
const SELF_EDITABLE_FIELDS = new Set<keyof UpdateSelfEmployeeProfileDto>([
  'mobilePhone',
  'personalEmail',
  'address',
  'biography',
  'profilePictureUrl',
]);

// Governed fields (must go through change request workflow)
const GOVERNED_FIELDS = new Set<string>([
  // Org & compensation
  'primaryPositionId',
  'primaryDepartmentId',
  'supervisorPositionId',
  'payGradeId',
  'jobTitle',
  // Identity/legal status related
  'firstName',
  'middleName',
  'lastName',
  'nationalId',
  'dateOfBirth',
  'gender',
  'maritalStatus',
]);

@Injectable()
export class EmployeeProfileService {
  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly profileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeProfileChangeRequest.name)
    private readonly changeRequestModel: Model<EmployeeProfileChangeRequest>,
    @InjectModel(Position.name)
    private readonly positionModel: Model<Position>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
    @InjectModel(PositionAssignment.name)
    private readonly positionAssignmentModel: Model<PositionAssignmentDocument>,
    @InjectModel(AppraisalRecord.name)
    private readonly appraisalRecordModel: Model<AppraisalRecord>,
    @InjectModel(ProfileAuditLog.name)
    private readonly auditLogModel: Model<ProfileAuditLog>,
    @InjectModel(EmployeeSystemRole.name)
    private readonly systemRoleModel: Model<EmployeeSystemRole>,
    @InjectModel(EmployeeQualification.name)
    private readonly qualificationModel: Model<EmployeeQualification>,
    @InjectModel(ChangeWorkflowRule.name)
    private readonly workflowRuleModel: Model<ChangeWorkflowRule>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
      private readonly syncService: ProfileSyncService,
  ) {}

  private async getManagerCurrentPositionId(managerId: string): Promise<Types.ObjectId | null> {
    // Preferred: org-structure current position assignment
    const assignment = await this.positionAssignmentModel
      .findOne({ employeeProfileId: new Types.ObjectId(managerId), endDate: null })
      .select('positionId')
      .lean()
      .exec();

    if (assignment?.positionId) return assignment.positionId as any;

    // Fallback: employee profile primaryPositionId
    const manager = await this.profileModel
      .findById(managerId)
      .select('primaryPositionId')
      .lean()
      .exec();

    return (manager?.primaryPositionId as any) || null;
  }

  private async getDirectReportEmployeeIdsByReportingLines(
    managerPositionId: Types.ObjectId,
  ): Promise<string[]> {
    const directReportPositions = await this.positionModel
      .find({ reportsToPositionId: managerPositionId, isActive: true })
      .select('_id')
      .lean()
      .exec();

    const directReportPositionIds = directReportPositions.map((p: any) => p._id);
    if (directReportPositionIds.length === 0) return [];

    const assignments = await this.positionAssignmentModel
      .find({ positionId: { $in: directReportPositionIds }, endDate: null })
      .select('employeeProfileId')
      .lean()
      .exec();

    return assignments
      .map((a: any) => (a.employeeProfileId instanceof Types.ObjectId ? a.employeeProfileId.toString() : String(a.employeeProfileId)))
      .filter(Boolean);
  }

  private async getDirectReportEmployeeIds(managerPositionId: Types.ObjectId): Promise<string[]> {
    const [byReportingLines, bySupervisorField] = await Promise.all([
      this.getDirectReportEmployeeIdsByReportingLines(managerPositionId),
      this.profileModel
        .find({ supervisorPositionId: managerPositionId })
        .select('_id')
        .lean()
        .exec()
        .then((rows: any[]) => rows.map((r) => r._id.toString())),
    ]);

    return Array.from(new Set([...byReportingLines, ...bySupervisorField]));
  }

  /**
   * Cleans update DTO by removing invalid values that would cause Mongoose casting errors
   * - Removes null, undefined, empty strings
   * - Removes invalid Date objects
   * - Validates date strings before including them
   */
  private cleanUpdateDto(dto: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};

    Object.keys(dto).forEach((key) => {
      const value = dto[key];

      // Remove null / undefined / empty string
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Handle Date objects - remove invalid dates
      if (value instanceof Date) {
        if (isNaN(value.getTime())) {
          return; // Skip invalid dates
        }
        cleaned[key] = value;
        return;
      }

      // Handle date strings - validate before including
      if (typeof value === 'string' && key.toLowerCase().includes('date')) {
        const parsed = new Date(value);
        if (isNaN(parsed.getTime())) {
          return; // Skip invalid date strings
        }
        // Convert valid date string to Date object for Mongoose
        cleaned[key] = parsed;
        return;
      }

      // Keep all other valid values
      cleaned[key] = value;
    });

    return cleaned;
  }

  private toId(val: unknown): string | undefined {
    return val instanceof Types.ObjectId
      ? val.toHexString()
      : typeof val === 'string'
        ? val
        : undefined;
  }

  async getMyProfile(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }
    const profile = await this.profileModel
      .findById(employeeId)
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .lean()
      .exec();
    if (!profile) throw new NotFoundException('Profile not found');

    // Fetch last appraisal record (explicit field or most recent)
    let lastAppraisal: any = undefined;
    if (profile.lastAppraisalRecordId) {
      lastAppraisal = await this.appraisalRecordModel
        .findById(profile.lastAppraisalRecordId)
        .select('totalScore overallRatingLabel cycleId templateId createdAt')
        .lean()
        .exec();
    } else {
      lastAppraisal = await this.appraisalRecordModel
        .findOne({ employeeProfileId: profile._id })
        .sort({ createdAt: -1 })
        .select('totalScore overallRatingLabel cycleId templateId createdAt')
        .lean()
        .exec();
    }

    // Highest qualification summary (BR 3h) - pick latest created or highest graduation type order
    const qualification = await this.qualificationModel
      .find({ employeeProfileId: profile._id })
      .sort({ createdAt: -1 })
      .limit(1)
      .lean()
      .exec();

    // Return full profile with all fields to match frontend expectations
    return {
      ...profile,
      _id: profile._id,
      employeeId: profile.employeeNumber,
      fullName: profile.fullName || `${profile.firstName} ${profile.lastName}`,
      positionId: profile.primaryPositionId,
      departmentId: profile.primaryDepartmentId,
      lastAppraisalRecord: lastAppraisal || null,
      highestQualification: qualification[0]
        ? {
            establishmentName: qualification[0].establishmentName,
            graduationType: qualification[0].graduationType,
          }
        : null,
    };
  }

  async updateSelfProfile(
    employeeId: string,
    dto: UpdateSelfEmployeeProfileDto,
  ) {
    console.log('🔄 updateSelfProfile called with:', { employeeId, dto });

    // Validate ObjectId before database query to prevent Mongoose CastError
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    // Get current profile for audit trail (BR 22)
    const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
    if (!currentProfile) throw new NotFoundException('Profile not found');

    console.log('📋 Current profile before update:', {
      mobilePhone: currentProfile.mobilePhone,
      personalEmail: currentProfile.personalEmail,
      biography: currentProfile.biography,
      profilePictureUrl: currentProfile.profilePictureUrl?.substring(0, 50) + '...',
    });

    const update: Record<string, unknown> = {};
    const changedFields: string[] = [];
    const previousValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    for (const key of Object.keys(
      dto,
    ) as (keyof UpdateSelfEmployeeProfileDto)[]) {
      if (!SELF_EDITABLE_FIELDS.has(key)) {
        throw new BadRequestException(
          `Field '${String(key)}' is not self-editable`,
        );
      }
      // Basic normalization: ensure nested address object only updates known subfields
      if (key === 'address' && dto.address) {
        update['address'] = {
          city: dto.address.city,
          streetAddress: dto.address.streetAddress,
          country: dto.address.country,
        };
        changedFields.push('address');
        previousValues['address'] = currentProfile.address;
        newValues['address'] = update['address'];
      } else {
        update[key as string] = dto[key];
        changedFields.push(key as string);
        previousValues[key as string] = (currentProfile as any)[key];
        newValues[key as string] = dto[key];
      }
    }

    console.log('💾 Update object to be saved:', update);

    const updated = await this.profileModel
      .findByIdAndUpdate(employeeId, { $set: update }, { new: true })
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .lean()
      .exec();

    console.log('✅ Updated profile from DB:', {
      mobilePhone: updated?.mobilePhone,
      personalEmail: updated?.personalEmail,
      biography: updated?.biography,
      profilePictureUrl: updated?.profilePictureUrl?.substring(0, 50) + '...',
    });

    // Create audit log for self-service update (BR 22)
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(employeeId), // Employee updating their own profile
      'SELF_UPDATE',
      changedFields,
      previousValues,
      newValues,
    );

    // Return the full updated profile instead of just ID
    return updated;
  }

  async submitChangeRequest(employeeId: string, dto: CreateChangeRequestDto) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }
    if (!dto.fields || dto.fields.length === 0) {
      throw new BadRequestException('At least one field change is required');
    }
    // Validate governed fields only
    for (const change of dto.fields) {
      if (!GOVERNED_FIELDS.has(change.fieldName)) {
        throw new BadRequestException(
          `Field '${change.fieldName}' cannot be changed via request or is not governed here`,
        );
      }
    }

    // Load current profile to capture actual old values
    const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
    if (!currentProfile) {
      throw new NotFoundException('Employee profile not found');
    }

    // Normalize field changes to use actual current values if not provided or null
    const normalizedFields = dto.fields.map((change) => {
      // Log incoming field change for debugging
      console.log(`[ChangeRequest] Processing field change:`, {
        fieldName: change.fieldName,
        oldValue: change.oldValue,
        newValue: change.newValue,
        newValueType: typeof change.newValue,
      });

      // Get the actual old value from current profile
      let currentValue = (currentProfile as any)[change.fieldName];
      
      // Convert ObjectId fields to strings for proper display
      if (currentValue && Types.ObjectId.isValid(currentValue)) {
        currentValue = currentValue.toString();
      } else if (currentValue && currentValue._id && Types.ObjectId.isValid(currentValue._id)) {
        // Handle populated ObjectId references
        currentValue = currentValue._id.toString();
      } else if (currentValue instanceof Date) {
        // Convert Date to ISO string for consistency
        currentValue = currentValue.toISOString().split('T')[0];
      }
      
      // Normalize oldValue - TRUST the value from frontend (it comes from profile)
      // Only fall back to current profile if frontend didn't provide it
      let normalizedOldValue = change.oldValue;
      if (normalizedOldValue === undefined || normalizedOldValue === null) {
        // If no oldValue provided by frontend, use the actual current value from profile
        normalizedOldValue = currentValue !== undefined && currentValue !== null ? currentValue : null;
      } else if (normalizedOldValue === '') {
        // Empty string means no value - use null
        normalizedOldValue = null;
      } else if (normalizedOldValue && Types.ObjectId.isValid(normalizedOldValue)) {
        // Convert ObjectId to string if needed
        normalizedOldValue = normalizedOldValue.toString();
      } else if (typeof normalizedOldValue === 'string') {
        // Preserve string values as-is (including "na", "test", etc.)
        normalizedOldValue = normalizedOldValue;
      }

      // Normalize newValue - PRESERVE the actual value sent by user
      let normalizedNewValue = change.newValue;
      
      // Only convert to null if truly missing, not if it's a valid value (even if it's the string "null")
      if (normalizedNewValue === undefined || normalizedNewValue === null) {
        // Only set to null if explicitly null/undefined, preserve empty strings as-is (they'll be validated)
        normalizedNewValue = null;
      } else if (normalizedNewValue === '') {
        // Empty string should remain empty string, not null - reject invalid requests
        throw new BadRequestException(`Field '${change.fieldName}' has an empty newValue. Please provide a valid value.`);
      } else if (normalizedNewValue === 'undefined' || normalizedNewValue === 'null') {
        // Reject the string "undefined" or "null" as invalid
        throw new BadRequestException(`Field '${change.fieldName}' has an invalid newValue: '${normalizedNewValue}'. Please provide a valid value.`);
      } else if (normalizedNewValue && Types.ObjectId.isValid(normalizedNewValue)) {
        // Ensure ObjectId values are strings for consistency
        normalizedNewValue = normalizedNewValue.toString();
      } else if (typeof normalizedNewValue === 'string') {
        // Trim whitespace but preserve the value
        normalizedNewValue = normalizedNewValue.trim();
        if (normalizedNewValue === '') {
          throw new BadRequestException(`Field '${change.fieldName}' has an empty newValue after trimming. Please provide a valid value.`);
        }
      }

      console.log(`[ChangeRequest] Normalized field:`, {
        fieldName: change.fieldName,
        oldValue: normalizedOldValue,
        newValue: normalizedNewValue,
      });

      return {
        fieldName: change.fieldName,
        oldValue: normalizedOldValue,
        newValue: normalizedNewValue,
      };
    });

    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const descriptionParts = await Promise.all(normalizedFields.map(async (f) => {
      let oldVal = f.oldValue === null || f.oldValue === undefined ? 'null' : String(f.oldValue);
      let newVal = f.newValue === null || f.newValue === undefined ? 'null' : String(f.newValue);

      if (f.fieldName === 'primaryPositionId' || f.fieldName === 'supervisorPositionId') {
        if (f.oldValue) {
          const oldPos = await this.positionModel.findById(f.oldValue);
          if (oldPos) oldVal = oldPos.title;
        }
        if (f.newValue) {
          const newPos = await this.positionModel.findById(f.newValue);
          if (newPos) newVal = newPos.title;
        }
      } else if (f.fieldName === 'primaryDepartmentId') {
        if (f.oldValue) {
          const oldDept = await this.departmentModel.findById(f.oldValue);
          if (oldDept) oldVal = oldDept.name;
        }
        if (f.newValue) {
          const newDept = await this.departmentModel.findById(f.newValue);
          if (newDept) newVal = newDept.name;
        }
      }

      const displayFieldName = f.fieldName === 'primaryPositionId' ? 'Position' 
        : f.fieldName === 'primaryDepartmentId' ? 'Department' 
        : f.fieldName === 'supervisorPositionId' ? 'Supervisor Position'
        : f.fieldName;

      return `${displayFieldName}: '${oldVal}' -> '${newVal}'`;
    }));
    const description = descriptionParts.join('; ');
    const created = await this.changeRequestModel.create({
      requestId,
      employeeProfileId: new Types.ObjectId(employeeId),
      requestDescription: description,
      fieldChanges: normalizedFields,
      reason: dto.reason,
      status: ProfileChangeStatus.PENDING,
    });

    // Workflow rule auto-approve check (US-E7-04, BR 36)
    const requestedFields = dto.fields.map((f) => f.fieldName).sort();
    const rules = await this.workflowRuleModel.find({ autoApprove: true }).lean().exec();
    const autoApprove = rules.some((r) => 
      r.autoApprove && this.isExactFieldMatch(r.fieldNames, requestedFields)
    );

    if (autoApprove) {
      // Apply changes immediately using normalized fields
      const update: Record<string, unknown> = {};
      const currentProfile = await this.profileModel.findById(employeeId).lean().exec();

      for (const change of normalizedFields) {
        // Skip if newValue is undefined, null, or empty string
        if (change.newValue === undefined || change.newValue === null || change.newValue === '') {
          continue;
        }

        // Skip if newValue is the string "undefined"
        if (typeof change.newValue === 'string' && change.newValue.toLowerCase() === 'undefined') {
          continue;
        }

        if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId'].includes(change.fieldName)) {
          const newVal = change.newValue as string;
          if (Types.ObjectId.isValid(newVal)) {
            update[change.fieldName] = new Types.ObjectId(newVal);
          } else {
            // Skip invalid ObjectIds
            continue;
          }
        } else if (change.fieldName === 'dateOfBirth' && change.newValue) {
          // Convert date string to Date object
          const dateValue = change.newValue;
          if (typeof dateValue === 'string' || typeof dateValue === 'number' || dateValue instanceof Date) {
            const parsedDate = new Date(dateValue);
            if (isNaN(parsedDate.getTime())) {
              // Skip invalid dates
              continue;
            }
            update[change.fieldName] = parsedDate;
          } else {
            update[change.fieldName] = dateValue;
          }
        } else {
          update[change.fieldName] = change.newValue;
        }
      }

      // Keep fullName in sync when first/last name change
      if (update['firstName'] !== undefined || update['lastName'] !== undefined) {
        const newFirst = (update['firstName'] as string | undefined) ?? currentProfile?.firstName ?? '';
        const newLast = (update['lastName'] as string | undefined) ?? currentProfile?.lastName ?? '';
        update['fullName'] = `${newFirst} ${newLast}`.trim();
      }

      // Clean update object before applying
      const cleanedUpdate = this.cleanUpdateDto(update);

      // Only update if there are valid fields to update
      if (Object.keys(cleanedUpdate).length > 0) {
        await this.profileModel.findByIdAndUpdate(employeeId, { $set: cleanedUpdate }, { new: true }).exec();
      }
      created.status = ProfileChangeStatus.APPROVED;
      created.processedByEmployeeId = new Types.ObjectId(employeeId);
      created.processedAt = new Date();
      await created.save();

      // Audit log auto-approval
      await this.createAuditLog(
        new Types.ObjectId(employeeId),
        new Types.ObjectId(employeeId),
        'CHANGE_REQUEST_AUTO_APPROVED',
        dto.fields.map((f) => f.fieldName),
        Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.oldValue])),
        Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.newValue])),
        dto.reason,
        requestId,
      );

      // Create notification for auto-approval
      await this.notificationModel.create({
        employeeId: new Types.ObjectId(employeeId),
        type: NotificationType.CHANGE_REQUEST_APPROVED,
        title: 'Change Request Auto-Approved',
        message: `Your change request has been automatically approved and applied to your profile.`,
        relatedId: requestId,
      });
    }

    // Audit log for submission
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(employeeId),
      'CHANGE_REQUEST_SUBMITTED',
      dto.fields.map((f) => f.fieldName),
      Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.oldValue])),
      Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.newValue])),
      dto.reason,
      requestId,
    );

    // Create notification for the employee (request submitter)
    await this.notificationModel.create({
      employeeId: new Types.ObjectId(employeeId),
      type: NotificationType.CHANGE_REQUEST_SUBMITTED,
      title: 'Change Request Submitted',
      message: `Your change request has been submitted successfully and is pending approval.`,
      relatedId: requestId,
    });

    // Notify HR Admins, HR Managers, and System Admins about the new change request
    await this.notifyHRAdminsOfChangeRequest(created, employeeId);

    // Return the full created request object
    return created.toObject();
  }

  /**
   * Get employee's own change requests (US-E1-05).
   */
  async getMyChangeRequests(employeeId: string, page: number, limit: number) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    const skip = (page - 1) * limit;
    const requests = await this.changeRequestModel
      .find({ employeeProfileId: new Types.ObjectId(employeeId) })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('processedByEmployeeId', 'firstName lastName fullName')
      .lean()
      .exec();

    const total = await this.changeRequestModel
      .countDocuments({ employeeProfileId: new Types.ObjectId(employeeId) })
      .exec();

    return {
      data: requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== MANAGER TEAM VIEW (US-E4-01, US-E4-02) ==========

  /**
   * Get team members for a department head (US-E4-01).
   * Returns employees in the same department with "Department Employee" role.
   * Excludes sensitive fields per BR 18b (privacy restrictions for line managers).
   */
  async getTeamMembers(managerId: string) {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager id');
    }

    // Get manager's profile to find their department
    const manager = await this.profileModel
      .findById(managerId)
      .select('primaryDepartmentId')
      .lean()
      .exec();

    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    if (!manager.primaryDepartmentId) {
      return { teamMembers: [], count: 0 };
    }

    // Find all employees with "Department Employee" role
    const departmentEmployeeRoles = await this.systemRoleModel
      .find({
        roles: SystemRole.DEPARTMENT_EMPLOYEE,
        isActive: true,
      })
      .select('employeeProfileId')
      .lean()
      .exec();

    const departmentEmployeeIds = departmentEmployeeRoles.map(
      (r) => r.employeeProfileId,
    );

    if (departmentEmployeeIds.length === 0) {
      return { teamMembers: [], count: 0 };
    }

    // Get employees in the same department with "Department Employee" role (excluding the manager)
    const teamMembers = await this.profileModel
      .find({
        _id: { $in: departmentEmployeeIds, $ne: new Types.ObjectId(managerId) },
        primaryDepartmentId: manager.primaryDepartmentId,
      })
      .populate('primaryPositionId', 'code title')
      .populate('primaryDepartmentId', 'code name')
      .select(
        // Exclude sensitive fields: nationalId, salary, personal contact, date of birth, marital status, address details
        'employeeNumber firstName lastName fullName workEmail profilePictureUrl status primaryPositionId primaryDepartmentId dateOfHire',
      )
      .lean()
      .exec();

    return {
      teamMembers: teamMembers.map((member) => ({
        _id: member._id,
        id: member._id,
        employeeId: member.employeeNumber,
        employeeNumber: member.employeeNumber,
        name: member.fullName || `${member.firstName} ${member.lastName}`,
        firstName: member.firstName,
        lastName: member.lastName,
        fullName: member.fullName || `${member.firstName} ${member.lastName}`,
        status: member.status,
        positionId: member.primaryPositionId || null,
        departmentId: member.primaryDepartmentId || null,
        dateOfHire: member.dateOfHire,
        workEmail: member.workEmail,
        profilePictureUrl: member.profilePictureUrl,
      })),
      count: teamMembers.length,
    };
  }

  /**
   * Get summary of team's job titles and departments (US-E4-02).
   * Returns summary for employees in the same department with "Department Employee" role.
   * Aggregated view without individual employee details.
   */
  async getTeamSummary(managerId: string) {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager id');
    }

    const manager = await this.profileModel
      .findById(managerId)
      .select('primaryDepartmentId')
      .populate('primaryDepartmentId', 'code name')
      .lean()
      .exec();

    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    if (!manager.primaryDepartmentId) {
      return {
        managerDepartment: null,
        totalTeamMembers: 0,
        byPosition: [],
        byDepartment: [],
        byStatus: [],
        totalCount: 0,
        department: null,
      };
    }

    // Find all employees with "Department Employee" role
    const departmentEmployeeRoles = await this.systemRoleModel
      .find({
        roles: SystemRole.DEPARTMENT_EMPLOYEE,
        isActive: true,
      })
      .select('employeeProfileId')
      .lean()
      .exec();

    const departmentEmployeeIds = departmentEmployeeRoles.map(
      (r) => r.employeeProfileId,
    );

    if (departmentEmployeeIds.length === 0) {
      return {
        managerDepartment: manager.primaryDepartmentId || null,
        totalTeamMembers: 0,
        byPosition: [],
        byDepartment: [],
        byStatus: [],
        totalCount: 0,
        department: manager.primaryDepartmentId ? (manager.primaryDepartmentId as any).name : null,
      };
    }

    // Get team member IDs (same department + Department Employee role, excluding manager)
    const teamMemberObjectIds = departmentEmployeeIds.filter(
      (id) => id.toString() !== managerId,
    );

    // Filter to only those in the same department
    const teamMembersInDept = await this.profileModel
      .find({
        _id: { $in: teamMemberObjectIds },
        primaryDepartmentId: manager.primaryDepartmentId,
      })
      .select('_id')
      .lean()
      .exec();

    const filteredTeamMemberIds = teamMembersInDept.map((m) => m._id);

    if (filteredTeamMemberIds.length === 0) {
      return {
        managerDepartment: manager.primaryDepartmentId || null,
        totalTeamMembers: 0,
        byPosition: [],
        byDepartment: [],
        byStatus: [],
        totalCount: 0,
        department: manager.primaryDepartmentId ? (manager.primaryDepartmentId as any).name : null,
      };
    }

    // Aggregate team by position
    const byPosition = await this.profileModel.aggregate([
      { $match: { _id: { $in: filteredTeamMemberIds } } },
      {
        $lookup: {
          from: 'positions',
          localField: 'primaryPositionId',
          foreignField: '_id',
          as: 'position',
        },
      },
      { $unwind: { path: '$position', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$primaryPositionId',
          title: { $first: '$position.title' },
          code: { $first: '$position.code' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Aggregate team by department
    const byDepartment = await this.profileModel.aggregate([
      { $match: { _id: { $in: filteredTeamMemberIds } } },
      {
        $lookup: {
          from: 'departments',
          localField: 'primaryDepartmentId',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$primaryDepartmentId',
          name: { $first: '$department.name' },
          code: { $first: '$department.code' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Aggregate team by status
    const byStatus = await this.profileModel.aggregate([
      { $match: { _id: { $in: filteredTeamMemberIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalTeamMembers = byStatus.reduce((sum, s) => sum + s.count, 0);

    // Get team members for additional analytics
    const teamMembersForAnalytics = await this.profileModel
      .find({ _id: { $in: filteredTeamMemberIds } })
      .select('dateOfHire contractType workType status')
      .lean()
      .exec();

    // Hire date analysis
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    const newHires = teamMembersForAnalytics.filter(m => {
      const hireDate = m.dateOfHire ? new Date(m.dateOfHire) : null;
      return hireDate && hireDate >= oneYearAgo;
    }).length;

    const recentHires = teamMembersForAnalytics.filter(m => {
      const hireDate = m.dateOfHire ? new Date(m.dateOfHire) : null;
      return hireDate && hireDate >= sixMonthsAgo;
    }).length;

    // Calculate average tenure (in months)
    const tenures = teamMembersForAnalytics
      .filter(m => m.dateOfHire)
      .map(m => {
        const hireDate = new Date(m.dateOfHire);
        const months = (now.getFullYear() - hireDate.getFullYear()) * 12 + 
                       (now.getMonth() - hireDate.getMonth());
        return Math.max(0, months);
      });
    
    const avgTenure = tenures.length > 0
      ? Math.round(tenures.reduce((a, b) => a + b, 0) / tenures.length)
      : 0;

    // Contract type breakdown
    const byContractType = teamMembersForAnalytics.reduce((acc, member) => {
      const type = member.contractType || 'NOT_SPECIFIED';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Work type breakdown
    const byWorkType = teamMembersForAnalytics.reduce((acc, member) => {
      const type = member.workType || 'NOT_SPECIFIED';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Hire date distribution (by year)
    const byHireYear = teamMembersForAnalytics
      .filter(m => m.dateOfHire)
      .reduce((acc, member) => {
        const year = new Date(member.dateOfHire).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

    // Format the data for response
    const byContractTypeArray = Object.entries(byContractType).map(([type, count]) => ({
      type,
      count,
    }));

    const byWorkTypeArray = Object.entries(byWorkType).map(([type, count]) => ({
      type,
      count,
    }));

    const byHireYearArray = Object.entries(byHireYear)
      .map(([year, count]) => ({
        year: parseInt(year),
        count,
      }))
      .sort((a, b) => a.year - b.year);

    return {
      managerDepartment: manager.primaryDepartmentId || null,
      department: manager.primaryDepartmentId ? (manager.primaryDepartmentId as any).name : null,
      totalCount: totalTeamMembers,
      totalTeamMembers,
      byPosition: byPosition.map(p => ({
        position: p.title || 'Unknown',
        positionCode: p.code,
        count: p.count,
      })),
      byDepartment: byDepartment.map(d => ({
        department: d.name || 'Unknown',
        departmentCode: d.code,
        count: d.count,
      })),
      byStatus: byStatus.map(s => ({
        status: s._id,
        count: s.count,
      })),
      // New analytics
      analytics: {
        newHires: newHires,
        recentHires: recentHires,
        avgTenureMonths: avgTenure,
        byContractType: byContractTypeArray,
        byWorkType: byWorkTypeArray,
        byHireYear: byHireYearArray,
      },
    };
  }

  // ========== HR ADMIN SEARCH (US-E6-03) ==========

  /**
   * Search employees by various criteria.
   * Only accessible by HR Admin roles (enforced at controller level).
   */
  async getTeamMemberProfile(managerId: string, employeeId: string) {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager id');
    }
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    const managerPositionId = await this.getManagerCurrentPositionId(managerId);
    if (!managerPositionId) {
      throw new ForbiddenException('Manager has no position assigned');
    }

    // Get the employee profile
    const employee = await this.profileModel
      .findById(employeeId)
      .populate('primaryPositionId', 'code title')
      .populate('primaryDepartmentId', 'code name')
      .populate('supervisorPositionId', 'code title')
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const directReportEmployeeIds = await this.getDirectReportEmployeeIds(managerPositionId);
    if (!directReportEmployeeIds.includes(employeeId)) {
      throw new ForbiddenException(
        'You do not have permission to view this employee profile',
      );
    }

    // Return profile with restricted fields (exclude sensitive data)
    // BR 18b: Managers cannot see: nationalId, payGradeId, bankInfo, dateOfBirth, maritalStatus, address details, salary
    return {
      _id: employee._id,
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.fullName,
      workEmail: employee.workEmail,
      profilePictureUrl: employee.profilePictureUrl,
      status: employee.status,
      primaryPositionId: employee.primaryPositionId,
      primaryDepartmentId: employee.primaryDepartmentId,
      supervisorPositionId: employee.supervisorPositionId,
      dateOfHire: employee.dateOfHire,
      // Intentionally excluded: nationalId, payGradeId, bankInfo, dateOfBirth, maritalStatus, address, salary
    };
  }

  /**
   * Manager assigns an employee to their team.
   * Updates the employee's supervisorPositionId to the manager's position.
   */
  async assignEmployeeToManagerTeam(employeeId: string, managerId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager id');
    }

    // Get manager's profile to find their position
    const manager = await this.profileModel
      .findById(managerId)
      .select('primaryPositionId fullName firstName lastName')
      .lean()
      .exec();

    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    // Resolve manager's current position using position assignments first, then fallback to profile
    const managerPositionId = await this.getManagerCurrentPositionId(managerId);

    if (!managerPositionId) {
      throw new BadRequestException(
        'Manager has no position assigned. Please assign a position to your profile first.',
      );
    }

    // Get the employee to assign
    const employee = await this.profileModel
      .findById(employeeId)
      .lean()
      .exec();

    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    const managerPosIdString =
      (managerPositionId as any)._id?.toString() || managerPositionId.toString();

    // Update the employee's supervisorPositionId
    const updated = await this.profileModel
      .findByIdAndUpdate(
        employeeId,
        {
          supervisorPositionId: new Types.ObjectId(managerPosIdString),
        },
        { new: true },
      )
      .lean()
      .exec();

    // Create audit log
    const managerName =
      manager.fullName || `${manager.firstName} ${manager.lastName}`;
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(managerId),
      'EMPLOYEE_ASSIGNED_TO_TEAM',
      ['supervisorPositionId'],
      { supervisorPositionId: employee.supervisorPositionId },
      { supervisorPositionId: updated?.supervisorPositionId },
      `Employee assigned to ${managerName}'s team by manager`,
    );

    // Emit sync event for hierarchy changes
    this.syncService.emitHierarchyChanged(
      employeeId,
      this.toId((updated as any)?.primaryPositionId),
      this.toId((updated as any)?.primaryDepartmentId),
    );

    return {
      message: `Employee successfully assigned to your team`,
      employee: updated,
    };
  }

  async searchEmployees(dto: SearchEmployeeDto) {
    const filter: FilterQuery<EmployeeProfileDocument> = {};

    if (dto.name) {
      const nameRegex = new RegExp(dto.name, 'i');
      filter.$or = [
        { firstName: nameRegex },
        { lastName: nameRegex },
        { fullName: nameRegex },
      ];
    }

    if (dto.employeeNumber) {
      filter.employeeNumber = new RegExp(dto.employeeNumber, 'i');
    }

    if (dto.departmentId && Types.ObjectId.isValid(dto.departmentId)) {
      filter.primaryDepartmentId = new Types.ObjectId(dto.departmentId);
    }

    if (dto.positionId && Types.ObjectId.isValid(dto.positionId)) {
      filter.primaryPositionId = new Types.ObjectId(dto.positionId);
    }

    if (dto.status) {
      filter.status = dto.status;
    }

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      this.profileModel
        .find(filter)
        .populate('primaryPositionId', 'code title')
        .populate('primaryDepartmentId', 'code name')
        .select(
          'employeeNumber firstName lastName fullName workEmail personalEmail mobilePhone status primaryPositionId primaryDepartmentId payGradeId dateOfHire profilePictureUrl',
        )
        .skip(skip)
        .limit(limit)
        .sort({ employeeNumber: 1 })
        .lean()
        .exec(),
      this.profileModel.countDocuments(filter).exec(),
    ]);

    return {
      data: employees.map((emp) => ({
        _id: emp._id,
        employeeNumber: emp.employeeNumber,
        firstName: emp.firstName,
        lastName: emp.lastName,
        fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`,
        workEmail: emp.workEmail,
        personalEmail: emp.personalEmail,
        mobilePhone: emp.mobilePhone,
        status: emp.status,
        primaryPositionId: emp.primaryPositionId || null,
        primaryDepartmentId: emp.primaryDepartmentId || null,
        payGradeId: emp.payGradeId || null,
        dateOfHire: emp.dateOfHire,
        profilePictureUrl: emp.profilePictureUrl,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ========== HR ADMIN MASTER DATA MANAGEMENT ==========

  /**
   * Create audit log entry (BR 22).
   * Traces all editing, changes, and cancellations in a timestamped manner.
   */
  private async createAuditLog(
    employeeProfileId: Types.ObjectId,
    performedByEmployeeId: Types.ObjectId,
    action: string,
    changedFields: string[],
    previousValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    reason?: string,
    changeRequestId?: string,
  ) {
    await this.auditLogModel.create({
      employeeProfileId,
      performedByEmployeeId,
      action,
      changedFields,
      previousValues,
      newValues,
      reason,
      changeRequestId,
      performedAt: new Date(),
    });
  }

  /**
   * Get employee profile by ID for HR Admin (full access).
   */
  async getEmployeeById(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    const profile = await this.profileModel
      .findById(employeeId)
      .populate('primaryPositionId')
      .populate('primaryDepartmentId')
      .populate('supervisorPositionId')
      .lean()
      .exec();

    if (!profile) {
      throw new NotFoundException('Employee profile not found');
    }

    return profile;
  }

  /**
   * HR Admin update any field of employee profile (US-EP-04).
   * BR 20a: Only authorized roles can modify data.
   * BR 22: All changes are audit logged.
   */
  /**
   * Create a new employee profile (HR Admin only).
   * Can optionally assign employee to a team via supervisorPositionId.
   */
  async createEmployeeProfile(
    hrAdminId: string,
    dto: CreateEmployeeProfileDto,
  ) {
    if (!Types.ObjectId.isValid(hrAdminId)) {
      throw new BadRequestException('Invalid HR admin id');
    }

    // Generate employee number if not provided
    let employeeNumber = dto.employeeNumber;
    if (!employeeNumber) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      employeeNumber = `EMP-${timestamp}-${random}`;
      
      // Ensure uniqueness
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const existing = await this.profileModel.findOne({ employeeNumber }).exec();
        if (!existing) {
          isUnique = true;
        } else {
          employeeNumber = `EMP-${timestamp}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          attempts++;
        }
      }
      
      if (!isUnique) {
        throw new BadRequestException('Failed to generate unique employee number. Please provide one manually.');
      }
    } else {
      // Check if provided employee number is unique
      const existing = await this.profileModel.findOne({ employeeNumber }).exec();
      if (existing) {
        throw new BadRequestException(`Employee number '${employeeNumber}' already exists`);
      }
    }

    // Validate work email uniqueness
    if (dto.workEmail) {
      const existingEmail = await this.profileModel.findOne({ workEmail: dto.workEmail }).exec();
      if (existingEmail) {
        throw new BadRequestException(`Work email '${dto.workEmail}' already exists`);
      }
    }

    // Build profile data
    const now = new Date();
    const dateOfHire = dto.dateOfHire ? new Date(dto.dateOfHire) : now;
    
    const profileData: any = {
      employeeNumber,
      firstName: dto.firstName,
      lastName: dto.lastName,
      fullName: `${dto.firstName} ${dto.middleName ? dto.middleName + ' ' : ''}${dto.lastName}`.trim(),
      dateOfHire,
      status: dto.status || EmployeeStatus.ACTIVE,
      statusEffectiveFrom: now,
      workEmail: dto.workEmail,
    };

    // Add optional fields
    if (dto.middleName) profileData.middleName = dto.middleName;
    if (dto.nationalId) profileData.nationalId = dto.nationalId;
    if (dto.gender) profileData.gender = dto.gender;
    if (dto.maritalStatus) profileData.maritalStatus = dto.maritalStatus;
    if (dto.dateOfBirth) profileData.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.personalEmail) profileData.personalEmail = dto.personalEmail;
    if (dto.mobilePhone) profileData.mobilePhone = dto.mobilePhone;
    if (dto.homePhone) profileData.homePhone = dto.homePhone;
    if (dto.address) profileData.address = dto.address;
    if (dto.profilePictureUrl) profileData.profilePictureUrl = dto.profilePictureUrl;
    if (dto.biography) profileData.biography = dto.biography;
    if (dto.jobTitle) profileData.jobTitle = dto.jobTitle;
    if (dto.contractStartDate) profileData.contractStartDate = new Date(dto.contractStartDate);
    if (dto.contractEndDate) profileData.contractEndDate = new Date(dto.contractEndDate);
    if (dto.contractType) profileData.contractType = dto.contractType;
    if (dto.workType) profileData.workType = dto.workType;

    // Add organizational links
    if (dto.primaryPositionId && Types.ObjectId.isValid(dto.primaryPositionId)) {
      profileData.primaryPositionId = new Types.ObjectId(dto.primaryPositionId);
    }
    if (dto.primaryDepartmentId && Types.ObjectId.isValid(dto.primaryDepartmentId)) {
      profileData.primaryDepartmentId = new Types.ObjectId(dto.primaryDepartmentId);
    }
    if (dto.supervisorPositionId && Types.ObjectId.isValid(dto.supervisorPositionId)) {
      profileData.supervisorPositionId = new Types.ObjectId(dto.supervisorPositionId);
    }
    if (dto.payGradeId) {
      profileData.payGradeId = dto.payGradeId;
    }

    // Create the employee profile
    const newProfile = await this.profileModel.create(profileData);

    // Create default system role (department employee)
    await this.systemRoleModel.create({
      employeeProfileId: newProfile._id,
      roles: [SystemRole.DEPARTMENT_EMPLOYEE],
      permissions: [],
      isActive: true,
    });

    // Audit log (BR 22)
    await this.createAuditLog(
      newProfile._id,
      new Types.ObjectId(hrAdminId),
      'EMPLOYEE_CREATED',
      Object.keys(profileData).filter(k => k !== '_id' && k !== '__v' && k !== 'createdAt' && k !== 'updatedAt'),
      {},
      profileData,
      `New employee created by HR Admin`,
    );

    // Sync triggers for new employee
    if (profileData.primaryPositionId || profileData.primaryDepartmentId) {
      this.syncService.emitHierarchyChanged(
        newProfile._id.toString(),
        this.toId(profileData.primaryPositionId),
        this.toId(profileData.primaryDepartmentId),
      );
    }

    // Populate and return
    const created = await this.profileModel
      .findById(newProfile._id)
      .populate('primaryPositionId', 'code title')
      .populate('primaryDepartmentId', 'code name')
      .populate('supervisorPositionId', 'code title')
      .lean()
      .exec();

    return {
      message: 'Employee profile created successfully',
      employee: created,
    };
  }

  async hrUpdateEmployeeProfile(
    employeeId: string,
    hrAdminId: string,
    dto: HrUpdateEmployeeProfileDto,
  ) {
    // Defensive logging to debug invalid data
    console.log('HR UPDATE DTO:', JSON.stringify(dto, null, 2));
    
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }
    if (!Types.ObjectId.isValid(hrAdminId)) {
      throw new BadRequestException('Invalid HR admin id');
    }

    // Get current profile for audit trail
    const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
    if (!currentProfile) {
      throw new NotFoundException('Employee profile not found');
    }

    // Extract changeReason and build update object
    const { changeReason, ...updateFields } = dto;
    const update: Record<string, unknown> = {};
    const changedFields: string[] = [];
    const previousValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(updateFields)) {
      // Skip undefined, null, and empty strings
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Convert string IDs to ObjectIds for reference fields
      if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId'].includes(key) && typeof value === 'string') {
        update[key] = new Types.ObjectId(value);
      } else {
        update[key] = value;
      }
      changedFields.push(key);
      previousValues[key] = (currentProfile as any)[key];
      newValues[key] = value;
    }

    // Update fullName if first or last name changed
    if (updateFields.firstName || updateFields.lastName) {
      const firstName = updateFields.firstName || currentProfile.firstName;
      const lastName = updateFields.lastName || currentProfile.lastName;
      update.fullName = `${firstName} ${lastName}`;
      changedFields.push('fullName');
    }

    if (changedFields.length === 0) {
      throw new BadRequestException('No fields to update');
    }

    // Clean update object to remove invalid dates and null values before MongoDB update
    const cleanedUpdate = this.cleanUpdateDto(update);

    const updated = await this.profileModel
      .findByIdAndUpdate(employeeId, { $set: cleanedUpdate }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException('Failed to update employee profile');
    }

    // Sync triggers for HR update (master data edit)
    if (changedFields.includes('status')) {
      const oldStatus = previousValues['status'] ?? (currentProfile as any).status ?? '';
      const newStatus = newValues['status'] ?? update['status'] ?? '';
      this.syncService.emitStatusChanged(employeeId, String(oldStatus), String(newStatus));
    }
    if (changedFields.some((f) => ['primaryPositionId','primaryDepartmentId'].includes(f))) {
      this.syncService.emitHierarchyChanged(
        employeeId,
        this.toId(update['primaryPositionId']),
        this.toId(update['primaryDepartmentId']),
      );
    }
    if (changedFields.includes('payGradeId')) {
      this.syncService.emitPayGradeChanged(
        employeeId,
        this.toId(previousValues['payGradeId']),
        this.toId(newValues['payGradeId']),
      );
    }

    // Handle position assignment creation/update when primaryPositionId changes
    if (changedFields.includes('primaryPositionId')) {
      const newPositionId = update['primaryPositionId'] as Types.ObjectId | undefined;
      const employeeObjectId = new Types.ObjectId(employeeId);
      
      if (newPositionId) {
        // Get the position to find its departmentId
        const position = await this.positionModel.findById(newPositionId).lean().exec();
        if (!position) {
          throw new NotFoundException(`Position with ID ${newPositionId} not found`);
        }

        // Get departmentId from position
        let departmentId: Types.ObjectId;
        if (position.departmentId) {
          departmentId = position.departmentId instanceof Types.ObjectId 
            ? position.departmentId 
            : new Types.ObjectId(String(position.departmentId));
        } else {
          // If position has no department, use primaryDepartmentId from update or current profile
          const deptId = update['primaryDepartmentId'] || (updated as any)?.primaryDepartmentId;
          if (!deptId) {
            throw new BadRequestException(
              `Position ${newPositionId} has no department and no primaryDepartmentId provided`
            );
          }
          departmentId = deptId instanceof Types.ObjectId ? deptId : new Types.ObjectId(String(deptId));
        }

        // End any existing active assignments for this employee
        await this.positionAssignmentModel.updateMany(
          {
            employeeProfileId: employeeObjectId,
            endDate: null, // Only active assignments
          },
          {
            $set: { endDate: new Date() },
          },
        );

        // Create new position assignment
        const newAssignment = new this.positionAssignmentModel({
          employeeProfileId: employeeObjectId,
          positionId: newPositionId instanceof Types.ObjectId ? newPositionId : new Types.ObjectId(String(newPositionId)),
          departmentId: departmentId,
          startDate: new Date(),
          reason: changeReason || 'Position assignment updated via HR profile update',
        });

        await newAssignment.save();
        console.log(`Created position assignment for employee ${employeeId} to position ${newPositionId}`);
      } else {
        // If primaryPositionId is being cleared, end all active assignments
        await this.positionAssignmentModel.updateMany(
          {
            employeeProfileId: employeeObjectId,
            endDate: null,
          },
          {
            $set: { endDate: new Date() },
          },
        );
        console.log(`Ended all position assignments for employee ${employeeId}`);
      }
    }

    // Create audit log (BR 22)
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(hrAdminId),
      'HR_UPDATE',
      changedFields,
      previousValues,
      newValues,
      changeReason,
    );

    return {
      message: 'Employee profile updated successfully',
      employeeId: updated?._id,
      changedFields,
    };
  }

  /**
   * Get all change requests for HR approval/review (US-E2-03).
   * Can filter by status: PENDING, APPROVED, REJECTED, or ALL
   */
  async getAllChangeRequests(
    page = 1,
    limit = 20,
    status?: ProfileChangeStatus,
  ) {
    const skip = (page - 1) * limit;

    const filter = status ? { status } : {};

    const [requests, total] = await Promise.all([
      this.changeRequestModel
        .find(filter)
        .populate('employeeProfileId', 'employeeNumber firstName lastName fullName')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.changeRequestModel.countDocuments(filter).exec(),
    ]);

    return {
      data: requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all pending change requests for HR approval (US-E2-03).
   * @deprecated Use getAllChangeRequests instead
   */
  async getPendingChangeRequests(page = 1, limit = 20) {
    return this.getAllChangeRequests(page, limit, ProfileChangeStatus.PENDING);
  }

  /**
   * Process (approve/reject) a change request (US-E2-03).
   * If approved, applies the changes to the employee profile.
   * BR 22: All processing is audit logged.
   */
  async processChangeRequest(
    requestId: string,
    hrAdminId: string,
    dto: ProcessChangeRequestDto,
  ) {
      console.log(`[Service] Processing request ${requestId} by ${hrAdminId}`);
      
      // Validate HR Admin ID format
      if (!hrAdminId || !Types.ObjectId.isValid(hrAdminId)) {
        console.error(`[Service] Invalid HR Admin ID: ${hrAdminId}`);
        throw new BadRequestException(`Invalid HR admin id: ${hrAdminId}`);
      }

      let request: (EmployeeProfileChangeRequest & Document & { _id: Types.ObjectId }) | null = null;

      if (Types.ObjectId.isValid(requestId)) {
        request = await this.changeRequestModel.findById(requestId).exec();
      }

      if (!request) {
        request = await this.changeRequestModel.findOne({ requestId }).exec();
      }

      if (!request) {
        throw new NotFoundException('Change request not found');
      }

      const auditReference = request.requestId || request._id.toHexString();

      if (request.status !== ProfileChangeStatus.PENDING) {
        console.error(`[Service] Request ${requestId} status is ${request.status}, expected PENDING`);
        throw new BadRequestException(`Change request has already been processed (Status: ${request.status})`);
      }

      // Update request status
      request.status = dto.status;
      request.processedByEmployeeId = new Types.ObjectId(hrAdminId);
      request.processedAt = new Date();
      request.processingComments = dto.comments;
      await request.save();

      // If approved, apply changes to profile
      if (dto.status === ProfileChangeStatus.APPROVED && request.fieldChanges?.length > 0) {
        const update: Record<string, unknown> = {};
        const newValues: Record<string, unknown> = {};
        const currentProfile = await this.profileModel.findById(request.employeeProfileId).lean().exec() as EmployeeProfileDocument;

        // Determine which fields to apply
        const fieldsToApply = dto.approvedFields && dto.approvedFields.length > 0
          ? request.fieldChanges.filter(change => dto.approvedFields!.includes(change.fieldName))
          : request.fieldChanges;

        for (const change of fieldsToApply) {
          // Skip if newValue is undefined, null, or empty string
          if (change.newValue === undefined || change.newValue === null || change.newValue === '') {
            continue;
          }

          // Skip if newValue is the string "undefined" (shouldn't happen but defensive check)
          if (typeof change.newValue === 'string' && change.newValue.toLowerCase() === 'undefined') {
            continue;
          }

          // Convert string IDs to ObjectIds for reference fields
          if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId'].includes(change.fieldName)) {
            const newVal = change.newValue as string;
            if (Types.ObjectId.isValid(newVal)) {
              update[change.fieldName] = new Types.ObjectId(newVal);
            } else {
              // Skip invalid ObjectIds
              continue;
            }
          } else if (change.fieldName === 'dateOfBirth' && change.newValue) {
            // Convert date string to Date object
            const dateValue = change.newValue;
            if (typeof dateValue === 'string' || typeof dateValue === 'number' || dateValue instanceof Date) {
              const parsedDate = new Date(dateValue);
              if (isNaN(parsedDate.getTime())) {
                // Skip invalid dates
                continue;
              }
              update[change.fieldName] = parsedDate;
            } else {
              update[change.fieldName] = dateValue;
            }
          } else {
            update[change.fieldName] = change.newValue;
          }
          newValues[change.fieldName] = change.newValue;
        }

        // Log if partial approval
        if (dto.approvedFields && dto.approvedFields.length < request.fieldChanges.length) {
          console.log(`[Service] Partial approval: ${dto.approvedFields.length}/${request.fieldChanges.length} fields approved`);
        }

        // Keep fullName in sync when first/last name change
        if (update['firstName'] !== undefined || update['lastName'] !== undefined) {
          const newFirst = (update['firstName'] as string | undefined) ?? currentProfile?.firstName ?? '';
          const newLast = (update['lastName'] as string | undefined) ?? currentProfile?.lastName ?? ''; // currentProfile is guaranteed here
          update['fullName'] = `${newFirst} ${newLast}`.trim();
          newValues['fullName'] = update['fullName'];
        }

        // Clean update object to remove any invalid values before MongoDB update
        const cleanedUpdate = this.cleanUpdateDto(update);

        // Only update if there are valid fields to update
        if (Object.keys(cleanedUpdate).length > 0) {
          await this.profileModel.findByIdAndUpdate(
            request.employeeProfileId,
            { $set: cleanedUpdate },
            { new: true }
          ).exec();
        }

          // Sync triggers after approved change request
          const changedFieldNames = request.fieldChanges.map((f) => f.fieldName);
          if (changedFieldNames.some((f) => ['primaryPositionId','primaryDepartmentId'].includes(f))) {
            this.syncService.emitHierarchyChanged(
              String(request.employeeProfileId),
              this.toId(update['primaryPositionId']),
              this.toId(update['primaryDepartmentId']),
            );
          }
          if (changedFieldNames.includes('payGradeId')) {
            this.syncService.emitPayGradeChanged(
              String(request.employeeProfileId),
              undefined,
              this.toId(update['payGradeId']),
            );
          }
          if (changedFieldNames.includes('status')) {
            const oldStatus = request.fieldChanges.find(f => f.fieldName==='status')?.oldValue;
            const oldStatusStr = typeof oldStatus === 'string' ? oldStatus : undefined;
            const newStatusStr = typeof update['status'] === 'string' ? update['status'] : undefined;
            this.syncService.emitStatusChanged(
              String(request.employeeProfileId),
              oldStatusStr ?? '',
              newStatusStr ?? '',
            );
          }
        // Audit log for approval
        await this.createAuditLog(
          request.employeeProfileId,
          new Types.ObjectId(hrAdminId),
          'CHANGE_REQUEST_APPROVED',
          request.fieldChanges.map((f) => f.fieldName),
          Object.fromEntries(request.fieldChanges.map((f) => [f.fieldName, f.oldValue])),
          newValues,
          dto.comments,
          auditReference,
        );

        // Create notification for approval
        await this.notificationModel.create({
          employeeId: request.employeeProfileId,
          type: NotificationType.CHANGE_REQUEST_APPROVED,
          title: 'Change Request Approved',
          message: `Your change request has been approved and applied to your profile.`,
          relatedId: requestId,
        });

      } else {
        // Audit log for rejection
        await this.createAuditLog(
          request.employeeProfileId,
          new Types.ObjectId(hrAdminId),
          'CHANGE_REQUEST_REJECTED',
          [],
          undefined,
          undefined,
          dto.comments,
          auditReference,
        );

        // Create notification for rejection
        await this.notificationModel.create({
          employeeId: request.employeeProfileId,
          type: NotificationType.CHANGE_REQUEST_REJECTED,
          title: 'Change Request Rejected',
          message: `Your change request has been rejected. ${dto.comments || ''}`,
          relatedId: requestId,
        });

      }

      return {
        message: `Change request ${dto.status.toLowerCase()}`,
        requestId: auditReference,
        status: dto.status,
      };
  }

  /**
   * Delete a change request (US-E2-03).
   * Allows HR Admin, HR Manager, and System Admin to delete requests.
   */
  async deleteChangeRequest(requestId: string, userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    let request: (EmployeeProfileChangeRequest & Document & { _id: Types.ObjectId }) | null = null;

    if (Types.ObjectId.isValid(requestId)) {
      request = await this.changeRequestModel.findById(requestId).exec();
    }

    if (!request) {
      request = await this.changeRequestModel.findOne({ requestId }).exec();
    }

    if (!request) {
      throw new NotFoundException('Change request not found');
    }

    // Log the deletion
    await this.createAuditLog(
      request.employeeProfileId,
      new Types.ObjectId(userId),
      'CHANGE_REQUEST_DELETED',
      ['requestId'],
      { requestId: request.requestId },
      { requestId: 'DELETED' },
      request.requestDescription,
    );

    await this.changeRequestModel.findByIdAndDelete(request._id).exec();

    return { message: 'Change request deleted successfully' };
  }

  /**
   * Deactivate employee profile (US-EP-05).
   * PERMANENTLY DELETES the employee and all related records.
   * Used for termination, resignation, retirement, or account removal.
   * BR 3j: Employee status definition for system access control.
   */
  async deactivateEmployee(
    employeeId: string,
    hrAdminId: string,
    dto: DeactivateEmployeeDto,
  ) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }
    if (!Types.ObjectId.isValid(hrAdminId)) {
      throw new BadRequestException('Invalid HR admin id');
    }

    const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
    if (!currentProfile) {
      throw new NotFoundException('Employee profile not found');
    }

    const previousStatus = currentProfile.status;
    const employeeNumber = currentProfile.employeeNumber;
    const fullName = currentProfile.fullName || `${currentProfile.firstName} ${currentProfile.lastName}`;

    // Create final audit log before deletion (BR 22)
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(hrAdminId),
      'PERMANENT_DELETE',
      ['status', 'account'],
      { status: previousStatus, account: 'active' },
      { status: dto.deactivationReason, account: 'deleted' },
      dto.notes,
    );

    // Delete all related records
    const [rolesDeleted, changeRequestsDeleted, qualificationsDeleted] = await Promise.all([
      this.systemRoleModel.deleteMany({ employeeProfileId: new Types.ObjectId(employeeId) }).exec(),
      this.changeRequestModel.deleteMany({ employeeProfileId: new Types.ObjectId(employeeId) }).exec(),
      this.qualificationModel.deleteMany({ employeeProfileId: new Types.ObjectId(employeeId) }).exec(),
      // Keep audit logs for compliance, or delete them if needed
      // this.auditLogModel.deleteMany({ employeeProfileId: new Types.ObjectId(employeeId) }).exec(),
    ]);

    // Status sync trigger before deletion
    this.syncService.emitStatusChanged(employeeId, previousStatus, 'DELETED');

    // Delete the employee profile itself
    await this.profileModel.findByIdAndDelete(employeeId).exec();

    return {
      message: `Employee account permanently deleted`,
      employeeId,
      employeeNumber,
      fullName,
      previousStatus,
      deletedRecords: {
        roles: rolesDeleted.deletedCount,
        changeRequests: changeRequestsDeleted.deletedCount,
        qualifications: qualificationsDeleted.deletedCount,
      },
    };
  }

  /**
   * Assign roles and permissions to employee (US-E7-05).
   * BR 20a: Only authorized roles can modify access permissions.
   */
  async assignRoles(
    employeeId: string,
    hrAdminId: string,
    dto: AssignRolesDto,
  ) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }
    if (!Types.ObjectId.isValid(hrAdminId)) {
      throw new BadRequestException('Invalid HR admin id');
    }

    // Verify employee exists
    const employee = await this.profileModel.findById(employeeId).select('_id').lean().exec();
    if (!employee) {
      throw new NotFoundException('Employee profile not found');
    }

    // Get current roles for audit
    const currentRoles = await this.systemRoleModel
      .findOne({ employeeProfileId: new Types.ObjectId(employeeId) })
      .lean()
      .exec();

    const previousRoles = currentRoles?.roles || [];
    const previousPermissions = currentRoles?.permissions || [];

    // Upsert the role assignment
    const result = await this.systemRoleModel.findOneAndUpdate(
      { employeeProfileId: new Types.ObjectId(employeeId) },
      {
        $set: {
          roles: dto.roles,
          permissions: dto.permissions || [],
          isActive: dto.isActive ?? true,
        },
      },
      { upsert: true, new: true },
    ).exec();

    // Audit log (BR 22)
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(hrAdminId),
      'ROLE_ASSIGNMENT',
      ['roles', 'permissions', 'isActive'],
      { roles: previousRoles, permissions: previousPermissions },
      { roles: dto.roles, permissions: dto.permissions || [], isActive: dto.isActive ?? true },
      dto.reason,
    );

    return {
      message: 'Roles assigned successfully',
      employee,
      roles: dto.roles,
      permissions: dto.permissions || [],
    };
  }

  /**
   * Get employee roles (for checking permissions).
   */
  async getEmployeeRoles(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    const roles = await this.systemRoleModel
      .findOne({ employeeProfileId: new Types.ObjectId(employeeId) })
      .lean()
      .exec();

    return roles || { roles: [], permissions: [], isActive: false };
  }

  /**
   * Get list of HR Managers for dropdown selection.
   * Returns employees with HR_MANAGER role.
   */
  async getHrManagersList() {
    // Find all active system roles with HR_MANAGER role
    const hrManagerRoles = await this.systemRoleModel
      .find({
        roles: { $in: [SystemRole.HR_MANAGER] },
        isActive: true,
      })
      .lean()
      .exec();

    if (hrManagerRoles.length === 0) {
      return [];
    }

    // Extract employee profile IDs
    const employeeIds = hrManagerRoles
      .map((role) => role.employeeProfileId)
      .filter((id) => id)
      .map((id) => (id instanceof Types.ObjectId ? id : new Types.ObjectId(id)));

    // Get employee profiles
    const employees = await this.profileModel
      .find({
        _id: { $in: employeeIds },
        status: EmployeeStatus.ACTIVE,
      })
      .select('employeeNumber firstName lastName fullName workEmail')
      .lean()
      .exec();

    // Format response
    return employees.map((emp) => ({
      _id: emp._id.toString(),
      id: emp._id.toString(),
      employeeNumber: emp.employeeNumber,
      name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`,
      workEmail: emp.workEmail,
    }));
  }

  /**
   * Get audit history for an employee (BR 22).
   */
  async getAuditHistory(employeeId: string, page = 1, limit = 50) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find({ employeeProfileId: new Types.ObjectId(employeeId) })
        .populate('performedByEmployeeId', 'employeeNumber firstName lastName fullName')
        .sort({ performedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments({ employeeProfileId: new Types.ObjectId(employeeId) }).exec(),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Helper method to check if two field arrays match exactly
   * @param ruleFields - Field names from the workflow rule
   * @param requestedFields - Field names from the change request (already sorted)
   * @returns true if arrays contain the same elements in the same order
   */
  private isExactFieldMatch(ruleFields: string[], requestedFields: string[]): boolean {
    const sortedRuleFields = [...ruleFields].sort();
    return (
      sortedRuleFields.length === requestedFields.length &&
      sortedRuleFields.every((field, index) => field === requestedFields[index])
    );
  }

  /**
   * Get notifications for an employee
   */
  async getNotifications(employeeId: string, unreadOnly = false) {
    if (!employeeId) {
      throw new BadRequestException('Employee ID is required');
    }

    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException(`Invalid employee id: ${employeeId}`);
    }

    try {
      const filter: any = { employeeId: new Types.ObjectId(employeeId) };
      if (unreadOnly) {
        filter.read = false;
      }

      const notifications = await this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
        .exec();

      // Log for debugging (remove in production if needed)
      console.log(`[Notifications] Found ${notifications.length} notifications for employee ${employeeId} (unreadOnly: ${unreadOnly})`);

      return notifications || [];
    } catch (error) {
      console.error(`[Notifications] Error fetching notifications for employee ${employeeId}:`, error);
      throw new BadRequestException(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(employeeId: string, notificationId: string) {
    if (!Types.ObjectId.isValid(employeeId) || !Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestException('Invalid id');
    }

    const notification = await this.notificationModel.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(notificationId),
        employeeId: new Types.ObjectId(employeeId)
      },
      { 
        $set: { read: true, readAt: new Date() }
      },
      { new: true }
    ).exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  /**
   * Mark all notifications as read for an employee
   */
  async markAllNotificationsAsRead(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    await this.notificationModel.updateMany(
      { employeeId: new Types.ObjectId(employeeId), read: false },
      { $set: { read: true, readAt: new Date() } }
    ).exec();

    return { message: 'All notifications marked as read' };
  }

  /**
   * Notify HR Admins, HR Managers, and System Admins when a change request is submitted
   */
  private async notifyHRAdminsOfChangeRequest(
    changeRequest: any,
    requestingEmployeeId: string,
  ): Promise<void> {
    try {
      // Get the requesting employee's name for the notification
      const requestingEmployee = await this.profileModel
        .findById(requestingEmployeeId)
        .select('firstName lastName fullName employeeNumber')
        .lean()
        .exec();

      const employeeName = requestingEmployee?.fullName || 
        `${requestingEmployee?.firstName || ''} ${requestingEmployee?.lastName || ''}`.trim() ||
        `Employee #${requestingEmployee?.employeeNumber || requestingEmployeeId}`;

      // Find all HR Admins, HR Managers, and System Admins
      const hrRoles = await this.systemRoleModel
        .find({
          isActive: true,
          roles: {
            $in: [
              SystemRole.HR_ADMIN,
              SystemRole.HR_MANAGER,
              SystemRole.SYSTEM_ADMIN,
            ],
          },
        })
        .select('employeeProfileId')
        .lean()
        .exec();

      if (hrRoles.length === 0) {
        console.log('[Notifications] No HR Admins/Managers found to notify');
        return;
      }

      // Create notifications for each HR admin/manager
      const notifications = hrRoles.map((roleDoc) => ({
        employeeId: roleDoc.employeeProfileId,
        type: NotificationType.CHANGE_REQUEST_SUBMITTED,
        title: 'New Change Request Pending Review',
        message: `A new change request (${changeRequest.requestId}) has been submitted by ${employeeName} and requires your review.`,
        relatedId: changeRequest.requestId,
        read: false,
      }));

      await this.notificationModel.insertMany(notifications);
      console.log(`[Notifications] Sent ${notifications.length} notifications to HR Admins/Managers for change request ${changeRequest.requestId}`);
    } catch (error) {
      console.error('[Notifications] Error notifying HR Admins of change request:', error);
      // Don't throw - notification failure shouldn't break the request submission
    }
  }
}
