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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leaves_service_1 = require("./leaves.service");
const guards_1 = require("../common/guards");
const decorators_1 = require("../common/decorators");
const create_leave_category_dto_1 = require("./dto/create-leave-category.dto");
const update_leave_category_dto_1 = require("./dto/update-leave-category.dto");
const leave_category_response_dto_1 = require("./dto/leave-category-response.dto");
const create_leave_type_dto_1 = require("./dto/create-leave-type.dto");
const update_leave_type_dto_1 = require("./dto/update-leave-type.dto");
const leave_type_response_dto_1 = require("./dto/leave-type-response.dto");
const create_leave_policy_dto_1 = require("./dto/create-leave-policy.dto");
const update_leave_policy_dto_1 = require("./dto/update-leave-policy.dto");
const leave_policy_response_dto_1 = require("./dto/leave-policy-response.dto");
const submit_leave_request_dto_1 = require("./dto/submit-leave-request.dto");
const update_leave_request_status_dto_1 = require("./dto/update-leave-request-status.dto");
const leave_request_query_dto_1 = require("./dto/leave-request-query.dto");
const leave_request_response_dto_1 = require("./dto/leave-request-response.dto");
const hr_override_dto_1 = require("./dto/hr-override.dto");
const create_entitlement_dto_1 = require("./dto/create-entitlement.dto");
const update_balance_dto_1 = require("./dto/update-balance.dto");
const leave_entitlement_response_dto_1 = require("./dto/leave-entitlement-response.dto");
const balance_summary_response_dto_1 = require("./dto/balance-summary-response.dto");
const create_adjustment_dto_1 = require("./dto/create-adjustment.dto");
const adjustment_query_dto_1 = require("./dto/adjustment-query.dto");
const leave_adjustment_response_dto_1 = require("./dto/leave-adjustment-response.dto");
const create_calendar_dto_1 = require("./dto/create-calendar.dto");
const add_blocked_period_dto_1 = require("./dto/add-blocked-period.dto");
const calendar_response_dto_1 = require("./dto/calendar-response.dto");
const delegate_approval_dto_1 = require("./dto/delegate-approval.dto");
const update_leave_request_dto_1 = require("./dto/update-leave-request.dto");
const net_days_calculation_dto_1 = require("./dto/net-days-calculation.dto");
const team_balance_response_dto_1 = require("./dto/team-balance-response.dto");
const upcoming_leave_response_dto_1 = require("./dto/upcoming-leave-response.dto");
const encashment_response_dto_1 = require("./dto/encashment-response.dto");
const audit_trail_response_dto_1 = require("./dto/audit-trail-response.dto");
const leave_status_enum_1 = require("./enums/leave-status.enum");
const add_holiday_dto_1 = require("./dto/add-holiday.dto");
let LeavesController = class LeavesController {
    leavesService;
    delegations = new Map();
    constructor(leavesService) {
        this.leavesService = leavesService;
    }
    async getAttachmentById(attachmentId) {
        return await this.leavesService.getAttachmentForHr(attachmentId);
    }
    async createLeaveCategory(dto) {
        return await this.leavesService.createLeaveCategory(dto);
    }
    async getAllLeaveCategories() {
        return await this.leavesService.getAllLeaveCategories();
    }
    async getLeaveCategoryById(id) {
        return await this.leavesService.getLeaveCategoryById(id);
    }
    async updateLeaveCategory(id, dto) {
        return await this.leavesService.updateLeaveCategory(id, dto);
    }
    async deleteLeaveCategory(id) {
        return await this.leavesService.deleteLeaveCategory(id);
    }
    async createLeaveType(dto) {
        return await this.leavesService.createLeaveType(dto);
    }
    async getAllLeaveTypes() {
        return await this.leavesService.getAllLeaveTypes();
    }
    async getLeaveTypeById(id) {
        return await this.leavesService.getLeaveTypeById(id);
    }
    async getLeaveTypeByCode(code) {
        return await this.leavesService.getLeaveTypeByCode(code);
    }
    async updateLeaveType(id, dto) {
        return await this.leavesService.updateLeaveType(id, dto);
    }
    async deleteLeaveType(id) {
        return await this.leavesService.deleteLeaveType(id);
    }
    async createLeavePolicy(dto) {
        return await this.leavesService.createLeavePolicy(dto);
    }
    async getAllPolicies() {
        return await this.leavesService.getAllPolicies();
    }
    async getLeavePolicyById(id) {
        return await this.leavesService.getLeavePolicyById(id);
    }
    async getLeavePolicyByType(leaveTypeId) {
        return await this.leavesService.getLeavePolicyByType(leaveTypeId);
    }
    async updateLeavePolicy(id, dto) {
        return await this.leavesService.updateLeavePolicy(id, dto);
    }
    async deleteLeavePolicy(id) {
        return await this.leavesService.deleteLeavePolicy(id);
    }
    async submitLeaveRequest(dto) {
        return await this.leavesService.submitLeaveRequest(dto, this.delegations);
    }
    async getAllLeaveRequests(query) {
        return await this.leavesService.getAllLeaveRequests(query);
    }
    async getLeaveRequestById(id) {
        return await this.leavesService.getLeaveRequestById(id);
    }
    async updateLeaveRequestStatus(id, dto, req) {
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const request = await this.leavesService.getLeaveRequestById(id);
        const authorized = await this.leavesService.isUserAuthorizedToApprove(request, currentUserId);
        if (!authorized) {
            throw new common_1.ForbiddenException('You are not authorized to approve/reject this request');
        }
        return await this.leavesService.updateLeaveRequestStatus(id, {
            ...dto,
            decidedBy: currentUserId,
        });
    }
    async hrOverride(id, dto, req) {
        return await this.leavesService.hrOverrideRequest(id, dto.decision, dto.justification, req.user.id);
    }
    async cancelLeaveRequest(id, employeeId) {
        return await this.leavesService.cancelLeaveRequest(id, employeeId);
    }
    async createEntitlement(dto) {
        return await this.leavesService.createEntitlement(dto);
    }
    async createPersonalizedEntitlement(dto) {
        return await this.leavesService.createPersonalizedEntitlement(dto);
    }
    async getEmployeeEntitlements(employeeId) {
        return await this.leavesService.getEmployeeEntitlements(employeeId);
    }
    async getEntitlementById(id) {
        return await this.leavesService.getEntitlementById(id);
    }
    async getBalanceSummary(employeeId, leaveTypeId) {
        return await this.leavesService.getBalanceSummary(employeeId, leaveTypeId);
    }
    async updateBalance(id, dto) {
        return await this.leavesService.updateBalance(id, dto);
    }
    async createAdjustment(dto) {
        return await this.leavesService.createAdjustment(dto);
    }
    async getEmployeeAdjustments(employeeId) {
        return await this.leavesService.getEmployeeAdjustments(employeeId);
    }
    async getAllAdjustments(query) {
        return await this.leavesService.getAllAdjustments(query);
    }
    async createCalendar(createCalendarDto) {
        return this.leavesService.createCalendar(createCalendarDto);
    }
    async getCalendarByYear(year) {
        return this.leavesService.getCalendarByYear(year);
    }
    async addBlockedPeriod(year, addBlockedPeriodDto) {
        return this.leavesService.addBlockedPeriod(year, addBlockedPeriodDto);
    }
    async removeBlockedPeriod(year, index) {
        return this.leavesService.removeBlockedPeriod(year, index);
    }
    async addHolidayToCalendar(year, dto) {
        return this.leavesService.addHolidayToCalendar(year, dto.holidayId);
    }
    async removeHolidayFromCalendar(year, holidayId) {
        return this.leavesService.removeHolidayFromCalendar(year, holidayId);
    }
    async updateLeaveRequest(id, updateLeaveRequestDto) {
        return this.leavesService.updateLeaveRequest(id, updateLeaveRequestDto);
    }
    async delegateApproval(id, delegateApprovalDto) {
        await this.leavesService.delegateApproval(id, delegateApprovalDto.fromUserId, delegateApprovalDto.toUserId, delegateApprovalDto.role);
        return { message: 'Approval authority delegated successfully' };
    }
    async flagIrregularPattern(id) {
        await this.leavesService.flagIrregularPattern(id);
        return { message: 'Leave request flagged for irregular pattern' };
    }
    async calculateNetDays(netDaysDto) {
        return this.leavesService.getNetDaysCalculationDetails(netDaysDto.employeeId, new Date(netDaysDto.from), new Date(netDaysDto.to));
    }
    async checkIfDateBlocked(date) {
        const isBlocked = await this.leavesService.isDateBlocked(new Date(date));
        return { date, isBlocked };
    }
    async getTeamBalances(managerId, leaveTypeId, departmentId) {
        return this.leavesService.getTeamBalances(managerId, {
            leaveTypeId,
            departmentId,
        });
    }
    async getTeamUpcomingLeaves(managerId, leaveTypeId, status, startDate, endDate, departmentId, sortOrder) {
        return this.leavesService.getTeamUpcomingLeaves(managerId, {
            leaveTypeId,
            status,
            startDate,
            endDate,
            departmentId,
            sortOrder,
        });
    }
    async calculateEncashment(employeeId, leaveTypeId) {
        return this.leavesService.calculateEncashment(employeeId, leaveTypeId);
    }
    async processFinalSettlement(employeeId) {
        return this.leavesService.processFinalSettlement(employeeId);
    }
    async getAuditTrail(employeeId) {
        return this.leavesService.getAuditTrail(employeeId);
    }
    async getIrregularPatterns() {
        return this.leavesService.getAllLeaveRequests({ status: undefined });
    }
    async runMonthlyAccrual() {
        const result = await this.leavesService.runAccrualProcess('monthly');
        return {
            message: 'Monthly accrual process completed',
            processed: result.processed,
            failed: result.failed,
        };
    }
    async runQuarterlyAccrual() {
        const result = await this.leavesService.runAccrualProcess('quarterly');
        return {
            message: 'Quarterly accrual process completed',
            processed: result.processed,
            failed: result.failed,
        };
    }
    async runYearlyAccrual() {
        const result = await this.leavesService.runAccrualProcess('yearly');
        return {
            message: 'Yearly accrual process completed',
            processed: result.processed,
            failed: result.failed,
        };
    }
    async runAccrualForEmployee(employeeId) {
        const entitlements = await this.leavesService.getEmployeeEntitlements(employeeId);
        const results = [];
        for (const entitlement of entitlements) {
            try {
                const now = new Date();
                const startDate = entitlement.lastAccrualDate || new Date(now.getFullYear(), 0, 1);
                const accrual = await this.leavesService.calculateAccrualForEmployee(employeeId, entitlement.leaveTypeId.toString(), startDate, now);
                await this.leavesService.updateBalance(entitlement._id.toString(), {
                    accruedActual: (entitlement.accruedActual || 0) + accrual.actual,
                    accruedRounded: (entitlement.accruedRounded || 0) + accrual.rounded,
                });
                results.push({
                    leaveTypeId: entitlement.leaveTypeId,
                    accrued: accrual,
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                results.push({
                    leaveTypeId: entitlement.leaveTypeId,
                    error: errorMessage,
                });
            }
        }
        return {
            message: 'Employee accrual process completed',
            employeeId,
            results,
        };
    }
    async runCarryForward() {
        const result = await this.leavesService.runYearEndCarryForward();
        return {
            message: 'Year-end carry-forward process completed',
            processed: result.processed,
            capped: result.capped,
            failed: result.failed,
        };
    }
    async calculateResetDates() {
        const result = await this.leavesService.updateAllResetDates();
        return {
            message: 'Reset dates calculation completed',
            updated: result.updated,
            failed: result.failed,
        };
    }
    async checkBalance(employeeId, leaveTypeId, days) {
        await this.leavesService.checkBalanceSufficiency(employeeId, leaveTypeId, Number(days));
        return { message: 'Sufficient balance available', available: true };
    }
    async checkOverlap(employeeId, from, to) {
        await this.leavesService.checkOverlappingLeaves(employeeId, new Date(from), new Date(to));
        return { message: 'No overlapping leaves found', hasOverlap: false };
    }
    async validateDocuments(leaveTypeId, days, hasAttachment) {
        const attachmentId = hasAttachment === 'true' ? 'dummy-id' : undefined;
        await this.leavesService.validateRequiredDocuments(leaveTypeId, Number(days), attachmentId);
        return { message: 'Document validation passed', documentsValid: true };
    }
};
exports.LeavesController = LeavesController;
__decorate([
    (0, common_1.Get)('attachments/:attachmentId'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get attachment metadata by ID (HR only)',
    }),
    (0, swagger_1.ApiParam)({
        name: 'attachmentId',
        description: 'Attachment ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Attachment retrieved successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid attachment ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attachment not found' }),
    __param(0, (0, common_1.Param)('attachmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getAttachmentById", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new leave category',
        description: 'Creates a new leave category with a unique name',
    }),
    (0, swagger_1.ApiBody)({ type: create_leave_category_dto_1.CreateLeaveCategoryDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Category created successfully',
        type: leave_category_response_dto_1.LeaveCategoryResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Category with this name already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_category_dto_1.CreateLeaveCategoryDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createLeaveCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all leave categories',
        description: 'Retrieves a list of all leave categories in the system',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of categories retrieved successfully',
        type: [leave_category_response_dto_1.LeaveCategoryResponseDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getAllLeaveCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get leave category by ID',
        description: 'Retrieves a specific leave category by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave category ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Category retrieved successfully',
        type: leave_category_response_dto_1.LeaveCategoryResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaveCategoryById", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update leave category',
        description: 'Updates an existing leave category',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave category ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({ type: update_leave_category_dto_1.UpdateLeaveCategoryDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Category updated successfully',
        type: leave_category_response_dto_1.LeaveCategoryResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_category_dto_1.UpdateLeaveCategoryDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateLeaveCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete leave category',
        description: 'Deletes a leave category by ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave category ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "deleteLeaveCategory", null);
__decorate([
    (0, common_1.Post)('types'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new leave type',
        description: 'Creates a new leave type with specified configuration. Requires HR Admin, HR Manager, or System Admin role.',
    }),
    (0, swagger_1.ApiBody)({ type: create_leave_type_dto_1.CreateLeaveTypeDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Leave type created successfully',
        type: leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Category not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Leave type with this code already exists',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_type_dto_1.CreateLeaveTypeDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createLeaveType", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all leave types',
        description: 'Retrieves all leave types with their category details. Requires authentication.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave types retrieved successfully',
        type: [leave_type_response_dto_1.LeaveTypeResponseDto],
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getAllLeaveTypes", null);
__decorate([
    (0, common_1.Get)('types/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get leave type by ID',
        description: 'Retrieves a specific leave type by its ID. Requires authentication.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave type ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave type retrieved successfully',
        type: leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaveTypeById", null);
__decorate([
    (0, common_1.Get)('types/code/:code'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get leave type by code',
        description: 'Retrieves a specific leave type by its unique code. Requires authentication.',
    }),
    (0, swagger_1.ApiParam)({ name: 'code', description: 'Leave type code', example: 'ANN' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave type retrieved successfully',
        type: leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave type not found' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaveTypeByCode", null);
__decorate([
    (0, common_1.Put)('types/:id'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update leave type',
        description: 'Updates an existing leave type. Requires HR Admin, HR Manager, or System Admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave type ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({ type: update_leave_type_dto_1.UpdateLeaveTypeDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave type updated successfully',
        type: leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_type_dto_1.UpdateLeaveTypeDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateLeaveType", null);
__decorate([
    (0, common_1.Delete)('types/:id'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete leave type',
        description: 'Deletes a leave type by ID. Requires HR Admin or System Admin role.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave type ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leave type deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave type not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "deleteLeaveType", null);
__decorate([
    (0, common_1.Post)('policies'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new leave policy',
        description: 'Creates a new leave policy with accrual and carry-forward rules',
    }),
    (0, swagger_1.ApiBody)({ type: create_leave_policy_dto_1.CreateLeavePolicyDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Policy created successfully',
        type: leave_policy_response_dto_1.LeavePolicyResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave type not found' }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Policy already exists for this leave type',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_policy_dto_1.CreateLeavePolicyDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createLeavePolicy", null);
__decorate([
    (0, common_1.Get)('policies'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all leave policies',
        description: 'Retrieves all leave policies with their associated leave types',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Policies retrieved successfully',
        type: [leave_policy_response_dto_1.LeavePolicyResponseDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getAllPolicies", null);
__decorate([
    (0, common_1.Get)('policies/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get leave policy by ID',
        description: 'Retrieves a specific leave policy by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave policy ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Policy retrieved successfully',
        type: leave_policy_response_dto_1.LeavePolicyResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeavePolicyById", null);
__decorate([
    (0, common_1.Get)('policies/leave-type/:leaveTypeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get policy by leave type ID',
        description: 'Retrieves the policy associated with a specific leave type',
    }),
    (0, swagger_1.ApiParam)({
        name: 'leaveTypeId',
        description: 'Leave type ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Policy retrieved successfully',
        type: leave_policy_response_dto_1.LeavePolicyResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    __param(0, (0, common_1.Param)('leaveTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeavePolicyByType", null);
__decorate([
    (0, common_1.Put)('policies/:id'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update leave policy',
        description: 'Updates an existing leave policy',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave policy ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({ type: update_leave_policy_dto_1.UpdateLeavePolicyDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Policy updated successfully',
        type: leave_policy_response_dto_1.LeavePolicyResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_policy_dto_1.UpdateLeavePolicyDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateLeavePolicy", null);
__decorate([
    (0, common_1.Delete)('policies/:id'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete leave policy',
        description: 'Deletes a leave policy by ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave policy ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Policy deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Policy not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "deleteLeavePolicy", null);
__decorate([
    (0, common_1.Post)('requests'),
    (0, swagger_1.ApiOperation)({
        summary: 'Submit a new leave request',
        description: 'Submits a new leave request for approval',
    }),
    (0, swagger_1.ApiBody)({ type: submit_leave_request_dto_1.SubmitLeaveRequestDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Leave request submitted successfully',
        type: leave_request_response_dto_1.LeaveRequestResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data or date range' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave type not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [submit_leave_request_dto_1.SubmitLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "submitLeaveRequest", null);
__decorate([
    (0, common_1.Get)('requests'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all leave requests',
        description: 'Retrieves leave requests with optional filters (employee, leave type, status, date range, department) and sorting',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'employeeId',
        required: false,
        description: 'Filter by employee ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        required: false,
        description: 'Filter by leave type ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by status',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        required: false,
        description: 'Filter by start date (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        required: false,
        description: 'Filter by end date (YYYY-MM-DD)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'departmentId',
        required: false,
        description: 'Filter by employee department ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortBy',
        required: false,
        description: 'Sort by dates.from or createdAt',
        enum: ['dates.from', 'createdAt'],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        required: false,
        description: 'Sort order asc|desc',
        enum: ['asc', 'desc'],
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave requests retrieved successfully',
        type: [leave_request_response_dto_1.LeaveRequestResponseDto],
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [leave_request_query_dto_1.LeaveRequestQueryDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getAllLeaveRequests", null);
__decorate([
    (0, common_1.Get)('requests/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get leave request by ID',
        description: 'Retrieves a specific leave request with full details',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave request ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave request retrieved successfully',
        type: leave_request_response_dto_1.LeaveRequestResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getLeaveRequestById", null);
__decorate([
    (0, common_1.Patch)('requests/:id/status'),
    (0, decorators_1.Roles)('Manager', 'HR Admin', 'HR Manager'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update leave request status',
        description: 'Approves, rejects, or updates the status of a leave request',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave request ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({ type: update_leave_request_status_dto_1.UpdateLeaveRequestStatusDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave request status updated successfully',
        type: leave_request_response_dto_1.LeaveRequestResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Not authorized to approve/reject this request',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_request_status_dto_1.UpdateLeaveRequestStatusDto, Object]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateLeaveRequestStatus", null);
__decorate([
    (0, common_1.Patch)('requests/:id/override'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'HR override approval/rejection',
        description: 'Allows HR Admin to override and approve/reject any pending leave request',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave request ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({ type: hr_override_dto_1.HROverrideDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave request overridden successfully',
        type: leave_request_response_dto_1.LeaveRequestResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input or request not pending',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, hr_override_dto_1.HROverrideDto, Object]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "hrOverride", null);
__decorate([
    (0, common_1.Delete)('requests/:id/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel leave request',
        description: 'Allows employee to cancel their own pending leave request',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Leave request ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'employeeId',
        required: true,
        description: 'Employee ID requesting cancellation',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave request cancelled successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input or only pending requests can be cancelled',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Leave request not found or no permission',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "cancelLeaveRequest", null);
__decorate([
    (0, common_1.Post)('entitlements'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create leave entitlement with automatic eligibility validation',
        description: `Creates a new leave entitlement for an employee with automatic eligibility validation.

REQ-007: System automatically validates employee against leave policy eligibility rules:
- Minimum tenure requirement
- Position/job title eligibility
- Contract type eligibility
- Job grade/level eligibility

The system fetches employee data from Employee Profile module and validates against the policy.
If yearlyEntitlement is not provided, it uses the default from the leave policy (Vacation Package concept).

For personalized/override entitlements that skip validation, use POST /entitlements/personalized endpoint.`,
    }),
    (0, swagger_1.ApiBody)({ type: create_entitlement_dto_1.CreateEntitlementDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Entitlement created successfully after passing eligibility validation',
        type: leave_entitlement_response_dto_1.LeaveEntitlementResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid input data or employee not eligible',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Entitlement already exists for this employee and leave type',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_entitlement_dto_1.CreateEntitlementDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createEntitlement", null);
__decorate([
    (0, common_1.Post)('entitlements/personalized'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create personalized entitlement (skips eligibility validation)',
        description: `Creates a personalized/override entitlement for an employee, bypassing eligibility validation.

REQ-007: Personalized entitlements can be assigned to individuals

Use this endpoint when:
- Assigning custom entitlements that differ from standard policy
- Overriding eligibility rules for specific employees
- Creating exceptions to standard vacation packages
- Granting special leave allowances

Note: This endpoint requires higher privileges (HR Admin or System Admin only) as it bypasses automatic validation.`,
    }),
    (0, swagger_1.ApiBody)({ type: create_entitlement_dto_1.CreateEntitlementDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Personalized entitlement created successfully',
        type: leave_entitlement_response_dto_1.LeaveEntitlementResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Entitlement already exists for this employee and leave type',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_entitlement_dto_1.CreateEntitlementDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createPersonalizedEntitlement", null);
__decorate([
    (0, common_1.Get)('entitlements/employee/:employeeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get employee entitlements',
        description: 'Retrieves all leave entitlements for a specific employee',
    }),
    (0, swagger_1.ApiParam)({
        name: 'employeeId',
        description: 'Employee ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Entitlements retrieved successfully',
        type: [leave_entitlement_response_dto_1.LeaveEntitlementResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid employee ID format' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getEmployeeEntitlements", null);
__decorate([
    (0, common_1.Get)('entitlements/:id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get entitlement by ID',
        description: 'Retrieves a specific leave entitlement by its ID',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Entitlement ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Entitlement retrieved successfully',
        type: leave_entitlement_response_dto_1.LeaveEntitlementResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Entitlement not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getEntitlementById", null);
__decorate([
    (0, common_1.Get)('balances/summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get balance summary',
        description: 'Retrieves a summary of leave balance for an employee and leave type',
    }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', required: true, description: 'Employee ID' }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        required: true,
        description: 'Leave type ID',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Balance summary retrieved successfully',
        type: balance_summary_response_dto_1.BalanceSummaryResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid ID format' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Entitlement not found' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('leaveTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getBalanceSummary", null);
__decorate([
    (0, common_1.Patch)('entitlements/:id/balance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update leave balance',
        description: 'Manually updates leave balance for an entitlement',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Entitlement ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiBody)({ type: update_balance_dto_1.UpdateBalanceDto }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Balance updated successfully',
        type: leave_entitlement_response_dto_1.LeaveEntitlementResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Entitlement not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_balance_dto_1.UpdateBalanceDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateBalance", null);
__decorate([
    (0, common_1.Post)('adjustments'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create leave adjustment',
        description: 'Creates a manual adjustment to employee leave balance',
    }),
    (0, swagger_1.ApiBody)({ type: create_adjustment_dto_1.CreateAdjustmentDto }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Adjustment created successfully',
        type: leave_adjustment_response_dto_1.LeaveAdjustmentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_adjustment_dto_1.CreateAdjustmentDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createAdjustment", null);
__decorate([
    (0, common_1.Get)('adjustments/employee/:employeeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get employee adjustments',
        description: 'Retrieves all leave adjustments for a specific employee',
    }),
    (0, swagger_1.ApiParam)({
        name: 'employeeId',
        description: 'Employee ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Adjustments retrieved successfully',
        type: [leave_adjustment_response_dto_1.LeaveAdjustmentResponseDto],
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid employee ID format' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getEmployeeAdjustments", null);
__decorate([
    (0, common_1.Get)('adjustments'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all adjustments',
        description: 'Retrieves leave adjustments with optional filters',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'employeeId',
        required: false,
        description: 'Filter by employee ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        required: false,
        description: 'Filter by leave type ID',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'adjustmentType',
        required: false,
        description: 'Filter by adjustment type',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Adjustments retrieved successfully',
        type: [leave_adjustment_response_dto_1.LeaveAdjustmentResponseDto],
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [adjustment_query_dto_1.AdjustmentQueryDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getAllAdjustments", null);
__decorate([
    (0, common_1.Post)('calendars'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Create calendar for a specific year' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Calendar created successfully',
        type: calendar_response_dto_1.CalendarResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Calendar already exists for this year',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_calendar_dto_1.CreateCalendarDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "createCalendar", null);
__decorate([
    (0, common_1.Get)('calendars/:year'),
    (0, swagger_1.ApiOperation)({ summary: 'Get calendar for a specific year' }),
    (0, swagger_1.ApiParam)({ name: 'year', description: 'Calendar year', example: 2024 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Calendar retrieved successfully',
        type: calendar_response_dto_1.CalendarResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calendar not found' }),
    __param(0, (0, common_1.Param)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getCalendarByYear", null);
__decorate([
    (0, common_1.Post)('calendars/:year/blocked-periods'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Add blocked period to calendar' }),
    (0, swagger_1.ApiParam)({ name: 'year', description: 'Calendar year', example: 2024 }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Blocked period added successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calendar not found' }),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, add_blocked_period_dto_1.AddBlockedPeriodDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "addBlockedPeriod", null);
__decorate([
    (0, common_1.Delete)('calendars/:year/blocked-periods/:index'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove blocked period from calendar' }),
    (0, swagger_1.ApiParam)({ name: 'year', description: 'Calendar year', example: 2024 }),
    (0, swagger_1.ApiParam)({
        name: 'index',
        description: 'Index of blocked period to remove',
        example: 0,
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Blocked period removed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calendar not found' }),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Param)('index')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "removeBlockedPeriod", null);
__decorate([
    (0, common_1.Post)('calendars/:year/holidays'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Add holiday ID to calendar' }),
    (0, swagger_1.ApiParam)({ name: 'year', description: 'Calendar year', example: 2024 }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Holiday added to calendar' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calendar not found' }),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, add_holiday_dto_1.AddHolidayDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "addHolidayToCalendar", null);
__decorate([
    (0, common_1.Delete)('calendars/:year/holidays/:holidayId'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove holiday ID from calendar' }),
    (0, swagger_1.ApiParam)({ name: 'year', description: 'Calendar year', example: 2024 }),
    (0, swagger_1.ApiParam)({
        name: 'holidayId',
        description: 'Holiday ID to remove',
        example: '507f1f77bcf86cd799439099',
    }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Holiday removed from calendar' }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Calendar or holiday not found' }),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Param)('holidayId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "removeHolidayFromCalendar", null);
__decorate([
    (0, common_1.Patch)('requests/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modify pending leave request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Leave request ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Leave request updated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Only pending requests can be modified',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_request_dto_1.UpdateLeaveRequestDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "updateLeaveRequest", null);
__decorate([
    (0, common_1.Post)('requests/:id/delegate'),
    (0, swagger_1.ApiOperation)({ summary: 'Delegate approval authority for a leave request' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Leave request ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Approval delegated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, delegate_approval_dto_1.DelegateApprovalDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "delegateApproval", null);
__decorate([
    (0, common_1.Patch)('requests/:id/flag-irregular'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin', 'Department Head'),
    (0, swagger_1.ApiOperation)({ summary: 'Flag irregular leave pattern' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Leave request ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Request flagged successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "flagIrregularPattern", null);
__decorate([
    (0, common_1.Post)('calculations/net-days'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate net working days for leave request' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Net days calculated successfully',
        type: net_days_calculation_dto_1.NetDaysResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [net_days_calculation_dto_1.NetDaysCalculationDto]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "calculateNetDays", null);
__decorate([
    (0, common_1.Get)('calendars/check-blocked'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if a date is blocked for leave requests' }),
    (0, swagger_1.ApiQuery)({
        name: 'date',
        description: 'Date to check (YYYY-MM-DD)',
        example: '2024-12-25',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Date checked successfully' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "checkIfDateBlocked", null);
__decorate([
    (0, common_1.Get)('manager/team-balances'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin', 'Department Head'),
    (0, swagger_1.ApiOperation)({ summary: 'Get leave balances for all team members' }),
    (0, swagger_1.ApiQuery)({
        name: 'managerId',
        description: 'Manager employee ID',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        description: 'Optional leave type filter',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'departmentId',
        description: 'Optional department filter (overrides manager department)',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Team balances retrieved successfully',
        type: [team_balance_response_dto_1.TeamBalanceResponseDto],
    }),
    __param(0, (0, common_1.Query)('managerId')),
    __param(1, (0, common_1.Query)('leaveTypeId')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getTeamBalances", null);
__decorate([
    (0, common_1.Get)('manager/team-upcoming-leaves'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin', 'Department Head'),
    (0, swagger_1.ApiOperation)({ summary: 'Get upcoming approved leaves for team members' }),
    (0, swagger_1.ApiQuery)({
        name: 'managerId',
        description: 'Manager employee ID',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        description: 'Optional leave type filter',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        description: 'Optional status filter',
        required: false,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
    }),
    (0, swagger_1.ApiQuery)({
        name: 'startDate',
        description: 'Filter by start date (YYYY-MM-DD)',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'endDate',
        description: 'Filter by end date (YYYY-MM-DD)',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'departmentId',
        description: 'Optional department filter',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sortOrder',
        description: 'Sort order asc|desc',
        required: false,
        enum: ['asc', 'desc'],
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Upcoming leaves retrieved successfully',
        type: [upcoming_leave_response_dto_1.UpcomingLeaveResponseDto],
    }),
    __param(0, (0, common_1.Query)('managerId')),
    __param(1, (0, common_1.Query)('leaveTypeId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('departmentId')),
    __param(6, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getTeamUpcomingLeaves", null);
__decorate([
    (0, common_1.Get)('encashment/calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate leave encashment for employee' }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', description: 'Employee ID', required: true }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        description: 'Leave type ID',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Encashment calculated successfully',
        type: encashment_response_dto_1.EncashmentResponseDto,
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave entitlement not found' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('leaveTypeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "calculateEncashment", null);
__decorate([
    (0, common_1.Post)('final-settlement/:employeeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Process final settlement for terminating employee',
    }),
    (0, swagger_1.ApiParam)({ name: 'employeeId', description: 'Employee ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Final settlement processed successfully',
        type: [encashment_response_dto_1.EncashmentResponseDto],
    }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "processFinalSettlement", null);
__decorate([
    (0, common_1.Get)('audit-trail/:employeeId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get audit trail of leave adjustments for employee',
    }),
    (0, swagger_1.ApiParam)({ name: 'employeeId', description: 'Employee ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Audit trail retrieved successfully',
        type: [audit_trail_response_dto_1.AuditTrailResponseDto],
    }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getAuditTrail", null);
__decorate([
    (0, common_1.Get)('reports/irregular-patterns'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all leave requests flagged for irregular patterns',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Irregular patterns retrieved successfully',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "getIrregularPatterns", null);
__decorate([
    (0, common_1.Post)('accrual/run-monthly'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually trigger monthly accrual process',
        description: 'Processes monthly accrual for all employees. Excludes unpaid leave periods (BR-11).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Monthly accrual completed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "runMonthlyAccrual", null);
__decorate([
    (0, common_1.Post)('accrual/run-quarterly'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually trigger quarterly accrual process',
        description: 'Processes quarterly accrual for all employees. Excludes unpaid leave periods (BR-11).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Quarterly accrual completed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "runQuarterlyAccrual", null);
__decorate([
    (0, common_1.Post)('accrual/run-yearly'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually trigger yearly accrual process',
        description: 'Processes yearly accrual for all employees. Excludes unpaid leave periods (BR-11).',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Yearly accrual completed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "runYearlyAccrual", null);
__decorate([
    (0, common_1.Post)('accrual/employee/:employeeId'),
    (0, decorators_1.Roles)('HR Admin', 'HR Manager', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually trigger accrual for specific employee',
        description: 'Calculates and applies accrual for a single employee across all their entitlements.',
    }),
    (0, swagger_1.ApiParam)({ name: 'employeeId', description: 'Employee ID' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Employee accrual completed successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid employee ID' }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - Insufficient permissions',
    }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "runAccrualForEmployee", null);
__decorate([
    (0, common_1.Post)('carry-forward/run'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Manually trigger year-end carry-forward',
        description: 'Processes carry-forward for all employees, applying max carry-forward caps (45 days default) and expiry dates.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Carry-forward completed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "runCarryForward", null);
__decorate([
    (0, common_1.Post)('reset-dates/calculate'),
    (0, decorators_1.Roles)('HR Admin', 'System Admin'),
    (0, swagger_1.ApiOperation)({
        summary: 'Calculate and update reset dates for all employees',
        description: 'Calculates reset dates based on employee hire dates and updates all entitlements.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Reset dates calculated successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Authentication required',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - HR Admin or System Admin role required',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "calculateResetDates", null);
__decorate([
    (0, common_1.Get)('validation/check-balance'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if employee has sufficient balance for leave request',
    }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', description: 'Employee ID', required: true }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        description: 'Leave type ID',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({ name: 'days', description: 'Requested days', required: true }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balance check completed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Insufficient balance' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('leaveTypeId')),
    __param(2, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "checkBalance", null);
__decorate([
    (0, common_1.Get)('validation/check-overlap'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if leave request overlaps with existing approved leaves',
    }),
    (0, swagger_1.ApiQuery)({ name: 'employeeId', description: 'Employee ID', required: true }),
    (0, swagger_1.ApiQuery)({
        name: 'from',
        description: 'Start date (YYYY-MM-DD)',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'to',
        description: 'End date (YYYY-MM-DD)',
        required: true,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'No overlap found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Overlap detected' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "checkOverlap", null);
__decorate([
    (0, common_1.Get)('validation/check-documents'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check if documents are required for leave type and duration',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'leaveTypeId',
        description: 'Leave type ID',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'days',
        description: 'Leave duration in days',
        required: true,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'hasAttachment',
        description: 'Whether attachment is provided',
        required: false,
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Documents validation passed' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Required documents missing' }),
    __param(0, (0, common_1.Query)('leaveTypeId')),
    __param(1, (0, common_1.Query)('days')),
    __param(2, (0, common_1.Query)('hasAttachment')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], LeavesController.prototype, "validateDocuments", null);
exports.LeavesController = LeavesController = __decorate([
    (0, swagger_1.ApiTags)('Leaves Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, common_1.Controller)('leaves'),
    __metadata("design:paramtypes", [leaves_service_1.LeavesService])
], LeavesController);
//# sourceMappingURL=leaves.controller.js.map