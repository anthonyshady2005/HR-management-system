import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeaveType, LeaveTypeDocument } from './models/leave-type.schema';
import { LeaveCategory, LeaveCategoryDocument } from './models/leave-category.schema';
import { LeaveRequest, LeaveRequestDocument } from './models/leave-request.schema';
import { LeavePolicy, LeavePolicyDocument } from './models/leave-policy.schema';
import { LeaveEntitlement, LeaveEntitlementDocument } from './models/leave-entitlement.schema';
import { LeaveAdjustment, LeaveAdjustmentDocument } from './models/leave-adjustment.schema';
import { LeaveStatus } from './enums/leave-status.enum';

@Injectable()
export class LeavesService {
    constructor(
        @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveTypeDocument>,
        @InjectModel(LeaveCategory.name) private leaveCategoryModel: Model<LeaveCategoryDocument>,
        @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
        @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicyDocument>,
        @InjectModel(LeaveEntitlement.name) private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
        @InjectModel(LeaveAdjustment.name) private leaveAdjustmentModel: Model<LeaveAdjustmentDocument>,
    ) {}

    // ==================== LEAVE CATEGORIES ====================

    async createLeaveCategory(data: { name: string; description?: string }) {
        const existingCategory = await this.leaveCategoryModel.findOne({ name: data.name });
        if (existingCategory) {
            throw new ConflictException('Leave category with this name already exists');
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

    async updateLeaveCategory(id: string, data: { name?: string; description?: string }) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid category ID format');
        }

        const category = await this.leaveCategoryModel.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        ).exec();

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
        return { message: 'Leave category deleted successfully', deletedCategory: category };
    }

    // ==================== LEAVE TYPES ====================

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

        const categoryExists = await this.leaveCategoryModel.findById(data.categoryId);
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

    async getAllLeaveTypes() {
        return await this.leaveTypeModel
            .find()
            .populate('categoryId')
            .exec();
    }

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

    async updateLeaveType(id: string, data: Partial<{
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
    }>) {
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

    async deleteLeaveType(id: string) {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid leave type ID format');
        }

        const leaveType = await this.leaveTypeModel.findByIdAndDelete(id).exec();
        if (!leaveType) {
            throw new NotFoundException('Leave type not found');
        }
        return { message: 'Leave type deleted successfully', deletedLeaveType: leaveType };
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

        const leaveTypeExists = await this.leaveTypeModel.findById(data.leaveTypeId);
        if (!leaveTypeExists) {
            throw new NotFoundException('Leave type not found');
        }

        const existingPolicy = await this.leavePolicyModel.findOne({ leaveTypeId: data.leaveTypeId });
        if (existingPolicy) {
            throw new ConflictException('Policy already exists for this leave type');
        }

        const policy = new this.leavePolicyModel(data);
        return await policy.save();
    }

    async getAllPolicies() {
        return await this.leavePolicyModel
            .find()
            .populate('leaveTypeId')
            .exec();
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

    async updateLeavePolicy(id: string, data: Partial<{
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
    }>) {
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
        return { message: 'Leave policy deleted successfully', deletedPolicy: policy };
    }

    // ==================== LEAVE REQUESTS ====================

    async submitLeaveRequest(data: {
        employeeId: string;
        leaveTypeId: string;
        dates: { from: Date; to: Date };
        durationDays: number;
        justification?: string;
        attachmentId?: string;
    }) {
        // Validate IDs
        if (!Types.ObjectId.isValid(data.employeeId) || !Types.ObjectId.isValid(data.leaveTypeId)) {
            throw new BadRequestException('Invalid employee or leave type ID format');
        }

        // Validate dates
        const fromDate = new Date(data.dates.from);
        const toDate = new Date(data.dates.to);

        if (fromDate >= toDate) {
            throw new BadRequestException('Start date must be before end date');
        }

        if (fromDate < new Date()) {
            throw new BadRequestException('Cannot submit leave for past dates');
        }

        // Check leave type exists
        const leaveType = await this.leaveTypeModel.findById(data.leaveTypeId);
        if (!leaveType) {
            throw new NotFoundException('Leave type not found');
        }

        // Create request with dummy approval flow
        const request = new this.leaveRequestModel({
            ...data,
            approvalFlow: [
                { role: 'Manager', status: 'pending' },
                { role: 'HR', status: 'pending' }
            ],
            status: LeaveStatus.PENDING,
            irregularPatternFlag: false
        });

        return await request.save();
    }

    async getAllLeaveRequests(filters?: {
        employeeId?: string;
        leaveTypeId?: string;
        status?: string;
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

        if (filters?.status) {
            query.status = filters.status;
        }

        return await this.leaveRequestModel
            .find(query)
            .populate('leaveTypeId')
            .populate('employeeId')
            .sort({ createdAt: -1 })
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

    async updateLeaveRequestStatus(id: string, data: {
        status: LeaveStatus;
        decidedBy?: string;
        role?: string;
    }) {
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
            const flowIndex = request.approvalFlow.findIndex(f => f.role === data.role);
            if (flowIndex !== -1) {
                request.approvalFlow[flowIndex].status = data.status;
                request.approvalFlow[flowIndex].decidedBy = new Types.ObjectId(data.decidedBy);
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
            employeeId: employeeId
        });

        if (!request) {
            throw new NotFoundException('Leave request not found or you do not have permission to cancel it');
        }

        if (request.status !== LeaveStatus.PENDING) {
            throw new BadRequestException('Only pending requests can be cancelled');
        }

        request.status = LeaveStatus.CANCELLED;
        return await request.save();
    }

    // ==================== LEAVE ENTITLEMENTS ====================

    async createEntitlement(data: {
        employeeId: string;
        leaveTypeId: string;
        yearlyEntitlement?: number;
        accruedActual?: number;
        accruedRounded?: number;
        carryForward?: number;
    }) {
        if (!Types.ObjectId.isValid(data.employeeId) || !Types.ObjectId.isValid(data.leaveTypeId)) {
            throw new BadRequestException('Invalid employee or leave type ID format');
        }

        // Check if entitlement already exists
        const existing = await this.leaveEntitlementModel.findOne({
            employeeId: data.employeeId,
            leaveTypeId: data.leaveTypeId
        });

        if (existing) {
            throw new ConflictException('Entitlement already exists for this employee and leave type');
        }

        const entitlement = new this.leaveEntitlementModel({
            ...data,
            remaining: (data.yearlyEntitlement || 0) + (data.carryForward || 0)
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
        if (!Types.ObjectId.isValid(employeeId) || !Types.ObjectId.isValid(leaveTypeId)) {
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
            remaining: entitlement.remaining,
            lastAccrualDate: entitlement.lastAccrualDate,
            nextResetDate: entitlement.nextResetDate
        };
    }

    async updateBalance(id: string, data: {
        yearlyEntitlement?: number;
        accruedActual?: number;
        accruedRounded?: number;
        carryForward?: number;
        taken?: number;
        pending?: number;
    }) {
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
        const total = (entitlement.yearlyEntitlement || 0) + (entitlement.carryForward || 0);
        entitlement.remaining = total - (entitlement.taken || 0) - (entitlement.pending || 0);

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
        if (!Types.ObjectId.isValid(data.employeeId) ||
            !Types.ObjectId.isValid(data.leaveTypeId) ||
            !Types.ObjectId.isValid(data.hrUserId)) {
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
}