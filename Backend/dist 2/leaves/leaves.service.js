"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LeavesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const leave_type_schema_1 = require("./models/leave-type.schema");
const leave_category_schema_1 = require("./models/leave-category.schema");
const leave_request_schema_1 = require("./models/leave-request.schema");
const leave_policy_schema_1 = require("./models/leave-policy.schema");
const leave_entitlement_schema_1 = require("./models/leave-entitlement.schema");
const leave_adjustment_schema_1 = require("./models/leave-adjustment.schema");
const calendar_schema_1 = require("./models/calendar.schema");
const attachment_schema_1 = require("./models/attachment.schema");
const position_assignment_schema_1 = require("../organization-structure/models/position-assignment.schema");
const employee_profile_schema_1 = require("../employee-profile/models/employee-profile.schema");
const enums_1 = require("../time-management/models/enums");
const leave_status_enum_1 = require("./enums/leave-status.enum");
const rounding_rule_enum_1 = require("./enums/rounding-rule.enum");
const accrual_method_enum_1 = require("./enums/accrual-method.enum");
const employee_profile_enums_1 = require("../employee-profile/enums/employee-profile.enums");
let LeavesService = LeavesService_1 = class LeavesService {
    leaveTypeModel;
    leaveCategoryModel;
    leaveRequestModel;
    leavePolicyModel;
    leaveEntitlementModel;
    leaveAdjustmentModel;
    calendarModel;
    attachmentModel;
    employeeProfileModel;
    positionAssignmentModel;
    logger = new common_1.Logger(LeavesService_1.name);
    delegationMap = new Map();
    constructor(leaveTypeModel, leaveCategoryModel, leaveRequestModel, leavePolicyModel, leaveEntitlementModel, leaveAdjustmentModel, calendarModel, attachmentModel, employeeProfileModel, positionAssignmentModel) {
        this.leaveTypeModel = leaveTypeModel;
        this.leaveCategoryModel = leaveCategoryModel;
        this.leaveRequestModel = leaveRequestModel;
        this.leavePolicyModel = leavePolicyModel;
        this.leaveEntitlementModel = leaveEntitlementModel;
        this.leaveAdjustmentModel = leaveAdjustmentModel;
        this.calendarModel = calendarModel;
        this.attachmentModel = attachmentModel;
        this.employeeProfileModel = employeeProfileModel;
        this.positionAssignmentModel = positionAssignmentModel;
    }
    async createLeaveCategory(data) {
        const existingCategory = await this.leaveCategoryModel.findOne({
            name: data.name,
        });
        if (existingCategory) {
            throw new common_1.ConflictException('Leave category with this name already exists');
        }
        const category = new this.leaveCategoryModel(data);
        return await category.save();
    }
    async getAllLeaveCategories() {
        return await this.leaveCategoryModel.find().exec();
    }
    async getLeaveCategoryById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid category ID format');
        }
        const category = await this.leaveCategoryModel.findById(id).exec();
        if (!category) {
            throw new common_1.NotFoundException('Leave category not found');
        }
        return category;
    }
    async updateLeaveCategory(id, data) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid category ID format');
        }
        const category = await this.leaveCategoryModel
            .findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .exec();
        if (!category) {
            throw new common_1.NotFoundException('Leave category not found');
        }
        return category;
    }
    async deleteLeaveCategory(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid category ID format');
        }
        const category = await this.leaveCategoryModel.findByIdAndDelete(id).exec();
        if (!category) {
            throw new common_1.NotFoundException('Leave category not found');
        }
        return {
            message: 'Leave category deleted successfully',
            deletedCategory: category,
        };
    }
    async createLeaveType(data) {
        if (!mongoose_2.Types.ObjectId.isValid(data.categoryId)) {
            throw new common_1.BadRequestException('Invalid category ID format');
        }
        const categoryExists = await this.leaveCategoryModel.findById(data.categoryId);
        if (!categoryExists) {
            throw new common_1.NotFoundException('Leave category not found');
        }
        const existingType = await this.leaveTypeModel.findOne({ code: data.code });
        if (existingType) {
            throw new common_1.ConflictException('Leave type with this code already exists');
        }
        const leaveType = new this.leaveTypeModel(data);
        return await leaveType.save();
    }
    async getAllLeaveTypes() {
        return await this.leaveTypeModel.find().populate('categoryId').exec();
    }
    async getLeaveTypeById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid leave type ID format');
        }
        const leaveType = await this.leaveTypeModel
            .findById(id)
            .populate('categoryId')
            .exec();
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        return leaveType;
    }
    async getLeaveTypeByCode(code) {
        const leaveType = await this.leaveTypeModel
            .findOne({ code })
            .populate('categoryId')
            .exec();
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        return leaveType;
    }
    async updateLeaveType(id, data) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid leave type ID format');
        }
        if (data.categoryId && !mongoose_2.Types.ObjectId.isValid(data.categoryId)) {
            throw new common_1.BadRequestException('Invalid category ID format');
        }
        const leaveType = await this.leaveTypeModel
            .findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .populate('categoryId')
            .exec();
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        return leaveType;
    }
    async deleteLeaveType(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid leave type ID format');
        }
        const leaveType = await this.leaveTypeModel.findByIdAndDelete(id).exec();
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        return {
            message: 'Leave type deleted successfully',
            deletedLeaveType: leaveType,
        };
    }
    async createLeavePolicy(data) {
        if (!mongoose_2.Types.ObjectId.isValid(data.leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid leave type ID format');
        }
        const leaveTypeExists = await this.leaveTypeModel.findById(data.leaveTypeId);
        if (!leaveTypeExists) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        const existingPolicy = await this.leavePolicyModel.findOne({
            leaveTypeId: data.leaveTypeId,
        });
        if (existingPolicy) {
            throw new common_1.ConflictException('Policy already exists for this leave type');
        }
        const policy = new this.leavePolicyModel(data);
        return await policy.save();
    }
    async getAllPolicies() {
        return await this.leavePolicyModel.find().populate('leaveTypeId').exec();
    }
    async getLeavePolicyById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid policy ID format');
        }
        const policy = await this.leavePolicyModel
            .findById(id)
            .populate('leaveTypeId')
            .exec();
        if (!policy) {
            throw new common_1.NotFoundException('Leave policy not found');
        }
        return policy;
    }
    async getLeavePolicyByType(leaveTypeId) {
        if (!mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid leave type ID format');
        }
        const policy = await this.leavePolicyModel
            .findOne({ leaveTypeId })
            .populate('leaveTypeId')
            .exec();
        if (!policy) {
            throw new common_1.NotFoundException('Leave policy not found for this leave type');
        }
        return policy;
    }
    async updateLeavePolicy(id, data) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid policy ID format');
        }
        const policy = await this.leavePolicyModel
            .findByIdAndUpdate(id, data, { new: true, runValidators: true })
            .populate('leaveTypeId')
            .exec();
        if (!policy) {
            throw new common_1.NotFoundException('Leave policy not found');
        }
        return policy;
    }
    async deleteLeavePolicy(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid policy ID format');
        }
        const policy = await this.leavePolicyModel.findByIdAndDelete(id).exec();
        if (!policy) {
            throw new common_1.NotFoundException('Leave policy not found');
        }
        return {
            message: 'Leave policy deleted successfully',
            deletedPolicy: policy,
        };
    }
    async submitLeaveRequest(data, delegations) {
        if (!mongoose_2.Types.ObjectId.isValid(data.employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(data.leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid employee or leave type ID format');
        }
        const fromDate = new Date(data.dates.from);
        const toDate = new Date(data.dates.to);
        if (fromDate >= toDate) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        const leaveType = await this.leaveTypeModel.findById(data.leaveTypeId);
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        await this.checkBlockedPeriods(fromDate, toDate);
        const netDays = await this.calculateNetLeaveDays(data.employeeId, fromDate, toDate);
        if (netDays <= 0) {
            throw new common_1.BadRequestException('Requested period has no working days available');
        }
        await this.checkOverlappingLeaves(data.employeeId, fromDate, toDate);
        const limitCheck = await this.checkCumulativeLimits(data.employeeId, data.leaveTypeId, netDays);
        if (!limitCheck.withinLimit) {
            throw new common_1.BadRequestException(`Cumulative leave limit exceeded. Used ${limitCheck.used}/${limitCheck.limit} days in past 12 months. ` +
                `Requesting ${netDays} more would exceed limit.`);
        }
        const balanceCheck = await this.checkBalanceSufficiency(data.employeeId, data.leaveTypeId, netDays);
        await this.validateRequiredDocuments(data.leaveTypeId, netDays, data.attachmentId);
        const managerId = await this.determineApprover(data.employeeId, delegations);
        const request = new this.leaveRequestModel({
            ...data,
            dates: { from: fromDate, to: toDate },
            durationDays: netDays,
            approvalFlow: [
                {
                    role: 'Manager',
                    status: 'pending',
                    decidedBy: managerId ? new mongoose_2.Types.ObjectId(managerId) : undefined,
                    comment: managerId
                        ? undefined
                        : 'No manager found - awaiting HR assignment',
                },
                { role: 'HR', status: 'pending' },
            ],
            status: leave_status_enum_1.LeaveStatus.PENDING,
            irregularPatternFlag: false,
        });
        return await request.save();
    }
    async getAllLeaveRequests(filters) {
        const baseMatch = {};
        if (filters?.employeeId) {
            if (!mongoose_2.Types.ObjectId.isValid(filters.employeeId)) {
                throw new common_1.BadRequestException('Invalid employee ID format');
            }
            baseMatch.employeeId = new mongoose_2.Types.ObjectId(filters.employeeId);
        }
        if (filters?.leaveTypeId) {
            if (!mongoose_2.Types.ObjectId.isValid(filters.leaveTypeId)) {
                throw new common_1.BadRequestException('Invalid leave type ID format');
            }
            baseMatch.leaveTypeId = new mongoose_2.Types.ObjectId(filters.leaveTypeId);
        }
        if (filters?.status) {
            baseMatch.status = filters.status;
        }
        if (filters?.startDate || filters?.endDate) {
            const range = {};
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
        if (filters?.departmentId) {
            if (!mongoose_2.Types.ObjectId.isValid(filters.departmentId)) {
                throw new common_1.BadRequestException('Invalid department ID format');
            }
            const deptId = new mongoose_2.Types.ObjectId(filters.departmentId);
            const pipeline = [
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
        return await this.leaveRequestModel
            .find(baseMatch)
            .populate('leaveTypeId')
            .populate('employeeId')
            .sort({ [sortField]: sortOrder })
            .exec();
    }
    async getLeaveRequestById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid leave request ID format');
        }
        const request = await this.leaveRequestModel
            .findById(id)
            .populate('leaveTypeId')
            .populate('employeeId')
            .populate('attachmentId')
            .exec();
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        return request;
    }
    async updateLeaveRequestStatus(id, data) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid leave request ID format');
        }
        const request = await this.leaveRequestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        request.status = data.status;
        if (data.role && data.decidedBy) {
            const flowIndex = request.approvalFlow.findIndex((f) => f.role === data.role);
            if (flowIndex !== -1) {
                request.approvalFlow[flowIndex].status = data.status;
                request.approvalFlow[flowIndex].decidedBy = new mongoose_2.Types.ObjectId(data.decidedBy);
                request.approvalFlow[flowIndex].decidedAt = new Date();
            }
        }
        return await request.save();
    }
    async cancelLeaveRequest(id, employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(id) || !mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const request = await this.leaveRequestModel.findOne({
            _id: id,
            employeeId: employeeId,
        });
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found or you do not have permission to cancel it');
        }
        if (request.status !== leave_status_enum_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending requests can be cancelled');
        }
        request.status = leave_status_enum_1.LeaveStatus.CANCELLED;
        return await request.save();
    }
    async getEmployeeDataForEligibility(employeeId) {
        try {
            if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
                this.logger.warn(`Invalid employeeId provided for eligibility lookup: ${employeeId}`);
                return null;
            }
            const employee = await this.employeeProfileModel
                .findById(employeeId)
                .populate('payGradeId')
                .lean()
                .exec();
            if (!employee) {
                this.logger.warn(`Employee profile not found for eligibility validation: ${employeeId}`);
                return null;
            }
            const now = new Date();
            const assignment = await this.positionAssignmentModel
                .findOne({
                employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
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
            const positionDoc = assignment?.positionId;
            const position = positionDoc?.title || positionDoc?.code || positionDoc?.name;
            const hireDate = employee.dateOfHire
                ? new Date(employee.dateOfHire)
                : null;
            const tenureMonths = hireDate && !isNaN(hireDate.getTime())
                ? Math.max(0, Math.floor((now.getTime() - hireDate.getTime()) /
                    (1000 * 60 * 60 * 24 * 30)))
                : 0;
            const grade = employee?.payGradeId?.grade;
            const location = employee?.address?.city ||
                employee?.address?.country ||
                undefined;
            return {
                tenureMonths,
                position,
                contractType: employee.contractType,
                grade,
                location,
            };
        }
        catch (error) {
            this.logger.error('Failed to fetch employee data from Employee Profile module', error instanceof Error ? error.stack : undefined);
            return null;
        }
    }
    async validateEmployeeEligibility(employeeId, leaveTypeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid employee or leave type ID format');
        }
        const policy = await this.leavePolicyModel
            .findOne({ leaveTypeId })
            .populate('leaveTypeId')
            .exec();
        if (!policy) {
            throw new common_1.NotFoundException('Leave policy not found for this leave type');
        }
        const reasons = [];
        let eligible = true;
        if (!policy.eligibility) {
            return {
                eligible: true,
                reasons: ['No eligibility restrictions'],
                policy,
            };
        }
        const employeeData = await this.getEmployeeDataForEligibility(employeeId);
        if (!employeeData) {
            reasons.push('WARNING: Employee Profile module not integrated - eligibility validation skipped');
            reasons.push('INTEGRATION REQUIRED: Connect to Employee Profile to validate tenure, position, and contract type');
            return { eligible: true, reasons, policy };
        }
        if (policy.eligibility.minTenureMonths !== undefined) {
            if (!employeeData.tenureMonths ||
                employeeData.tenureMonths < policy.eligibility.minTenureMonths) {
                eligible = false;
                reasons.push(`Insufficient tenure: requires ${policy.eligibility.minTenureMonths} months, ` +
                    `employee has ${employeeData.tenureMonths || 0} months`);
            }
        }
        if (policy.eligibility.positionsAllowed &&
            Array.isArray(policy.eligibility.positionsAllowed)) {
            if (policy.eligibility.positionsAllowed.length > 0) {
                if (!employeeData.position ||
                    !policy.eligibility.positionsAllowed.includes(employeeData.position)) {
                    eligible = false;
                    reasons.push(`Position not eligible: allowed positions are [${policy.eligibility.positionsAllowed.join(', ')}], ` +
                        `employee position is '${employeeData.position || 'unknown'}'`);
                }
            }
        }
        if (policy.eligibility.contractTypesAllowed &&
            Array.isArray(policy.eligibility.contractTypesAllowed)) {
            if (policy.eligibility.contractTypesAllowed.length > 0) {
                if (!employeeData.contractType ||
                    !policy.eligibility.contractTypesAllowed.includes(employeeData.contractType)) {
                    eligible = false;
                    reasons.push(`Contract type not eligible: allowed types are [${policy.eligibility.contractTypesAllowed.join(', ')}], ` +
                        `employee contract type is '${employeeData.contractType || 'unknown'}'`);
                }
            }
        }
        if (eligible) {
            reasons.push('Employee meets all eligibility criteria');
        }
        return { eligible, reasons, policy };
    }
    async createEntitlement(data) {
        if (!mongoose_2.Types.ObjectId.isValid(data.employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(data.leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid employee or leave type ID format');
        }
        const existing = await this.leaveEntitlementModel.findOne({
            employeeId: data.employeeId,
            leaveTypeId: data.leaveTypeId,
        });
        if (existing) {
            throw new common_1.ConflictException('Entitlement already exists for this employee and leave type');
        }
        const validation = await this.validateEmployeeEligibility(data.employeeId, data.leaveTypeId);
        if (!validation.eligible) {
            throw new common_1.BadRequestException(`Employee is not eligible for this leave type. Reasons: ${validation.reasons.join('; ')}`);
        }
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
    async createPersonalizedEntitlement(data) {
        if (!mongoose_2.Types.ObjectId.isValid(data.employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(data.leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid employee or leave type ID format');
        }
        const existing = await this.leaveEntitlementModel.findOne({
            employeeId: data.employeeId,
            leaveTypeId: data.leaveTypeId,
        });
        if (existing) {
            throw new common_1.ConflictException('Entitlement already exists for this employee and leave type. Use update endpoint to modify.');
        }
        let yearlyEntitlement = data.yearlyEntitlement;
        if (yearlyEntitlement === undefined) {
            const policy = await this.leavePolicyModel.findOne({
                leaveTypeId: data.leaveTypeId,
            });
            if (policy) {
                yearlyEntitlement = policy.yearlyRate || 0;
            }
            else {
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
    async getEmployeeEntitlements(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID format');
        }
        return await this.leaveEntitlementModel
            .find({ employeeId })
            .populate('leaveTypeId')
            .exec();
    }
    async getEntitlementById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid entitlement ID format');
        }
        const entitlement = await this.leaveEntitlementModel
            .findById(id)
            .populate('leaveTypeId')
            .populate('employeeId')
            .exec();
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found');
        }
        return entitlement;
    }
    async getBalanceSummary(employeeId, leaveTypeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const entitlement = await this.leaveEntitlementModel
            .findOne({ employeeId, leaveTypeId })
            .populate('leaveTypeId')
            .exec();
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found');
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
    async updateBalance(id, data) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid entitlement ID format');
        }
        const entitlement = await this.leaveEntitlementModel.findById(id);
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found');
        }
        Object.assign(entitlement, data);
        const total = (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
        entitlement.remaining =
            total - (entitlement.taken || 0) - (entitlement.pending || 0);
        return await entitlement.save();
    }
    async createAdjustment(data) {
        if (!mongoose_2.Types.ObjectId.isValid(data.employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(data.leaveTypeId) ||
            !mongoose_2.Types.ObjectId.isValid(data.hrUserId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const adjustment = new this.leaveAdjustmentModel(data);
        return await adjustment.save();
    }
    async getEmployeeAdjustments(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID format');
        }
        return await this.leaveAdjustmentModel
            .find({ employeeId })
            .populate('leaveTypeId')
            .populate('hrUserId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async getAllAdjustments(filters) {
        const query = {};
        if (filters?.employeeId) {
            if (!mongoose_2.Types.ObjectId.isValid(filters.employeeId)) {
                throw new common_1.BadRequestException('Invalid employee ID format');
            }
            query.employeeId = filters.employeeId;
        }
        if (filters?.leaveTypeId) {
            if (!mongoose_2.Types.ObjectId.isValid(filters.leaveTypeId)) {
                throw new common_1.BadRequestException('Invalid leave type ID format');
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
    async createCalendar(data) {
        const existingCalendar = await this.calendarModel.findOne({
            year: data.year,
        });
        if (existingCalendar) {
            throw new common_1.ConflictException(`Calendar for year ${data.year} already exists`);
        }
        const calendar = new this.calendarModel({
            year: data.year,
            holidays: data.holidays || [],
            blockedPeriods: data.blockedPeriods || [],
        });
        return await calendar.save();
    }
    async getCalendarByYear(year) {
        const calendar = await this.calendarModel
            .findOne({ year })
            .populate('holidays')
            .exec();
        if (!calendar) {
            throw new common_1.NotFoundException(`Calendar for year ${year} not found`);
        }
        return calendar;
    }
    async addBlockedPeriod(year, period) {
        const calendar = await this.calendarModel.findOne({ year });
        if (!calendar) {
            throw new common_1.NotFoundException(`Calendar for year ${year} not found`);
        }
        calendar.blockedPeriods.push(period);
        return await calendar.save();
    }
    async removeBlockedPeriod(year, periodIndex) {
        const calendar = await this.calendarModel.findOne({ year });
        if (!calendar) {
            throw new common_1.NotFoundException(`Calendar for year ${year} not found`);
        }
        if (periodIndex < 0 || periodIndex >= calendar.blockedPeriods.length) {
            throw new common_1.BadRequestException('Invalid period index');
        }
        calendar.blockedPeriods.splice(periodIndex, 1);
        return await calendar.save();
    }
    async isDateBlocked(date) {
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
    async checkBlockedPeriods(from, to) {
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
            throw new common_1.BadRequestException('Leave request overlaps with blocked period. Leave requests are not allowed during this time.');
        }
    }
    async addHolidayToCalendar(year, holidayId) {
        if (!mongoose_2.Types.ObjectId.isValid(holidayId)) {
            throw new common_1.BadRequestException('Invalid holiday ID format');
        }
        const calendar = await this.calendarModel.findOne({ year });
        if (!calendar) {
            throw new common_1.NotFoundException(`Calendar for year ${year} not found`);
        }
        const exists = calendar.holidays.some((h) => h.toString() === holidayId);
        if (!exists) {
            calendar.holidays.push(new mongoose_2.Types.ObjectId(holidayId));
            await calendar.save();
        }
        return calendar;
    }
    async removeHolidayFromCalendar(year, holidayId) {
        if (!mongoose_2.Types.ObjectId.isValid(holidayId)) {
            throw new common_1.BadRequestException('Invalid holiday ID format');
        }
        const calendar = await this.calendarModel.findOne({ year });
        if (!calendar) {
            throw new common_1.NotFoundException(`Calendar for year ${year} not found`);
        }
        const before = calendar.holidays.length;
        calendar.holidays = calendar.holidays.filter((h) => h.toString() !== holidayId);
        if (calendar.holidays.length === before) {
            throw new common_1.NotFoundException('Holiday not found on calendar');
        }
        await calendar.save();
        return calendar;
    }
    async checkOverlappingLeaves(employeeId, from, to, excludeRequestId) {
        const query = {
            employeeId,
            status: { $in: [leave_status_enum_1.LeaveStatus.APPROVED, leave_status_enum_1.LeaveStatus.PENDING] },
            $or: [{ 'dates.from': { $lte: to }, 'dates.to': { $gte: from } }],
        };
        if (excludeRequestId) {
            query._id = { $ne: excludeRequestId };
        }
        const overlapping = await this.leaveRequestModel.find(query);
        if (overlapping.length > 0) {
            throw new common_1.ConflictException('Leave request overlaps with existing approved leave');
        }
    }
    async checkBalanceSufficiency(employeeId, leaveTypeId, requestedDays) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        if (!leaveType.paid) {
            return {
                sufficient: true,
                paidDays: 0,
                unpaidDays: requestedDays,
                requiresConversion: false,
            };
        }
        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId,
            leaveTypeId,
        });
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found for this employee and leave type');
        }
        const available = entitlement.remaining || 0;
        if (requestedDays <= available) {
            return {
                sufficient: true,
                paidDays: requestedDays,
                unpaidDays: 0,
                requiresConversion: false,
            };
        }
        return {
            sufficient: false,
            paidDays: available,
            unpaidDays: requestedDays - available,
            requiresConversion: true,
        };
    }
    async validateRequiredDocuments(leaveTypeId, durationDays, attachmentId) {
        if (!mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid leave type ID format');
        }
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        const requiresAttachment = leaveType.requiresAttachment;
        const isSickLeave = leaveType.code === 'SICK_LEAVE' ||
            leaveType.name.toLowerCase().includes('sick');
        const requiresMedicalCert = isSickLeave && durationDays > 1;
        if (requiresAttachment || requiresMedicalCert) {
            if (!attachmentId) {
                throw new common_1.BadRequestException(requiresMedicalCert
                    ? 'Medical certificate required for sick leave exceeding 1 day'
                    : `${leaveType.name} requires supporting documents`);
            }
            const attachment = await this.attachmentModel.findById(attachmentId);
            if (!attachment) {
                throw new common_1.NotFoundException('Attachment not found');
            }
            if (leaveType.attachmentType && attachment.fileType) {
                const allowedTypes = this.getAllowedMimeTypes(leaveType.attachmentType);
                if (!allowedTypes.includes(attachment.fileType)) {
                    throw new common_1.BadRequestException(`Invalid file type. Expected ${leaveType.attachmentType}, got ${attachment.fileType}`);
                }
            }
            if (attachment.size) {
                const maxSizeBytes = parseInt(process.env.MAX_ATTACHMENT_SIZE_MB || '10') * 1024 * 1024;
                if (attachment.size > maxSizeBytes) {
                    throw new common_1.BadRequestException(`File size exceeds ${maxSizeBytes / 1024 / 1024}MB limit`);
                }
            }
        }
    }
    async getAttachmentForHr(attachmentId) {
        if (!mongoose_2.Types.ObjectId.isValid(attachmentId)) {
            throw new common_1.BadRequestException('Invalid attachment ID format');
        }
        const attachment = await this.attachmentModel.findById(attachmentId).exec();
        if (!attachment) {
            throw new common_1.NotFoundException('Attachment not found');
        }
        return attachment;
    }
    async calculateNetLeaveDays(employeeId, from, to) {
        const year = from.getFullYear();
        const calendar = await this.calendarModel
            .findOne({ year })
            .populate('holidays');
        const holidays = calendar?.holidays || [];
        let netDays = 0;
        const cursor = new Date(from);
        while (cursor <= to) {
            const dayIsHoliday = holidays.some((h) => {
                if (!h?.type ||
                    ![
                        enums_1.HolidayType.NATIONAL,
                        enums_1.HolidayType.ORGANIZATIONAL,
                        enums_1.HolidayType.WEEKLY_REST,
                    ].includes(h.type)) {
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
    async getNetDaysCalculationDetails(employeeId, from, to) {
        const year = from.getFullYear();
        const calendar = await this.calendarModel
            .findOne({ year })
            .populate('holidays');
        const holidays = calendar?.holidays || [];
        let totalDays = 0;
        let holidaysExcluded = 0;
        const holidayDates = [];
        const cursor = new Date(from);
        const end = new Date(to);
        while (cursor <= end) {
            totalDays++;
            const dayIsHoliday = holidays.some((h) => {
                if (!h?.type ||
                    ![
                        enums_1.HolidayType.NATIONAL,
                        enums_1.HolidayType.ORGANIZATIONAL,
                        enums_1.HolidayType.WEEKLY_REST,
                    ].includes(h.type)) {
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
            if (dayIsHoliday)
                holidaysExcluded++;
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
    async deductFromBalance(employeeId, leaveTypeId, days) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        if (!leaveType.paid) {
            return;
        }
        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId,
            leaveTypeId,
        });
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found');
        }
        entitlement.pending = Math.max(0, entitlement.pending - days);
        entitlement.taken += days;
        const total = (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
        entitlement.remaining = total - entitlement.taken - entitlement.pending;
        if (entitlement.remaining < 0) {
            throw new common_1.BadRequestException('Operation would result in negative balance');
        }
        await entitlement.save();
    }
    async returnDaysToBalance(employeeId, leaveTypeId, days) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        if (!leaveType.paid) {
            return;
        }
        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId,
            leaveTypeId,
        });
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found');
        }
        entitlement.taken = Math.max(0, entitlement.taken - days);
        const total = (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
        entitlement.remaining = total - entitlement.taken - entitlement.pending;
        await entitlement.save();
    }
    async addToPendingBalance(employeeId, leaveTypeId, days) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const leaveType = await this.leaveTypeModel.findById(leaveTypeId);
        if (!leaveType) {
            throw new common_1.NotFoundException('Leave type not found');
        }
        if (!leaveType.paid) {
            return;
        }
        const entitlement = await this.leaveEntitlementModel.findOne({
            employeeId,
            leaveTypeId,
        });
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found');
        }
        entitlement.pending += days;
        const total = (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
        entitlement.remaining = total - entitlement.taken - entitlement.pending;
        await entitlement.save();
    }
    async delegateApproval(requestId, fromUserId, toUserId, role) {
        if (!mongoose_2.Types.ObjectId.isValid(requestId) ||
            !mongoose_2.Types.ObjectId.isValid(fromUserId) ||
            !mongoose_2.Types.ObjectId.isValid(toUserId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const request = await this.leaveRequestModel.findById(requestId);
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        const roleExists = request.approvalFlow.some((a) => a.role === role);
        if (!roleExists) {
            throw new common_1.BadRequestException(`No approval level found for role: ${role}`);
        }
        const key = `${requestId}-${role}`;
        this.delegationMap.set(key, {
            requestId,
            role,
            delegatorId: fromUserId,
            delegateId: toUserId,
            createdAt: new Date(),
        });
    }
    async resolveTeamMembers(managerId, departmentId) {
        if (!mongoose_2.Types.ObjectId.isValid(managerId)) {
            throw new common_1.BadRequestException('Invalid manager ID format');
        }
        const managerProfile = await this.employeeProfileModel.findById(managerId);
        if (!managerProfile) {
            throw new common_1.NotFoundException('Manager profile not found');
        }
        const deptFilter = departmentId
            ? new mongoose_2.Types.ObjectId(departmentId)
            : managerProfile.primaryDepartmentId;
        const query = { _id: { $ne: new mongoose_2.Types.ObjectId(managerId) } };
        const or = [];
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
    async getTeamBalances(managerId, options) {
        const { members } = await this.resolveTeamMembers(managerId, options?.departmentId);
        const teamBalances = [];
        for (const member of members) {
            const entQuery = { employeeId: member._id };
            if (options?.leaveTypeId) {
                if (!mongoose_2.Types.ObjectId.isValid(options.leaveTypeId)) {
                    throw new common_1.BadRequestException('Invalid leave type ID format');
                }
                entQuery.leaveTypeId = new mongoose_2.Types.ObjectId(options.leaveTypeId);
            }
            const entitlements = await this.leaveEntitlementModel
                .find(entQuery)
                .populate('leaveTypeId')
                .exec();
            teamBalances.push({
                employeeId: member._id.toString(),
                employeeName: member.fullName,
                employeeNumber: String(member.employeeNumber ?? ''),
                balances: entitlements.map((e) => ({
                    leaveType: e.leaveTypeId?.name || 'Unknown',
                    remaining: e.remaining,
                    taken: e.taken,
                    pending: e.pending,
                    carryForward: e.carryForward,
                })),
            });
        }
        return teamBalances;
    }
    async getTeamUpcomingLeaves(managerId, options) {
        const { members } = await this.resolveTeamMembers(managerId, options?.departmentId);
        const employeeIds = members.map((m) => m._id);
        if (!employeeIds.length) {
            return [];
        }
        const query = {
            employeeId: { $in: employeeIds },
        };
        if (options?.leaveTypeId) {
            if (!mongoose_2.Types.ObjectId.isValid(options.leaveTypeId)) {
                throw new common_1.BadRequestException('Invalid leave type ID format');
            }
            query.leaveTypeId = new mongoose_2.Types.ObjectId(options.leaveTypeId);
        }
        query.status = options?.status || leave_status_enum_1.LeaveStatus.APPROVED;
        if (options?.startDate || options?.endDate) {
            const range = {};
            if (options.startDate)
                range.$gte = new Date(options.startDate);
            if (options.endDate)
                range.$lte = new Date(options.endDate);
            query['dates.from'] = range;
        }
        else {
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
            employeeId: lr.employeeId?._id?.toString() || '',
            employeeName: lr.employeeId?.fullName || '',
            leaveType: lr.leaveTypeId?.name || '',
            from: lr.dates.from,
            to: lr.dates.to,
            durationDays: lr.durationDays,
            status: lr.status,
        }));
    }
    async flagIrregularPattern(requestId) {
        if (!mongoose_2.Types.ObjectId.isValid(requestId)) {
            throw new common_1.BadRequestException('Invalid request ID format');
        }
        const request = await this.leaveRequestModel.findById(requestId);
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        request.irregularPatternFlag = true;
        await request.save();
    }
    async calculateEncashment(employeeId, leaveTypeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid ID format');
        }
        const entitlement = await this.leaveEntitlementModel
            .findOne({ employeeId, leaveTypeId })
            .populate('leaveTypeId');
        if (!entitlement) {
            throw new common_1.NotFoundException('Leave entitlement not found');
        }
        const dailySalaryRate = 0;
        const unusedDays = Math.min(entitlement.remaining, 30);
        const encashmentAmount = dailySalaryRate * unusedDays;
        return {
            employeeId,
            leaveType: entitlement.leaveTypeId.name,
            unusedDays,
            dailySalaryRate,
            encashmentAmount,
            formula: `Daily Salary Rate × Unused Days (capped at 30) = ${dailySalaryRate} × ${unusedDays} = ${encashmentAmount}`,
        };
    }
    async processFinalSettlement(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID format');
        }
        const entitlements = await this.leaveEntitlementModel
            .find({ employeeId })
            .populate('leaveTypeId');
        const settlements = [];
        return settlements;
    }
    async getAuditTrail(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID format');
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
            leaveType: adj.leaveTypeId.name,
            adjustmentType: adj.adjustmentType,
            amount: adj.amount,
            reason: adj.reason,
            hrUserId: adj.hrUserId,
            hrUserName: adj.hrUserId.fullName || 'Unknown',
            createdAt: adj.createdAt,
        }));
    }
    async updateLeaveRequest(id, data) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('Invalid request ID format');
        }
        const request = await this.leaveRequestModel.findById(id);
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        if (request.status !== leave_status_enum_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending requests can be modified');
        }
        if (data.fromDate || data.toDate) {
            const from = data.fromDate ? new Date(data.fromDate) : request.dates.from;
            const to = data.toDate ? new Date(data.toDate) : request.dates.to;
            if (from >= to) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
            request.dates.from = from;
            request.dates.to = to;
            await this.checkBlockedPeriods(from, to);
            const netDays = await this.calculateNetLeaveDays(request.employeeId.toString(), from, to);
            if (netDays <= 0) {
                throw new common_1.BadRequestException('Requested period has no working days available');
            }
            await this.checkOverlappingLeaves(request.employeeId.toString(), from, to, request._id.toString());
            await this.checkBalanceSufficiency(request.employeeId.toString(), request.leaveTypeId.toString(), netDays);
            await this.validateRequiredDocuments(request.leaveTypeId.toString(), netDays, data.attachmentId ?? request.attachmentId?.toString());
            request.durationDays = netDays;
        }
        else if (data.durationDays) {
            const netDays = await this.calculateNetLeaveDays(request.employeeId.toString(), request.dates.from, request.dates.to);
            request.durationDays = netDays;
        }
        if (data.justification !== undefined) {
            request.justification = data.justification;
        }
        if (data.attachmentId !== undefined) {
            request.attachmentId = data.attachmentId
                ? new mongoose_2.Types.ObjectId(data.attachmentId)
                : undefined;
        }
        await this.checkBalanceSufficiency(request.employeeId.toString(), request.leaveTypeId.toString(), request.durationDays);
        await this.validateRequiredDocuments(request.leaveTypeId.toString(), request.durationDays, request.attachmentId?.toString());
        return await request.save();
    }
    applyRounding(value, rule) {
        switch (rule) {
            case rounding_rule_enum_1.RoundingRule.ROUND:
                return Math.round(value);
            case rounding_rule_enum_1.RoundingRule.ROUND_UP:
                return Math.ceil(value);
            case rounding_rule_enum_1.RoundingRule.ROUND_DOWN:
                return Math.floor(value);
            case rounding_rule_enum_1.RoundingRule.NONE:
            default:
                return value;
        }
    }
    async getEmployeeHireDate(employeeId) {
        try {
            return null;
        }
        catch (error) {
            console.error(`Failed to fetch hire date for employee ${employeeId}:`, error.message);
            return null;
        }
    }
    async getUnpaidDaysInPeriod(employeeId, startDate, endDate) {
        try {
            const unpaidLeaves = await this.leaveRequestModel
                .find({
                employeeId,
                status: leave_status_enum_1.LeaveStatus.APPROVED,
                'dates.from': { $lte: endDate },
                'dates.to': { $gte: startDate },
            })
                .exec();
            let unpaidDays = 0;
            for (const leave of unpaidLeaves) {
                const leaveType = await this.leaveTypeModel.findById(leave.leaveTypeId);
                if (leaveType && !leaveType.paid) {
                    const leaveStart = new Date(Math.max(leave.dates.from.getTime(), startDate.getTime()));
                    const leaveEnd = new Date(Math.min(leave.dates.to.getTime(), endDate.getTime()));
                    const days = Math.ceil((leaveEnd.getTime() - leaveStart.getTime()) /
                        (1000 * 60 * 60 * 24)) + 1;
                    unpaidDays += days;
                }
            }
            return unpaidDays;
        }
        catch (error) {
            console.error(`Failed to check unpaid days for employee ${employeeId}:`, error.message);
            return 0;
        }
    }
    async calculateEligibleMonths(employeeId, startDate, endDate) {
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth()) +
            1;
        const unpaidDays = await this.getUnpaidDaysInPeriod(employeeId, startDate, endDate);
        const unpaidMonths = unpaidDays / 30;
        const eligibleMonths = Math.max(0, monthsDiff - unpaidMonths);
        return eligibleMonths;
    }
    async calculateAccrualForEmployee(employeeId, leaveTypeId, startDate, endDate) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid employee or leave type ID format');
        }
        const policy = await this.leavePolicyModel.findOne({ leaveTypeId }).exec();
        if (!policy) {
            throw new common_1.NotFoundException('Leave policy not found for this leave type');
        }
        const eligibleMonths = await this.calculateEligibleMonths(employeeId, startDate, endDate);
        let accruedActual = 0;
        switch (policy.accrualMethod) {
            case accrual_method_enum_1.AccrualMethod.MONTHLY:
                accruedActual = eligibleMonths * (policy.monthlyRate || 0);
                break;
            case 'per-term':
                const eligibleQuarters = Math.floor(eligibleMonths / 3);
                accruedActual = eligibleQuarters * (policy.monthlyRate || 0) * 3;
                break;
            case accrual_method_enum_1.AccrualMethod.YEARLY:
                if (eligibleMonths >= 12) {
                    accruedActual = policy.yearlyRate || 0;
                }
                else {
                    accruedActual = (eligibleMonths / 12) * (policy.yearlyRate || 0);
                }
                break;
            default:
                accruedActual = 0;
        }
        const accruedRounded = this.applyRounding(accruedActual, policy.roundingRule);
        return { actual: accruedActual, rounded: accruedRounded };
    }
    async runAccrualProcess(accrualType) {
        const now = new Date();
        let startDate;
        let endDate = now;
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
        const processed = [];
        const failed = [];
        const entitlements = await this.leaveEntitlementModel.find().exec();
        for (const entitlement of entitlements) {
            try {
                const employeeId = entitlement.employeeId.toString();
                const leaveTypeId = entitlement.leaveTypeId.toString();
                const policy = await this.leavePolicyModel
                    .findOne({ leaveTypeId })
                    .exec();
                if (!policy)
                    continue;
                const shouldProcess = (accrualType === 'monthly' &&
                    policy.accrualMethod === accrual_method_enum_1.AccrualMethod.MONTHLY) ||
                    (accrualType === 'quarterly' &&
                        policy.accrualMethod === 'per-term') ||
                    (accrualType === 'yearly' &&
                        policy.accrualMethod === accrual_method_enum_1.AccrualMethod.YEARLY);
                if (!shouldProcess)
                    continue;
                const accrual = await this.calculateAccrualForEmployee(employeeId, leaveTypeId, startDate, endDate);
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
            }
            catch (error) {
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
    async calculateResetDate(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee ID format');
        }
        const hireDate = await this.getEmployeeHireDate(employeeId);
        if (!hireDate) {
            const now = new Date();
            return new Date(now.getFullYear() + 1, 0, 1);
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        let nextReset = new Date(currentYear, hireDate.getMonth(), hireDate.getDate());
        if (nextReset <= now) {
            nextReset = new Date(currentYear + 1, hireDate.getMonth(), hireDate.getDate());
        }
        return nextReset;
    }
    async updateAllResetDates() {
        const updated = [];
        const failed = [];
        const entitlements = await this.leaveEntitlementModel.find().exec();
        for (const entitlement of entitlements) {
            try {
                const employeeId = entitlement.employeeId.toString();
                const resetDate = await this.calculateResetDate(employeeId);
                entitlement.nextResetDate = resetDate;
                await entitlement.save();
                updated.push(1);
            }
            catch (error) {
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
    async processCarryForwardForEmployee(employeeId, leaveTypeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId) ||
            !mongoose_2.Types.ObjectId.isValid(leaveTypeId)) {
            throw new common_1.BadRequestException('Invalid employee or leave type ID format');
        }
        const entitlement = await this.leaveEntitlementModel
            .findOne({
            employeeId,
            leaveTypeId,
        })
            .exec();
        if (!entitlement) {
            throw new common_1.NotFoundException('Entitlement not found');
        }
        const policy = await this.leavePolicyModel.findOne({ leaveTypeId }).exec();
        if (!policy) {
            throw new common_1.NotFoundException('Leave policy not found');
        }
        if (!policy.carryForwardAllowed) {
            entitlement.carryForward = 0;
            await entitlement.save();
            return;
        }
        const unusedDays = entitlement.remaining || 0;
        const maxCarryForward = policy.maxCarryForward ||
            parseInt(process.env.MAX_CARRY_FORWARD_DAYS || '45');
        const carriedForward = Math.min(unusedDays, maxCarryForward);
        entitlement.carryForward = carriedForward;
        entitlement.taken = 0;
        entitlement.pending = 0;
        entitlement.accruedActual = 0;
        entitlement.accruedRounded = 0;
        entitlement.remaining =
            (entitlement.yearlyEntitlement || 0) + carriedForward;
        if (policy.expiryAfterMonths && entitlement.nextResetDate) {
            const expiryDate = new Date(entitlement.nextResetDate);
            expiryDate.setMonth(expiryDate.getMonth() + policy.expiryAfterMonths);
        }
        await entitlement.save();
    }
    async runYearEndCarryForward() {
        const processed = [];
        const capped = [];
        const failed = [];
        const entitlements = await this.leaveEntitlementModel.find().exec();
        for (const entitlement of entitlements) {
            try {
                const employeeId = entitlement.employeeId.toString();
                const leaveTypeId = entitlement.leaveTypeId.toString();
                const policy = await this.leavePolicyModel
                    .findOne({ leaveTypeId })
                    .exec();
                if (!policy || !policy.carryForwardAllowed)
                    continue;
                const originalRemaining = entitlement.remaining || 0;
                const maxCarryForward = policy.maxCarryForward ||
                    parseInt(process.env.MAX_CARRY_FORWARD_DAYS || '45');
                await this.processCarryForwardForEmployee(employeeId, leaveTypeId);
                if (originalRemaining > maxCarryForward) {
                    capped.push({
                        employeeId,
                        leaveTypeId,
                        original: originalRemaining,
                        capped: maxCarryForward,
                    });
                }
                processed.push(1);
            }
            catch (error) {
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
    async getEmployeeManagerId(employeeId) {
        const assignment = await this.positionAssignmentModel
            .findOne({
            employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
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
        const position = assignment.positionId;
        if (!position.reportsToPositionId) {
            this.logger.warn(`Position ${position._id} has no reportsToPositionId`);
            return null;
        }
        const managerAssignment = await this.positionAssignmentModel.findOne({
            positionId: position.reportsToPositionId,
            startDate: { $lte: new Date() },
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
        });
        if (!managerAssignment) {
            this.logger.warn(`No one assigned to manager position ${position.reportsToPositionId}`);
            return null;
        }
        return managerAssignment.employeeProfileId.toString();
    }
    async determineApprover(employeeId, delegations) {
        const managerId = await this.getEmployeeManagerId(employeeId);
        if (!managerId) {
            return null;
        }
        if (delegations && delegations.has(managerId)) {
            return delegations.get(managerId) || null;
        }
        return managerId;
    }
    async isUserAuthorizedToApprove(request, userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            return false;
        }
        const currentStep = request.approvalFlow.find((s) => s.status === 'pending');
        if (!currentStep) {
            return false;
        }
        const now = new Date();
        const hasHrRole = async () => {
            const profile = await this.employeeProfileModel
                .findById(userId)
                .populate('accessProfileId')
                .lean()
                .exec();
            const roles = profile?.accessProfileId?.roles || [];
            return roles.some((role) => [
                employee_profile_enums_1.SystemRole.HR_ADMIN,
                employee_profile_enums_1.SystemRole.HR_MANAGER,
                employee_profile_enums_1.SystemRole.HR_EMPLOYEE,
            ].includes(role));
        };
        const isInReportingChain = async () => {
            const employeeId = request.employeeId?.toString?.() || request.employeeId;
            if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
                return false;
            }
            const employeeAssignment = await this.positionAssignmentModel
                .findOne({
                employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
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
            const managerPositionIds = [];
            let currentPosition = employeeAssignment?.positionId;
            while (currentPosition?.reportsToPositionId) {
                const managerPositionId = currentPosition.reportsToPositionId.toString();
                managerPositionIds.push(managerPositionId);
                const managerAssignment = await this.positionAssignmentModel
                    .findOne({
                    positionId: new mongoose_2.Types.ObjectId(managerPositionId),
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
                currentPosition = managerAssignment?.positionId;
            }
            if (!managerPositionIds.length) {
                return false;
            }
            const userAssignment = await this.positionAssignmentModel
                .findOne({
                employeeProfileId: new mongoose_2.Types.ObjectId(userId),
                positionId: {
                    $in: managerPositionIds.map((id) => new mongoose_2.Types.ObjectId(id)),
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
            return Boolean(userAssignment);
        };
        const [hrRole, managerInChain] = await Promise.all([
            hasHrRole(),
            isInReportingChain(),
        ]);
        if (currentStep.role === 'Manager') {
            return managerInChain || hrRole;
        }
        if (currentStep.role === 'HR') {
            return hrRole;
        }
        return false;
    }
    async escalateToNextLevel(currentManagerId) {
        const managerAssignment = await this.positionAssignmentModel
            .findOne({
            employeeProfileId: new mongoose_2.Types.ObjectId(currentManagerId),
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
        const position = managerAssignment.positionId;
        if (!position.reportsToPositionId) {
            return null;
        }
        const higherManagerAssignment = await this.positionAssignmentModel.findOne({
            positionId: position.reportsToPositionId,
            startDate: { $lte: new Date() },
            $or: [{ endDate: { $exists: false } }, { endDate: { $gte: new Date() } }],
        });
        if (!higherManagerAssignment) {
            return null;
        }
        return higherManagerAssignment.employeeProfileId.toString();
    }
    async escalateStaleApprovals() {
        const thresholdHours = parseInt(process.env.AUTO_ESCALATION_HOURS || '48');
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - thresholdHours);
        const staleRequests = await this.leaveRequestModel.find({
            status: leave_status_enum_1.LeaveStatus.PENDING,
            createdAt: { $lt: thresholdDate },
        });
        const errors = [];
        let escalated = 0;
        for (const request of staleRequests) {
            try {
                const pendingIndex = request.approvalFlow.findIndex((s) => s.status === 'pending');
                if (pendingIndex === -1)
                    continue;
                const currentStep = request.approvalFlow[pendingIndex];
                const stepCreatedAt = currentStep.decidedAt || request.createdAt;
                if (stepCreatedAt > thresholdDate)
                    continue;
                if (currentStep.role === 'Manager' && currentStep.decidedBy) {
                    const newManagerId = await this.escalateToNextLevel(currentStep.decidedBy.toString());
                    if (newManagerId) {
                        currentStep.decidedBy = new mongoose_2.Types.ObjectId(newManagerId);
                        await request.save();
                        escalated++;
                    }
                    else {
                        currentStep.status = 'approved';
                        currentStep.decidedAt = new Date();
                        await request.save();
                        escalated++;
                    }
                }
                else if (currentStep.role === 'HR') {
                    currentStep.status = 'approved';
                    currentStep.decidedAt = new Date();
                    request.status = leave_status_enum_1.LeaveStatus.APPROVED;
                    await this.deductFromBalance(request.employeeId.toString(), request.leaveTypeId.toString(), request.durationDays);
                    await request.save();
                    escalated++;
                }
            }
            catch (error) {
                errors.push(`Request ${request._id}: ${error.message}`);
            }
        }
        return { escalated, errors };
    }
    async hrOverrideRequest(requestId, decision, justification, hrAdminId) {
        const request = await this.leaveRequestModel
            .findById(requestId)
            .populate('leaveTypeId');
        if (!request) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        if (request.status !== leave_status_enum_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('Can only override pending requests');
        }
        const now = new Date();
        if (decision === 'approve') {
            for (const step of request.approvalFlow) {
                if (step.status === 'pending') {
                    step.status = 'approved';
                    step.decidedBy = new mongoose_2.Types.ObjectId(hrAdminId);
                    step.decidedAt = now;
                }
            }
            request.status = leave_status_enum_1.LeaveStatus.APPROVED;
            const leaveType = request.leaveTypeId;
            if (leaveType.paid) {
                await this.deductFromBalance(request.employeeId.toString(), request.leaveTypeId.toString(), request.durationDays);
            }
        }
        else {
            const currentStep = request.approvalFlow.find((s) => s.status === 'pending');
            if (currentStep) {
                currentStep.status = 'rejected';
                currentStep.decidedBy = new mongoose_2.Types.ObjectId(hrAdminId);
                currentStep.decidedAt = now;
            }
            request.status = leave_status_enum_1.LeaveStatus.REJECTED;
        }
        await request.save();
        return request;
    }
    async checkCumulativeLimits(employeeId, leaveTypeId, requestedDays) {
        const policy = await this.leavePolicyModel.findOne({ leaveTypeId });
        const limit = policy?.cumulativeLeaveLimit;
        if (!policy || !limit) {
            return { withinLimit: true, used: 0, limit: 0 };
        }
        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        const pastLeaves = await this.leaveRequestModel.find({
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            leaveTypeId: new mongoose_2.Types.ObjectId(leaveTypeId),
            status: leave_status_enum_1.LeaveStatus.APPROVED,
            'dates.from': { $gte: startDate, $lte: endDate },
        });
        const usedDays = pastLeaves.reduce((sum, leave) => sum + leave.durationDays, 0);
        const totalWithNew = usedDays + requestedDays;
        return {
            withinLimit: totalWithNew <= limit,
            used: usedDays,
            limit: limit,
        };
    }
    getAllowedMimeTypes(attachmentType) {
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
};
exports.LeavesService = LeavesService;
exports.LeavesService = LeavesService = LeavesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(leave_type_schema_1.LeaveType.name)),
    __param(1, (0, mongoose_1.InjectModel)(leave_category_schema_1.LeaveCategory.name)),
    __param(2, (0, mongoose_1.InjectModel)(leave_request_schema_1.LeaveRequest.name)),
    __param(3, (0, mongoose_1.InjectModel)(leave_policy_schema_1.LeavePolicy.name)),
    __param(4, (0, mongoose_1.InjectModel)(leave_entitlement_schema_1.LeaveEntitlement.name)),
    __param(5, (0, mongoose_1.InjectModel)(leave_adjustment_schema_1.LeaveAdjustment.name)),
    __param(6, (0, mongoose_1.InjectModel)(calendar_schema_1.Calendar.name)),
    __param(7, (0, mongoose_1.InjectModel)(attachment_schema_1.Attachment.name)),
    __param(8, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __param(9, (0, mongoose_1.InjectModel)(position_assignment_schema_1.PositionAssignment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], LeavesService);
//# sourceMappingURL=leaves.service.js.map