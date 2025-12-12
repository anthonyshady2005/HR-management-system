import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import {
  LeaveCategory,
  LeaveCategoryDocument,
} from './models/leave-category.schema';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from './models/leave-request.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import {
  LeaveEntitlement,
  LeaveEntitlementDocument,
} from './models/leave-entitlement.schema';
import {
  LeaveAdjustment,
  LeaveAdjustmentDocument,
} from './models/leave-adjustment.schema';
import { Calendar, CalendarDocument } from './models/calendar.schema';
import { Attachment, AttachmentDocument } from './models/attachment.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from '../organization-structure/models/position-assignment.schema';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../time-management/models/notification-log.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { HolidayType } from '../time-management/models/enums';
import {
  Holiday,
  HolidayDocument,
} from '../time-management/models/holiday.schema';
import { LeaveStatus } from './enums/leave-status.enum';
import { RoundingRule } from './enums/rounding-rule.enum';
import { AccrualMethod } from './enums/accrual-method.enum';
import { SystemRole, EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import { paySlip, PayslipDocument } from '../payroll-execution/models/payslip.schema';
import { employeePayrollDetails, employeePayrollDetailsDocument } from '../payroll-execution/models/employeePayrollDetails.schema';
import {AdjustmentType} from "./enums/adjustment-type.enum";
import {NotificationLogCreateDTO} from "../time-management/dto/notification-log-create.dto";
import {NotificationLogDetailsDTO} from "../time-management/dto/notification-log-details.dto";
import { Department, DepartmentDocument } from '../organization-structure/models/department.schema';
import { Position, PositionDocument } from '../organization-structure/models/position.schema';

@Injectable()
export class LeavesService {
  private readonly logger = new Logger(LeavesService.name);

  // For delegation workaround (in-memory storage)
  private delegationMap = new Map<
    string,
    {
      requestId: string;
      role: string;
      delegatorId: string;
      delegateId: string;
      createdAt: Date;
    }
  >();

  constructor(
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(LeaveCategory.name)
    private leaveCategoryModel: Model<LeaveCategoryDocument>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeavePolicy.name)
    private leavePolicyModel: Model<LeavePolicyDocument>,
    @InjectModel(LeaveEntitlement.name)
    private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeaveAdjustment.name)
    private leaveAdjustmentModel: Model<LeaveAdjustmentDocument>,
    @InjectModel(Calendar.name) private calendarModel: Model<CalendarDocument>,
    @InjectModel(Attachment.name)
    private attachmentModel: Model<AttachmentDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(PositionAssignment.name)
    private positionAssignmentModel: Model<PositionAssignmentDocument>,
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    @InjectModel('paySlip') private paySlipModel: Model<PayslipDocument>,
    @InjectModel(employeePayrollDetails.name)
    private employeePayrollDetailsModel: Model<employeePayrollDetailsDocument>,
    @InjectModel(Holiday.name)
    private holidayModel: Model<HolidayDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
  ) {}

  /**
   * Utility: fire-and-forget notification log
   */
  private async logNotification(
    to: string,
    type: string,
    message?: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(to)) {
      return;
    }
    try {
      await this.notificationLogModel.create({
        to: new Types.ObjectId(to),
        type,
        message,
      });
    } catch (err) {
      this.logger.error(
        `Failed to log notification to ${to} [${type}]`,
        err instanceof Error ? err.stack : undefined,
      );
    }
  }

  /**
   * Shared org helpers (used for manager resolution and approvals).
   * Priority: live position_assignments, then profile links, then department head.
   */
  private toObjectId(id?: string | Types.ObjectId): Types.ObjectId | null {
    if (!id) return null;
    if (id instanceof Types.ObjectId) return id;
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  }

  private async findActiveAssignmentByEmployee(
    employeeId: string,
    asOf: Date = new Date(),
  ) {
    const empId = this.toObjectId(employeeId);
    if (!empId) return null;

    return this.positionAssignmentModel
      .findOne({
        employeeProfileId: empId,
        startDate: { $lte: asOf },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: asOf } },
        ],
      })
      .populate('positionId')
      .lean()
      .exec();
  }

  private async findActiveOccupantByPosition(
    positionId?: string | Types.ObjectId,
    asOf: Date = new Date(),
  ): Promise<string | null> {
    const posId = this.toObjectId(positionId);
    if (!posId) return null;

    const assignment = await this.positionAssignmentModel
      .findOne({
        positionId: posId,
        startDate: { $lte: asOf },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: asOf } },
        ],
      })
      .lean()
      .exec();

    return assignment?.employeeProfileId
      ? assignment.employeeProfileId.toString()
      : null;
  }

  private async resolveDepartmentHeadOccupant(
    departmentId?: string | Types.ObjectId,
    asOf: Date = new Date(),
  ): Promise<string | null> {
    const depId = this.toObjectId(departmentId);
    if (!depId) return null;

    const department = await this.departmentModel
      .findById(depId)
      .select('headPositionId')
      .lean()
      .exec();

    if (!department?.headPositionId) {
      return null;
    }

    return this.findActiveOccupantByPosition(department.headPositionId, asOf);
  }

  private async getEmployeeProfileOrgLinks(employeeId: string) {
    return this.employeeProfileModel
      .findById(employeeId)
      .select('primaryPositionId primaryDepartmentId supervisorPositionId')
      .lean()
      .exec();
  }

  private async getPositionById(positionId?: string | Types.ObjectId) {
    const posId = this.toObjectId(positionId);
    if (!posId) return null;
    return this.positionModel.findById(posId).lean().exec();
  }

  private async getEmployeeCurrentPositionId(
    employeeId: string,
    asOf: Date = new Date(),
  ): Promise<string | null> {
    const assignment = await this.findActiveAssignmentByEmployee(employeeId, asOf);
    if (assignment?.positionId) {
      const populated = assignment.positionId as any;
      if (populated?._id) {
        return populated._id.toString();
      }
      if (assignment.positionId) {
        return assignment.positionId.toString();
      }
    }

    const profile = await this.getEmployeeProfileOrgLinks(employeeId);
    return profile?.primaryPositionId
      ? profile.primaryPositionId.toString()
      : null;
  }

  private async isDeptHeadForEmployee(
    headId: string,
    employeeId: string,
  ): Promise<boolean> {
    console.log('[isDeptHeadForEmployee] Checking:', { headId, employeeId });

    const headDepartments = await this.getDepartmentsForHead(headId);
    console.log('[isDeptHeadForEmployee] Head departments:', headDepartments);

    if (!headDepartments.length) {
      console.log('[isDeptHeadForEmployee] No departments found for head');
      return false;
    }

    const deptSet = new Set(headDepartments.map((d) => d.id));

    const profile = await this.employeeProfileModel
      .findById(employeeId)
      .select('primaryDepartmentId')
      .lean()
      .exec();

    console.log('[isDeptHeadForEmployee] Employee profile department:', profile?.primaryDepartmentId?.toString());

    if (profile?.primaryDepartmentId) {
      if (deptSet.has(profile.primaryDepartmentId.toString())) {
        console.log('[isDeptHeadForEmployee] Match found via profile department!');
        return true;
      }
    }

    const assignment = await this.findActiveAssignmentByEmployee(employeeId);
    console.log('[isDeptHeadForEmployee] Employee assignment department:', assignment?.departmentId?.toString());

    if (assignment?.departmentId) {
      if (deptSet.has(assignment.departmentId.toString())) {
        console.log('[isDeptHeadForEmployee] Match found via assignment department!');
        return true;
      }
    }

    // Fallback: any historical assignment (ignoring dates) to capture edge cases
    const anyAssignment = await this.positionAssignmentModel
      .findOne({ employeeProfileId: new Types.ObjectId(employeeId) })
      .select('departmentId')
      .lean()
      .exec();
    if (anyAssignment?.departmentId) {
      if (deptSet.has(anyAssignment.departmentId.toString())) {
        return true;
      }
    }

    return false;
  }

  /**
   * Departments managed by a user (as head) using active assignments -> headPositionId match.
   * Fallback: primaryDepartmentId on profile.
   */
  async getDepartmentsForHead(
    employeeId: string,
  ): Promise<{ id: string; name?: string; code?: string }[]> {
    const now = new Date();
    const empId = this.toObjectId(employeeId);
    if (!empId) return [];

    const assignments = await this.positionAssignmentModel
      .find({
        employeeProfileId: empId,
        startDate: { $lte: now },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      })
      .select('positionId')
      .lean()
      .exec();

    const positionIds = Array.from(
      new Set(
        assignments
          .map((a) => this.toObjectId(a.positionId))
          .filter((id): id is Types.ObjectId => Boolean(id)),
      ),
    );

    const departments = positionIds.length
      ? await this.departmentModel
          .find({ headPositionId: { $in: positionIds } })
          .select('_id name code')
          .lean()
          .exec()
      : [];

    const deptMap = new Map<string, { id: string; name?: string; code?: string }>();
    departments.forEach((d) => {
      if (d?._id) deptMap.set(d._id.toString(), {
        id: d._id.toString(),
        name: (d as any).name,
        code: (d as any).code,
      });
    });

    if (!deptMap.size) {
      const profile = await this.getEmployeeProfileOrgLinks(employeeId);
      if (profile?.primaryDepartmentId) {
        const dept = await this.departmentModel
          .findById(profile.primaryDepartmentId)
          .select('_id name code')
          .lean()
          .exec();
        if (dept?._id) {
          deptMap.set(dept._id.toString(), {
            id: dept._id.toString(),
            name: (dept as any).name,
            code: (dept as any).code,
          });
        }
      }
    }

    return Array.from(deptMap.values());
  }

  /**
   * Create a notification log entry (exposed via controller API).
   */
  async createNotificationLog(
    dto: NotificationLogCreateDTO,
  ): Promise<NotificationLogDetailsDTO> {
    const created = await this.notificationLogModel.create(dto);
    const populated = await created.populate(
      'to',
      'fullName workEmail personalEmail',
    );
    return populated.toObject() as NotificationLogDetailsDTO;
  }

  /**
   * Get notification logs, optionally filtered by recipient.
   */
  async getNotificationLogs(to?: string): Promise<NotificationLogDetailsDTO[]> {
    const query: any = {};
    if (to) {
      query.to = Types.ObjectId.isValid(to) ? new Types.ObjectId(to) : to;
    }

    return this.notificationLogModel
      .find(query)
      .populate('to', 'fullName workEmail personalEmail')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  // ==================== LEAVE CATEGORIES ====================

  async createLeaveCategory(data: { name: string; description?: string }) {
    const existingCategory = await this.leaveCategoryModel.findOne({
      name: data.name,
    });
    if (existingCategory) {
      throw new ConflictException(
        'Leave category with this name already exists',
      );
    }

    const category = new this.leaveCategoryModel(data);
    return await category.save();
  }

  async getAllLeaveCategories() {
    return await this.leaveCategoryModel.find().exec();
  }

  async getLeaveCategoryById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }

    const category = await this.leaveCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Leave category not found');
    }
    return category;
  }

  async updateLeaveCategory(
    id: string,
    data: { name?: string; description?: string },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }

    const category = await this.leaveCategoryModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .exec();

    if (!category) {
      throw new NotFoundException('Leave category not found');
    }
    return category;
  }

  async deleteLeaveCategory(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }

    const category = await this.leaveCategoryModel.findByIdAndDelete(id).exec();
    if (!category) {
      throw new NotFoundException('Leave category not found');
    }
    return {
      message: 'Leave category deleted successfully',
      deletedCategory: category,
    };
  }

  // ==================== LEAVE TYPES ====================

  /**
   * Create a new leave type
   * @access HR Admin, HR Manager, System Admin only
   * @param data Leave type creation data
   * @returns Created leave type
   */
  async createLeaveType(data: {
    code: string;
    name: string;
    categoryId: string;
    description?: string;
    paid?: boolean;
    deductible?: boolean;
    requiresAttachment?: boolean;
    attachmentType?: string;
    minTenureMonths?: number;
    maxDurationDays?: number;
  }) {
    // Validate category exists
    if (!Types.ObjectId.isValid(data.categoryId)) {
      throw new BadRequestException('Invalid category ID format');
    }

    const categoryExists = await this.leaveCategoryModel.findById(
      data.categoryId,
    );
    if (!categoryExists) {
      throw new NotFoundException('Leave category not found');
    }

    // Check for duplicate code
    const existingType = await this.leaveTypeModel.findOne({ code: data.code });
    if (existingType) {
      throw new ConflictException('Leave type with this code already exists');
    }

    const leaveType = new this.leaveTypeModel(data);
    return await leaveType.save();
  }

  /**
   * Get all leave types
   * @access All authenticated users
   * @returns List of all leave types
   */
  async getAllLeaveTypes() {
    return await this.leaveTypeModel.find().populate('categoryId').exec();
  }

  /**
   * Get leave type by ID
   * @access All authenticated users
   * @param id Leave type ID
   * @returns Leave type details
   */
  async getLeaveTypeById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    const leaveType = await this.leaveTypeModel
      .findById(id)
      .populate('categoryId')
      .exec();

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }
    return leaveType;
  }

  /**
   * Get leave type by code
   * @access All authenticated users
   * @param code Leave type code
   * @returns Leave type details
   */
  async getLeaveTypeByCode(code: string) {
    const leaveType = await this.leaveTypeModel
      .findOne({ code })
      .populate('categoryId')
      .exec();

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }
    return leaveType;
  }

  /**
   * Update leave type
   * @access HR Admin, HR Manager, System Admin only
   * @param id Leave type ID
   * @param data Update data
   * @returns Updated leave type
   */
  async updateLeaveType(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      categoryId: string;
      description: string;
      paid: boolean;
      deductible: boolean;
      requiresAttachment: boolean;
      attachmentType: string;
      minTenureMonths: number;
      maxDurationDays: number;
    }>,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    if (data.categoryId && !Types.ObjectId.isValid(data.categoryId)) {
      throw new BadRequestException('Invalid category ID format');
    }

    const leaveType = await this.leaveTypeModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('categoryId')
      .exec();

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }
    return leaveType;
  }

  /**
   * Delete leave type
   * @access HR Admin, System Admin only
   * @param id Leave type ID
   * @returns Deletion confirmation
   */
  async deleteLeaveType(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    const leaveType = await this.leaveTypeModel.findByIdAndDelete(id).exec();
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }
    return {
      message: 'Leave type deleted successfully',
      deletedLeaveType: leaveType,
    };
  }

  // ==================== LEAVE POLICIES ====================

  async createLeavePolicy(data: {
    leaveTypeId: string;
    accrualMethod?: string;
    monthlyRate?: number;
    yearlyRate?: number;
    carryForwardAllowed?: boolean;
    maxCarryForward?: number;
    expiryAfterMonths?: number;
    roundingRule?: string;
    minNoticeDays?: number;
    maxConsecutiveDays?: number;
    eligibility?: Record<string, any>;
  }) {
    if (!Types.ObjectId.isValid(data.leaveTypeId)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    const leaveTypeExists = await this.leaveTypeModel.findById(
      data.leaveTypeId,
    );
    if (!leaveTypeExists) {
      throw new NotFoundException('Leave type not found');
    }

    const existingPolicy = await this.leavePolicyModel.findOne({
      leaveTypeId: data.leaveTypeId,
    });
    if (existingPolicy) {
      throw new ConflictException('Policy already exists for this leave type');
    }

    const policy = new this.leavePolicyModel(data);
    return await policy.save();
  }

  async getAllPolicies() {
    const policies = await this.leavePolicyModel.find().exec();

    // Skip policies with invalid or missing leaveTypeId to avoid ObjectId cast errors
    const validPolicies = policies.filter((pol) =>
      Types.ObjectId.isValid((pol as any).leaveTypeId),
    );

    return this.leavePolicyModel.populate(validPolicies, 'leaveTypeId');
  }

  async getLeavePolicyById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid policy ID format');
    }

    const policy = await this.leavePolicyModel
      .findById(id)
      .populate('leaveTypeId')
      .exec();

    if (!policy) {
      throw new NotFoundException('Leave policy not found');
    }
    return policy;
  }

  async getLeavePolicyByType(leaveTypeId: string) {
    if (!Types.ObjectId.isValid(leaveTypeId)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    const policy = await this.leavePolicyModel
      .findOne({ leaveTypeId })
      .populate('leaveTypeId')
      .exec();

    if (!policy) {
      throw new NotFoundException('Leave policy not found for this leave type');
    }
    return policy;
  }

  async updateLeavePolicy(
    id: string,
    data: Partial<{
      accrualMethod: string;
      monthlyRate: number;
      yearlyRate: number;
      carryForwardAllowed: boolean;
      maxCarryForward: number;
      expiryAfterMonths: number;
      roundingRule: string;
      minNoticeDays: number;
      maxConsecutiveDays: number;
      eligibility: Record<string, any>;
    }>,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid policy ID format');
    }

    const policy = await this.leavePolicyModel
      .findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('leaveTypeId')
      .exec();

    if (!policy) {
      throw new NotFoundException('Leave policy not found');
    }
    return policy;
  }

  async deleteLeavePolicy(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid policy ID format');
    }

    const policy = await this.leavePolicyModel.findByIdAndDelete(id).exec();
    if (!policy) {
      throw new NotFoundException('Leave policy not found');
    }
    return {
      message: 'Leave policy deleted successfully',
      deletedPolicy: policy,
    };
  }

  // ==================== LEAVE REQUESTS ====================

  async submitLeaveRequest(
    data: {
      employeeId: string;
      leaveTypeId: string;
      dates: { from: Date; to: Date };
      durationDays: number; // ignored, computed
      justification?: string;
      attachmentId?: string;
    },
    delegations?: Map<string, string>, // Optional: passed from controller
  ) {
    if (
      !Types.ObjectId.isValid(data.employeeId) ||
      !Types.ObjectId.isValid(data.leaveTypeId)
    ) {
      throw new BadRequestException('Invalid employee or leave type ID format');
    }

    const fromDate = new Date(data.dates.from);
    const toDate = new Date(data.dates.to);

    if (fromDate > toDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const leaveType = await this.leaveTypeModel.findById(data.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Enforce late submission window: allow backdated requests only within minNoticeDays
    const policy = await this.leavePolicyModel
      .findOne({ leaveTypeId: data.leaveTypeId })
      .exec();
    if (policy?.minNoticeDays !== undefined) {
      const now = new Date();
      if (fromDate < now) {
        const daysLate = Math.floor(
          (now.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysLate > policy.minNoticeDays) {
          throw new BadRequestException(
            `Late submission exceeds allowed window: ${daysLate} days late, policy permits ${policy.minNoticeDays} day(s)`,
          );
        }
      }
    }

    // Enforce blocked periods
    await this.checkBlockedPeriods(fromDate, toDate);

    // Compute net working days (excludes NATIONAL, ORGANIZATIONAL, WEEKLY_REST)
    const netDays = await this.calculateNetLeaveDays(
      data.employeeId,
      fromDate,
      toDate,
    );
    if (netDays <= 0) {
      throw new BadRequestException(
        'Requested period has no working days available',
      );
    }

    // Overlap check
    await this.checkOverlappingLeaves(data.employeeId, fromDate, toDate);

    // BR-41: Check cumulative limits FIRST (before balance check)
    const limitCheck = await this.checkCumulativeLimits(
      data.employeeId,
      data.leaveTypeId,
      netDays,
    );

    if (!limitCheck.withinLimit) {
      throw new BadRequestException(
        `Cumulative leave limit exceeded. Used ${limitCheck.used}/${limitCheck.limit} days in past 12 months. ` +
        `Requesting ${netDays} more would exceed limit.`,
      );
    }

    // Entitlement / balance check with auto-conversion support
    await this.ensurePaidBalanceOrThrow(
      data.employeeId,
      data.leaveTypeId,
      netDays,
    );

    // Document requirement check - simple single attachment ID
    await this.validateRequiredDocuments(
      data.leaveTypeId,
      netDays,
      data.attachmentId,
    );

    // REQ-020: Determine manager dynamically
    const managerId = await this.determineApprover(
      data.employeeId,
      delegations,
    );

    const request = new this.leaveRequestModel({
      ...data,
      dates: { from: fromDate, to: toDate },
      durationDays: netDays, // override client input
      attachmentId: data.attachmentId
        ? new Types.ObjectId(data.attachmentId)
        : undefined,
      approvalFlow: [
        {
          role: 'Manager',
          status: 'pending',
          decidedBy: managerId ? new Types.ObjectId(managerId) : undefined,
          comment: managerId
            ? undefined
            : 'No manager found - awaiting HR assignment',
        },
        { role: 'HR', status: 'pending' },
      ],
      status: LeaveStatus.PENDING,
      irregularPatternFlag: false,
    });

    // Note: paid/unpaid breakdown is derived from LeaveType.paid field
    // balanceCheck.paidDays and balanceCheck.unpaidDays indicate the split
    // No need to store in request - can be calculated on retrieval

    const saved = await request.save();

    // Track pending balance for paid leave types
    await this.addToPendingBalance(
      data.employeeId,
      data.leaveTypeId,
      netDays,
    );

    // Notify employee (submission acknowledgement)
    await this.logNotification(
      data.employeeId,
      'LEAVE_SUBMITTED',
      `Leave request submitted for ${fromDate.toDateString()} to ${toDate.toDateString()}`,
    );

    // Notify direct manager (action required)
    if (managerId) {
      await this.logNotification(
        managerId,
        'LEAVE_ACTION_REQUIRED',
        `New leave request awaiting your approval for employee ${data.employeeId}`,
      );
    }

    return saved;
  }

  async getAllLeaveRequests(filters?: {
    employeeId?: string;
    leaveTypeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    departmentId?: string | string[];
    sortBy?: 'dates.from' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const baseMatch: any = {};

    // Department scoping first: resolve employee IDs in given departments (profile primaryDepartmentId or active assignment snapshot)
    if (filters?.departmentId) {
      const deptIdsRaw = Array.isArray(filters.departmentId)
        ? filters.departmentId
        : [filters.departmentId];
      const deptIds = deptIdsRaw
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

      if (deptIdsRaw.length > 0 && deptIds.length === 0) {
        return [];
      }

      const now = new Date();
      const [profileEmployees, assignmentEmployees] = await Promise.all([
        this.employeeProfileModel
          .find({ primaryDepartmentId: { $in: deptIds } })
          .select('_id')
          .lean()
          .exec(),
        this.positionAssignmentModel
          .find({
            departmentId: { $in: deptIds },
            startDate: { $lte: now },
            $or: [
              { endDate: { $exists: false } },
              { endDate: null },
              { endDate: { $gte: now } },
            ],
          })
          .select('employeeProfileId')
          .lean()
          .exec(),
      ]);

      const employeeIds = new Set<string>();
      profileEmployees.forEach((e) => {
        if (e?._id) employeeIds.add(e._id.toString());
      });
      assignmentEmployees.forEach((e) => {
        const id = (e as any)?.employeeProfileId;
        if (id) employeeIds.add(id.toString());
      });

      if (!employeeIds.size) {
        return [];
      }

      const employeeObjectIds = Array.from(employeeIds).map((id) => new Types.ObjectId(id));
      baseMatch.$or = [
        { employeeId: { $in: employeeObjectIds } },
        { $expr: { $in: [{ $toString: '$employeeId' }, Array.from(employeeIds)] } },
      ];
    }

    if (filters?.employeeId) {
      const empId = filters.employeeId;
      if (Types.ObjectId.isValid(empId)) {
        // Match either as ObjectId or string (defensive in case documents store raw string)
        baseMatch.$or = [
          { employeeId: new Types.ObjectId(empId) },
          { $expr: { $eq: [{ $toString: '$employeeId' }, empId] } },
        ];
      } else {
        // Fallback: string comparison
        baseMatch.$expr = { $eq: [{ $toString: '$employeeId' }, empId] };
      }
    }

    if (filters?.leaveTypeId) {
      if (!Types.ObjectId.isValid(filters.leaveTypeId)) {
        throw new BadRequestException('Invalid leave type ID format');
      }
      baseMatch.leaveTypeId = new Types.ObjectId(filters.leaveTypeId);
    }

    if (filters?.status) {
      baseMatch.status = filters.status;
    }

    // Utility to validate and normalize employee id for downstream checks
    const employeeIdForChecks =
      (filters?.employeeId && Types.ObjectId.isValid(filters.employeeId))
        ? filters.employeeId
        : undefined;

    // Date range filter on request dates
    if (filters?.startDate || filters?.endDate) {
      const range: any = {};
      if (filters.startDate) {
        range.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        range.$lte = new Date(filters.endDate);
      }
      baseMatch['dates.from'] = range;
    }

    const sortField = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder === 'asc' ? 1 : -1;

    // Default path without department filter (aggregate to support $expr/$or matching)
    const pipeline: any[] = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'leavetypes',
          localField: 'leaveTypeId',
          foreignField: '_id',
          as: 'leaveType',
        },
      },
      { $unwind: { path: '$leaveType', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'employee_profiles',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: { path: '$employee', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachmentId',
          foreignField: '_id',
          as: 'attachment',
        },
      },
      { $unwind: { path: '$attachment', preserveNullAndEmptyArrays: true } },
      { $sort: { [sortField]: sortOrder } },
    ];

    return await this.leaveRequestModel.aggregate(pipeline).exec();
  }

  async getLeaveRequestById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave request ID format');
    }

    const request = await this.leaveRequestModel
      .findById(id)
      .populate('leaveTypeId')
      .populate('employeeId')
      .populate('attachmentId')
      .exec();

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }
    return request;
  }

  async updateLeaveRequestStatus(
    id: string,
    data: {
      status: LeaveStatus;
      decidedBy?: string;
      role?: string;
    },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave request ID format');
    }

    const request = await this.leaveRequestModel.findById(id).populate('leaveTypeId');
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Cancelled requests cannot be approved or rejected
    if (request.status === LeaveStatus.CANCELLED) {
      throw new BadRequestException('Cannot approve or reject a cancelled request');
    }

    const wasStatus = request.status;

    // Update individual approval step if role is provided
    if (data.role && data.decidedBy) {
      const flowIndex = request.approvalFlow.findIndex(
        (f) => f.role === data.role,
      );
      if (flowIndex !== -1) {
        request.approvalFlow[flowIndex].status = data.status;
        request.approvalFlow[flowIndex].decidedBy = new Types.ObjectId(
          data.decidedBy,
        );
        request.approvalFlow[flowIndex].decidedAt = new Date();
      } else {
        throw new BadRequestException(`Approval step with role '${data.role}' not found`);
      }
    }

    // Recalculate overall status from approval flow
    // Final status logic: any rejection = rejected, all approved = approved, otherwise pending
    const hasRejected = request.approvalFlow.some((s) => s.status === 'rejected');
    const allApproved = request.approvalFlow.every((s) => s.status === 'approved');

    if (hasRejected) {
      request.status = LeaveStatus.REJECTED; // Final - any rejection finalizes as rejected
    } else if (allApproved) {
      request.status = LeaveStatus.APPROVED; // Final - both Manager and HR must approve
    } else {
      request.status = LeaveStatus.PENDING; // Still waiting for remaining approvals
    }

    const saved = await request.save();

    // Balance updates based on OVERALL status changes (not individual step decisions)
    // Only deduct when overall status changes from non-approved to approved
    // Extract IDs properly (handle populated fields)
    const employeeIdStr = (request.employeeId as any)?._id?.toString() || (request.employeeId as any)?.toString();
    const leaveTypeIdStr = (request.leaveTypeId as any)?._id?.toString() || (request.leaveTypeId as any)?.toString();

    if (wasStatus !== LeaveStatus.APPROVED && saved.status === LeaveStatus.APPROVED) {
      // Final approval achieved - deduct balance
      await this.deductFromBalance(
        employeeIdStr,
        leaveTypeIdStr,
        request.durationDays,
      );

      // Sync with payroll: Handle paid/unpaid leave deductions/encashments
      await this.syncLeaveApprovalWithPayroll(
        employeeIdStr,
        leaveTypeIdStr,
        request.durationDays,
        request.dates.from,
        request.dates.to,
      );
    } else if (
      wasStatus === LeaveStatus.PENDING &&
      (saved.status === LeaveStatus.REJECTED || saved.status === LeaveStatus.CANCELLED)
    ) {
      // Rejection or cancellation - release pending balance
      await this.releasePendingBalance(
        employeeIdStr,
        leaveTypeIdStr,
        request.durationDays,
      );
    }

    const employeeId = employeeIdStr;
    const managerStep = request.approvalFlow.find((f) => f.role === 'Manager');
    const managerId = managerStep?.decidedBy?.toString();

    // Notify employee only on overall status change
    if (wasStatus !== saved.status) {
      await this.logNotification(
        employeeId,
        `LEAVE_${saved.status.toUpperCase()}`,
        `Your leave request status changed to ${saved.status}`,
      );
    } else {
      // Notify about step approval even if overall status unchanged
      await this.logNotification(
        employeeId,
        'LEAVE_STEP_UPDATE',
        `Your leave request was updated by ${data.role || 'approver'}`,
      );
    }

    // Notify manager when overall status becomes finalized (approved/rejected/cancelled)
    if (
      wasStatus !== saved.status &&
      [LeaveStatus.APPROVED, LeaveStatus.REJECTED, LeaveStatus.CANCELLED].includes(
        saved.status,
      ) &&
      managerId
    ) {
      await this.logNotification(
        managerId,
        `LEAVE_${saved.status.toUpperCase()}_NOTIFY`,
        `Leave request for employee ${employeeId} is now ${saved.status}`,
      );
    }

    return saved;
  }

  /**
   * Bulk update multiple leave requests at once
   * Allows HR managers to approve/reject multiple requests efficiently
   */
  async bulkUpdateLeaveRequests(
    requestIds: string[],
    status: LeaveStatus,
    decidedBy: string,
    role?: string,
  ): Promise<{
    successCount: number;
    failedCount: number;
    successfulIds: string[];
    failures: Array<{ requestId: string; error: string }>;
  }> {
    const results = {
      successCount: 0,
      failedCount: 0,
      successfulIds: [] as string[],
      failures: [] as Array<{ requestId: string; error: string }>,
    };

    // Process each request individually to ensure proper error handling and balance tracking
    for (const requestId of requestIds) {
      try {
        // Validate ID format
        if (!Types.ObjectId.isValid(requestId)) {
          throw new BadRequestException('Invalid request ID format');
        }

        // Use the existing updateLeaveRequestStatus method to ensure consistency
        await this.updateLeaveRequestStatus(requestId, {
          status,
          decidedBy,
          role,
        });

        results.successCount++;
        results.successfulIds.push(requestId);
      } catch (error) {
        results.failedCount++;
        results.failures.push({
          requestId,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    return results;
  }

  async cancelLeaveRequest(id: string, employeeId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid leave request ID format');
    }

    if (!employeeId) {
      throw new BadRequestException('Employee ID is required to cancel a request');
    }

    const employeeObjectId = Types.ObjectId.isValid(employeeId)
      ? new Types.ObjectId(employeeId)
      : null;

    // Fetch the request first
    const request = await this.leaveRequestModel.findById(id);

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Enforce ownership: the provided employeeId must match the request owner (string or ObjectId)
    const belongsToEmployee =
      request.employeeId?.toString() === employeeId ||
      (employeeObjectId &&
        request.employeeId instanceof Types.ObjectId &&
        request.employeeId.equals(employeeObjectId));

    if (!belongsToEmployee) {
      throw new NotFoundException(
        'Leave request not found or you do not have permission to cancel it',
      );
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    request.status = LeaveStatus.CANCELLED;
    const saved = await request.save();

    // Release pending back to remaining for paid leave
    await this.releasePendingBalance(
      request.employeeId.toString(),
      request.leaveTypeId.toString(),
      request.durationDays,
    );

    // Notify employee (self) and manager if available
    await this.logNotification(
      request.employeeId.toString(),
      'LEAVE_CANCELLED',
      'Your leave request has been cancelled',
    );

    const managerStep = request.approvalFlow.find((f) => f.role === 'Manager');
    const managerId = managerStep?.decidedBy?.toString();
    if (managerId) {
      await this.logNotification(
        managerId,
        'LEAVE_CANCELLED_NOTIFY',
        `Employee ${request.employeeId} cancelled their leave request`,
      );
    }

    return saved;
  }

  // ==================== LEAVE ENTITLEMENTS ====================

  /**
   * Fetch employee data from Employee Profile module
   * @param employeeId Employee ID
   * @returns Employee data needed for eligibility validation
   */
  private async getEmployeeDataForEligibility(employeeId: string): Promise<{
    tenureMonths: number;
    position?: string;
    contractType?: string;
    grade?: string;
    location?: string;
  } | null> {
    try {
      if (!Types.ObjectId.isValid(employeeId)) {
        this.logger.warn(
          `Invalid employeeId provided for eligibility lookup: ${employeeId}`,
        );
        return null;
      }

      // Get employee profile with pay grade snapshot
      const employee = await this.employeeProfileModel
        .findById(employeeId)
        .populate('payGradeId')
        .lean()
        .exec();

      if (!employee) {
        this.logger.warn(
          `Employee profile not found for eligibility validation: ${employeeId}`,
        );
        return null;
      }

      // Determine current position title (if any)
      const now = new Date();
      const assignment = await this.positionAssignmentModel
        .findOne({
          employeeProfileId: new Types.ObjectId(employeeId),
          startDate: { $lte: now },
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        })
        .populate('positionId')
        .lean()
        .exec();

      const positionDoc = assignment?.positionId as any;
      const position =
        positionDoc?.title || positionDoc?.code || positionDoc?.name;

      // Calculate tenure in months using hire date
      const hireDate = employee.dateOfHire
        ? new Date(employee.dateOfHire)
        : null;
      const tenureMonths =
        hireDate && !isNaN(hireDate.getTime())
          ? Math.max(
            0,
            Math.floor(
              (now.getTime() - hireDate.getTime()) /
              (1000 * 60 * 60 * 24 * 30),
            ),
          )
          : 0;

      const grade = (employee as any)?.payGradeId?.grade;
      const location =
        (employee as any)?.address?.city ||
        (employee as any)?.address?.country ||
        undefined;

      return {
        tenureMonths,
        position,
        contractType: employee.contractType,
        grade,
        location,
      };
    } catch (error) {
      this.logger.error(
        'Failed to fetch employee data from Employee Profile module',
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  /**
   * Validate employee eligibility against leave policy rules
   * REQ-007: Eligibility rules validation (automatic and internal)
   * @param employeeId Employee ID
   * @param leaveTypeId Leave type ID
   * @returns Validation result with eligibility status and reasons
   */
  private async validateEmployeeEligibility(
    employeeId: string,
    leaveTypeId: string,
  ): Promise<{
    eligible: boolean;
    reasons: string[];
    policy?: any;
  }> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid employee or leave type ID format');
    }

    // Get the leave policy for this leave type
    const policy = await this.leavePolicyModel
      .findOne({ leaveTypeId })
      .populate('leaveTypeId')
      .exec();

    if (!policy) {
      throw new NotFoundException('Leave policy not found for this leave type');
    }

    const reasons: string[] = [];
    let eligible = true;

    // If no eligibility rules defined, all employees are eligible
    if (!policy.eligibility) {
      return {
        eligible: true,
        reasons: ['No eligibility restrictions'],
        policy,
      };
    }

    // Fetch employee data from Employee Profile module
    const employeeData = await this.getEmployeeDataForEligibility(employeeId);

    // If Employee Profile is not integrated yet, allow entitlement creation with warning
    if (!employeeData) {
      reasons.push(
        'WARNING: Employee Profile module not integrated - eligibility validation skipped',
      );
      reasons.push(
        'INTEGRATION REQUIRED: Connect to Employee Profile to validate tenure, position, and contract type',
      );
      return { eligible: true, reasons, policy };
    }

    // Check minimum tenure requirement
    if (policy.eligibility.minTenureMonths !== undefined) {
      if (
        !employeeData.tenureMonths ||
        employeeData.tenureMonths < policy.eligibility.minTenureMonths
      ) {
        eligible = false;
        reasons.push(
          `Insufficient tenure: requires ${policy.eligibility.minTenureMonths} months, ` +
          `employee has ${employeeData.tenureMonths || 0} months`,
        );
      }
    }

    // Check position eligibility
    if (
      policy.eligibility.positionsAllowed &&
      Array.isArray(policy.eligibility.positionsAllowed)
    ) {
      if (policy.eligibility.positionsAllowed.length > 0) {
        if (
          !employeeData.position ||
          !policy.eligibility.positionsAllowed.includes(employeeData.position)
        ) {
          eligible = false;
          reasons.push(
            `Position not eligible: allowed positions are [${policy.eligibility.positionsAllowed.join(', ')}], ` +
            `employee position is '${employeeData.position || 'unknown'}'`,
          );
        }
      }
    }

    // Check contract type eligibility
    if (
      policy.eligibility.contractTypesAllowed &&
      Array.isArray(policy.eligibility.contractTypesAllowed)
    ) {
      if (policy.eligibility.contractTypesAllowed.length > 0) {
        if (
          !employeeData.contractType ||
          !policy.eligibility.contractTypesAllowed.includes(
            employeeData.contractType,
          )
        ) {
          eligible = false;
          reasons.push(
            `Contract type not eligible: allowed types are [${policy.eligibility.contractTypesAllowed.join(', ')}], ` +
            `employee contract type is '${employeeData.contractType || 'unknown'}'`,
          );
        }
      }
    }

    if (eligible) {
      reasons.push('Employee meets all eligibility criteria');
    }

    return { eligible, reasons, policy };
  }

  /**
   * Create entitlement with automatic eligibility validation
   * REQ-007: Set eligibility rules and validate before granting entitlement
   * Validation is done automatically and internally by fetching employee data from Employee Profile
   * @access HR Admin only
   */
  async createEntitlement(data: {
    employeeId: string;
    leaveTypeId: string;
    yearlyEntitlement?: number;
    accruedActual?: number;
    accruedRounded?: number;
    carryForward?: number;
  }) {
    if (
      !Types.ObjectId.isValid(data.employeeId) ||
      !Types.ObjectId.isValid(data.leaveTypeId)
    ) {
      throw new BadRequestException('Invalid employee or leave type ID format');
    }

    // Check if entitlement already exists
    const existing = await this.leaveEntitlementModel.findOne({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
    });

    if (existing) {
      throw new ConflictException(
        'Entitlement already exists for this employee and leave type',
      );
    }

    // Automatic eligibility validation (internal)
    // Fetches employee data from Employee Profile and validates against policy rules
    const validation = await this.validateEmployeeEligibility(
      data.employeeId,
      data.leaveTypeId,
    );

    if (!validation.eligible) {
      throw new BadRequestException(
        `Employee is not eligible for this leave type. Reasons: ${validation.reasons.join('; ')}`,
      );
    }

    // If yearlyEntitlement not provided, get it from policy
    // This implements the default entitlement based on policy (Vacation Package concept)
    let yearlyEntitlement = data.yearlyEntitlement;
    if (yearlyEntitlement === undefined) {
      const policy = await this.leavePolicyModel.findOne({
        leaveTypeId: data.leaveTypeId,
      });
      if (policy) {
        yearlyEntitlement = policy.yearlyRate || 0;
      }
    }

    const entitlement = new this.leaveEntitlementModel({
      ...data,
      yearlyEntitlement: yearlyEntitlement || 0,
      remaining: (yearlyEntitlement || 0) + (data.carryForward || 0),
    });

    return await entitlement.save();
  }

  /**
   * Create personalized/override entitlement (skips eligibility validation)
   * REQ-007: Personalized entitlements can be assigned to individuals
   *
   * Use this method when:
   * - Assigning custom entitlements that differ from standard policy
   * - Overriding eligibility rules for specific employees
   * - Creating exceptions to standard vacation packages
   *
   * Note: This bypasses automatic eligibility validation to allow HR Admin
   * flexibility in assigning custom entitlements
   *
   * @access HR Admin only
   */
  async createPersonalizedEntitlement(data: {
    employeeId: string;
    leaveTypeId: string;
    yearlyEntitlement?: number;
    accruedActual?: number;
    accruedRounded?: number;
    carryForward?: number;
    reason?: string;
  }) {
    if (
      !Types.ObjectId.isValid(data.employeeId) ||
      !Types.ObjectId.isValid(data.leaveTypeId)
    ) {
      throw new BadRequestException('Invalid employee or leave type ID format');
    }

    // Check if entitlement already exists
    const existing = await this.leaveEntitlementModel.findOne({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
    });

    if (existing) {
      throw new ConflictException(
        'Entitlement already exists for this employee and leave type. Use update endpoint to modify.',
      );
    }

    // Skip eligibility validation for personalized entitlements
    // This allows HR Admin to create exceptions and custom packages

    // If yearlyEntitlement not provided, get it from policy
    let yearlyEntitlement = data.yearlyEntitlement;
    if (yearlyEntitlement === undefined) {
      const policy = await this.leavePolicyModel.findOne({
        leaveTypeId: data.leaveTypeId,
      });
      if (policy) {
        yearlyEntitlement = policy.yearlyRate || 0;
      } else {
        yearlyEntitlement = 0;
      }
    }

    const entitlement = new this.leaveEntitlementModel({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      yearlyEntitlement: yearlyEntitlement,
      accruedActual: data.accruedActual || 0,
      accruedRounded: data.accruedRounded || 0,
      carryForward: data.carryForward || 0,
      remaining: yearlyEntitlement + (data.carryForward || 0),
    });

    return await entitlement.save();
  }

  /**
   * Create entitlements for multiple employees in batch
   * REQ-007: Batch entitlement creation for efficiency
   *
   * @param data Batch entitlement creation payload
   * @returns Summary of created, skipped, and failed entitlements
   * @access HR Admin only
   */
  async createBatchEntitlement(data: {
    employeeIds: string[];
    leaveTypeId: string;
    yearlyEntitlement?: number;
    accruedActual?: number;
    accruedRounded?: number;
    carryForward?: number;
    personalized?: boolean;
  }) {
    // Validate leave type ID
    if (!Types.ObjectId.isValid(data.leaveTypeId)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    // Validate all employee IDs
    const invalidEmployeeIds = data.employeeIds.filter(
      (id) => !Types.ObjectId.isValid(id),
    );
    if (invalidEmployeeIds.length > 0) {
      throw new BadRequestException(
        `Invalid employee ID format: ${invalidEmployeeIds.join(', ')}`,
      );
    }

    // Fetch leave policy for default values
    const policy = await this.leavePolicyModel.findOne({
      leaveTypeId: data.leaveTypeId,
    });

    const yearlyEntitlement =
      data.yearlyEntitlement !== undefined
        ? data.yearlyEntitlement
        : policy?.yearlyRate || 0;

    const result = {
      created: 0,
      skipped: 0,
      failed: 0,
      createdEmployeeIds: [] as string[],
      skippedEmployeeIds: [] as string[],
      errors: [] as { employeeId: string; error: string }[],
    };

    for (const employeeId of data.employeeIds) {
      try {
        // Check if entitlement already exists
        const existing = await this.leaveEntitlementModel.findOne({
          employeeId,
          leaveTypeId: data.leaveTypeId,
        });

        if (existing) {
          result.skipped++;
          result.skippedEmployeeIds.push(employeeId);
          continue;
        }

        // Validate employee exists
        const employee = await this.employeeProfileModel.findById(employeeId);
        if (!employee) {
          result.failed++;
          result.errors.push({
            employeeId,
            error: 'Employee not found',
          });
          continue;
        }

        // Skip if not personalized - validate eligibility
        if (!data.personalized) {
          const validation = await this.validateEmployeeEligibility(
            employeeId,
            data.leaveTypeId,
          );

          if (!validation.eligible) {
            result.failed++;
            result.errors.push({
              employeeId,
              error: `Not eligible: ${validation.reasons.join('; ')}`,
            });
            continue;
          }
        }

        // Create entitlement
        const entitlement = new this.leaveEntitlementModel({
          employeeId,
          leaveTypeId: data.leaveTypeId,
          yearlyEntitlement,
          accruedActual: data.accruedActual || 0,
          accruedRounded: data.accruedRounded || 0,
          carryForward: data.carryForward || 0,
          taken: 0,
          pending: 0,
          remaining: yearlyEntitlement + (data.carryForward || 0),
        });

        await entitlement.save();
        result.created++;
        result.createdEmployeeIds.push(employeeId);
      } catch (error) {
        result.failed++;
        result.errors.push({
          employeeId,
          error: error.message || 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Create entitlements for a group of employees based on filters
   * REQ-007: Group entitlement creation based on department, position, etc.
   *
   * @param data Group entitlement creation payload with filters
   * @returns Summary of created, skipped, and failed entitlements
   * @access HR Admin only
   */
  async createGroupEntitlement(data: {
    filters: {
      departmentId?: string;
      positionId?: string;
      contractType?: string;
      minTenure?: number;
    };
    leaveTypeId: string;
    yearlyEntitlement?: number;
    accruedActual?: number;
    accruedRounded?: number;
    carryForward?: number;
    personalized?: boolean;
  }) {
    // Validate leave type ID
    if (!Types.ObjectId.isValid(data.leaveTypeId)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    // Build employee query based on filters
    const employeeQuery: any = { status: EmployeeStatus.ACTIVE };

    if (data.filters.departmentId) {
      if (!Types.ObjectId.isValid(data.filters.departmentId)) {
        throw new BadRequestException('Invalid department ID format');
      }
      employeeQuery.departmentId = data.filters.departmentId;
    }

    if (data.filters.positionId) {
      if (!Types.ObjectId.isValid(data.filters.positionId)) {
        throw new BadRequestException('Invalid position ID format');
      }
      employeeQuery.positionId = data.filters.positionId;
    }

    if (data.filters.contractType) {
      employeeQuery.contractType = data.filters.contractType;
    }

    // Fetch employees matching the filters
    const employees = await this.employeeProfileModel.find(employeeQuery).exec();

    if (employees.length === 0) {
      throw new NotFoundException('No employees found matching the filters');
    }

    // Filter by tenure if specified
    let filteredEmployees = employees;
    if (data.filters.minTenure !== undefined && data.filters.minTenure > 0) {
      filteredEmployees = employees.filter((employee) => {
        const hireDate = employee.dateOfHire
          ? new Date(employee.dateOfHire)
          : new Date();
        const tenureMonths =
          (new Date().getTime() - hireDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30);
        return tenureMonths >= (data.filters.minTenure ?? 0);
      });
    }

    if (filteredEmployees.length === 0) {
      throw new NotFoundException(
        'No employees found matching the filters with minimum tenure',
      );
    }

    // Use batch creation for the filtered employees
    const employeeIds = filteredEmployees.map((emp) => emp._id.toString());

    return await this.createBatchEntitlement({
      employeeIds,
      leaveTypeId: data.leaveTypeId,
      yearlyEntitlement: data.yearlyEntitlement,
      accruedActual: data.accruedActual,
      accruedRounded: data.accruedRounded,
      carryForward: data.carryForward,
      personalized: data.personalized,
    });
  }

  async getEmployeeEntitlements(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID format');
    }

    return await this.leaveEntitlementModel
      .find({ employeeId })
      .populate('leaveTypeId')
      .exec();
  }

  async getEntitlementById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid entitlement ID format');
    }

    const entitlement = await this.leaveEntitlementModel
      .findById(id)
      .populate('leaveTypeId')
      .populate('employeeId')
      .exec();

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }
    return entitlement;
  }

  async getBalanceSummary(employeeId: string, leaveTypeId: string) {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const entitlement = await this.leaveEntitlementModel
      .findOne({ employeeId, leaveTypeId })
      .populate('leaveTypeId')
      .exec();

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    return {
      leaveType: entitlement.leaveTypeId,
      yearlyEntitlement: entitlement.yearlyEntitlement,
      carryForward: entitlement.carryForward,
      totalAvailable: entitlement.yearlyEntitlement + entitlement.carryForward,
      taken: entitlement.taken,
      pending: entitlement.pending,
      accruedActual: entitlement.accruedActual,
      accruedRounded: entitlement.accruedRounded,
      remaining: entitlement.remaining,
      lastAccrualDate: entitlement.lastAccrualDate,
      nextResetDate: entitlement.nextResetDate,
    };
  }

  /**
   * Helper method to calculate remaining balance consistently
   * Handles both upfront allocation (YEARLY) and incremental accrual (MONTHLY/QUARTERLY)
   * @param entitlement The entitlement document
   * @param policy The leave policy (optional, will be fetched if not provided)
   * @returns The calculated remaining balance
   */
  private async calculateRemainingBalance(
    entitlement: any,
    policy?: any,
  ): Promise<number> {
    // Fetch policy if not provided
    if (!policy) {
      policy = await this.leavePolicyModel
        .findOne({ leaveTypeId: entitlement.leaveTypeId })
        .exec();
    }

    // Calculate base allowance based on accrual method
    // For YEARLY accrual: use yearlyEntitlement (upfront allocation at year start)
    // For MONTHLY/QUARTERLY: use accruedRounded (incremental accrual over time)
    const baseAllowance =
      policy?.accrualMethod === AccrualMethod.YEARLY
        ? entitlement.yearlyEntitlement || 0
        : entitlement.accruedRounded || 0;

    return (
      (entitlement.carryForward || 0) +
      baseAllowance -
      (entitlement.taken || 0) -
      (entitlement.pending || 0)
    );
  }

  async updateBalance(
    id: string,
    data: {
      yearlyEntitlement?: number;
      accruedActual?: number;
      accruedRounded?: number;
      carryForward?: number;
      taken?: number;
      pending?: number;
    },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid entitlement ID format');
    }

    const entitlement = await this.leaveEntitlementModel.findById(id);
    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    // Update fields
    Object.assign(entitlement, data);

    // Recalculate remaining using helper method
    entitlement.remaining = await this.calculateRemainingBalance(entitlement);


    return await entitlement.save();
  }

  // ==================== LEAVE ADJUSTMENTS ====================

  async createAdjustment(data: {
    employeeId: string;
    leaveTypeId: string;
    adjustmentType: AdjustmentType;
    amount: number;
    reason: string;
    hrUserId: string;
  }) {
    if (
      !Types.ObjectId.isValid(data.employeeId) ||
      !Types.ObjectId.isValid(data.leaveTypeId) ||
      !Types.ObjectId.isValid(data.hrUserId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const amount = Math.abs(data.amount);
    if (amount <= 0) {
      throw new BadRequestException('Adjustment amount must be greater than zero');
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    // Apply adjustment to entitlement in real-time
    const applyDeduction = (days: number) => {
      const available =
        (entitlement.yearlyEntitlement || 0) +
        (entitlement.carryForward || 0) -
        (entitlement.taken || 0) -
        (entitlement.pending || 0);

      if (available < days) {
        throw new BadRequestException(
          'Adjustment would make balance negative; increase grant before deducting',
        );
      }

      // Prefer to deduct from carryForward first, then yearlyEntitlement
      const fromCarry = Math.min(entitlement.carryForward || 0, days);
      entitlement.carryForward = Math.max(
        0,
        (entitlement.carryForward || 0) - fromCarry,
      );

      const remaining = days - fromCarry;
      if (remaining > 0) {
        entitlement.yearlyEntitlement = Math.max(
          0,
          (entitlement.yearlyEntitlement || 0) - remaining,
        );
      }
    };

    switch (data.adjustmentType) {
      case AdjustmentType.ADD:
        entitlement.carryForward = (entitlement.carryForward || 0) + amount;
        break;
      case AdjustmentType.DEDUCT:
      case AdjustmentType.ENCASHMENT:
        applyDeduction(amount);
        break;
      default:
        throw new BadRequestException('Unsupported adjustment type');
    }

    // Recalculate remaining using helper method
    entitlement.remaining = await this.calculateRemainingBalance(entitlement);

    await entitlement.save();

    // Persist adjustment audit log
    const adjustment = new this.leaveAdjustmentModel({
      ...data,
      amount,
    });
    return await adjustment.save();
  }

  async getEmployeeAdjustments(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID format');
    }

    return await this.leaveAdjustmentModel
      .find({ employeeId })
      .populate('leaveTypeId')
      .populate('hrUserId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllAdjustments(filters?: {
    employeeId?: string;
    leaveTypeId?: string;
    adjustmentType?: string;
  }) {
    const query: any = {};

    if (filters?.employeeId) {
      if (!Types.ObjectId.isValid(filters.employeeId)) {
        throw new BadRequestException('Invalid employee ID format');
      }
      query.employeeId = filters.employeeId;
    }

    if (filters?.leaveTypeId) {
      if (!Types.ObjectId.isValid(filters.leaveTypeId)) {
        throw new BadRequestException('Invalid leave type ID format');
      }
      query.leaveTypeId = filters.leaveTypeId;
    }

    if (filters?.adjustmentType) {
      query.adjustmentType = filters.adjustmentType;
    }

    return await this.leaveAdjustmentModel
      .find(query)
      .populate('leaveTypeId')
      .populate('employeeId')
      .populate('hrUserId')
      .sort({ createdAt: -1 })
      .exec();
  }

  // ==================== CALENDAR MANAGEMENT (EXTENDED) ====================

  /**
   * REQ-010: Create calendar for a specific year
   * BR-33, BR-55: Manage holidays and blocked periods
   */
  async createCalendar(data: {
    year: number;
    holidays?: string[];
    blockedPeriods?: { from: Date; to: Date; reason: string }[];
  }) {
    const existingCalendar = await this.calendarModel.findOne({
      year: data.year,
    });
    if (existingCalendar) {
      throw new ConflictException(
        `Calendar for year ${data.year} already exists`,
      );
    }

    const calendar = new this.calendarModel({
      year: data.year,
      holidays: data.holidays || [],
      blockedPeriods: data.blockedPeriods || [],
    });

    return await calendar.save();
  }

  /**
   * Get calendar by year
   */
  async getCalendarByYear(year: number) {
    const calendar = await this.calendarModel
      .findOne({ year })
      .populate('holidays')
      .exec();

    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    return calendar;
  }

  /**
   * Add blocked period to calendar
   * BR-55: Leave Block Periods
   */
  async addBlockedPeriod(
    year: number,
    period: { from: Date; to: Date; reason: string },
  ) {
    const calendar = await this.calendarModel.findOne({ year });
    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    calendar.blockedPeriods.push(period);
    return await calendar.save();
  }

  /**
   * Remove blocked period from calendar
   */
  async removeBlockedPeriod(year: number, periodIndex: number) {
    const calendar = await this.calendarModel.findOne({ year });
    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }

    if (periodIndex < 0 || periodIndex >= calendar.blockedPeriods.length) {
      throw new BadRequestException('Invalid period index');
    }

    calendar.blockedPeriods.splice(periodIndex, 1);
    return await calendar.save();
  }

  /**
   * Check if a date falls in a blocked period
   * BR-55: Block leave requests during blocked periods
   */
  async isDateBlocked(date: Date): Promise<boolean> {
    const year = date.getFullYear();
    const calendar = await this.calendarModel.findOne({ year });

    if (!calendar) {
      return false;
    }
    return calendar.blockedPeriods.some((period) => {
      const from = new Date(period.from);
      const to = new Date(period.to);
      return date >= from && date <= to;
    });
  }

  /**
   * Check if date range overlaps with blocked period
   */
  async checkBlockedPeriods(from: Date, to: Date): Promise<void> {
    // Iterate across all years spanned by the request to ensure multi-year blocks are enforced
    const startYear = from.getFullYear();
    const endYear = to.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const calendar = await this.calendarModel.findOne({ year });
      if (!calendar) {
        continue;
      }

      const hasBlockedDates = calendar.blockedPeriods.some((period) => {
        const periodFrom = new Date(period.from);
        const periodTo = new Date(period.to);
        return from <= periodTo && to >= periodFrom;
      });

      if (hasBlockedDates) {
        throw new BadRequestException(
          'Leave request overlaps with a blocked period. Leave requests are not allowed during this time.',
        );
      }
    }
  }
  async addHolidayToCalendar(year: number, holidayId: string) {
    if (!Types.ObjectId.isValid(holidayId)) {
      throw new BadRequestException('Invalid holiday ID format');
    }
    const calendar = await this.calendarModel.findOne({ year });
    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }
    // avoid duplicates
    const exists = calendar.holidays.some((h) => h.toString() === holidayId);
    if (!exists) {
      calendar.holidays.push(new Types.ObjectId(holidayId));
      await calendar.save();
    }
    return calendar;
  }

  // ==================== HOLIDAYS (ADMIN) ====================

  async createHoliday(data: {
    name?: string;
    type: HolidayType;
    startDate: Date;
    endDate?: Date;
  }) {
    const holiday = new this.holidayModel({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
    return await holiday.save();
  }

  async getAllHolidays() {
    return await this.holidayModel.find().sort({ startDate: 1 }).exec();
  }

  async getHolidayById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid holiday ID format');
    }
    const holiday = await this.holidayModel.findById(id).exec();
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }
    return holiday;
  }

  async removeHolidayFromCalendar(year: number, holidayId: string) {
    if (!Types.ObjectId.isValid(holidayId)) {
      throw new BadRequestException('Invalid holiday ID format');
    }
    const calendar = await this.calendarModel.findOne({ year });
    if (!calendar) {
      throw new NotFoundException(`Calendar for year ${year} not found`);
    }
    const before = calendar.holidays.length;
    calendar.holidays = calendar.holidays.filter(
      (h) => h.toString() !== holidayId,
    );
    if (calendar.holidays.length === before) {
      throw new NotFoundException('Holiday not found on calendar');
    }
    await calendar.save();
    return calendar;
  }

  // ==================== VALIDATION METHODS (EXTENDED) ====================

  /**
   * REQ-031: Check for overlapping approved leaves
   * BR-31: Automatic overlap checking
   */
  async checkOverlappingLeaves(
    employeeId: string,
    from: Date,
    to: Date,
    excludeRequestId?: string,
  ): Promise<void> {
    const query: any = {
      employeeId,
      status: { $in: [LeaveStatus.APPROVED, LeaveStatus.PENDING] },
      $or: [{ 'dates.from': { $lte: to }, 'dates.to': { $gte: from } }],
    };

    if (excludeRequestId) {
      query._id = { $ne: excludeRequestId };
    }

    const overlapping = await this.leaveRequestModel.find(query);

    if (overlapping.length > 0) {
      throw new ConflictException(
        'Leave request overlaps with existing approved leave',
      );
    }
  }

  /**
   * REQ-015: Check balance sufficiency
   * BR-29: Convert to unpaid or block if insufficient balance
   */
  async checkBalanceSufficiency(
    employeeId: string,
    leaveTypeId: string,
    requestedDays: number,
  ): Promise<{
    sufficient: boolean;
    paidDays: number;
    unpaidDays: number;
    requiresConversion: boolean;
  }> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    // STEP 1: Check if leave type is paid or unpaid
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // STEP 2: If unpaid leave, skip balance check entirely
    if (!leaveType.paid) {
      return {
        sufficient: true,
        paidDays: 0,
        unpaidDays: requestedDays,
        requiresConversion: false,
      };
    }

    // STEP 3: For paid leave, check balance
    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException(
        'Leave entitlement not found for this employee and leave type',
      );
    }

    // Enforce carry-forward expiry if configured
    const policyForExpiry = await this.leavePolicyModel
      .findOne({ leaveTypeId })
      .exec();
    await this.enforceCarryForwardExpiry(entitlement, policyForExpiry || undefined);

    const available = entitlement.remaining || 0;

    // STEP 4: If sufficient balance, approve all as paid
    if (requestedDays <= available) {
      return {
        sufficient: true,
        paidDays: requestedDays,
        unpaidDays: 0,
        requiresConversion: false,
      };
    }

    // STEP 5: Insufficient balance - auto-convert excess to unpaid
    return {
      sufficient: false,
      paidDays: available,
      unpaidDays: requestedDays - available,
      requiresConversion: true,
    };
  }

  /**
   * Helper: enforce paid balance sufficiency and throw with user-facing guidance
   */
  private async ensurePaidBalanceOrThrow(
    employeeId: string,
    leaveTypeId: string,
    requestedDays: number,
  ) {
    const balanceCheck = await this.checkBalanceSufficiency(
      employeeId,
      leaveTypeId,
      requestedDays,
    );

    if (balanceCheck.requiresConversion) {
      throw new BadRequestException(
        `Insufficient paid leave balance. Requested ${requestedDays} day(s) but only ` +
        `${balanceCheck.paidDays} day(s) available. Convert ${balanceCheck.unpaidDays} ` +
        'day(s) to unpaid leave to proceed.',
      );
    }

    return balanceCheck;
  }

  /**
   * REQ-016: Validate required documents
   * BR-54: Medical certificate required for sick leave > 1 day
   */
  /**
   * REQ-028: Enhanced document validation
   */
  async validateRequiredDocuments(
    leaveTypeId: string,
    durationDays: number,
    attachmentId?: string,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(leaveTypeId)) {
      throw new BadRequestException('Invalid leave type ID format');
    }

    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    const requiresAttachment = leaveType.requiresAttachment;

    // BR-54: Medical cert required for sick leave > 1 day
    const isSickLeave =
      leaveType.code === 'SICK_LEAVE' ||
      leaveType.name.toLowerCase().includes('sick');
    const requiresMedicalCert = isSickLeave && durationDays > 1;

    if (requiresAttachment || requiresMedicalCert) {
      if (!attachmentId) {
        throw new BadRequestException(
          requiresMedicalCert
            ? 'Medical certificate required for sick leave exceeding 1 day'
            : `${leaveType.name} requires supporting documents`,
        );
      }

      if (!Types.ObjectId.isValid(attachmentId)) {
        throw new BadRequestException('Invalid attachment ID format');
      }

      // Validate the attachment exists and meets requirements
      const attachment = await this.attachmentModel.findById(attachmentId);
      if (!attachment) {
        throw new NotFoundException('Attachment not found');
      }

      // REQ-028: Validate file type
      if (leaveType.attachmentType && attachment.fileType) {
        const allowedTypes = this.getAllowedMimeTypes(leaveType.attachmentType);
        if (!allowedTypes.includes(attachment.fileType)) {
          throw new BadRequestException(
            `Invalid file type. Expected ${leaveType.attachmentType}, got ${attachment.fileType}`,
          );
        }
      }

      // REQ-028: Validate file size (10MB default)
      if (attachment.size) {
        const maxSizeBytes =
          parseInt(process.env.MAX_ATTACHMENT_SIZE_MB || '10') * 1024 * 1024;
        if (attachment.size > maxSizeBytes) {
          throw new BadRequestException(
            `File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit`,
          );
        }
      }
    }
  }

  /**
   * HR Manager/Admin: Fetch attachment metadata by ID
   */
  async getAttachmentForHr(
    attachmentId: string,
  ): Promise<AttachmentDocument | null> {
    if (!Types.ObjectId.isValid(attachmentId)) {
      throw new BadRequestException('Invalid attachment ID format');
    }

    const attachment = await this.attachmentModel.findById(attachmentId).exec();
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  /**
   * REQ-005, REQ-023: Calculate net leave days excluding weekends and holidays
   * BR-23: Leave duration calculated net of non-working days
   * BR-33: Public holidays excluded from leave count
   *

   */
  async calculateNetLeaveDays(
    employeeId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const year = from.getFullYear();
    const calendar = await this.calendarModel
      .findOne({ year })
      .populate('holidays');
    const holidays = (calendar?.holidays as any[]) || [];

    let netDays = 0;
    const cursor = new Date(from);

    while (cursor <= to) {
      const dayIsHoliday = holidays.some((h: any) => {
        if (
          !h?.type ||
          ![
            HolidayType.NATIONAL,
            HolidayType.ORGANIZATIONAL,
            HolidayType.WEEKLY_REST,
          ].includes(h.type)
        ) {
          return false;
        }
        const start = new Date(h.startDate);
        const end = h.endDate ? new Date(h.endDate) : start;
        return cursor >= start && cursor <= end && h.active !== false;
      });

      if (!dayIsHoliday) {
        netDays++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return netDays;
  }

  /**
   * Get detailed calculation breakdown
   */
  async getNetDaysCalculationDetails(employeeId: string, from: Date, to: Date) {
    const year = from.getFullYear();
    const calendar = await this.calendarModel
      .findOne({ year })
      .populate('holidays');
    const holidays = (calendar?.holidays as any[]) || [];

    let totalDays = 0;
    let holidaysExcluded = 0;
    const holidayDates: string[] = [];

    const cursor = new Date(from);
    const end = new Date(to);

    while (cursor <= end) {
      totalDays++;

      const dayIsHoliday = holidays.some((h: any) => {
        if (
          !h?.type ||
          ![
            HolidayType.NATIONAL,
            HolidayType.ORGANIZATIONAL,
            HolidayType.WEEKLY_REST,
          ].includes(h.type)
        ) {
          return false;
        }
        const start = new Date(h.startDate);
        const stop = h.endDate ? new Date(h.endDate) : start;
        const matches = cursor >= start && cursor <= stop && h.active !== false;
        if (matches) {
          holidayDates.push(cursor.toISOString().split('T')[0]);
        }
        return matches;
      });

      if (dayIsHoliday) holidaysExcluded++;
      cursor.setDate(cursor.getDate() + 1);
    }

    const netDays = totalDays - holidaysExcluded;
    return {
      totalDays,
      weekendsExcluded: 0,
      holidaysExcluded,
      netDays,
      holidayDates,
    };
  }

  // ==================== BALANCE MANAGEMENT (EXTENDED) ====================

  /**
   * REQ-029: Deduct days from balance upon approval
   * BR-32: Real-time balance update
   * BR-29: Only deduct for paid leave types
   */
  async deductFromBalance(
    employeeId: string,
    leaveTypeId: string,
    days: number,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    // Check if leave type is paid
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Skip balance deduction for unpaid leave types
    if (!leaveType.paid) {
      return; // Unpaid leave does not affect balance
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    // Move from pending to taken
    entitlement.pending = Math.max(0, entitlement.pending - days);
    entitlement.taken += days;

    // Recalculate remaining using helper method
    entitlement.remaining = await this.calculateRemainingBalance(entitlement);

    // BR-48: Prevent negative balance
    if (entitlement.remaining < 0) {
      throw new BadRequestException(
        'Operation would result in negative balance',
      );
    }

    await entitlement.save();
  }

  /**
   * Release pending days back to remaining (e.g., rejection/cancellation)
   * Mirrors addToPendingBalance but subtracts from pending.
   */
  private async releasePendingBalance(
    employeeId: string,
    leaveTypeId: string,
    days: number,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Skip pending adjustments for unpaid leave types
    if (!leaveType.paid) {
      return;
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    entitlement.pending = Math.max(0, entitlement.pending - days);

    // Recalculate remaining using helper method
    entitlement.remaining = await this.calculateRemainingBalance(entitlement);

    await entitlement.save();
  }

  /**
   * Return deducted balance when overriding APPROVED -> REJECTED
   * Moves days from 'taken' back to 'remaining'
   */
  private async returnDeductedBalance(
    employeeId: string,
    leaveTypeId: string,
    days: number,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Skip for unpaid leave types
    if (!leaveType.paid) {
      return;
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    // Return days from 'taken' to available balance
    entitlement.taken = Math.max(0, entitlement.taken - days);

    // Recalculate remaining using helper method
    entitlement.remaining = await this.calculateRemainingBalance(entitlement);

    await entitlement.save();
  }

  /**
   * REQ-018: Return days to balance when leave is cancelled
   * BR-18: Auto-return days on cancellation
   * BR-29: Only return for paid leave types
   */
  async returnDaysToBalance(
    employeeId: string,
    leaveTypeId: string,
    days: number,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    // Check if leave type is paid
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Skip balance return for unpaid leave types
    if (!leaveType.paid) {
      return; // Unpaid leave does not affect balance
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    // Return from taken to remaining
    entitlement.taken = Math.max(0, entitlement.taken - days);

    // Recalculate remaining
    const total =
      (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
    entitlement.remaining = total - entitlement.taken - entitlement.pending;

    await entitlement.save();
  }

  /**
   * Add days to pending balance when request is submitted
   * BR-29: Only track pending for paid leave types
   */
  async addToPendingBalance(
    employeeId: string,
    leaveTypeId: string,
    days: number,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    // Check if leave type is paid
    const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    // Skip pending tracking for unpaid leave types
    if (!leaveType.paid) {
      return; // Unpaid leave does not affect balance
    }

    const entitlement = await this.leaveEntitlementModel.findOne({
      employeeId,
      leaveTypeId,
    });

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    entitlement.pending += days;

    // Recalculate remaining using helper method
    entitlement.remaining = await this.calculateRemainingBalance(entitlement);

    await entitlement.save();
  }

  // ==================== DELEGATION (EXTENDED) ====================

  /**
   * REQ-023: Delegate approval authority
   * BR-26: Manager can delegate during absence
   */
  async delegateApproval(
    requestId: string,
    fromUserId: string,
    toUserId: string,
    role: string,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(requestId) ||
      !Types.ObjectId.isValid(fromUserId) ||
      !Types.ObjectId.isValid(toUserId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Find the approval level for the specified role
    const roleExists = request.approvalFlow.some((a) => a.role === role);

    if (!roleExists) {
      throw new BadRequestException(
        `No approval level found for role: ${role}`,
      );
    }

    // Store delegation in memory (workaround for schema constraint)
    const key = `${requestId}-${role}`;
    this.delegationMap.set(key, {
      requestId,
      role,
      delegatorId: fromUserId,
      delegateId: toUserId,
      createdAt: new Date(),
    });
  }

  // ==================== MANAGER OPERATIONS (EXTENDED) ====================

  /**
   * REQ-034: View team leave balances
   * BR-46: Manager access to team absence reports
   */
  private async resolveTeamMembers(
    managerId: string,
    departmentId?: string,
  ): Promise<{ members: EmployeeProfileDocument[] }> {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager ID format');
    }

    const managerProfile = await this.employeeProfileModel.findById(managerId);
    if (!managerProfile) {
      throw new NotFoundException('Manager profile not found');
    }

    const deptFilter = departmentId
      ? new Types.ObjectId(departmentId)
      : managerProfile.primaryDepartmentId;
    // If departmentId parameter is provided - convert it to Types.ObjectId and use that.
    // Otherwise use managerProfile.primaryDepartmentId.

    const query: any = { _id: { $ne: new Types.ObjectId(managerId) } };
    // Find all employees whose _id is NOT equal to the managerâs ID.
    const or: any[] = [];

    if (managerProfile.primaryPositionId) {
      or.push({ supervisorPositionId: managerProfile.primaryPositionId });
    }
    if (deptFilter) {
      or.push({ primaryDepartmentId: deptFilter });
    }
    if (or.length) {
      query.$or = or;
    }
    // If there are OR conditions, add them into the final query
    // example:
    // query = {
    //   _id: { $ne: managerId },
    //   $or: [
    //     { supervisorPositionId: managerPrimaryPosition },
    //     { primaryDepartmentId: deptFilter }
    //   ]
    // }


    const members = await this.employeeProfileModel.find(query).exec();
    return { members };
  }

  async getTeamBalances(
    managerId: string,
    options?: { leaveTypeId?: string; departmentId?: string },
  ) {
    const { members } = await this.resolveTeamMembers(
      managerId,
      options?.departmentId,
    );

    type TeamBalance = {
      employeeId: string;
      employeeName?: string;
      employeeNumber: string;
      balances: {
        leaveType: string;
        remaining: number;
        taken: number;
        pending: number;
        carryForward: number;
      }[];
    };

    const teamBalances: TeamBalance[] = [];

    for (const member of members) {
      const entQuery: any = { employeeId: member._id };
      if (options?.leaveTypeId) {
        if (!Types.ObjectId.isValid(options.leaveTypeId)) {
          throw new BadRequestException('Invalid leave type ID format');
        }
        entQuery.leaveTypeId = new Types.ObjectId(options.leaveTypeId);
      }

      const entitlements = await this.leaveEntitlementModel
        .find(entQuery)
        .populate('leaveTypeId')
        .exec();

      teamBalances.push({
        employeeId: member._id.toString(),
        employeeName: member.fullName,
        employeeNumber: String((member as any).employeeNumber ?? ''),
        balances: entitlements.map((e) => ({
          leaveType: (e.leaveTypeId as any)?.name || 'Unknown',
          remaining: e.remaining,
          taken: e.taken,
          pending: e.pending,
          carryForward: e.carryForward,
        })),
      });
    }

    return teamBalances;
  }

  /**
   * Get pending leave requests for a manager's team, with optional overlap filter
   */
  async getManagerPendingTeamRequests(
    managerId: string,
    options?: { overlappingOnly?: boolean },
  ): Promise<{
    requests: LeaveRequest[];
    allRequests: LeaveRequest[];
    overlaps: { requestA: string; requestB: string }[];
  }> {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager ID format');
    }

    const now = new Date();

    const managerAssignment = await this.positionAssignmentModel
      .findOne({
        employeeProfileId: new Types.ObjectId(managerId),
        startDate: { $lte: now },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      })
      .populate('positionId')
      .lean()
      .exec();

    if (!managerAssignment?.positionId) {
      throw new NotFoundException('Manager position not found or inactive');
    }

    const managerPositionId = (managerAssignment.positionId as any)?._id;

    console.log(
      `[Overlap Debug] Manager ID: ${managerId}, Manager Position ID: ${managerPositionId}`,
    );

    const teamAssignments = await this.positionAssignmentModel
      .find({
        startDate: { $lte: now },
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: now } },
        ],
      })
      .populate('positionId')
      .lean()
      .exec();

    console.log(
      `[Overlap Debug] Total active assignments found: ${teamAssignments.length}`,
    );

    const teamMemberIds = teamAssignments
      .filter((a) => {
        const positionReportsTo = (a.positionId as any)?.reportsToPositionId;
        if (!positionReportsTo) return false;

        // Compare ObjectIds as strings since we're using .lean()
        const reportsToId = positionReportsTo.toString();
        const managerId = managerPositionId.toString();
        const matches = reportsToId === managerId;

        if (matches) {
          console.log(
            `[Overlap Debug] Found team member: ${(a.employeeProfileId as Types.ObjectId).toString()}`,
          );
        }

        return matches;
      })
      .map((a) => (a.employeeProfileId as Types.ObjectId).toString());

    console.log(
      `[Overlap Debug] Team member IDs found: ${teamMemberIds.length}`,
      teamMemberIds,
    );

    if (!teamMemberIds.length) {
      console.log('[Overlap Debug] No team members found - returning empty');
      return { requests: [], allRequests: [], overlaps: [] };
    }

    // Fetch both pending and approved requests
    // First, let's check what pending requests exist for debugging
    const allPendingInDB = await this.leaveRequestModel
      .find({ status: LeaveStatus.PENDING })
      .select('employeeId status dates')
      .lean()
      .exec();

    console.log(
      `[Overlap Debug] Total pending requests in DB: ${allPendingInDB.length}`,
    );
    allPendingInDB.forEach((req) => {
      console.log(
        `[Overlap Debug]   - Request employeeId: ${req.employeeId}, Status: ${req.status}`,
      );
    });

    // Try querying without ObjectId conversion first
    const testQuery = await this.leaveRequestModel
      .find({
        status: LeaveStatus.PENDING,
      })
      .lean()
      .exec();

    console.log('[Overlap Debug] All pending (no filter):', testQuery.length);

    // Now try with string IDs directly
    const pendingRequests = await this.leaveRequestModel
      .find({
        status: LeaveStatus.PENDING,
        employeeId: { $in: teamMemberIds },
      })
      .populate('employeeId')
      .populate('leaveTypeId')
      .lean()
      .exec();

    const approvedRequests = await this.leaveRequestModel
      .find({
        status: LeaveStatus.APPROVED,
        employeeId: { $in: teamMemberIds.map((id) => new Types.ObjectId(id)) },
      })
      .populate('employeeId')
      .populate('leaveTypeId')
      .lean()
      .exec();

    console.log(
      `[Overlap Debug] Pending requests found: ${pendingRequests.length}`,
    );
    console.log(
      `[Overlap Debug] Approved requests found: ${approvedRequests.length}`,
    );

    const overlaps: { requestA: string; requestB: string }[] = [];
    const overlappingIds = new Set<string>();

    // Check overlaps between pending requests
    for (let i = 0; i < pendingRequests.length; i++) {
      for (let j = i + 1; j < pendingRequests.length; j++) {
        const a = pendingRequests[i];
        const b = pendingRequests[j];

        // Convert dates to Date objects for comparison
        const aFrom = new Date(a.dates.from);
        const aTo = new Date(a.dates.to);
        const bFrom = new Date(b.dates.from);
        const bTo = new Date(b.dates.to);

        // Log for debugging
        console.log(
          `Comparing: ${(a.employeeId as any)?.firstName || a.employeeId} (${aFrom.toISOString()} - ${aTo.toISOString()}) ` +
            `vs ${(b.employeeId as any)?.firstName || b.employeeId} (${bFrom.toISOString()} - ${bTo.toISOString()})`,
        );

        // Check if dates overlap
        const datesOverlap = aFrom <= bTo && aTo >= bFrom;

        // When employeeId is populated, it's an object with _id field
        const aEmployeeId = (a.employeeId as any)?._id?.toString() || a.employeeId.toString();
        const bEmployeeId = (b.employeeId as any)?._id?.toString() || b.employeeId.toString();
        const differentEmployees = aEmployeeId !== bEmployeeId;

        console.log(
          `  Employee IDs: ${aEmployeeId} vs ${bEmployeeId}`,
        );
        console.log(
          `  Dates overlap: ${datesOverlap}, Different employees: ${differentEmployees}`,
        );

        if (datesOverlap && differentEmployees) {
          overlaps.push({
            requestA: a._id.toString(),
            requestB: b._id.toString(),
          });
          overlappingIds.add(a._id.toString());
          overlappingIds.add(b._id.toString());
          console.log(`  ✓ OVERLAP DETECTED`);
        }
      }
    }

    // Check overlaps between pending and approved requests
    for (const pending of pendingRequests) {
      for (const approved of approvedRequests) {
        const pendingFrom = new Date(pending.dates.from);
        const pendingTo = new Date(pending.dates.to);
        const approvedFrom = new Date(approved.dates.from);
        const approvedTo = new Date(approved.dates.to);

        const datesOverlap = pendingFrom <= approvedTo && pendingTo >= approvedFrom;

        // When employeeId is populated, it's an object with _id field
        const pendingEmployeeId = (pending.employeeId as any)?._id?.toString() || pending.employeeId.toString();
        const approvedEmployeeId = (approved.employeeId as any)?._id?.toString() || approved.employeeId.toString();
        const differentEmployees = pendingEmployeeId !== approvedEmployeeId;

        if (datesOverlap && differentEmployees) {
          overlaps.push({
            requestA: pending._id.toString(),
            requestB: approved._id.toString(),
          });
          overlappingIds.add(pending._id.toString());
        }
      }
    }

    const filteredRequests = options?.overlappingOnly
      ? pendingRequests.filter((r) => overlappingIds.has(r._id.toString()))
      : pendingRequests;

    // Include all requests (pending + approved) in the response for full context
    const allRequests = [...pendingRequests, ...approvedRequests];

    return {
      requests: filteredRequests as any,
      allRequests: allRequests as any,
      overlaps,
    };
  }

  /**
   * REQ-034: View team upcoming leaves
   */
  async getTeamUpcomingLeaves(
    managerId: string,
    options?: {
      leaveTypeId?: string;
      status?: LeaveStatus;
      startDate?: string;
      endDate?: string;
      departmentId?: string;
      sortOrder?: 'asc' | 'desc';
    },
  ) {
    const { members } = await this.resolveTeamMembers(
      managerId,
      options?.departmentId,
    );
    const employeeIds = members.map((m) => m._id);

    if (!employeeIds.length) {
      return [];
    }

    const query: any = {
      employeeId: { $in: employeeIds },
    };

    if (options?.leaveTypeId) {
      if (!Types.ObjectId.isValid(options.leaveTypeId)) {
        throw new BadRequestException('Invalid leave type ID format');
      }
      query.leaveTypeId = new Types.ObjectId(options.leaveTypeId);
    }

    query.status = options?.status || LeaveStatus.APPROVED;

    if (options?.startDate || options?.endDate) {
      const range: any = {};
      if (options.startDate) range.$gte = new Date(options.startDate);
      if (options.endDate) range.$lte = new Date(options.endDate);
      query['dates.from'] = range;
    } else {
      query['dates.from'] = { $gte: new Date() };
      // Show only upcoming leaves starting today or after, if no exact dates available
    }

    const sortOrder = options?.sortOrder === 'desc' ? -1 : 1;

    const leaves = await this.leaveRequestModel
      .find(query)
      .populate('employeeId')
      .populate('leaveTypeId')
      .sort({ 'dates.from': sortOrder })
      .exec();

    return leaves.map((lr) => ({
      requestId: lr._id.toString(),
      employeeId: (lr.employeeId as any)?._id?.toString() || '',
      employeeName: (lr.employeeId as any)?.fullName || '',
      leaveType: (lr.leaveTypeId as any)?.name || '',
      from: lr.dates.from,
      to: lr.dates.to,
      durationDays: lr.durationDays,
      status: lr.status,
    }));
  }

  /**
   * REQ-039: Flag irregular leave pattern
   */
  async flagIrregularPattern(requestId: string): Promise<void> {
    if (!Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException('Invalid request ID format');
    }

    const request = await this.leaveRequestModel.findById(requestId);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    request.irregularPatternFlag = true;
    await request.save();
  }

  // ==================== ENCASHMENT & FINAL SETTLEMENT (EXTENDED) ====================

  /**
   * REQ-042: Calculate leave encashment
   * BR-52, BR-53: Encashment formula and final settlement
   *
   * NOTE: Requires integration with Payroll module to get daily salary rate
   */
  async calculateEncashment(employeeId: string, leaveTypeId: string) {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid ID format');
    }

    const entitlement = await this.leaveEntitlementModel
      .findOne({ employeeId, leaveTypeId })
      .populate('leaveTypeId');

    if (!entitlement) {
      throw new NotFoundException('Leave entitlement not found');
    }

    // Fetch daily salary rate from employee's base salary
    const baseSalary = await this.getEmployeeBaseSalary(employeeId);
    if (!baseSalary || baseSalary <= 0) {
      throw new NotFoundException(
        'Employee base salary not found. Cannot calculate encashment.',
      );
    }

    // Calculate daily salary rate: Base Salary / Work Days in Month
    const workDaysInMonth = this.getWorkDaysInMonth(new Date());
    const dailySalaryRate = baseSalary / workDaysInMonth;

    // BR-53: Capped at 30 days
    const unusedDays = Math.min(entitlement.remaining, 30);

    const encashmentAmount = dailySalaryRate * unusedDays;

    return {
      employeeId,
      leaveType: (entitlement.leaveTypeId as any).name,
      unusedDays,
      dailySalaryRate,
      encashmentAmount,
      formula: `Daily Salary Rate Ã Unused Days (capped at 30) = ${dailySalaryRate} Ã ${unusedDays} = ${encashmentAmount}`,
    };
  }

  /**
   * Process final settlement for terminating employee
   * BR-52: Convert remaining balance to encashment or deduction
   */
  async processFinalSettlement(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID format');
    }

    await this.processFinalSettlementForTerminatedEmployee(employeeId);
    return { processed: true };
  }

  // ==================== AUDIT & REPORTING (EXTENDED) ====================

  /**
   * REQ-013: Get audit trail for employee adjustments
   * BR-12, BR-17: Track all manual adjustments with timestamp, user, reason
   */
  async getAuditTrail(employeeId: string) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID format');
    }

    const adjustments = await this.leaveAdjustmentModel
      .find({ employeeId })
      .populate('leaveTypeId')
      .populate('hrUserId')
      .sort({ createdAt: -1 })
      .exec();

    return adjustments.map((adj) => ({
      adjustmentId: adj._id,
      employeeId: adj.employeeId,
      leaveType: (adj.leaveTypeId as any).name,
      adjustmentType: adj.adjustmentType,
      amount: adj.amount,
      reason: adj.reason,
      hrUserId: adj.hrUserId,
      hrUserName: (adj.hrUserId as any).fullName || 'Unknown',
      createdAt: (adj as any).createdAt,
    }));
  }

  /**
   * Update leave request (modify pending request)
   * REQ-017: Modify pending request
   */
  async updateLeaveRequest(
    id: string,
    data: {
      fromDate?: Date;
      toDate?: Date;
      durationDays?: number;
      justification?: string;
      attachmentId?: string;
    },
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid request ID format');
    }

    const request = await this.leaveRequestModel.findById(id);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Only allow modification if status is PENDING
    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be modified');
    }

    const originalDuration = request.durationDays;

    // Update fields
    if (data.fromDate || data.toDate) {
      const from = data.fromDate ? new Date(data.fromDate) : request.dates.from;
      const to = data.toDate ? new Date(data.toDate) : request.dates.to;

      if (from > to) {
        throw new BadRequestException('Start date must be before end date');
      }

      request.dates.from = from;
      request.dates.to = to;

      // Enforce blocked periods
      await this.checkBlockedPeriods(from, to);

      // Always recompute net working days
      const netDays = await this.calculateNetLeaveDays(
        request.employeeId.toString(),
        from,
        to,
      );
      if (netDays <= 0) {
        throw new BadRequestException(
          'Requested period has no working days available',
        );
      }
      // Overlap check (exclude current request)
      await this.checkOverlappingLeaves(
        request.employeeId.toString(),
        from,
        to,
        request._id.toString(),
      );

      // Entitlement / balance check (block if paid balance insufficient)
      await this.ensurePaidBalanceOrThrow(
        request.employeeId.toString(),
        request.leaveTypeId.toString(),
        netDays,
      );

      // Document requirement check
      await this.validateRequiredDocuments(
        request.leaveTypeId.toString(),
        netDays,
        data.attachmentId ?? request.attachmentId?.toString(),
      );

      request.durationDays = netDays;
    } else if (data.durationDays) {
      // Ignore client-supplied duration; keep existing duration or recompute if needed
      const netDays = await this.calculateNetLeaveDays(
        request.employeeId.toString(),
        request.dates.from,
        request.dates.to,
      );
      request.durationDays = netDays;
    }

    if (data.justification !== undefined) {
      request.justification = data.justification;
    }

    if (data.attachmentId !== undefined) {
      if (data.attachmentId) {
        if (!Types.ObjectId.isValid(data.attachmentId)) {
          throw new BadRequestException('Invalid attachment ID format');
        }
        request.attachmentId = new Types.ObjectId(data.attachmentId);
      } else {
        request.attachmentId = undefined;
      }
    }

    // Ensure balance sufficiency with current duration
    await this.ensurePaidBalanceOrThrow(
      request.employeeId.toString(),
      request.leaveTypeId.toString(),
      request.durationDays,
    );

    // Re-validate document requirement with current duration/attachment
    await this.validateRequiredDocuments(
      request.leaveTypeId.toString(),
      request.durationDays,
      request.attachmentId?.toString(),
    );

    // Sync pending balance change (only for paid leave types)
    const pendingDelta = request.durationDays - originalDuration;
    if (pendingDelta !== 0) {
      if (pendingDelta < 0) {
        await this.releasePendingBalance(
          request.employeeId.toString(),
          request.leaveTypeId.toString(),
          Math.abs(pendingDelta),
        );
      } else {
        await this.addToPendingBalance(
          request.employeeId.toString(),
          request.leaveTypeId.toString(),
          pendingDelta,
        );
      }
    }

    const saved = await request.save();

    // Notify employee and manager (if available)
    await this.logNotification(
      request.employeeId.toString(),
      'LEAVE_UPDATED',
      'Your leave request was updated.',
    );
    const managerStep = request.approvalFlow.find((s) => s.role === 'Manager');
    const managerId = managerStep?.decidedBy?.toString();
    if (managerId) {
      await this.logNotification(
        managerId,
        'LEAVE_UPDATED_NOTIFY',
        `Leave request for employee ${request.employeeId.toString()} was updated.`,
      );
    }

    return saved;
  }

  // ==================== HELPER/UTILITY METHODS (EXTENDED) ====================

  /**
   * Zero out expired carry-forward and recompute remaining
   */
  private async enforceCarryForwardExpiry(
    entitlement: LeaveEntitlementDocument,
    policy?: LeavePolicyDocument | null,
  ): Promise<void> {
    if (!policy) {
      policy = await this.leavePolicyModel
        .findOne({ leaveTypeId: entitlement.leaveTypeId })
        .exec();
    }

    if (!policy || !policy.expiryAfterMonths || !entitlement.nextResetDate) {
      return;
    }

    const expiryDate = new Date(entitlement.nextResetDate);
    expiryDate.setMonth(expiryDate.getMonth() + policy.expiryAfterMonths);

    if (expiryDate < new Date()) {
      entitlement.carryForward = 0;
      const total =
        (entitlement.yearlyEntitlement || 0) +
        (entitlement.carryForward || 0) +
        (entitlement.accruedRounded || 0);
      entitlement.remaining =
        total - (entitlement.taken || 0) - (entitlement.pending || 0);
      await entitlement.save();
    }
  }

  /**
   * Apply rounding rule to accrual calculation
   * BR-20: Rounding methods
   */
  applyRounding(value: number, rule: RoundingRule): number {
    switch (rule) {
      case RoundingRule.ROUND:
        return Math.round(value);
      case RoundingRule.ROUND_UP:
        return Math.ceil(value);
      case RoundingRule.ROUND_DOWN:
        return Math.floor(value);
      case RoundingRule.NONE:
      default:
        return value;
    }
  }

  // ==================== ACCRUAL, CARRY-FORWARD, AND RESET METHODS ====================

  /**
   * Get employee hire date from Employee Profile module
   * @param employeeId Employee ID
   * @returns Hire date
   */
  private async getEmployeeHireDate(employeeId: string): Promise<Date | null> {
    try {
      if (!Types.ObjectId.isValid(employeeId)) {
        return null;
      }

      const employee = await this.employeeProfileModel
        .findById(employeeId)
        .lean()
        .exec();

      if (employee?.dateOfHire) {
        const hireDate = new Date(employee.dateOfHire);
        return isNaN(hireDate.getTime()) ? null : hireDate;
      }

      return null;
    } catch (error) {
      console.error(
        `Failed to fetch hire date for employee ${employeeId}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Check if employee is on unpaid leave or suspended during a specific period
   * BR-11: Accrual must pause during unpaid leave or suspension
   * @param employeeId Employee ID
   * @param startDate Period start date
   * @param endDate Period end date
   * @returns Number of days on unpaid leave/suspension
   */
  private async getUnpaidDaysInPeriod(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    try {
      // Include suspension periods if employee is suspended and effective date overlaps
      let suspensionDays = 0;
      const employeeProfile = await this.employeeProfileModel
        .findById(employeeId)
        .lean()
        .exec();

      if (
        employeeProfile &&
        employeeProfile.status === EmployeeStatus.SUSPENDED &&
        employeeProfile.statusEffectiveFrom
      ) {
        const suspensionStart = new Date(employeeProfile.statusEffectiveFrom);
        const suspensionEnd = endDate; // treat as ongoing suspension

        if (suspensionStart <= endDate) {
          const overlapStart = suspensionStart < startDate ? startDate : suspensionStart;
          const overlapEnd = suspensionEnd;
          const days =
            Math.ceil(
              (overlapEnd.getTime() - overlapStart.getTime()) /
              (1000 * 60 * 60 * 24),
            ) + 1;
          suspensionDays += days;
        }
      }

      // Check Leave Requests for unpaid leave
      const unpaidLeaves = await this.leaveRequestModel
        .find({
          employeeId,
          status: LeaveStatus.APPROVED,
          'dates.from': { $lte: endDate },
          'dates.to': { $gte: startDate },
        })
        .exec();

      let unpaidDays = suspensionDays;
      for (const leave of unpaidLeaves) {
        // Check if this is unpaid leave by checking if leave type is not paid
        const leaveType = await this.leaveTypeModel.findById(leave.leaveTypeId);
        if (leaveType && !leaveType.paid) {
          // Calculate overlap days
          const leaveStart = new Date(
            Math.max(leave.dates.from.getTime(), startDate.getTime()),
          );
          const leaveEnd = new Date(
            Math.min(leave.dates.to.getTime(), endDate.getTime()),
          );
          const days =
            Math.ceil(
              (leaveEnd.getTime() - leaveStart.getTime()) /
              (1000 * 60 * 60 * 24),
            ) + 1;
          unpaidDays += days;
        }
      }

      return unpaidDays;
    } catch (error) {
      console.error(
        `Failed to check unpaid days for employee ${employeeId}:`,
        error.message,
      );
      return 0;
    }
  }

  /**
   * Calculate eligible months worked (excluding unpaid leave and suspension)
   * @param employeeId Employee ID
   * @param startDate Period start date
   * @param endDate Period end date
   * @returns Number of eligible months
   */
  private async calculateEligibleMonths(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Calculate total months in period
    const monthsDiff =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;

    // Get unpaid days in period
    const unpaidDays = await this.getUnpaidDaysInPeriod(
      employeeId,
      startDate,
      endDate,
    );

    // Convert unpaid days to months (assuming 30 days per month)
    const unpaidMonths = unpaidDays / 30;

    // Calculate eligible months
    const eligibleMonths = Math.max(0, monthsDiff - unpaidMonths);

    return eligibleMonths;
  }

  /**
   * Calculate accrual for a single employee
   * REQ-003, REQ-040: Configure accrual parameters
   * @param employeeId Employee ID
   * @param leaveTypeId Leave type ID
   * @param startDate Accrual period start
   * @param endDate Accrual period end
   * @returns Actual and rounded accrued values
   */
  async calculateAccrualForEmployee(
    employeeId: string,
    leaveTypeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ actual: number; rounded: number }> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid employee or leave type ID format');
    }

    // Get leave policy
    const policy = await this.leavePolicyModel.findOne({ leaveTypeId }).exec();
    if (!policy) {
      throw new NotFoundException('Leave policy not found for this leave type');
    }

    // Calculate eligible months (excluding unpaid periods - BR-11)
    const eligibleMonths = await this.calculateEligibleMonths(
      employeeId,
      startDate,
      endDate,
    );

    let accruedActual = 0;

    // Calculate based on accrual method
    switch (policy.accrualMethod) {
      case AccrualMethod.MONTHLY:
        // Monthly accrual = eligible months Ã monthly rate
        accruedActual = eligibleMonths * (policy.monthlyRate || 0);
        break;

      case AccrualMethod.PER_TERM: // Treat as QUARTERLY
        // Quarterly accrual = eligible quarters Ã (monthly rate Ã 3)
        const eligibleQuarters = Math.floor(eligibleMonths / 3);
        accruedActual = eligibleQuarters * (policy.monthlyRate || 0) * 3;
        break;

      case AccrualMethod.YEARLY:
        // Yearly accrual = yearly rate (if full year worked)
        if (eligibleMonths >= 12) {
          accruedActual = policy.yearlyRate || 0;
        } else {
          // Pro-rated for partial year
          accruedActual = (eligibleMonths / 12) * (policy.yearlyRate || 0);
        }
        break;

      default:
        accruedActual = 0;
    }

    // Apply rounding rule
    const accruedRounded = this.applyRounding(
      accruedActual,
      policy.roundingRule,
    );

    return { actual: accruedActual, rounded: accruedRounded };
  }

  /**
   * Run accrual process for all employees
   * REQ-040: Automatic leave accrual
   * @param accrualType Type of accrual to run
   * @returns Processing result
   */
  async runAccrualProcess(
    accrualType: 'monthly' | 'quarterly' | 'yearly',
  ): Promise<{
    processed: number;
    failed: Array<{ employeeId: string; error: string }>;
  }> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    // Determine period based on accrual type
    switch (accrualType) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3 - 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3, 0);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
    }

    const processed: number[] = [];
    const failed: Array<{ employeeId: string; error: string }> = [];

    // Get all entitlements
    const entitlements = await this.leaveEntitlementModel.find().exec();

    for (const entitlement of entitlements) {
      try {
        const employeeId = entitlement.employeeId.toString();
        const leaveTypeId = entitlement.leaveTypeId.toString();

        // Get policy to check accrual method
        const policy = await this.leavePolicyModel
          .findOne({ leaveTypeId })
          .exec();
        if (!policy) continue;

        // Only process if accrual method matches
        const shouldProcess =
          (accrualType === 'monthly' &&
            policy.accrualMethod === AccrualMethod.MONTHLY) ||
          (accrualType === 'quarterly' &&
            policy.accrualMethod === AccrualMethod.PER_TERM) ||
          (accrualType === 'yearly' &&
            policy.accrualMethod === AccrualMethod.YEARLY);

        if (!shouldProcess) continue;

        // Validate employee status - skip if not active
        const employee = await this.employeeProfileModel
          .findById(employeeId)
          .select('status')
          .lean()
          .exec();

        if (!employee) {
          this.logger.warn(
            `Employee ${employeeId} not found during accrual processing`,
          );
          failed.push({
            employeeId,
            error: 'Employee not found',
          });
          continue;
        }

        if (employee.status !== EmployeeStatus.ACTIVE) {
          this.logger.log(
            `Skipping accrual for employee ${employeeId}: status is ${employee.status}`,
          );
          continue;
        }

        // Re-validate eligibility before processing
        const validation = await this.validateEmployeeEligibility(
          employeeId,
          leaveTypeId,
        );
        if (!validation.eligible) {
          this.logger.warn(
            `Skipping accrual for employee ${employeeId}, leave type ${leaveTypeId}: ` +
              `no longer eligible. Reasons: ${validation.reasons.join('; ')}`,
          );
          continue;
        }

        // Calculate accrual
        const accrual = await this.calculateAccrualForEmployee(
          employeeId,
          leaveTypeId,
          startDate,
          endDate,
        );

        // Update entitlement
        entitlement.accruedActual =
          (entitlement.accruedActual || 0) + accrual.actual;
        entitlement.accruedRounded =
          (entitlement.accruedRounded || 0) + accrual.rounded;

        // Calculate remaining based on accrual method
        // For YEARLY accrual: use yearlyEntitlement (upfront allocation)
        // For MONTHLY/QUARTERLY: use accruedRounded (incremental accrual)
        const baseAllowance =
          policy.accrualMethod === AccrualMethod.YEARLY
            ? entitlement.yearlyEntitlement || 0
            : entitlement.accruedRounded || 0;

        entitlement.remaining =
          (entitlement.carryForward || 0) +
          baseAllowance -
          (entitlement.taken || 0) -
          (entitlement.pending || 0);
        entitlement.lastAccrualDate = now;

        await entitlement.save();
        processed.push(1);
      } catch (error) {
        failed.push({
          employeeId: entitlement.employeeId.toString(),
          error: error.message,
        });
      }
    }

    return {
      processed: processed.length,
      failed,
    };
  }

  /**
   * Calculate next reset date based on hire date criterion
   * REQ-041: Reset parameters configuration
   * @param employeeId Employee ID
   * @returns Next reset date
   */
  async calculateResetDate(employeeId: string): Promise<Date> {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID format');
    }

    // Get employee hire date
    const hireDate = await this.getEmployeeHireDate(employeeId);

    if (!hireDate) {
      // Fallback: use January 1st if hire date not available
      const now = new Date();
      return new Date(now.getFullYear() + 1, 0, 1);
    }

    // Calculate next anniversary based on hire date
    const now = new Date();
    const currentYear = now.getFullYear();

    // Next reset is on hire date anniversary
    let nextReset = new Date(
      currentYear,
      hireDate.getMonth(),
      hireDate.getDate(),
    );

    // If already passed this year, use next year
    if (nextReset <= now) {
      nextReset = new Date(
        currentYear + 1,
        hireDate.getMonth(),
        hireDate.getDate(),
      );
    }

    return nextReset;
  }

  /**
   * Update reset dates for all employees
   * @returns Update result
   */
  async updateAllResetDates(): Promise<{
    updated: number;
    failed: Array<{ employeeId: string; error: string }>;
  }> {
    const updated: number[] = [];
    const failed: Array<{ employeeId: string; error: string }> = [];

    const entitlements = await this.leaveEntitlementModel.find().exec();

    for (const entitlement of entitlements) {
      try {
        const employeeId = entitlement.employeeId.toString();
        const resetDate = await this.calculateResetDate(employeeId);

        entitlement.nextResetDate = resetDate;
        await entitlement.save();
        updated.push(1);
      } catch (error) {
        failed.push({
          employeeId: entitlement.employeeId.toString(),
          error: error.message,
        });
      }
    }

    return {
      updated: updated.length,
      failed,
    };
  }

  /**
   * Process carry-forward for a single employee
   * REQ-041: Carry-over parameters
   * @param employeeId Employee ID
   * @param leaveTypeId Leave type ID
   */
  async processCarryForwardForEmployee(
    employeeId: string,
    leaveTypeId: string,
  ): Promise<void> {
    if (
      !Types.ObjectId.isValid(employeeId) ||
      !Types.ObjectId.isValid(leaveTypeId)
    ) {
      throw new BadRequestException('Invalid employee or leave type ID format');
    }

    const entitlement = await this.leaveEntitlementModel
      .findOne({
        employeeId,
        leaveTypeId,
      })
      .exec();

    if (!entitlement) {
      throw new NotFoundException('Entitlement not found');
    }

    const policy = await this.leavePolicyModel.findOne({ leaveTypeId }).exec();
    if (!policy) {
      throw new NotFoundException('Leave policy not found');
    }

    // Check if carry-forward is allowed
    if (!policy.carryForwardAllowed) {
      // Reset to 0 if not allowed
      entitlement.carryForward = 0;
      await entitlement.save();
      return;
    }

    // Calculate unused days
    const unusedDays = entitlement.remaining || 0;

    // Apply cap (use policy max or env variable default)
    const maxCarryForward =
      policy.maxCarryForward ||
      parseInt(process.env.MAX_CARRY_FORWARD_DAYS || '45');
    const carriedForward = Math.min(unusedDays, maxCarryForward);

    // Update entitlement for new period
    entitlement.carryForward = carriedForward;
    entitlement.taken = 0;
    entitlement.pending = 0;
    entitlement.accruedActual = 0;
    entitlement.accruedRounded = 0;
    entitlement.remaining =
      (entitlement.yearlyEntitlement || 0) + carriedForward;

    // Calculate expiry date if specified
    await entitlement.save();
  }

  /**
   * Run year-end carry-forward for all employees
   * REQ-041: Automatic carry-forward processing
   * @returns Processing result
   */
  async runYearEndCarryForward(): Promise<{
    processed: number;
    capped: Array<{
      employeeId: string;
      leaveTypeId: string;
      original: number;
      capped: number;
    }>;
    failed: Array<{ employeeId: string; error: string }>;
  }> {
    const processed: number[] = [];
    const capped: Array<{
      employeeId: string;
      leaveTypeId: string;
      original: number;
      capped: number;
    }> = [];
    const failed: Array<{ employeeId: string; error: string }> = [];

    const entitlements = await this.leaveEntitlementModel.find().exec();

    for (const entitlement of entitlements) {
      try {
        const employeeId = entitlement.employeeId.toString();
        const leaveTypeId = entitlement.leaveTypeId.toString();

        const policy = await this.leavePolicyModel
          .findOne({ leaveTypeId })
          .exec();
        if (!policy || !policy.carryForwardAllowed) continue;

        const originalRemaining = entitlement.remaining || 0;
        const maxCarryForward =
          policy.maxCarryForward ||
          parseInt(process.env.MAX_CARRY_FORWARD_DAYS || '45');

        // Process carry-forward
        await this.processCarryForwardForEmployee(employeeId, leaveTypeId);

        // Track if capping was applied
        if (originalRemaining > maxCarryForward) {
          capped.push({
            employeeId,
            leaveTypeId,
            original: originalRemaining,
            capped: maxCarryForward,
          });
        }

        processed.push(1);
      } catch (error) {
        failed.push({
          employeeId: entitlement.employeeId.toString(),
          error: error.message,
        });
      }
    }

    return {
      processed: processed.length,
      capped,
      failed,
    };
  }

  // ==================== APPROVAL WORKFLOW ====================

  /**
   * REQ-020: Get employee's manager from Organization Structure
   * Employee - PositionAssignment - Position - reportsToPositionId - find employee in that position
   */
  private async getEmployeeManagerId(
    employeeId: string,
  ): Promise<string | null> {
    const now = new Date();
    let departmentId: Types.ObjectId | string | undefined;

    // Step 1: Active assignment (preferred source of truth)
    const assignment = await this.findActiveAssignmentByEmployee(employeeId, now);
    let position: any = assignment?.positionId;
    departmentId = assignment?.departmentId;

    if (position?.reportsToPositionId) {
      const manager = await this.findActiveOccupantByPosition(
        position.reportsToPositionId,
        now,
      );
      if (manager) return manager;
    }

    // Step 2: Supervisor explicitly set on profile
    const profileOrg = await this.getEmployeeProfileOrgLinks(employeeId);
    if (profileOrg?.supervisorPositionId) {
      const manager = await this.findActiveOccupantByPosition(
        profileOrg.supervisorPositionId,
        now,
      );
      if (manager) return manager;
    }

    // Step 3: Primary position -> reportsTo chain
    if (!position && profileOrg?.primaryPositionId) {
      position = await this.getPositionById(profileOrg.primaryPositionId);
    }
    if (position?.reportsToPositionId) {
      const manager = await this.findActiveOccupantByPosition(
        position.reportsToPositionId,
        now,
      );
      if (manager) return manager;
    }

    // Step 4: Department head as last resort
    if (!departmentId) {
      departmentId =
        profileOrg?.primaryDepartmentId ||
        (position as any)?.departmentId ||
        undefined;
    }
    const deptHead = await this.resolveDepartmentHeadOccupant(departmentId, now);
    if (deptHead) return deptHead;

    this.logger.warn(
      `No manager found for employee ${employeeId} via assignment, profile, or department head`,
    );
    return null;
  }

  /**
   * REQ-023: Check delegation (use existing in-memory Map from controller)
   * This will be called from controller with delegation context
   */
  async determineApprover(
    employeeId: string,
    delegations?: Map<string, string>,
  ): Promise<string | null> {
    const managerId = await this.getEmployeeManagerId(employeeId);
    if (!managerId) {
      return null;
    }

    // Check if manager has delegated (passed from controller)
    if (delegations && delegations.has(managerId)) {
      return delegations.get(managerId) || null;
    }

    return managerId;
  }

  /**
   * REQ-021/022: Check if user can approve/reject
   */
  async isUserAuthorizedToApprove(
    request: LeaveRequest,
    userId: string,
    targetRole?: string, // The specific role the user is trying to approve
  ): Promise<boolean> {
    console.log('[Authorization Debug] Starting authorization check:', {
      userId,
      targetRole,
      approvalFlow: request.approvalFlow,
    });

    if (!Types.ObjectId.isValid(userId)) {
      console.log('[Authorization Debug] Invalid userId');
      return false;
    }

    // If targetRole is provided, check authorization for that specific step
    // Otherwise, check the first pending step (backward compatibility)
    const currentStep = targetRole
      ? request.approvalFlow.find((s) => s.role === targetRole && s.status === 'pending')
      : request.approvalFlow.find((s) => s.status === 'pending');

    console.log('[Authorization Debug] Found step:', currentStep);

    if (!currentStep) {
      console.log('[Authorization Debug] No pending step found for role:', targetRole);
      return false;
    }

    const now = new Date();

    // Extract employeeId once for reuse
    // Handle both populated (object with _id) and non-populated (ObjectId or string) cases
    const employeeId =
      (request.employeeId as any)?._id?.toString?.() ||  // Populated: extract _id
      (request.employeeId as any)?.toString?.() ||       // ObjectId: convert to string
      (request.employeeId as any);                       // Already a string

    console.log('[Authorization Debug] employeeId:', employeeId);

    if (!Types.ObjectId.isValid(employeeId)) {
      console.log('[Authorization Debug] Invalid employeeId');
      return false;
    }

    // Quick HR role check - query EmployeeSystemRole collection
    const hasHrRole = async (): Promise<boolean> => {
      // Query the employee_system_roles collection instead of accessProfileId
      const systemRoleDoc = await this.employeeProfileModel.db
        .collection('employee_system_roles')
        .findOne({ employeeProfileId: new Types.ObjectId(userId) });

      console.log('[hasHrRole Debug] System role document:', {
        userId,
        systemRoleDoc,
      });

      const roles = (systemRoleDoc?.roles as SystemRole[]) || [];

      console.log('[hasHrRole Debug] Roles found:', roles);

      const hasRole = roles.some((role) =>
        [
          SystemRole.HR_ADMIN,
          SystemRole.HR_MANAGER,
          SystemRole.HR_EMPLOYEE,
        ].includes(role),
      );

      console.log('[hasHrRole Debug] Has HR role:', hasRole);

      return hasRole;
    };

    // Check if user sits anywhere in the employee's manager chain via reportsToPositionId
    const isInReportingChain = async (): Promise<boolean> => {
      const managerPositionIds: string[] = [];
      // Start from employee's current position (assignment preferred, profile fallback)
      let currentPositionId =
        (await this.getEmployeeCurrentPositionId(employeeId, now)) || null;

      // Walk up the reports-to chain collecting manager positions
      while (currentPositionId) {
        const position = await this.getPositionById(currentPositionId);
        if (!position?.reportsToPositionId) break;
        const managerPositionId = position.reportsToPositionId.toString();
        managerPositionIds.push(managerPositionId);
        currentPositionId = managerPositionId;
      }

      // Fallback: department head if no positional chain
      if (!managerPositionIds.length) {
        const profileOrg = await this.getEmployeeProfileOrgLinks(employeeId);
        const deptHead = await this.resolveDepartmentHeadOccupant(
          profileOrg?.primaryDepartmentId,
          now,
        );
        return deptHead === userId;
      }

      // Does the user hold any of those manager positions (at any level)?
      const userAssignment = await this.positionAssignmentModel
        .findOne({
          employeeProfileId: new Types.ObjectId(userId),
          positionId: {
            $in: managerPositionIds.map((id) => new Types.ObjectId(id)),
          },
          startDate: { $lte: now },
          $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } },
          ],
        })
        .lean()
        .exec();

      if (userAssignment) return true;

      // Or user holds the manager position via primaryPositionId (profile fallback)
      const userProfileOrg = await this.getEmployeeProfileOrgLinks(userId);
      if (
        userProfileOrg?.primaryPositionId &&
        managerPositionIds.includes(userProfileOrg.primaryPositionId.toString())
      ) {
        return true;
      }

      // Lastly, user is the department head of employee's department
      const profileOrg = await this.getEmployeeProfileOrgLinks(employeeId);
      const deptHead = await this.resolveDepartmentHeadOccupant(
        profileOrg?.primaryDepartmentId,
        now,
      );
      return deptHead === userId;
    };

    const [hrRole, managerInChain, isDeptHead] = await Promise.all([
      hasHrRole(),
      isInReportingChain(),
      this.isDeptHeadForEmployee(userId, employeeId),
    ]);

    // DEBUG: Log authorization checks
    console.log('[Authorization Debug]', {
      userId,
      employeeId,
      targetRole,
      currentStepRole: currentStep.role,
      hrRole,
      managerInChain,
      isDeptHead,
    });

    // Manager step: user must be in reporting chain or HR override
    if (currentStep.role === 'Manager') {
      const authorized = managerInChain || hrRole || isDeptHead;
      console.log('[Authorization Debug] Manager step authorization:', authorized);
      return authorized;
    }

    // HR step: check if user has HR role
    if (currentStep.role === 'HR') {
      console.log('[Authorization Debug] HR step authorization:', hrRole);
      return hrRole;
    }

    console.log('[Authorization Debug] No matching step role');
    return false;
  }

  /**
   * BR-28: Escalate to next level using Organization Structure
   * currentManagerId - Position - reportsToPositionId - employee in that position
   */
  private async escalateToNextLevel(
    currentManagerId: string,
  ): Promise<string | null> {
    // Get current manager's position
    const managerAssignment = await this.positionAssignmentModel
      .findOne({
        employeeProfileId: new Types.ObjectId(currentManagerId),
        startDate: { $lte: new Date() },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: new Date() } },
        ],
      })
      .populate('positionId');

    if (!managerAssignment || !managerAssignment.positionId) {
      return null;
    }

    const position = managerAssignment.positionId as any;

    // Get reportsToPositionId (manager's manager position)
    if (!position.reportsToPositionId) {
      return null; // No higher level
    }

    // Find employee in that position
    const higherManagerAssignment = await this.positionAssignmentModel.findOne({
      positionId: position.reportsToPositionId,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    if (!higherManagerAssignment) {
      return null; // Position not staffed
    }

    return higherManagerAssignment.employeeProfileId.toString();
  }

  /**
   * BR-28: Escalate stale approvals to manager's manager via reportsToPositionId
   */
  async escalateStaleApprovals(): Promise<{
    escalated: number;
    errors: string[];
  }> {
    const thresholdHours = parseInt(process.env.AUTO_ESCALATION_HOURS || '48');
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - thresholdHours);

    // Find pending requests older than threshold
    const staleRequests = await this.leaveRequestModel.find({
      status: LeaveStatus.PENDING,
      createdAt: { $lt: thresholdDate },
    });

    const errors: string[] = [];
    let escalated = 0;

    for (const request of staleRequests) {
      try {
        // Find first pending step
        const pendingIndex = request.approvalFlow.findIndex(
          (s) => s.status === 'pending',
        );
        if (pendingIndex === -1) continue;

        const currentStep = request.approvalFlow[pendingIndex];

        // Check if step is stale
        const stepCreatedAt =
          currentStep.decidedAt || (request as any).createdAt;
        if (stepCreatedAt > thresholdDate) continue;

        // ESCALATION LOGIC: Find manager's manager via reportsToPositionId
        if (currentStep.role === 'Manager' && currentStep.decidedBy) {
          const newManagerId = await this.escalateToNextLevel(
            currentStep.decidedBy.toString(),
          );

          if (newManagerId) {
            // Reassign to higher-level manager
            currentStep.decidedBy = new Types.ObjectId(newManagerId);

            await request.save();
            escalated++;

            await this.logNotification(
              newManagerId,
              'LEAVE_ESCALATED',
              `Leave request for employee ${request.employeeId.toString()} escalated to you after pending > ${thresholdHours} hours`,
            );

            await this.logNotification(
              request.employeeId.toString(),
              'LEAVE_ESCALATED_INFO',
              'Your leave request was escalated to a higher-level manager due to pending approval.',
            );
          } else {
            // No higher manager available; leave pending and record for monitoring
            errors.push(
              `Request ${request._id}: no higher manager found for escalation`,
            );
          }
        } else if (currentStep.role === 'HR') {
          // HR stale: notify HR and employee but do not auto-approve
          const managerStep = request.approvalFlow.find(
            (f) => f.role === 'Manager',
          );
          const managerId = managerStep?.decidedBy?.toString();

          await this.logNotification(
            request.employeeId.toString(),
            'LEAVE_HR_PENDING_ESCALATION',
            'Your leave request is pending HR action beyond the escalation window',
          );

          if (managerId) {
            await this.logNotification(
              managerId,
              'LEAVE_HR_PENDING_ESCALATION_NOTIFY',
              `Leave request for employee ${request.employeeId.toString()} is pending HR action beyond escalation window`,
            );
          }
        }
      } catch (error) {
        errors.push(`Request ${request._id}: ${error.message}`);
      }
    }

    return { escalated, errors };
  }

  /**
   * REQ-026: HR Admin override
   */
  async hrOverrideRequest(
    requestId: string,
    decision: 'approve' | 'reject',
    justification: string,
    hrAdminId: string,
  ): Promise<LeaveRequest> {
    const request = await this.leaveRequestModel
      .findById(requestId)
      .populate('leaveTypeId')
      .populate('employeeId');

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Extract IDs properly (handle populated fields)
    const employeeIdStr = (request.employeeId as any)?._id?.toString() || (request.employeeId as any)?.toString();
    const leaveTypeIdStr = (request.leaveTypeId as any)?._id?.toString() || (request.leaveTypeId as any)?.toString();

    // Store previous status for balance tracking
    const wasStatus = request.status;

    const now = new Date();

    if (decision === 'approve') {
      // Approve all pending steps
      for (const step of request.approvalFlow) {
        if (step.status !== 'approved') {
          step.status = 'approved';
          step.decidedBy = new Types.ObjectId(hrAdminId);
          step.decidedAt = now;
        }
      }

      request.status = LeaveStatus.APPROVED;
    } else {
      // Reject - update all pending steps to rejected
      for (const step of request.approvalFlow) {
        if (step.status === 'pending') {
          step.status = 'rejected';
          step.decidedBy = new Types.ObjectId(hrAdminId);
          step.decidedAt = now;
        }
      }

      request.status = LeaveStatus.REJECTED;
    }

    const saved = await request.save();

    // Balance handling based on status transitions
    if (wasStatus !== LeaveStatus.APPROVED && saved.status === LeaveStatus.APPROVED) {
      // Transitioning to APPROVED - deduct balance
      await this.deductFromBalance(
        employeeIdStr,
        leaveTypeIdStr,
        request.durationDays,
      );

      // Sync with payroll
      await this.syncLeaveApprovalWithPayroll(
        employeeIdStr,
        leaveTypeIdStr,
        request.durationDays,
        request.dates.from,
        request.dates.to,
      );
    } else if (
      wasStatus === LeaveStatus.PENDING &&
      saved.status === LeaveStatus.REJECTED
    ) {
      // Transitioning from PENDING to REJECTED - release pending balance
      await this.releasePendingBalance(
        employeeIdStr,
        leaveTypeIdStr,
        request.durationDays,
      );
    } else if (
      wasStatus === LeaveStatus.APPROVED &&
      saved.status === LeaveStatus.REJECTED
    ) {
      // Transitioning from APPROVED to REJECTED - return deducted balance to available
      await this.returnDeductedBalance(
        employeeIdStr,
        leaveTypeIdStr,
        request.durationDays,
      );
    }

    await this.logNotification(
      employeeIdStr,
      `LEAVE_${saved.status.toUpperCase()}`,
      `Your leave request was ${saved.status} by HR override: ${justification}`,
    );

    const managerStep = request.approvalFlow.find((f) => f.role === 'Manager');
    const managerId = managerStep?.decidedBy?.toString();
    if (managerId) {
      await this.logNotification(
        managerId,
        `LEAVE_${saved.status.toUpperCase()}_NOTIFY`,
        `Leave request for employee ${employeeIdStr} ${saved.status} by HR override`,
      );
    }

    return saved;
  }

  /**
   * Update approval workflow for a leave request
   * Allows HR Admin to modify the approval flow steps, roles, and decisions
   *
   * @param requestId ID of the leave request
   * @param approvalFlow Updated approval flow steps
   * @param hrAdminId ID of the HR Admin making the change
   * @returns Updated leave request
   * @access HR Admin only
   */
  async updateApprovalFlow(
    requestId: string,
    approvalFlow: {
      role: string;
      status: string;
      decidedBy?: string;
      decidedAt?: Date;
    }[],
    hrAdminId: string,
  ): Promise<LeaveRequest> {
    // Validate request ID
    if (!Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException('Invalid request ID format');
    }

    // Fetch the leave request
    const request = await this.leaveRequestModel
      .findById(requestId)
      .populate('leaveTypeId')
      .exec();

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Validate approval flow steps
    if (!approvalFlow || approvalFlow.length === 0) {
      throw new BadRequestException(
        'Approval flow must contain at least one step',
      );
    }

    // Validate decidedBy IDs
    for (const step of approvalFlow) {
      if (step.decidedBy && !Types.ObjectId.isValid(step.decidedBy)) {
        throw new BadRequestException(
          `Invalid decidedBy ID format: ${step.decidedBy}`,
        );
      }
    }

    // Store old approval flow for audit logging
    const oldApprovalFlow = JSON.parse(JSON.stringify(request.approvalFlow));

    // Update approval flow
    request.approvalFlow = approvalFlow.map((step) => ({
      role: step.role,
      status: step.status,
      decidedBy: step.decidedBy
        ? new Types.ObjectId(step.decidedBy)
        : undefined,
      decidedAt: step.decidedAt ? new Date(step.decidedAt) : undefined,
    }));

    // Recalculate overall status based on updated approval flow
    const hasRejected = request.approvalFlow.some((s) => s.status === 'rejected');
    const allApproved = request.approvalFlow.every((s) => s.status === 'approved');

    const oldStatus = request.status;

    if (hasRejected) {
      request.status = LeaveStatus.REJECTED;

      // If status changed from approved to rejected, release the balance
      if (oldStatus === LeaveStatus.APPROVED) {
        const leaveType = request.leaveTypeId as any;
        if (leaveType.paid) {
          await this.releasePendingBalance(
            request.employeeId.toString(),
            request.leaveTypeId.toString(),
            request.durationDays,
          );
        }
      }
    } else if (allApproved) {
      request.status = LeaveStatus.APPROVED;

      // If status changed from pending/rejected to approved, deduct balance
      if (oldStatus !== LeaveStatus.APPROVED) {
        const leaveType = request.leaveTypeId as any;
        if (leaveType.paid) {
          await this.deductFromBalance(
            request.employeeId.toString(),
            request.leaveTypeId.toString(),
            request.durationDays,
          );
        }
      }
    } else {
      request.status = LeaveStatus.PENDING;

      // If status changed from approved to pending, release the balance
      if (oldStatus === LeaveStatus.APPROVED) {
        const leaveType = request.leaveTypeId as any;
        if (leaveType.paid) {
          await this.releasePendingBalance(
            request.employeeId.toString(),
            request.leaveTypeId.toString(),
            request.durationDays,
          );
        }
      }
    }

    const saved = await request.save();

    // Log notification to employee if status changed
    if (oldStatus !== saved.status) {
      await this.logNotification(
        request.employeeId.toString(),
        `LEAVE_${saved.status.toUpperCase()}`,
        `Your leave request status changed to ${saved.status} due to approval flow update by HR Admin`,
      );
    }

    // Log audit trail
    this.logger.log(
      `HR Admin ${hrAdminId} updated approval flow for request ${requestId}. ` +
        `Status changed from ${oldStatus} to ${saved.status}`,
    );

    return saved;
  }

  /**
   * BR-41: Check cumulative leave limits (rolling 12 months)
   * NOTE: Requires 'cumulativeLeaveLimit' field in LeavePolicy schema (currently not present)
   */
  private async checkCumulativeLimits(
    employeeId: string,
    leaveTypeId: string,
    requestedDays: number,
  ): Promise<{ withinLimit: boolean; used: number; limit: number }> {
    const policy = await this.leavePolicyModel.findOne({ leaveTypeId });

    // TODO: Add 'cumulativeLeaveLimit' field to LeavePolicy schema to enable this check
    // For now, skip cumulative limit validation if field doesn't exist
    const limit = (policy as any)?.cumulativeLeaveLimit;
    if (!policy || !limit) {
      return { withinLimit: true, used: 0, limit: 0 };
    }

    // Rolling 12-month window
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Get all approved leaves in past 12 months for this type
    const pastLeaves = await this.leaveRequestModel.find({
      employeeId: new Types.ObjectId(employeeId),
      leaveTypeId: new Types.ObjectId(leaveTypeId),
      status: LeaveStatus.APPROVED,
      'dates.from': { $gte: startDate, $lte: endDate },
    });

    const usedDays = pastLeaves.reduce(
      (sum, leave) => sum + leave.durationDays,
      0,
    );
    const totalWithNew = usedDays + requestedDays;

    return {
      withinLimit: totalWithNew <= limit,
      used: usedDays,
      limit: limit,
    };
  }

  /**
   * Helper: Get allowed MIME types for attachment type
   */
  private getAllowedMimeTypes(attachmentType: string): string[] {
    const typeMap = {
      MEDICAL_CERTIFICATE: ['application/pdf', 'image/jpeg', 'image/png'],
      TRAVEL_DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/png'],
      MARRIAGE_CERTIFICATE: ['application/pdf', 'image/jpeg', 'image/png'],
      DEATH_CERTIFICATE: ['application/pdf', 'image/jpeg', 'image/png'],
      OTHER: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/msword',
      ],
    };

    return typeMap[attachmentType] || typeMap['OTHER'];
  }

  // ==================== PAYROLL INTEGRATION ====================

  /**
   * Sync leave approval with payroll system
   * Handles paid/unpaid leave deductions and encashments in real-time
   * @param employeeId Employee ID
   * @param leaveTypeId Leave type ID
   * @param durationDays Number of leave days
   * @param fromDate Leave start date
   * @param toDate Leave end date
   */
  private async syncLeaveApprovalWithPayroll(
    employeeId: string,
    leaveTypeId: string,
    durationDays: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<void> {
    try {
      // Get leave type to check if paid or unpaid
      const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
      if (!leaveType) {
        this.logger.warn(
          `Leave type not found for payroll sync: ${leaveTypeId}`,
        );
        return;
      }

      // Check if employee is terminated/resigned - process final settlement
      const employee = await this.employeeProfileModel.findById(employeeId);
      if (
        employee &&
        (employee.status === EmployeeStatus.TERMINATED ||
          employee.status === EmployeeStatus.RETIRED)
      ) {
        await this.processFinalSettlementForTerminatedEmployee(employeeId);
        return;
      }

      // For unpaid leave: Calculate and add deduction to payroll
      if (!leaveType.paid) {
        await this.addUnpaidLeaveDeduction(
          employeeId,
          durationDays,
          fromDate,
          toDate,
        );
      }

      // For paid leave: No deduction needed (balance already deducted)
      // Encashment will be handled during final settlement if employee terminates
    } catch (error) {
      this.logger.error(
        `Failed to sync leave approval with payroll for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - allow leave approval to proceed even if payroll sync fails
    }
  }

  /**
   * Add unpaid leave deduction to payroll
   * Formula: (Base Salary / Work Days in Month) Ã Unpaid Leave Days
   * @param employeeId Employee ID
   * @param unpaidDays Number of unpaid leave days
   * @param fromDate Leave start date
   * @param toDate Leave end date
   */
  private async addUnpaidLeaveDeduction(
    employeeId: string,
    unpaidDays: number,
    fromDate: Date,
    toDate: Date,
  ): Promise<void> {
    try {
      // Get employee's base salary from latest payroll details or employee profile
      const baseSalary = await this.getEmployeeBaseSalary(employeeId);
      if (!baseSalary || baseSalary <= 0) {
        this.logger.warn(
          `Cannot calculate unpaid leave deduction: base salary not found for employee ${employeeId}`,
        );
        return;
      }

      // Calculate work days in the month (typically 22-23 working days)
      const workDaysInMonth = this.getWorkDaysInMonth(fromDate);

      // Calculate deduction: (Base Salary / Work Days in Month) Ã Unpaid Leave Days
      const deductionAmount = (baseSalary / workDaysInMonth) * unpaidDays;

      // Find or create payslip for the current payroll period
      const payrollPeriod = this.getPayrollPeriodForDate(fromDate);
      const payslip = await this.findOrCreatePayslipForPeriod(
        employeeId,
        payrollPeriod,
      );

      if (payslip) {
        // Add unpaid leave deduction to penalties
        if (!payslip.deductionsDetails) {
          payslip.deductionsDetails = {
            taxes: [],
            insurances: [],
            penalties: {
              employeeId: new Types.ObjectId(employeeId),
              penalties: [],
            },
          };
        }

        if (!payslip.deductionsDetails.penalties) {
          payslip.deductionsDetails.penalties = {
            employeeId: new Types.ObjectId(employeeId),
            penalties: [],
          };
        }

        // Add unpaid leave penalty
        if (payslip.deductionsDetails.penalties && payslip.deductionsDetails.penalties.penalties) {
          payslip.deductionsDetails.penalties.penalties.push({
            reason: `Unpaid Leave Deduction (${unpaidDays} days from ${fromDate.toISOString().split('T')[0]} to ${toDate.toISOString().split('T')[0]})`,
            amount: deductionAmount,
          });

          // Recalculate totals
          const totalPenalties = payslip.deductionsDetails.penalties.penalties.reduce(
            (sum, p) => sum + p.amount,
            0,
          );
          const previousPenaltyTotal = payslip.deductionsDetails.penalties.penalties.length > 1
            ? payslip.deductionsDetails.penalties.penalties[
          payslip.deductionsDetails.penalties.penalties.length - 2
            ]?.amount || 0
            : 0;
          const totalDeductions =
            (payslip.totaDeductions || 0) +
            deductionAmount -
            previousPenaltyTotal;
          payslip.totaDeductions = totalDeductions;
          payslip.netPay = payslip.totalGrossSalary - totalDeductions;

          await payslip.save();

          this.logger.log(
            `Added unpaid leave deduction of ${deductionAmount} for employee ${employeeId}`,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to add unpaid leave deduction for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Process unapproved absences by adding unpaid leave deductions to payroll
   * Formula: (Base Salary / Work Days in Month) x Unpaid Leave Days
   */
  async processUnapprovedAbsence(
    employeeId: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<void> {
    const unpaidDays =
      Math.ceil(
        (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;
    await this.addUnpaidLeaveDeduction(employeeId, unpaidDays, fromDate, toDate);
  }

  /**
   * Process final settlement for terminated/resigned employee
   * Automatically converts remaining leave balance to encashment or deduction
   * @param employeeId Employee ID
   */
  async processFinalSettlementForTerminatedEmployee(
    employeeId: string,
  ): Promise<void> {
    try {
      const employee = await this.employeeProfileModel.findById(employeeId);
      if (!employee) {
        throw new NotFoundException('Employee not found');
      }

      if (
        employee.status !== EmployeeStatus.TERMINATED &&
        employee.status !== EmployeeStatus.RETIRED
      ) {
        // Only process for terminated/resigned employees
        return;
      }

      // Get all entitlements for the employee
      const entitlements = await this.leaveEntitlementModel
        .find({ employeeId })
        .populate('leaveTypeId')
        .exec();

      for (const entitlement of entitlements) {
        const leaveType = entitlement.leaveTypeId as any;

        // Only process encashment for paid leave types with remaining balance
        if (leaveType.paid && entitlement.remaining > 0) {
          // Calculate encashment
          const encashment = await this.calculateEncashment(
            employeeId,
            leaveType._id.toString(),
          );

          if (encashment.encashmentAmount > 0) {
            // Add encashment to payroll
            await this.addLeaveEncashmentToPayroll(
              employeeId,
              encashment.encashmentAmount,
              leaveType.name,
              entitlement.remaining,
            );

            // Reset entitlement after encashment
            entitlement.remaining = 0;
            entitlement.taken = 0;
            entitlement.pending = 0;
            await entitlement.save();

            this.logger.log(
              `Processed final settlement: ${encashment.encashmentAmount} encashment for employee ${employeeId}, leave type ${leaveType.name}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to process final settlement for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Add leave encashment to payroll earnings
   * @param employeeId Employee ID
   * @param encashmentAmount Encashment amount
   * @param leaveTypeName Leave type name
   * @param unusedDays Number of unused days encashed
   */
  private async addLeaveEncashmentToPayroll(
    employeeId: string,
    encashmentAmount: number,
    leaveTypeName: string,
    unusedDays: number,
  ): Promise<void> {
    try {
      const now = new Date();
      const payrollPeriod = this.getPayrollPeriodForDate(now);
      const payslip = await this.findOrCreatePayslipForPeriod(
        employeeId,
        payrollPeriod,
      );

      if (payslip) {
        // Add encashment to earnings refunds
        if (!payslip.earningsDetails) {
          payslip.earningsDetails = {
            baseSalary: 0,
            allowances: [],
            bonuses: [],
            benefits: [],
            refunds: [],
          };
        }

        if (!payslip.earningsDetails.refunds) {
          payslip.earningsDetails.refunds = [];
        }

        payslip.earningsDetails.refunds.push({
          description: `Leave Encashment - ${leaveTypeName} (${unusedDays} days)`,
          amount: encashmentAmount,
        } as any);

        // Recalculate totals
        const totalRefunds = payslip.earningsDetails.refunds.reduce(
          (sum, r) => sum + (r.amount || 0),
          0,
        );
        payslip.totalGrossSalary =
          (payslip.totalGrossSalary || 0) + encashmentAmount;
        payslip.netPay = payslip.totalGrossSalary - (payslip.totaDeductions || 0);

        await payslip.save();

        this.logger.log(
          `Added leave encashment of ${encashmentAmount} to payroll for employee ${employeeId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to add leave encashment to payroll for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Get employee base salary from latest payroll details or employee profile
   * @param employeeId Employee ID
   * @returns Base salary amount
   */
  private async getEmployeeBaseSalary(employeeId: string): Promise<number | null> {
    try {
      // Try to get from latest payroll details
      const latestPayrollDetails = await this.employeePayrollDetailsModel
        .findOne({ employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      if (latestPayrollDetails && latestPayrollDetails.baseSalary > 0) {
        return latestPayrollDetails.baseSalary;
      }

      // Fallback: Try to get from latest payslip
      const latestPayslip = await this.paySlipModel
        .findOne({ employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      if (latestPayslip && latestPayslip.earningsDetails?.baseSalary) {
        return latestPayslip.earningsDetails.baseSalary;
      }

      // Fallback: Try to get from employee profile pay grade (if populated)
      const profileWithGrade = await this.employeeProfileModel
        .findById(employeeId)
        .populate('payGradeId')
        .lean()
        .exec();

      const payGradeDoc = (profileWithGrade as any)?.payGradeId;
      if (payGradeDoc && typeof payGradeDoc.baseSalary === 'number' && payGradeDoc.baseSalary > 0) {
        return payGradeDoc.baseSalary;
      }

      // If payroll module provides another salary source, hook it here
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to get base salary for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  /**
   * Get work days in a month (excluding weekends)
   * Typically 22-23 working days per month
   * @param date Date in the month
   * @returns Number of work days
   */
  private getWorkDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let workDays = 0;
    for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
    }

    return workDays || 22; // Default to 22 if calculation fails
  }

  /**
   * Get payroll period identifier for a given date
   * Format: YYYY-MM (e.g., "2024-01")
   * @param date Date
   * @returns Payroll period string
   */
  private getPayrollPeriodForDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Find or create payslip for a payroll period
   * @param employeeId Employee ID
   * @param payrollPeriod Payroll period (YYYY-MM format)
   * @returns Payslip document or null
   */
  private async findOrCreatePayslipForPeriod(
    employeeId: string,
    payrollPeriod: string,
  ): Promise<PayslipDocument | null> {
    try {
      // Try to find existing payslip for this period
      // Note: This assumes payrollRunId or period tracking exists
      // For now, we'll find the most recent payslip or create a placeholder
      const existingPayslip = await this.paySlipModel
        .findOne({ employeeId: new Types.ObjectId(employeeId) })
        .sort({ createdAt: -1 })
        .exec();

      if (existingPayslip) {
        return existingPayslip;
      }

      // If no payslip exists, we cannot create one without a payrollRunId
      // Log this for payroll processing to handle
      this.logger.warn(
        `No payslip found for employee ${employeeId} in period ${payrollPeriod}. Payroll processing should create payslip first.`,
      );

      // Return null - payroll processing should create payslips
      return null;
    } catch (error) {
      this.logger.error(
        `Failed to find or create payslip for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }
}
