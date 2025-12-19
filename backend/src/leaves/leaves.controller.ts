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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LeavesService } from './leaves.service';
import { Attachment, AttachmentDocument } from './models/attachment.schema';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { NotificationLogCreateDTO } from '../time-management/dto/notification-log-create.dto';

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
import { UpdateApprovalFlowDto } from './dto/update-approval-flow.dto';

// Leave Entitlement DTOs
import { CreateEntitlementDto } from './dto/create-entitlement.dto';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { LeaveEntitlementResponseDto } from './dto/leave-entitlement-response.dto';
import { BalanceSummaryResponseDto } from './dto/balance-summary-response.dto';
import { CreateBatchEntitlementDto } from './dto/create-batch-entitlement.dto';
import { BatchEntitlementResponseDto } from './dto/batch-entitlement-response.dto';

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
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { HolidayType } from '../time-management/models/enums';

@ApiTags('Leaves Management')
@ApiBearerAuth()
@Roles('department employee','HR Admin', 'HR Manager', 'System Admin','department head')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leaves')
export class LeavesController {
  // NOT USED
  private delegations = new Map<string, string>();

  constructor(
    private readonly leavesService: LeavesService,
    @InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>,
  ) {}

  private getCurrentUserId(req: any): string {
    const userId = req?.user?.id || req?.user?._id || req?.user?.sub;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return typeof userId === 'string' ? userId : userId.toString();
  }

  private getUserRoles(req: any): string[] {
    if (Array.isArray(req?.user?.roles)) {
      return req.user.roles.map((r: any) => String(r).toLowerCase());
    }
    if (req?.user?.role) {
      return [String(req.user.role).toLowerCase()];
    }
    return [];
  }

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

  @Get('positions')
  @ApiOperation({
    summary: 'Get position options (enum + org titles)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of position labels',
  })
  async getPositions() {
    const positions = await this.leavesService.getPositionOptions();
    return { positions };
  }

  @Get('notifications')
  @Roles('department employee', 'department head', 'HR Manager', 'HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Get notification logs',
  })
  @ApiQuery({
    name: 'to',
    required: true,
    description: ' recipient ID to filter notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(@Query('to') to?: string) {
    return await this.leavesService.getNotificationLogs(to);
  }

  @Post('attachments/upload')
  @Roles('department employee')
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      }
    }),
    limits: { fileSize: 10 * 1024 * 1024 }
  }))
  @ApiOperation({
    summary: 'Upload attachment documents',
    description: 'Upload one or more documents for leave request',
  })
  @ApiResponse({
    status: 201,
    description: 'Files uploaded successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid files' })
  async uploadAttachment(@UploadedFiles() files: Express.Multer.File[], @Request() req) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const attachments: Array<{ id: string; name: string }> = [];
    for (const file of files) {
      const attachment = await this.attachmentModel.create({
        originalName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        size: file.size,
      });
      attachments.push({
        id: attachment._id.toString(),
        name: file.originalname,
      });
    }
    return { attachments };
  }

  @Get('attachments/:id/download')
  @Roles('department employee', 'department head', 'HR Manager', 'HR Admin')
  @ApiOperation({
    summary: 'Download attachment file',
    description: 'Download the actual file',
  })
  @ApiParam({
    name: 'id',
    description: 'Attachment ID',
  })
  @ApiResponse({
    status: 200,
    description: 'File stream',
  })
  @ApiResponse({ status: 404, description: 'Attachment not found' })
  async downloadAttachment(@Param('id') id: string, @Res() res) {
    const attachment = await this.attachmentModel.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }
    res.download(attachment.filePath, attachment.originalName);
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

  @Patch('categories/:id')
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
  @Roles('HR Admin', 'HR Manager', 'System Admin')
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

  @Patch('types/:id')
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

  @Patch('policies/:id')
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
  @Roles('department employee')
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
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'department head')
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
    name: 'paid',
    required: false,
    description: 'Filter by paid/unpaid leave type',
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
  async getAllLeaveRequests(
    @Query() query: LeaveRequestQueryDto,
    @Request() req,
  ) {
    const roles = this.getUserRoles(req);
    const isDeptHead = roles.includes('department head');
    const isHrOrAdmin = roles.some((r) =>
      ['hr admin', 'hr manager', 'system admin'].includes(r),
    );
    const currentUserId =
      isDeptHead && !isHrOrAdmin ? this.getCurrentUserId(req) : null;

    // department head visibility: restrict to their departments unless elevated role
    let departmentFilter: string | string[] | undefined = query.departmentId;
    let headDepartmentIds: string[] = [];
    if (isDeptHead && !isHrOrAdmin) {
      headDepartmentIds = currentUserId
        ? (await this.leavesService.getDepartmentsForHead(currentUserId)).map(
            (d) => d.id,
          )
        : [];

      if (query.departmentId) {
        if (!headDepartmentIds.includes(query.departmentId)) {
          throw new ForbiddenException(
            'Not authorized to view leave requests for this department',
          );
        }
        departmentFilter = query.departmentId;
      } else if (headDepartmentIds.length) {
        departmentFilter = headDepartmentIds;
      }
    }

    return await this.leavesService.getAllLeaveRequests({
      ...query,
      departmentId: departmentFilter,
      includeDecidedByIds: currentUserId ? [currentUserId] : undefined,
    });
  }

  @Get('requests/head')
  @Roles('department head')
  @ApiOperation({
    summary: 'Get leave requests for departments managed by current head',
    description:
      'Scopes results strictly to the departments this head manages. Additional filters are optional.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'leaveTypeId',
    required: false,
    description: 'Filter by leave type ID',
  })
  @ApiQuery({
    name: 'paid',
    required: false,
    description: 'Filter by paid/unpaid leave type',
  })
  async getHeadLeaveRequests(
    @Query() query: LeaveRequestQueryDto,
    @Request() req,
  ) {
    const currentUserId = this.getCurrentUserId(req);
    const headDepartments = await this.leavesService.getDepartmentsForHead(
      currentUserId,
    );
    const headDepartmentIds = headDepartments.map((d) => d.id);
    const departmentFilter = headDepartmentIds.length ? headDepartmentIds : undefined;

    return await this.leavesService.getAllLeaveRequests({
      ...query,
      departmentId: departmentFilter,
      includeDecidedByIds: [currentUserId],
    });
  }

  @Get('departments/head')
  @Roles('department head', 'HR Admin', 'HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get departments managed by current head' })
  async getDepartmentsForHead(@Request() req) {
    const currentUserId = this.getCurrentUserId(req);
    const includeAllForHr = this.getUserRoles(req).some((r) =>
      ['hr admin', 'hr manager', 'system admin'].includes(r),
    );
    return await this.leavesService.getDepartmentsForHead(
      currentUserId,
      includeAllForHr,
    );
  }

  @Get('requests/me')
  @Roles('department employee')
  @ApiOperation({
    summary: 'Get leave requests for current employee',
    description:
      'Returns only the authenticated employee-s leave requests. Ignores any employeeId passed in the query.',
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
    name: 'paid',
    required: false,
    description: 'Filter by paid/unpaid leave type',
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
    description: 'Employee leave requests retrieved successfully',
    type: [LeaveRequestResponseDto],
  })
  async getMyLeaveRequests(
    @Query() query: LeaveRequestQueryDto,
    @Request() req,
  ) {
    const currentUserId = this.getCurrentUserId(req);
    return await this.leavesService.getAllLeaveRequests({
      ...query,
      employeeId: currentUserId,
    });
  }

  @Get('requests/:id')
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'department head')
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

  @Get('requests/me/:id')
  @Roles('department employee')
  @ApiOperation({
    summary: 'Get a specific leave request for current employee',
    description:
      'Returns a leave request only if it belongs to the authenticated employee.',
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Request does not belong to current user',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async getMyLeaveRequestById(@Param('id') id: string, @Request() req) {
    const currentUserId = this.getCurrentUserId(req);
    const request = await this.leavesService.getLeaveRequestById(id);
    const employeeId =
      (request as any)?.employeeId?._id ||
      (request as any)?.employeeId?.id ||
      (request as any)?.employeeId ||
      undefined;
    const belongsToCurrentUser =
      typeof employeeId === 'string'
        ? employeeId === currentUserId
        : employeeId?.toString?.() === currentUserId;

    if (!belongsToCurrentUser) {
      throw new ForbiddenException(
        'You are not authorized to view this leave request',
      );
    }

    return request;
  }

  @Patch('requests/:id/status')
  @Roles('Manager', 'department head', 'HR Admin', 'HR Manager')
  @ApiOperation({
    summary: 'Approve or reject a leave request step',
    description: `Approve or reject an individual approval step (Manager or HR) in the leave request workflow.

**Workflow:**
1. **Manager approval step:**
   - Authorized users: Direct manager in reporting chain, department head, or HR roles
   - If manager approves: Manager step → approved, Request status stays PENDING until HR also approves
   - If manager rejects: Manager step → rejected, Request status → REJECTED (final)

2. **HR approval step:**
   - Authorized users: HR Admin, HR Manager, HR Employee
   - If HR approves: HR step → approved, Request status becomes APPROVED if Manager already approved, otherwise stays PENDING
   - If HR rejects: HR step → rejected, Request status → REJECTED (final)

**Final Status Logic:**
- Any rejection (Manager OR HR) → Request status = REJECTED (final)
- Both steps approved → Request status = APPROVED (final)
- Otherwise → Request status = PENDING (waiting for remaining approvals)

**Authorization:**
- System automatically checks if the current user is authorized for the pending approval step
- Managers can act on Manager step, HR roles can act on HR step (or override Manager step)
- Department heads can approve for employees in their managed departments

**Balance Deduction:**
- Balance is ONLY deducted when BOTH Manager and HR approve (overall status becomes APPROVED)
- Rejections release pending balance back to available balance`,
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateLeaveRequestStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Leave request step updated successfully. Overall status calculated from approval flow.',
    type: LeaveRequestResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or approval step not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to approve/reject this request or step',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async updateLeaveRequestStatus(
    @Param('id') id: string,
    @Body() dto: UpdateLeaveRequestStatusDto,
    @Request() req, // Get JWT user
  ) {
    const currentUserId = this.getCurrentUserId(req);

    console.log('[Controller Debug] updateLeaveRequestStatus called:', {
      requestId: id,
      userId: currentUserId,
      dto,
    });

    // REQ-021/022: Check authorization for the specific role being approved
    const request = await this.leavesService.getLeaveRequestById(id);

    const authorized = await this.leavesService.isUserAuthorizedToApprove(
      request,
      currentUserId,
      dto.role, // Pass the role the user is trying to approve
    );

    console.log('[Controller Debug] Authorization result:', authorized);

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
   * Bulk approve/reject multiple leave requests
   */
  @Post('requests/bulk-update')
  @Roles('HR Manager', 'HR Admin', 'System Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk approve or reject multiple leave requests (HR step only)',
    description: `Process multiple leave requests at once for the HR approval step.

**Important:**
- This endpoint ONLY processes the HR approval step in the workflow
- Does NOT override the approval workflow (unlike the override endpoint)
- Follows the same rules as individual approval/rejection buttons
- Cancelled requests cannot be approved or rejected

**Features:**
- Approve/reject multiple requests in a single operation
- Each request is processed individually with proper error handling
- Balance tracking is maintained for each request
- Failed requests don't block successful ones
- Detailed success/failure reporting

**Use Cases:**
- HR managers can efficiently process pending requests waiting for HR approval
- Clear HR approval backlog after a holiday period`,
  })
  @ApiBody({
    type: 'BulkUpdateRequestsDto',
    description: 'Bulk update request data',
    schema: {
      type: 'object',
      required: ['requestIds', 'status'],
      properties: {
        requestIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          description: 'Array of leave request IDs to update',
        },
        status: {
          type: 'string',
          enum: ['approved', 'rejected'],
          example: 'approved',
          description: 'Decision to apply to all requests',
        },
        role: {
          type: 'string',
          example: 'HR',
          description: 'Role of the approval step (automatically set to "HR" for bulk operations)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk update completed with detailed results',
    schema: {
      type: 'object',
      properties: {
        successCount: { type: 'number', example: 5 },
        failedCount: { type: 'number', example: 2 },
        successfulIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        },
        failures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              requestId: { type: 'string' },
              error: { type: 'string' },
            },
          },
          example: [
            {
              requestId: '507f1f77bcf86cd799439013',
              error: 'Request already approved',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Not authorized for bulk operations' })
  async bulkUpdateRequests(
    @Body() dto: any,
    @Request() req,
  ) {
    const currentUserId = this.getCurrentUserId(req);

    // Bulk operations ALWAYS apply to the HR step only
    return await this.leavesService.bulkUpdateLeaveRequests(
      dto.requestIds,
      dto.status,
      currentUserId,
      'HR', // Force HR role for bulk operations
    );
  }

  /**
   * REQ-026: HR Admin override for any leave request
   */
  @Patch('requests/:id/override')
  @Roles('HR Admin', 'System Admin','HR Manager')
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

  @Patch('requests/:id/approval-flow')
  @Roles('HR Admin', 'System Admin','department head', 'HR Manager')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update approval workflow for a leave request',
    description: `Allows HR Admin to modify the approval flow steps for a leave request.

This powerful endpoint enables HR Admin to:
- Add, remove, or reorder approval steps
- Change the status of any approval step (pending, approved, rejected)
- Assign or change who approved/rejected each step
- Update approval dates
- Fix workflow errors or make corrections

The system will automatically:
- Recalculate the overall request status based on the approval flow
- Adjust leave balances if status changes (approve/reject)
- Notify the employee if the status changes
- Log the change for audit purposes

**Important Notes:**
- The overall request status is derived from the approval flow:
  - If any step is rejected → Request is REJECTED
  - If all steps are approved → Request is APPROVED
  - Otherwise → Request is PENDING
- Balance adjustments happen automatically when status changes
- All changes are logged for audit trail`,
  })
  @ApiParam({
    name: 'id',
    description: 'Leave request ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateApprovalFlowDto })
  @ApiResponse({
    status: 200,
    description: 'Approval flow updated successfully',
    type: LeaveRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or approval flow',
  })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async updateApprovalFlow(
    @Param('id') id: string,
    @Body() dto: UpdateApprovalFlowDto,
    @Request() req,
  ) {
    return await this.leavesService.updateApprovalFlow(
      id,
      dto.approvalFlow,
      req.user.id,
    );
  }

  @Delete('requests/:id/cancel')
  @Roles('department employee')
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
    @Request() req,
  ) {
    // Default to the authenticated user if employeeId is not provided
    const currentUserId = this.getCurrentUserId(req);
    const targetEmployeeId = employeeId || currentUserId;
    return await this.leavesService.cancelLeaveRequest(id, targetEmployeeId);
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

  @Post('entitlements/batch')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Create entitlements for multiple employees in batch',
    description: `Creates entitlements for multiple employees at once.

REQ-007: Batch entitlement creation for efficiency

This endpoint allows HR Admin to:
- Assign the same leave entitlement to multiple employees simultaneously
- Choose between standard (with eligibility validation) or personalized (without validation)
- Receive detailed results about created, skipped, and failed entitlements

The operation processes all employees and returns a summary showing:
- Created: Successfully created entitlements
- Skipped: Employees who already have this entitlement
- Failed: Employees who failed validation or encountered errors`,
  })
  @ApiBody({ type: CreateBatchEntitlementDto })
  @ApiResponse({
    status: 201,
    description: 'Batch entitlement creation completed',
    type: BatchEntitlementResponseDto,
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
  async createBatchEntitlement(@Body() dto: CreateBatchEntitlementDto) {
    return await this.leavesService.createBatchEntitlement(dto);
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

  @Patch('entitlements/:id')
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update entitlement balances',
    description:
      'Allows HR to edit entitlement balance fields. Remaining is recalculated automatically.',
  })
  @ApiParam({
    name: 'id',
    description: 'Entitlement ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ type: UpdateBalanceDto })
  @ApiResponse({
    status: 200,
    description: 'Entitlement updated successfully',
    type: LeaveEntitlementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid entitlement ID or payload' })
  @ApiResponse({ status: 404, description: 'Entitlement not found' })
  async updateEntitlement(
    @Param('id') id: string,
    @Body() dto: UpdateBalanceDto,
  ) {
    await this.leavesService.updateBalance(id, dto);
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

  // ==================== LEAVE ADJUSTMENTS ====================

  @Post('adjustments')
  @Roles('HR Admin')
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
  @Roles('HR Admin', 'HR Manager', 'System Admin')
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

  // ==================== HOLIDAYS (ADMIN) ====================

  @Post('holidays')
  @Roles('HR Admin', 'System Admin', 'HR Manager')
  @ApiOperation({ summary: 'Create a holiday' })
  @ApiBody({ type: CreateHolidayDto })
  async createHoliday(@Body() dto: CreateHolidayDto) {
    return this.leavesService.createHoliday({
      name: dto.name,
      type: dto.type as any,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });
  }

  @Get('holidays')
  @Roles('HR Admin', 'System Admin', 'HR Manager')
  @ApiOperation({ summary: 'Get all holidays' })
  async getHolidays() {
    return this.leavesService.getAllHolidays();
  }

  @Get('holidays/:id')
  @Roles('HR Admin', 'System Admin', 'HR Manager')
  @ApiOperation({ summary: 'Get holiday by ID' })
  async getHolidayById(@Param('id') id: string) {
    return this.leavesService.getHolidayById(id);
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
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'department head')
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
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'department head')
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
  @Roles('HR Admin', 'HR Manager', 'System Admin', 'department head')
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
  @Roles('HR Admin', 'HR Manager', 'System Admin')
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
  @Roles('HR Admin', 'HR Manager', 'System Admin','department head')
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
   * Manual trigger: escalate stale approvals (manager/HR)
   */
  @Post('requests/escalations/stale')
  @HttpCode(HttpStatus.OK)
  @Roles('HR Admin', 'HR Manager', 'System Admin')
  @ApiOperation({
    summary: 'Manually run stale approval escalation',
    description:
      'Checks pending requests older than the AUTO_ESCALATION_HOURS threshold and notifies/escalates per workflow rules.',
  })
  @ApiResponse({
    status: 200,
    description: 'Escalation process executed',
  })
  async escalateStaleApprovals() {
    const result = await this.leavesService.escalateStaleApprovals();
    return {
      message: 'Stale approvals escalation executed',
      ...result,
    };
  }

  /**
   * Manual trigger for accrual (single endpoint)
   */
  @Post('accrual/run')
  @Roles('HR Admin', 'System Admin')
  @ApiOperation({
    summary: 'Manually trigger accrual process',
    description:
      'Runs accrual across all policies/entitlements. Optional type can hint a period but the service processes all.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['monthly', 'quarterly', 'yearly'],
          default: 'monthly',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Accrual process completed successfully',
  })
  async runAccrualGeneric(@Body() body: { type?: 'monthly' | 'quarterly' | 'yearly' }) {
    const type = body?.type;
    const result = await this.leavesService.runAccrualProcess(type);
    return {
      message: 'Accrual process completed',
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

  // Manual carry-forward/reset endpoints removed; handled by daily maintenance
  // Check balance sufficiency for leave request
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
  @ApiQuery({
    name: 'excludeRequestId',
    description: 'Optional: exclude a specific request (e.g., when editing)',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'No overlap found' })
  @ApiResponse({ status: 409, description: 'Overlap detected' })
  async checkOverlap(
    @Query('employeeId') employeeId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('excludeRequestId') excludeRequestId?: string,
  ) {
    await this.leavesService.checkOverlappingLeaves(
      employeeId,
      new Date(from),
      new Date(to),
      excludeRequestId,
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

  // ==================== MANAGER PENDING TEAM REQUESTS ====================
  @Get('requests/manager/:managerId/pending-team')
  @Roles('department head')
  @ApiOperation({
    summary: 'Get pending leave requests for a manager-s team',
    description:
      'Returns pending leave requests for team members reporting to this manager. Checks for overlaps with both other pending requests AND approved requests. Optional filter to only include overlapping pending leaves.',
  })
  @ApiParam({
    name: 'managerId',
    description: 'Manager employee profile ID',
  })
  @ApiQuery({
    name: 'overlappingOnly',
    required: false,
    description:
      'If true, only return pending requests that overlap with other team members (either pending or approved requests)',
  })
  async getManagerPendingTeamRequests(
    @Param('managerId') managerId: string,
    @Query('overlappingOnly') overlappingOnly?: string,
  ) {
    const overlapFlag = overlappingOnly === 'true';
    return this.leavesService.getManagerPendingTeamRequests(managerId, {
      overlappingOnly: overlapFlag,
    });
  }
}
