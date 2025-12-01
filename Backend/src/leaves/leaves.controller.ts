import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { LeavesService } from './leaves.service';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

// Category DTOs
import { CreateLeaveCategoryDto } from './dto/create-leave-category.dto';
import { UpdateLeaveCategoryDto } from './dto/update-leave-category.dto';
import { LeaveCategoryResponseDto } from './dto/leave-category-response.dto';

// Leave Type DTOs
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { LeaveTypeResponseDto } from './dto/leave-type-response.dto';

// Leave Policy DTOs
import { CreateLeavePolicyDto } from './dto/create-leave-policy.dto';
import { UpdateLeavePolicyDto } from './dto/update-leave-policy.dto';
import { LeavePolicyResponseDto } from './dto/leave-policy-response.dto';

// Leave Request DTOs
import { SubmitLeaveRequestDto } from './dto/submit-leave-request.dto';
import { UpdateLeaveRequestStatusDto } from './dto/update-leave-request-status.dto';
import { LeaveRequestQueryDto } from './dto/leave-request-query.dto';
import { LeaveRequestResponseDto } from './dto/leave-request-response.dto';
import { HROverrideDto } from './dto/hr-override.dto';

// Leave Entitlement DTOs
import { CreateEntitlementDto } from './dto/create-entitlement.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { LeaveEntitlementResponseDto } from './dto/leave-entitlement-response.dto';
import { BalanceSummaryResponseDto } from './dto/balance-summary-response.dto';

// Leave Adjustment DTOs
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { AdjustmentQueryDto } from './dto/adjustment-query.dto';
import { LeaveAdjustmentResponseDto } from './dto/leave-adjustment-response.dto';

// Extended DTOs
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { AddBlockedPeriodDto } from './dto/add-blocked-period.dto';
import { CalendarResponseDto } from './dto/calendar-response.dto';
import { DelegateApprovalDto } from './dto/delegate-approval.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import {
  NetDaysCalculationDto,
  NetDaysResponseDto,
} from './dto/net-days-calculation.dto';
import { TeamBalanceResponseDto } from './dto/team-balance-response.dto';
import { UpcomingLeaveResponseDto } from './dto/upcoming-leave-response.dto';
import { EncashmentResponseDto } from './dto/encashment-response.dto';
import { AuditTrailResponseDto } from './dto/audit-trail-response.dto';
import { LeaveStatus } from './enums/leave-status.enum';
import { AddHolidayDto } from './dto/add-holiday.dto';

@ApiTags('Leaves Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeavesController {
  // In-memory delegation Map (REQ-023)
  private delegations = new Map<string, string>();

  constructor(private readonly leavesService: LeavesService) {}

  // ==================== ATTACHMENTS ====================

  @Get('attachments/:attachmentId')
  @Roles('HR Admin', 'HR Manager')
  @ApiOperation({
    summary: 'Get attachment metadata by ID (HR only)',
  })
  @ApiParam({
    name: 'attachmentId',
    description: 'Attachment ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Attachment retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid attachment ID format' })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async getAttachmentById(@Param('attachmentId') attachmentId: string) {
    return await this.leavesService.getAttachmentForHr(attachmentId);
  }

  // ==================== LEAVE CATEGORIES ====================

  @Post('categories')
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @ApiOperation({
    summary: 'Create a new leave category',
    description: 'Creates a new leave category with a unique name',
  })
  @ApiBody({ type: CreateLeaveCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: LeaveCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  async createLeaveCategory(@Body() dto: CreateLeaveCategoryDto) {
    return await this.leavesService.createLeaveCategory(dto);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all leave categories',
    description: 'Retrieves a list of all leave categories in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
    type: [LeaveCategoryResponseDto],
  })
  async getAllLeaveCategories() {
    return await this.leavesService.getAllLeaveCategories();
  }

  @Get('categories/:id')
  @ApiOperation({
    summary: 'Get leave category by ID',
    description: 'Retrieves a specific leave category by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: LeaveCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getLeaveCategoryById(@Param('id') id: string) {
    return await this.leavesService.getLeaveCategoryById(id);
  }

  @Put('categories/:id')
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @ApiOperation({
    summary: 'Update leave category',
    description: 'Updates an existing leave category',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateLeaveCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: LeaveCategoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateLeaveCategory(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveCategoryDto,
  ) {
    return await this.leavesService.updateLeaveCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete leave category',
    description: 'Deletes a leave category by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async deleteLeaveCategory(@Param('id') id: string) {
    return await this.leavesService.deleteLeaveCategory(id);
  }

  // ==================== LEAVE TYPES ====================

  @Post('types')
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @ApiOperation({
    summary: 'Create a new leave type',
    description:
      'Creates a new leave type with specified configuration. Requires HR Admin, HR Manager, or System Admin role.',
  })
  @ApiBody({ type: CreateLeaveTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Leave type created successfully',
    type: LeaveTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({
    status: 409,
    description: 'Leave type with this code already exists',
  })
  async createLeaveType(@Body() dto: CreateLeaveTypeDto) {
    return await this.leavesService.createLeaveType(dto);
  }

  @Get('types')
  @ApiOperation({
    summary: 'Get all leave types',
    description:
      'Retrieves all leave types with their category details. Requires authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave types retrieved successfully',
    type: [LeaveTypeResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  async getAllLeaveTypes() {
    return await this.leavesService.getAllLeaveTypes();
  }

  @Get('types/:id')
  @ApiOperation({
    summary: 'Get leave type by ID',
    description:
      'Retrieves a specific leave type by its ID. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave type ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave type retrieved successfully',
    type: LeaveTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async getLeaveTypeById(@Param('id') id: string) {
    return await this.leavesService.getLeaveTypeById(id);
  }

  @Get('types/code/:code')
  @ApiOperation({
    summary: 'Get leave type by code',
    description:
      'Retrieves a specific leave type by its unique code. Requires authentication.',
  })
  @ApiParam({ name: 'code', description: 'Leave type code', example: 'ANN' })
  @ApiResponse({
    status: 200,
    description: 'Leave type retrieved successfully',
    type: LeaveTypeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async getLeaveTypeByCode(@Param('code') code: string) {
    return await this.leavesService.getLeaveTypeByCode(code);
  }

  @Put('types/:id')
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @ApiOperation({
    summary: 'Update leave type',
    description:
      'Updates an existing leave type. Requires HR Admin, HR Manager, or System Admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave type ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateLeaveTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Leave type updated successfully',
    type: LeaveTypeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async updateLeaveType(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    return await this.leavesService.updateLeaveType(id, dto);
  }

  @Delete('types/:id')
  @Roles('HR Admin', 'System Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete leave type',
    description:
      'Deletes a leave type by ID. Requires HR Admin or System Admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave type ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Leave type deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async deleteLeaveType(@Param('id') id: string) {
    return await this.leavesService.deleteLeaveType(id);
  }

  // ==================== LEAVE POLICIES ====================

  @Post('policies')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Create a new leave policy',
    description:
      'Creates a new leave policy with accrual and carry-forward rules',
  })
  @ApiBody({ type: CreateLeavePolicyDto })
  @ApiResponse({
    status: 201,
    description: 'Policy created successfully',
    type: LeavePolicyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  @ApiResponse({
    status: 409,
    description: 'Policy already exists for this leave type',
  })
  async createLeavePolicy(@Body() dto: CreateLeavePolicyDto) {
    return await this.leavesService.createLeavePolicy(dto);
  }

  @Get('policies')
  @ApiOperation({
    summary: 'Get all leave policies',
    description:
      'Retrieves all leave policies with their associated leave types',
  })
  @ApiResponse({
    status: 200,
    description: 'Policies retrieved successfully',
    type: [LeavePolicyResponseDto],
  })
  async getAllPolicies() {
    return await this.leavesService.getAllPolicies();
  }

  @Get('policies/:id')
  @ApiOperation({
    summary: 'Get leave policy by ID',
    description: 'Retrieves a specific leave policy by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave policy ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Policy retrieved successfully',
    type: LeavePolicyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getLeavePolicyById(@Param('id') id: string) {
    return await this.leavesService.getLeavePolicyById(id);
  }

  @Get('policies/leave-type/:leaveTypeId')
  @ApiOperation({
    summary: 'Get policy by leave type ID',
    description: 'Retrieves the policy associated with a specific leave type',
  })
  @ApiParam({
    name: 'leaveTypeId',
    description: 'Leave type ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Policy retrieved successfully',
    type: LeavePolicyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async getLeavePolicyByType(@Param('leaveTypeId') leaveTypeId: string) {
    return await this.leavesService.getLeavePolicyByType(leaveTypeId);
  }

  @Put('policies/:id')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Update leave policy',
    description: 'Updates an existing leave policy',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave policy ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateLeavePolicyDto })
  @ApiResponse({
    status: 200,
    description: 'Policy updated successfully',
    type: LeavePolicyResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async updateLeavePolicy(
    @Param('id') id: string,
    @Body() dto: UpdateLeavePolicyDto,
  ) {
    return await this.leavesService.updateLeavePolicy(id, dto);
  }

  @Delete('policies/:id')
  @Roles('HR Admin', 'System Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete leave policy',
    description: 'Deletes a leave policy by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave policy ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Policy deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Policy not found' })
  async deleteLeavePolicy(@Param('id') id: string) {
    return await this.leavesService.deleteLeavePolicy(id);
  }

  // ==================== LEAVE REQUESTS ====================

  @Post('requests')
  @ApiOperation({
    summary: 'Submit a new leave request',
    description: 'Submits a new leave request for approval',
  })
  @ApiBody({ type: SubmitLeaveRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Leave request submitted successfully',
    type: LeaveRequestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or date range' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async submitLeaveRequest(@Body() dto: SubmitLeaveRequestDto) {
    // Pass delegation Map to service
    return await this.leavesService.submitLeaveRequest(dto, this.delegations);
  }

  @Get('requests')
  @ApiOperation({
    summary: 'Get all leave requests',
    description:
      'Retrieves leave requests with optional filters (employee, leave type, status, date range, department) and sorting',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'leaveTypeId',
    required: false,
    description: 'Filter by leave type ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter by employee department ID',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by dates.from or createdAt',
    enum: ['dates.from', 'createdAt'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order asc|desc',
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Leave requests retrieved successfully',
    type: [LeaveRequestResponseDto],
  })
  async getAllLeaveRequests(@Query() query: LeaveRequestQueryDto) {
    return await this.leavesService.getAllLeaveRequests(query);
  }

  @Get('requests/:id')
  @ApiOperation({
    summary: 'Get leave request by ID',
    description: 'Retrieves a specific leave request with full details',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request retrieved successfully',
    type: LeaveRequestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async getLeaveRequestById(@Param('id') id: string) {
    return await this.leavesService.getLeaveRequestById(id);
  }

  @Patch('requests/:id/status')
  @Roles('Manager', 'HR Admin', 'HR Manager')
  @ApiOperation({
    summary: 'Update leave request status',
    description: 'Approves, rejects, or updates the status of a leave request',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateLeaveRequestStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Leave request status updated successfully',
    type: LeaveRequestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to approve/reject this request',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async updateLeaveRequestStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestStatusDto,
    @Request() req, // Get JWT user
  ) {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      throw new UnauthorizedException('User not authenticated');
    }

    // REQ-021/022: Check authorization
    const request = await this.leavesService.getLeaveRequestById(id);

    const authorized = await this.leavesService.isUserAuthorizedToApprove(
      request,
      currentUserId,
    );

    if (!authorized) {
      throw new ForbiddenException(
        'You are not authorized to approve/reject this request',
      );
    }

    return await this.leavesService.updateLeaveRequestStatus(id, {
      ...dto,
      decidedBy: currentUserId,
    });
  }

  /**
   * REQ-026: HR Admin override for any leave request
   */
  @Patch('requests/:id/override')
  @Roles('HR Admin', 'System Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'HR override approval/rejection',
    description:
      'Allows HR Admin to override and approve/reject any pending leave request',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: HROverrideDto })
  @ApiResponse({
    status: 200,
    description: 'Leave request overridden successfully',
    type: LeaveRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or request not pending',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async hrOverride(
    @Param('id') id: string,
    @Body() dto: HROverrideDto,
    @Request() req,
  ) {
    return await this.leavesService.hrOverrideRequest(
      id,
      dto.decision,
      dto.justification,
      req.user.id,
    );
  }

  @Delete('requests/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel leave request',
    description: 'Allows employee to cancel their own pending leave request',
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'employeeId',
    required: true,
    description: 'Employee ID requesting cancellation',
  })
  @ApiResponse({
    status: 200,
    description: 'Leave request cancelled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or only pending requests can be cancelled',
  })
  @ApiResponse({
    status: 404,
    description: 'Leave request not found or no permission',
  })
  async cancelLeaveRequest(
    @Param('id') id: string,
    @Query('employeeId') employeeId: string,
  ) {
    return await this.leavesService.cancelLeaveRequest(id, employeeId);
  }

  // ==================== LEAVE ENTITLEMENTS ====================

  @Post('entitlements')
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @ApiOperation({
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
  })
  @ApiBody({ type: CreateEntitlementDto })
  @ApiResponse({
    status: 201,
    description:
      'Entitlement created successfully after passing eligibility validation',
    type: LeaveEntitlementResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or employee not eligible',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin role required',
  })
  @ApiResponse({
    status: 409,
    description: 'Entitlement already exists for this employee and leave type',
  })
  async createEntitlement(@Body() dto: CreateEntitlementDto) {
    return await this.leavesService.createEntitlement(dto);
  }

  @Post('entitlements/personalized')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Create personalized entitlement (skips eligibility validation)',
    description: `Creates a personalized/override entitlement for an employee, bypassing eligibility validation.

REQ-007: Personalized entitlements can be assigned to individuals

Use this endpoint when:
- Assigning custom entitlements that differ from standard policy
- Overriding eligibility rules for specific employees
- Creating exceptions to standard vacation packages
- Granting special leave allowances

Note: This endpoint requires higher privileges (HR Admin or System Admin only) as it bypasses automatic validation.`,
  })
  @ApiBody({ type: CreateEntitlementDto })
  @ApiResponse({
    status: 201,
    description: 'Personalized entitlement created successfully',
    type: LeaveEntitlementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({
    status: 409,
    description: 'Entitlement already exists for this employee and leave type',
  })
  async createPersonalizedEntitlement(@Body() dto: CreateEntitlementDto) {
    return await this.leavesService.createPersonalizedEntitlement(dto);
  }

  @Get('entitlements/employee/:employeeId')
  @ApiOperation({
    summary: 'Get employee entitlements',
    description: 'Retrieves all leave entitlements for a specific employee',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Entitlements retrieved successfully',
    type: [LeaveEntitlementResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid employee ID format' })
  async getEmployeeEntitlements(@Param('employeeId') employeeId: string) {
    return await this.leavesService.getEmployeeEntitlements(employeeId);
  }

  @Get('entitlements/:id')
  @ApiOperation({
    summary: 'Get entitlement by ID',
    description: 'Retrieves a specific leave entitlement by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Entitlement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Entitlement retrieved successfully',
    type: LeaveEntitlementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Entitlement not found' })
  async getEntitlementById(@Param('id') id: string) {
    return await this.leavesService.getEntitlementById(id);
  }

  @Get('balances/summary')
  @ApiOperation({
    summary: 'Get balance summary',
    description:
      'Retrieves a summary of leave balance for an employee and leave type',
  })
  @ApiQuery({ name: 'employeeId', required: true, description: 'Employee ID' })
  @ApiQuery({
    name: 'leaveTypeId',
    required: true,
    description: 'Leave type ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Balance summary retrieved successfully',
    type: BalanceSummaryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid ID format' })
  @ApiResponse({ status: 404, description: 'Entitlement not found' })
  async getBalanceSummary(
    @Query('employeeId') employeeId: string,
    @Query('leaveTypeId') leaveTypeId: string,
  ) {
    return await this.leavesService.getBalanceSummary(employeeId, leaveTypeId);
  }

  @Patch('entitlements/:id/balance')
  @ApiOperation({
    summary: 'Update leave balance',
    description: 'Manually updates leave balance for an entitlement',
  })
  @ApiParam({
    name: 'id',
    description: 'Entitlement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateBalanceDto })
  @ApiResponse({
    status: 200,
    description: 'Balance updated successfully',
    type: LeaveEntitlementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Entitlement not found' })
  async updateBalance(@Param('id') id: string, @Body() dto: UpdateBalanceDto) {
    return await this.leavesService.updateBalance(id, dto);
  }

  // ==================== LEAVE ADJUSTMENTS ====================

  @Post('adjustments')
  @ApiOperation({
    summary: 'Create leave adjustment',
    description: 'Creates a manual adjustment to employee leave balance',
  })
  @ApiBody({ type: CreateAdjustmentDto })
  @ApiResponse({
    status: 201,
    description: 'Adjustment created successfully',
    type: LeaveAdjustmentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAdjustment(@Body() dto: CreateAdjustmentDto) {
    return await this.leavesService.createAdjustment(dto);
  }

  @Get('adjustments/employee/:employeeId')
  @ApiOperation({
    summary: 'Get employee adjustments',
    description: 'Retrieves all leave adjustments for a specific employee',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Adjustments retrieved successfully',
    type: [LeaveAdjustmentResponseDto],
  })
  @ApiResponse({ status: 400, description: 'Invalid employee ID format' })
  async getEmployeeAdjustments(@Param('employeeId') employeeId: string) {
    return await this.leavesService.getEmployeeAdjustments(employeeId);
  }

  @Get('adjustments')
  @ApiOperation({
    summary: 'Get all adjustments',
    description: 'Retrieves leave adjustments with optional filters',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiQuery({
    name: 'leaveTypeId',
    required: false,
    description: 'Filter by leave type ID',
  })
  @ApiQuery({
    name: 'adjustmentType',
    required: false,
    description: 'Filter by adjustment type',
  })
  @ApiResponse({
    status: 200,
    description: 'Adjustments retrieved successfully',
    type: [LeaveAdjustmentResponseDto],
  })
  async getAllAdjustments(@Query() query: AdjustmentQueryDto) {
    return await this.leavesService.getAllAdjustments(query);
  }

  // ==================== CALENDAR ENDPOINTS (EXTENDED) ====================

  /**
   * REQ-010: Create calendar for a year
   */
  @Post('calendars')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({ summary: 'Create calendar for a specific year' })
  @ApiResponse({
    status: 201,
    description: 'Calendar created successfully',
    type: CalendarResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({
    status: 409,
    description: 'Calendar already exists for this year',
  })
  async createCalendar(@Body() createCalendarDto: CreateCalendarDto) {
    return this.leavesService.createCalendar(createCalendarDto);
  }

  /**
   * Get calendar by year
   */
  @Get('calendars/:year')
  @ApiOperation({ summary: 'Get calendar for a specific year' })
  @ApiParam({ name: 'year', description: 'Calendar year', example: 2024 })
  @ApiResponse({
    status: 200,
    description: 'Calendar retrieved successfully',
    type: CalendarResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async getCalendarByYear(@Param('year') year: number) {
    return this.leavesService.getCalendarByYear(year);
  }

  /**
   * REQ-010: Add blocked period to calendar
   * BR-55: Leave Block Periods
   */
  @Post('calendars/:year/blocked-periods')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({ summary: 'Add blocked period to calendar' })
  @ApiParam({ name: 'year', description: 'Calendar year', example: 2024 })
  @ApiResponse({
    status: 201,
    description: 'Blocked period added successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async addBlockedPeriod(
    @Param('year') year: number,
    @Body() addBlockedPeriodDto: AddBlockedPeriodDto,
  ) {
    return this.leavesService.addBlockedPeriod(year, addBlockedPeriodDto);
  }

  /**
   * Remove blocked period from calendar
   */
  @Delete('calendars/:year/blocked-periods/:index')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({ summary: 'Remove blocked period from calendar' })
  @ApiParam({ name: 'year', description: 'Calendar year', example: 2024 })
  @ApiParam({
    name: 'index',
    description: 'Index of blocked period to remove',
    example: 0,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Blocked period removed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async removeBlockedPeriod(
    @Param('year') year: number,
    @Param('index') index: number,
  ) {
    return this.leavesService.removeBlockedPeriod(year, index);
  }

  /**
   * Add holiday (by ID) to calendar
   */
  @Post('calendars/:year/holidays')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({ summary: 'Add holiday ID to calendar' })
  @ApiParam({ name: 'year', description: 'Calendar year', example: 2024 })
  @ApiResponse({ status: 201, description: 'Holiday added to calendar' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Calendar not found' })
  async addHolidayToCalendar(
    @Param('year') year: number,
    @Body() dto: AddHolidayDto,
  ) {
    return this.leavesService.addHolidayToCalendar(year, dto.holidayId);
  }

  /**
   * Remove holiday (by ID) from calendar
   */
  @Delete('calendars/:year/holidays/:holidayId')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({ summary: 'Remove holiday ID from calendar' })
  @ApiParam({ name: 'year', description: 'Calendar year', example: 2024 })
  @ApiParam({
    name: 'holidayId',
    description: 'Holiday ID to remove',
    example: '507f1f77bcf86cd799439099',
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Holiday removed from calendar' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  @ApiResponse({ status: 404, description: 'Calendar or holiday not found' })
  async removeHolidayFromCalendar(
    @Param('year') year: number,
    @Param('holidayId') holidayId: string,
  ) {
    return this.leavesService.removeHolidayFromCalendar(year, holidayId);
  }

  // ==================== LEAVE REQUEST ENHANCEMENTS (EXTENDED) ====================

  /**
   * REQ-017: Modify pending leave request
   */
  @Patch('requests/:id')
  @ApiOperation({ summary: 'Modify pending leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({
    status: 200,
    description: 'Leave request updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Only pending requests can be modified',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async updateLeaveRequest(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ) {
    return this.leavesService.updateLeaveRequest(id, updateLeaveRequestDto);
  }

  /**
   * REQ-023: Delegate approval authority
   * BR-26: Manager can delegate during absence
   */
  @Post('requests/:id/delegate')
  @ApiOperation({ summary: 'Delegate approval authority for a leave request' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({ status: 200, description: 'Approval delegated successfully' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async delegateApproval(
    @Param('id') id: string,
    @Body() delegateApprovalDto: DelegateApprovalDto,
  ) {
    await this.leavesService.delegateApproval(
      id,
      delegateApprovalDto.fromUserId,
      delegateApprovalDto.toUserId,
      delegateApprovalDto.role,
    );
    return { message: 'Approval authority delegated successfully' };
  }

  /**
   * REQ-039: Flag irregular leave pattern
   */
  @Patch('requests/:id/flag-irregular')
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'Department Head')
  @ApiOperation({ summary: 'Flag irregular leave pattern' })
  @ApiParam({ name: 'id', description: 'Leave request ID' })
  @ApiResponse({ status: 200, description: 'Request flagged successfully' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async flagIrregularPattern(@Param('id') id: string) {
    await this.leavesService.flagIrregularPattern(id);
    return { message: 'Leave request flagged for irregular pattern' };
  }

  // ==================== CALCULATION UTILITIES (EXTENDED) ====================

  /**
   * REQ-005, REQ-023: Calculate net leave days
   * BR-23: Calculate duration net of non-working days
   * BR-33: Exclude public holidays
   */
  @Post('calculations/net-days')
  @ApiOperation({ summary: 'Calculate net working days for leave request' })
  @ApiResponse({
    status: 200,
    description: 'Net days calculated successfully',
    type: NetDaysResponseDto,
  })
  async calculateNetDays(@Body() netDaysDto: NetDaysCalculationDto) {
    return this.leavesService.getNetDaysCalculationDetails(
      netDaysDto.employeeId,
      new Date(netDaysDto.from),
      new Date(netDaysDto.to),
    );
  }

  /**
   * Check if date is blocked
   */
  @Get('calendars/check-blocked')
  @ApiOperation({ summary: 'Check if a date is blocked for leave requests' })
  @ApiQuery({
    name: 'date',
    description: 'Date to check (YYYY-MM-DD)',
    example: '2024-12-25',
  })
  @ApiResponse({ status: 200, description: 'Date checked successfully' })
  async checkIfDateBlocked(@Query('date') date: string) {
    const isBlocked = await this.leavesService.isDateBlocked(new Date(date));
    return { date, isBlocked };
  }

  // ==================== MANAGER ENDPOINTS (EXTENDED) ====================

  /**
   * REQ-034: View team leave balances
   * BR-46: Manager access to team reports
   */
  @Get('manager/team-balances')
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'Department Head')
  @ApiOperation({ summary: 'Get leave balances for all team members' })
  @ApiQuery({
    name: 'managerId',
    description: 'Manager employee ID',
    required: true,
  })
  @ApiQuery({
    name: 'leaveTypeId',
    description: 'Optional leave type filter',
    required: false,
  })
  @ApiQuery({
    name: 'departmentId',
    description: 'Optional department filter (overrides manager department)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Team balances retrieved successfully',
    type: [TeamBalanceResponseDto],
  })
  async getTeamBalances(
    @Query('managerId') managerId: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.leavesService.getTeamBalances(managerId, {
      leaveTypeId,
      departmentId,
    });
  }

  /**
   * REQ-034: View team upcoming leaves
   */
  @Get('manager/team-upcoming-leaves')
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'Department Head')
  @ApiOperation({ summary: 'Get upcoming approved leaves for team members' })
  @ApiQuery({
    name: 'managerId',
    description: 'Manager employee ID',
    required: true,
  })
  @ApiQuery({
    name: 'leaveTypeId',
    description: 'Optional leave type filter',
    required: false,
  })
  @ApiQuery({
    name: 'status',
    description: 'Optional status filter',
    required: false,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Filter by start date (YYYY-MM-DD)',
    required: false,
  })
  @ApiQuery({
    name: 'endDate',
    description: 'Filter by end date (YYYY-MM-DD)',
    required: false,
  })
  @ApiQuery({
    name: 'departmentId',
    description: 'Optional department filter',
    required: false,
  })
  @ApiQuery({
    name: 'sortOrder',
    description: 'Sort order asc|desc',
    required: false,
    enum: ['asc', 'desc'],
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming leaves retrieved successfully',
    type: [UpcomingLeaveResponseDto],
  })
  async getTeamUpcomingLeaves(
    @Query('managerId') managerId: string,
    @Query('leaveTypeId') leaveTypeId?: string,
    @Query('status') status?: LeaveStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.leavesService.getTeamUpcomingLeaves(managerId, {
      leaveTypeId,
      status,
      startDate,
      endDate,
      departmentId,
      sortOrder,
    });
  }

  // ==================== ENCASHMENT & FINAL SETTLEMENT (EXTENDED) ====================

  /**
   * REQ-042: Calculate leave encashment
   * BR-52, BR-53: Encashment formula
   */
  @Get('encashment/calculate')
  @ApiOperation({ summary: 'Calculate leave encashment for employee' })
  @ApiQuery({ name: 'employeeId', description: 'Employee ID', required: true })
  @ApiQuery({
    name: 'leaveTypeId',
    description: 'Leave type ID',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Encashment calculated successfully',
    type: EncashmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Leave entitlement not found' })
  async calculateEncashment(
    @Query('employeeId') employeeId: string,
    @Query('leaveTypeId') leaveTypeId: string,
  ) {
    return this.leavesService.calculateEncashment(employeeId, leaveTypeId);
  }

  /**
   * REQ-042: Process final settlement for terminating employee
   * BR-52: Convert remaining balance to encashment
   */
  @Post('final-settlement/:employeeId')
  @ApiOperation({
    summary: 'Process final settlement for terminating employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Final settlement processed successfully',
    type: [EncashmentResponseDto],
  })
  async processFinalSettlement(@Param('employeeId') employeeId: string) {
    return this.leavesService.processFinalSettlement(employeeId);
  }

  // ==================== AUDIT & REPORTING (EXTENDED) ====================

  /**
   * REQ-013: Get audit trail for employee
   * BR-12, BR-17: Track all manual adjustments
   */
  @Get('audit-trail/:employeeId')
  @ApiOperation({
    summary: 'Get audit trail of leave adjustments for employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit trail retrieved successfully',
    type: [AuditTrailResponseDto],
  })
  async getAuditTrail(@Param('employeeId') employeeId: string) {
    return this.leavesService.getAuditTrail(employeeId);
  }

  /**
   * Get all flagged irregular patterns
   */
  @Get('reports/irregular-patterns')
  @ApiOperation({
    summary: 'Get all leave requests flagged for irregular patterns',
  })
  @ApiResponse({
    status: 200,
    description: 'Irregular patterns retrieved successfully',
  })
  async getIrregularPatterns() {
    return this.leavesService.getAllLeaveRequests({ status: undefined });
    // Filter for irregularPatternFlag === true in service implementation
  }

  // ==================== ACCRUAL & CARRY-FORWARD AUTOMATION (EXTENDED) ====================

  /**
   * REQ-003, REQ-040, REQ-041: Manual trigger for monthly accrual
   * Processes accrual for all employees with MONTHLY accrual method
   */
  @Post('accrual/run-monthly')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Manually trigger monthly accrual process',
    description:
      'Processes monthly accrual for all employees. Excludes unpaid leave periods (BR-11).',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly accrual completed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  async runMonthlyAccrual() {
    const result = await this.leavesService.runAccrualProcess('monthly');
    return {
      message: 'Monthly accrual process completed',
      processed: result.processed,
      failed: result.failed,
    };
  }

  /**
   * REQ-003, REQ-040, REQ-041: Manual trigger for quarterly accrual
   * Processes accrual for all employees with PER_TERM (quarterly) accrual method
   */
  @Post('accrual/run-quarterly')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Manually trigger quarterly accrual process',
    description:
      'Processes quarterly accrual for all employees. Excludes unpaid leave periods (BR-11).',
  })
  @ApiResponse({
    status: 200,
    description: 'Quarterly accrual completed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  async runQuarterlyAccrual() {
    const result = await this.leavesService.runAccrualProcess('quarterly');
    return {
      message: 'Quarterly accrual process completed',
      processed: result.processed,
      failed: result.failed,
    };
  }

  /**
   * REQ-003, REQ-040, REQ-041: Manual trigger for yearly accrual
   * Processes accrual for all employees with YEARLY accrual method
   */
  @Post('accrual/run-yearly')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Manually trigger yearly accrual process',
    description:
      'Processes yearly accrual for all employees. Excludes unpaid leave periods (BR-11).',
  })
  @ApiResponse({
    status: 200,
    description: 'Yearly accrual completed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  async runYearlyAccrual() {
    const result = await this.leavesService.runAccrualProcess('yearly');
    return {
      message: 'Yearly accrual process completed',
      processed: result.processed,
      failed: result.failed,
    };
  }

  /**
   * REQ-003, REQ-040, REQ-041: Manual trigger for accrual for specific employee
   * Calculates and applies accrual for a single employee
   */
  @Post('accrual/employee/:employeeId')
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @ApiOperation({
    summary: 'Manually trigger accrual for specific employee',
    description:
      'Calculates and applies accrual for a single employee across all their entitlements.',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({
    status: 200,
    description: 'Employee accrual completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid employee ID' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async runAccrualForEmployee(@Param('employeeId') employeeId: string) {
    const entitlements =
      await this.leavesService.getEmployeeEntitlements(employeeId);
    type AccrualResult =
      | {
          leaveTypeId: Types.ObjectId;
          accrued: { actual: number; rounded: number };
        }
      | { leaveTypeId: Types.ObjectId; error: string };
    const results: AccrualResult[] = [];

    for (const entitlement of entitlements) {
      try {
        const now = new Date();
        const startDate =
          entitlement.lastAccrualDate || new Date(now.getFullYear(), 0, 1);
        const accrual = await this.leavesService.calculateAccrualForEmployee(
          employeeId,
          entitlement.leaveTypeId.toString(),
          startDate,
          now,
        );

        // Update entitlement (remaining is calculated automatically by updateBalance)
        await this.leavesService.updateBalance(entitlement._id.toString(), {
          accruedActual: (entitlement.accruedActual || 0) + accrual.actual,
          accruedRounded: (entitlement.accruedRounded || 0) + accrual.rounded,
        });
        results.push({
          leaveTypeId: entitlement.leaveTypeId,
          accrued: accrual,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
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

  /**
   * REQ-040, REQ-041: Manual trigger for year-end carry-forward
   * Processes carry-forward for all employees with caps and expiry rules
   */
  @Post('carry-forward/run')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Manually trigger year-end carry-forward',
    description:
      'Processes carry-forward for all employees, applying max carry-forward caps (45 days default) and expiry dates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carry-forward completed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  async runCarryForward() {
    const result = await this.leavesService.runYearEndCarryForward();
    return {
      message: 'Year-end carry-forward process completed',
      processed: result.processed,
      capped: result.capped,
      failed: result.failed,
    };
  }

  /**
   * REQ-003: Calculate reset dates for all employees
   * Updates nextResetDate based on hire date criterion
   */
  @Post('reset-dates/calculate')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Calculate and update reset dates for all employees',
    description:
      'Calculates reset dates based on employee hire dates and updates all entitlements.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reset dates calculated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - HR Admin or System Admin role required',
  })
  async calculateResetDates() {
    const result = await this.leavesService.updateAllResetDates();
    return {
      message: 'Reset dates calculation completed',
      updated: result.updated,
      failed: result.failed,
    };
  }

  // ==================== VALIDATION ENDPOINTS (EXTENDED) ====================

  /**
   * Check balance sufficiency for leave request
   */
  @Get('validation/check-balance')
  @ApiOperation({
    summary: 'Check if employee has sufficient balance for leave request',
  })
  @ApiQuery({ name: 'employeeId', description: 'Employee ID', required: true })
  @ApiQuery({
    name: 'leaveTypeId',
    description: 'Leave type ID',
    required: true,
  })
  @ApiQuery({ name: 'days', description: 'Requested days', required: true })
  @ApiResponse({ status: 200, description: 'Balance check completed' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  async checkBalance(
    @Query('employeeId') employeeId: string,
    @Query('leaveTypeId') leaveTypeId: string,
    @Query('days') days: number,
  ) {
    await this.leavesService.checkBalanceSufficiency(
      employeeId,
      leaveTypeId,
      Number(days),
    );
    return { message: 'Sufficient balance available', available: true };
  }

  /**
   * Check for overlapping leaves
   */
  @Get('validation/check-overlap')
  @ApiOperation({
    summary: 'Check if leave request overlaps with existing approved leaves',
  })
  @ApiQuery({ name: 'employeeId', description: 'Employee ID', required: true })
  @ApiQuery({
    name: 'from',
    description: 'Start date (YYYY-MM-DD)',
    required: true,
  })
  @ApiQuery({
    name: 'to',
    description: 'End date (YYYY-MM-DD)',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'No overlap found' })
  @ApiResponse({ status: 409, description: 'Overlap detected' })
  async checkOverlap(
    @Query('employeeId') employeeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    await this.leavesService.checkOverlappingLeaves(
      employeeId,
      new Date(from),
      new Date(to),
    );
    return { message: 'No overlapping leaves found', hasOverlap: false };
  }

  /**
   * Validate required documents
   */
  @Get('validation/check-documents')
  @ApiOperation({
    summary: 'Check if documents are required for leave type and duration',
  })
  @ApiQuery({
    name: 'leaveTypeId',
    description: 'Leave type ID',
    required: true,
  })
  @ApiQuery({
    name: 'days',
    description: 'Leave duration in days',
    required: true,
  })
  @ApiQuery({
    name: 'hasAttachment',
    description: 'Whether attachment is provided',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Documents validation passed' })
  @ApiResponse({ status: 400, description: 'Required documents missing' })
  async validateDocuments(
    @Query('leaveTypeId') leaveTypeId: string,
    @Query('days') days: number,
    @Query('hasAttachment') hasAttachment?: string,
  ) {
    const attachmentId = hasAttachment === 'true' ? 'dummy-id' : undefined;
    await this.leavesService.validateRequiredDocuments(
      leaveTypeId,
      Number(days),
      attachmentId,
    );
    return { message: 'Document validation passed', documentsValid: true };
  }
}
