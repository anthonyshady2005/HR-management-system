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
import { Model, Types, FilterQuery } from 'mongoose';
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
import { AppraisalRecord } from '../performance/models/appraisal-record.schema';
import { UpdateSelfEmployeeProfileDto } from './dto/update-self-profile.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { HrUpdateEmployeeProfileDto } from './dto/hr-update-employee-profile.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { DeactivateEmployeeDto } from './dto/deactivate-employee.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { EmployeeQualification } from './models/qualification.schema';
import { ChangeWorkflowRule } from './workflow-rule.schema';
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
  // Identity/legal status related
  'firstName',
  'middleName',
  'lastName',
  'nationalId',
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
    @InjectModel(AppraisalRecord.name)
    private readonly appraisalRecordModel: Model<AppraisalRecord>,
    @InjectModel(ProfileAuditLog.name)
    private readonly auditLogModel: Model<ProfileAuditLog>,
    @InjectModel(EmployeeSystemRole.name)
    private readonly systemRoleModel: Model<EmployeeSystemRole>,
    @InjectModel(EmployeeQualification.name)
    private readonly qualificationModel: Model<EmployeeQualification>,
    // Notifications
    @InjectModel(ChangeWorkflowRule.name)
    private readonly workflowRuleModel: Model<ChangeWorkflowRule>,
      private readonly syncService: ProfileSyncService,
  ) {}

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
      .populate('payGradeId')
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

    return {
      id: profile._id,
      employeeNumber: profile.employeeNumber,
      name: profile.fullName || `${profile.firstName} ${profile.lastName}`,
      status: profile.status,
      dateOfHire: profile.dateOfHire,
      payGrade: profile.payGradeId || null,
      position: profile.primaryPositionId || null,
      department: profile.primaryDepartmentId || null,
      contact: {
        email: profile.workEmail || profile.personalEmail,
        mobilePhone: profile.mobilePhone,
        address: profile.address,
      },
      biography: profile.biography,
      profilePictureUrl: profile.profilePictureUrl,
      lastAppraisal: lastAppraisal || null,
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
    // Validate ObjectId before database query to prevent Mongoose CastError
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    // Get current profile for audit trail (BR 22)
    const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
    if (!currentProfile) throw new NotFoundException('Profile not found');

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

    const updated = await this.profileModel
      .findByIdAndUpdate(employeeId, { $set: update }, { new: true })
      .lean()
      .exec();

    // Create audit log for self-service update (BR 22)
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(employeeId), // Employee updating their own profile
      'SELF_UPDATE',
      changedFields,
      previousValues,
      newValues,
    );


    return { message: 'Profile updated', profileId: updated?._id };
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
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const description = dto.fields
      .map(
        (f) =>
          `${f.fieldName}: '${String(f.oldValue)}' -> '${String(f.newValue)}'`,
      )
      .join('; ');
    const created = await this.changeRequestModel.create({
      requestId,
      employeeProfileId: new Types.ObjectId(employeeId),
      requestDescription: description,
      fieldChanges: dto.fields,
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
      // Apply changes immediately
      const update: Record<string, unknown> = {};
      for (const change of dto.fields) {
        if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId', 'payGradeId'].includes(change.fieldName)) {
          update[change.fieldName] = new Types.ObjectId(String(change.newValue));
        } else {
          update[change.fieldName] = change.newValue;
        }
      }
      await this.profileModel.findByIdAndUpdate(employeeId, { $set: update }).exec();
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

    return {
      message: 'Change request submitted',
      requestId: created.requestId,
      status: created.status,
    };
  }

  // ========== MANAGER TEAM VIEW (US-E4-01, US-E4-02) ==========

  /**
   * Get team members who report to the manager's position.
   * Excludes sensitive fields per BR 18b (privacy restrictions for line managers).
   * BR 41b: Direct managers see their team only.
   */
  async getTeamMembers(managerId: string) {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager id');
    }

    // Get manager's profile to find their position
    const manager = await this.profileModel
      .findById(managerId)
      .select('primaryPositionId')
      .lean()
      .exec();

    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    if (!manager.primaryPositionId) {
      // Manager has no position assigned, return empty team
      return { teamMembers: [], count: 0 };
    }

    // Find employees whose supervisorPositionId matches manager's primaryPositionId
    const teamMembers = await this.profileModel
      .find({ supervisorPositionId: manager.primaryPositionId })
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
        id: member._id,
        name: member.fullName || `${member.firstName} ${member.lastName}`,
        status: member.status,
        position: member.primaryPositionId || null,
        department: member.primaryDepartmentId || null,
        dateOfHire: member.dateOfHire,
      })),
      count: teamMembers.length,
    };
  }

  /**
   * Get summary of team's job titles and departments (US-E4-02).
   * Aggregated view without individual employee details.
   */
  async getTeamSummary(managerId: string) {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager id');
    }

    const manager = await this.profileModel
      .findById(managerId)
      .select('primaryPositionId primaryDepartmentId')
      .populate('primaryDepartmentId', 'code name')
      .lean()
      .exec();

    if (!manager) {
      throw new NotFoundException('Manager profile not found');
    }

    if (!manager.primaryPositionId) {
      return {
        managerDepartment: manager.primaryDepartmentId || null,
        totalTeamMembers: 0,
        byPosition: [],
        byDepartment: [],
        byStatus: [],
      };
    }

    // Aggregate team by position
    const byPosition = await this.profileModel.aggregate([
      { $match: { supervisorPositionId: manager.primaryPositionId } },
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
      { $match: { supervisorPositionId: manager.primaryPositionId } },
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
      { $match: { supervisorPositionId: manager.primaryPositionId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalTeamMembers = byStatus.reduce((sum, s) => sum + s.count, 0);

    return {
      managerDepartment: manager.primaryDepartmentId || null,
      totalTeamMembers,
      byPosition,
      byDepartment,
      byStatus,
    };
  }

  // ========== HR ADMIN SEARCH (US-E6-03) ==========

  /**
   * Search employees by various criteria.
   * Only accessible by HR Admin roles (enforced at controller level).
   */
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
        .populate('payGradeId', 'name minSalary maxSalary')
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
      employees: employees.map((emp) => ({
        id: emp._id,
        employeeNumber: emp.employeeNumber,
        name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
        workEmail: emp.workEmail,
        personalEmail: emp.personalEmail,
        mobilePhone: emp.mobilePhone,
        status: emp.status,
        position: emp.primaryPositionId || null,
        department: emp.primaryDepartmentId || null,
        payGrade: emp.payGradeId || null,
        dateOfHire: emp.dateOfHire,
        profilePictureUrl: emp.profilePictureUrl,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
      .populate('payGradeId')
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
  async hrUpdateEmployeeProfile(
    employeeId: string,
    hrAdminId: string,
    dto: HrUpdateEmployeeProfileDto,
  ) {
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
      if (value !== undefined) {
        // Convert string IDs to ObjectIds for reference fields
        if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId', 'payGradeId'].includes(key) && typeof value === 'string') {
          update[key] = new Types.ObjectId(value);
        } else {
          update[key] = value;
        }
        changedFields.push(key);
        previousValues[key] = (currentProfile as any)[key];
        newValues[key] = value;
      }
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

    const updated = await this.profileModel
      .findByIdAndUpdate(employeeId, { $set: update }, { new: true })
      .lean()
      .exec();

    // Sync triggers for HR update (master data edit)
    if (changedFields.includes('status')) {
      this.syncService.emitStatusChanged(employeeId, String(previousValues['status']), String(newValues['status']));
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
   * Get all pending change requests for HR approval (US-E2-03).
   */
  async getPendingChangeRequests(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      this.changeRequestModel
        .find({ status: ProfileChangeStatus.PENDING })
        .populate('employeeProfileId', 'employeeNumber firstName lastName fullName')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.changeRequestModel.countDocuments({ status: ProfileChangeStatus.PENDING }).exec(),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    if (!Types.ObjectId.isValid(hrAdminId)) {
      throw new BadRequestException('Invalid HR admin id');
    }

    const request = await this.changeRequestModel.findOne({ requestId }).exec();
    if (!request) {
      throw new NotFoundException('Change request not found');
    }

    if (request.status !== ProfileChangeStatus.PENDING) {
      throw new BadRequestException('Change request has already been processed');
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

      for (const change of request.fieldChanges) {
        // Convert string IDs to ObjectIds for reference fields
        if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId', 'payGradeId'].includes(change.fieldName)) {
          update[change.fieldName] = new Types.ObjectId(change.newValue as string);
        } else {
          update[change.fieldName] = change.newValue;
        }
        newValues[change.fieldName] = change.newValue;
      }

      await this.profileModel.findByIdAndUpdate(
        request.employeeProfileId,
        { $set: update },
      ).exec();

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
        requestId,
      );

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
        requestId,
      );

    }

    return {
      message: `Change request ${dto.status.toLowerCase()}`,
      requestId,
      status: dto.status,
    };
  }

  /**
   * Deactivate employee profile (US-EP-05).
   * Used for termination, resignation, retirement.
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
    const effectiveDate = dto.effectiveDate || new Date();

    await this.profileModel.findByIdAndUpdate(employeeId, {
      $set: {
        status: dto.status,
        statusEffectiveFrom: effectiveDate,
      },
    }).exec();

    // Status sync trigger on deactivation
    this.syncService.emitStatusChanged(employeeId, previousStatus, dto.status);

    // Audit log (BR 22)
    await this.createAuditLog(
      new Types.ObjectId(employeeId),
      new Types.ObjectId(hrAdminId),
      'DEACTIVATE',
      ['status', 'statusEffectiveFrom'],
      { status: previousStatus, statusEffectiveFrom: currentProfile.statusEffectiveFrom },
      { status: dto.status, statusEffectiveFrom: effectiveDate },
      dto.reason,
    );

    return {
      message: `Employee status changed to ${dto.status}`,
      employeeId,
      previousStatus,
      newStatus: dto.status,
      effectiveDate,
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
      employeeId,
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
}
