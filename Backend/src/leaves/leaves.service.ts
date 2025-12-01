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
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { HolidayType } from '../time-management/models/enums';
import { LeaveStatus } from './enums/leave-status.enum';
import { RoundingRule } from './enums/rounding-rule.enum';
import { AccrualMethod } from './enums/accrual-method.enum';

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
  ) {}

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
    return await this.leavePolicyModel.find().populate('leaveTypeId').exec();
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

    if (fromDate >= toDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const leaveType = await this.leaveTypeModel.findById(data.leaveTypeId);
    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
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
    const balanceCheck = await this.checkBalanceSufficiency(
      data.employeeId,
      data.leaveTypeId,
      netDays,
    );

    // Document requirement check
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

    return await request.save();
  }

  async getAllLeaveRequests(filters?: {
    employeeId?: string;
    leaveTypeId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    departmentId?: string;
    sortBy?: 'dates.from' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const baseMatch: any = {};

    if (filters?.employeeId) {
      if (!Types.ObjectId.isValid(filters.employeeId)) {
        throw new BadRequestException('Invalid employee ID format');
      }
      baseMatch.employeeId = new Types.ObjectId(filters.employeeId);
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

    // If department filter is provided, use aggregation with lookup to employee_profiles
    if (filters?.departmentId) {
      if (!Types.ObjectId.isValid(filters.departmentId)) {
        throw new BadRequestException('Invalid department ID format');
      }
      const deptId = new Types.ObjectId(filters.departmentId);
      const pipeline: any[] = [
        { $match: baseMatch },
        {
          $lookup: {
            from: 'employee_profiles',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employeeDoc',
          },
        },
        { $unwind: '$employeeDoc' },
        { $match: { 'employeeDoc.primaryDepartmentId': deptId } },
        {
          $lookup: {
            from: 'leavetypes',
            localField: 'leaveTypeId',
            foreignField: '_id',
            as: 'leaveType',
          },
        },
        { $unwind: { path: '$leaveType', preserveNullAndEmptyArrays: true } },
        { $sort: { [sortField]: sortOrder } },
      ];

      return await this.leaveRequestModel.aggregate(pipeline).exec();
    }

    // Default path without department filter
    return await this.leaveRequestModel
      .find(baseMatch)
      .populate('leaveTypeId')
      .populate('employeeId')
      .sort({ [sortField]: sortOrder })
      .exec();
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

    const request = await this.leaveRequestModel.findById(id);
    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    // Update overall status
    request.status = data.status;

    // Update approval flow if role is provided
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
      }
    }

    return await request.save();
  }

  async cancelLeaveRequest(id: string, employeeId: string) {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const request = await this.leaveRequestModel.findOne({
      _id: id,
      employeeId: employeeId,
    });

    if (!request) {
      throw new NotFoundException(
        'Leave request not found or you do not have permission to cancel it',
      );
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    request.status = LeaveStatus.CANCELLED;
    return await request.save();
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
      // TODO: Replace with actual Employee Profile service call when integrated
      // Example: const employee = await this.employeeProfileService.getEmployeeById(employeeId);

      // For now, return null to indicate Employee Profile integration is pending
      // This will allow the system to work without strict validation until integration is complete
      return null;

      /* When Employee Profile is integrated, implement like this:
            const employee = await this.employeeProfileService.getEmployeeById(employeeId);

            // Calculate tenure in months
            const hireDate = new Date(employee.hireDate);
            const now = new Date();
            const tenureMonths = Math.floor((now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

            return {
                tenureMonths,
                position: employee.jobTitle || employee.position,
                contractType: employee.contractType,
                grade: employee.grade || employee.level,
                location: employee.location || employee.office
            };
            */
    } catch (error) {
      console.error(
        'Failed to fetch employee data from Employee Profile module:',
        error.message,
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

    // Recalculate remaining
    const total =
      (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
    entitlement.remaining =
      total - (entitlement.taken || 0) - (entitlement.pending || 0);

    return await entitlement.save();
  }

  // ==================== LEAVE ADJUSTMENTS ====================

  async createAdjustment(data: {
    employeeId: string;
    leaveTypeId: string;
    adjustmentType: string;
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

    const adjustment = new this.leaveAdjustmentModel(data);
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
    const year = from.getFullYear();
    const calendar = await this.calendarModel.findOne({ year });

    if (!calendar) {
      return;
    }

    const hasBlockedDates = calendar.blockedPeriods.some((period) => {
      const periodFrom = new Date(period.from);
      const periodTo = new Date(period.to);
      return from <= periodTo && to >= periodFrom;
    });

    if (hasBlockedDates) {
      throw new BadRequestException(
        'Leave request overlaps with blocked period. Leave requests are not allowed during this time.',
      );
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

    // Recalculate remaining
    const total =
      (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
    entitlement.remaining = total - entitlement.taken - entitlement.pending;

    // BR-48: Prevent negative balance
    if (entitlement.remaining < 0) {
      throw new BadRequestException(
        'Operation would result in negative balance',
      );
    }

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

    // Recalculate remaining
    const total =
      (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
    entitlement.remaining = total - entitlement.taken - entitlement.pending;

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

    const query: any = { _id: { $ne: new Types.ObjectId(managerId) } };
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

    // TODO: Fetch daily salary rate from Payroll module
    // const dailySalaryRate = await this.payrollService.getDailySalaryRate(employeeId);
    const dailySalaryRate = 0; // Placeholder

    // BR-53: Capped at 30 days
    const unusedDays = Math.min(entitlement.remaining, 30);

    const encashmentAmount = dailySalaryRate * unusedDays;

    return {
      employeeId,
      leaveType: (entitlement.leaveTypeId as any).name,
      unusedDays,
      dailySalaryRate,
      encashmentAmount,
      formula: `Daily Salary Rate × Unused Days (capped at 30) = ${dailySalaryRate} × ${unusedDays} = ${encashmentAmount}`,
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

    const entitlements = await this.leaveEntitlementModel
      .find({ employeeId })
      .populate('leaveTypeId');

    const settlements = [];
      // TODO: Replace with actual
    // for (const entitlement of entitlements) {
    //   const leaveType = entitlement.leaveTypeId as any;
    //
    //   // Only encash annual leave types
    //   if (leaveType.code === 'ANNUAL' && entitlement.remaining > 0) {
    //     const encashment = await this.calculateEncashment(
    //       employeeId,
    //       leaveType._id,
    //     );
    //     settlements.push(encashment);
    //   }
    // }

    return settlements;
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

    // Update fields
    if (data.fromDate || data.toDate) {
      const from = data.fromDate ? new Date(data.fromDate) : request.dates.from;
      const to = data.toDate ? new Date(data.toDate) : request.dates.to;

      if (from >= to) {
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

      // Entitlement / balance check
      await this.checkBalanceSufficiency(
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
      request.attachmentId = data.attachmentId
        ? new Types.ObjectId(data.attachmentId)
        : undefined;
    }

    // Ensure balance sufficiency with current duration
    await this.checkBalanceSufficiency(
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

    return await request.save();
  }

  // ==================== HELPER/UTILITY METHODS (EXTENDED) ====================

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
      // TODO: Replace with actual Employee Profile service call
      // const employee = await this.employeeProfileService.getEmployeeById(employeeId);
      // return new Date(employee.hireDate);

      // For now, return null - will need Employee Profile integration
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
      // Check Leave Requests for unpaid leave
      const unpaidLeaves = await this.leaveRequestModel
        .find({
          employeeId,
          status: LeaveStatus.APPROVED,
          'dates.from': { $lte: endDate },
          'dates.to': { $gte: startDate },
        })
        .exec();

      let unpaidDays = 0;
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

      // TODO: Also check Employee Profile for suspension periods
      // const suspensionDays = await this.employeeProfileService.getSuspensionDays(employeeId, startDate, endDate);
      // unpaidDays += suspensionDays;

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
        // Monthly accrual = eligible months × monthly rate
        accruedActual = eligibleMonths * (policy.monthlyRate || 0);
        break;

      case 'per-term': // Treat as QUARTERLY
        // Quarterly accrual = eligible quarters × (monthly rate × 3)
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
            policy.accrualMethod === 'per-term') ||
          (accrualType === 'yearly' &&
            policy.accrualMethod === AccrualMethod.YEARLY);

        if (!shouldProcess) continue;

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
        entitlement.remaining =
          (entitlement.yearlyEntitlement || 0) +
          (entitlement.carryForward || 0) +
          entitlement.accruedRounded -
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
    if (policy.expiryAfterMonths && entitlement.nextResetDate) {
      const expiryDate = new Date(entitlement.nextResetDate);
      expiryDate.setMonth(expiryDate.getMonth() + policy.expiryAfterMonths);
      // Note: We don't have an expiryDate field in schema, but logic is here for when it's added
    }

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
   * Employee → PositionAssignment → Position → reportsToPositionId → find employee in that position
   */
  private async getEmployeeManagerId(
    employeeId: string,
  ): Promise<string | null> {
    // Step 1: Get employee's current position assignment
    const assignment = await this.positionAssignmentModel
      .findOne({
        employeeProfileId: new Types.ObjectId(employeeId),
        startDate: { $lte: new Date() },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: new Date() } },
        ],
      })
      .populate('positionId');

    if (!assignment || !assignment.positionId) {
      this.logger.warn(`No active position found for employee ${employeeId}`);
      return null;
    }

    const position = assignment.positionId as any;

    // Step 2: Get the reportsToPositionId (manager's position)
    if (!position.reportsToPositionId) {
      this.logger.warn(`Position ${position._id} has no reportsToPositionId`);
      return null;
    }

    // Step 3: Find who is currently in the manager position
    const managerAssignment = await this.positionAssignmentModel.findOne({
      positionId: position.reportsToPositionId,
      startDate: { $lte: new Date() },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
    });

    if (!managerAssignment) {
      this.logger.warn(
        `No one assigned to manager position ${position.reportsToPositionId}`,
      );
      return null;
    }

    return managerAssignment.employeeProfileId.toString();
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
  ): Promise<boolean> {
    // Find first pending step
    const currentStep = request.approvalFlow.find(
      (s) => s.status === 'pending',
    );
    if (!currentStep) {
      return false;
    }

    // Manager step: check if user is assigned manager or HR Admin (override capability)
    if (currentStep.role === 'Manager') {
      const isAssignedManager = currentStep.decidedBy?.toString() === userId;
      // TODO: Check if user has HR Admin role (from Employee Profile or JWT)
      // const isHRAdmin = await this.checkUserRole(userId, 'HR Admin');
      return isAssignedManager; // || isHRAdmin;
    }

    // HR step: check if user has HR role
    if (currentStep.role === 'HR') {
      // TODO: Check if user has HR role
      // return await this.checkUserRole(userId, ['HR Admin', 'HR Manager']);
      return true; // Temporary - allow any HR role
    }

    return false;
  }

  /**
   * BR-28: Escalate to next level using Organization Structure
   * currentManagerId → Position → reportsToPositionId → employee in that position
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

            // TODO: Send notification to new manager
          } else {
            // No higher manager - auto-approve and move to HR
            currentStep.status = 'approved';
            currentStep.decidedAt = new Date();

            await request.save();
            escalated++;
          }
        } else if (currentStep.role === 'HR') {
          // HR step stale - auto-approve (final escalation)
          currentStep.status = 'approved';
          currentStep.decidedAt = new Date();

          request.status = LeaveStatus.APPROVED;

          // Deduct balance
          await this.deductFromBalance(
            request.employeeId.toString(),
            request.leaveTypeId.toString(),
            request.durationDays,
          );

          await request.save();
          escalated++;
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
      .populate('leaveTypeId');

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Can only override pending requests');
    }

    const now = new Date();

    if (decision === 'approve') {
      // Approve all pending steps
      for (const step of request.approvalFlow) {
        if (step.status === 'pending') {
          step.status = 'approved';
          step.decidedBy = new Types.ObjectId(hrAdminId);
          step.decidedAt = now;
        }
      }

      request.status = LeaveStatus.APPROVED;

      // Deduct balance (only for paid leave)
      const leaveType = request.leaveTypeId as any;
      if (leaveType.paid) {
        await this.deductFromBalance(
          request.employeeId.toString(),
          request.leaveTypeId.toString(),
          request.durationDays,
        );
      }
    } else {
      // Reject
      const currentStep = request.approvalFlow.find(
        (s) => s.status === 'pending',
      );
      if (currentStep) {
        currentStep.status = 'rejected';
        currentStep.decidedBy = new Types.ObjectId(hrAdminId);
        currentStep.decidedAt = now;
      }

      request.status = LeaveStatus.REJECTED;
    }

    await request.save();
    // TODO: Send notification

    return request;
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
}
