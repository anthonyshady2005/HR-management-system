import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { LeavesService } from './leaves.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { CreateVacationPackageDto } from './dto/create-vacation-package.dto';
import { UpdateVacationPackageDto } from './dto/update-vacation-package.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { CreateHolidayCalendarDto } from './dto/create-holiday-calendar.dto';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  // ==================== LEAVE TYPES ====================

  @ApiTags('Leave Types')
  @Post('types')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new leave type',
    description:
      'Creates a new leave type definition. Only HR Admin or System Admin can perform this action.',
  })
  @ApiBody({ type: CreateLeaveTypeDto })
  @ApiResponse({ status: 201, description: 'Leave type created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Leave type with this ID already exists',
  })
  async createLeaveType(@Body() createLeaveTypeDto: CreateLeaveTypeDto) {
    return this.leavesService.createLeaveType(createLeaveTypeDto);
  }

  @ApiTags('Leave Types')
  @Get('types')
  @ApiOperation({
    summary: 'Get all leave types',
    description:
      'Returns a list of all leave types. Can be filtered by active status.',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: String,
    description: 'Filter by active status',
    example: 'true',
  })
  @ApiResponse({
    status: 200,
    description: 'List of leave types retrieved successfully',
  })
  async findAllLeaveTypes(@Query('isActive') isActive?: string) {
    const filter =
      isActive !== undefined ? { isActive: isActive === 'true' } : {};
    return this.leavesService.findAllLeaveTypes(filter);
  }

  @ApiTags('Leave Types')
  @Get('types/:id')
  @ApiOperation({
    summary: 'Get leave type by ID',
    description: 'Returns a single leave type by MongoDB ObjectId',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the leave type',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({ status: 200, description: 'Leave type found' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async findLeaveTypeById(@Param('id') id: string) {
    return this.leavesService.findLeaveTypeById(id);
  }

  @ApiTags('Leave Types')
  @Get('types/code/:leaveTypeId')
  @ApiOperation({
    summary: 'Get leave type by code',
    description:
      'Returns a single leave type by its unique code (e.g., ANN, SICK)',
  })
  @ApiParam({
    name: 'leaveTypeId',
    description: 'Unique leave type code',
    example: 'ANN',
  })
  @ApiResponse({ status: 200, description: 'Leave type found' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async findLeaveTypeByCode(@Param('leaveTypeId') leaveTypeId: string) {
    return this.leavesService.findLeaveTypeByCode(leaveTypeId);
  }

  @ApiTags('Leave Types')
  @Put('types/:id')
  @ApiOperation({
    summary: 'Update leave type',
    description:
      'Updates an existing leave type. Only HR Admin or System Admin can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the leave type' })
  @ApiBody({ type: UpdateLeaveTypeDto })
  @ApiResponse({ status: 200, description: 'Leave type updated successfully' })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async updateLeaveType(
    @Param('id') id: string,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto,
  ) {
    return this.leavesService.updateLeaveType(id, updateLeaveTypeDto);
  }

  @ApiTags('Leave Types')
  @Delete('types/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate leave type',
    description:
      'Soft deletes a leave type by marking it as inactive. Only System Admin can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the leave type' })
  @ApiResponse({
    status: 204,
    description: 'Leave type deactivated successfully',
  })
  @ApiResponse({ status: 404, description: 'Leave type not found' })
  async deactivateLeaveType(@Param('id') id: string) {
    return this.leavesService.deactivateLeaveType(id);
  }

  // ==================== LEAVE REQUESTS ====================

  @ApiTags('Leave Requests')
  @Post('requests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a new leave request',
    description: `Submit a new leave request. The system will validate eligibility, check balance, calculate net days, and build approval chain.`,
  })
  @ApiBody({ type: CreateLeaveRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Leave request submitted successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createLeaveRequest(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const employeeId = req.user?.employeeId || createLeaveRequestDto.employeeId;
    return this.leavesService.createLeaveRequest({
      ...createLeaveRequestDto,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      employeeId,
    });
  }

  @ApiTags('Leave Requests')
  @Get('requests')
  @ApiOperation({
    summary: 'Get all leave requests',
    description: 'Returns a list of leave requests with optional filters',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
    example: 'EMP001',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by request status',
    example: 'pendingManagerApproval',
  })
  @ApiResponse({ status: 200, description: 'List of leave requests' })
  async findAllLeaveRequests(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ) {
    const filter: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (employeeId) filter.employeeId = employeeId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (status) filter.status = status;
    return this.leavesService.findAllLeaveRequests(filter);
  }

  @ApiTags('Leave Requests')
  @Get('requests/my-requests')
  @ApiOperation({
    summary: 'Get current user leave requests',
    description: 'Returns all leave requests for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'User leave requests retrieved' })
  async getMyRequests(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const employeeId = req.user?.employeeId;
    return this.leavesService.findLeaveRequestsByEmployee(employeeId);
  }

  @ApiTags('Leave Requests')
  @Get('requests/pending-approvals')
  @ApiOperation({
    summary: 'Get pending approvals',
    description:
      'Returns all leave requests pending approval from the authenticated manager',
  })
  @ApiResponse({ status: 200, description: 'Pending approvals retrieved' })
  async getPendingApprovals(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const approverId = req.user?.employeeId;
    return this.leavesService.findPendingApprovals(approverId);
  }

  @ApiTags('Leave Requests')
  @Get('requests/:id')
  @ApiOperation({
    summary: 'Get leave request by ID',
    description: 'Returns a single leave request with full details',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the leave request',
  })
  @ApiResponse({ status: 200, description: 'Leave request found' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async findLeaveRequestById(@Param('id') id: string) {
    return this.leavesService.findLeaveRequestById(id);
  }

  @ApiTags('Leave Requests')
  @Put('requests/:id')
  @ApiOperation({
    summary: 'Update leave request',
    description:
      'Update leave request details (only allowed for draft requests)',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the leave request',
  })
  @ApiBody({ type: UpdateLeaveRequestDto })
  @ApiResponse({ status: 200, description: 'Leave request updated' })
  async updateLeaveRequest(
    @Param('id') id: string,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ) {
    return this.leavesService.updateLeaveRequest(id, updateLeaveRequestDto);
  }

  @ApiTags('Leave Requests')
  @Put('requests/:id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel leave request',
    description:
      'Cancel a pending leave request. Releases pending days back to balance.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the leave request',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { reason: { type: 'string', example: 'Plans changed' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Leave request cancelled' })
  async cancelLeaveRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const employeeId = req.user?.employeeId;
    return this.leavesService.cancelLeaveRequest(id, employeeId, reason);
  }

  @ApiTags('Leave Requests')
  @Put('requests/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve leave request',
    description:
      'Approve a leave request. Updates balance and syncs to Time Management and Payroll.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the leave request',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        comments: { type: 'string', example: 'Approved - enjoy your vacation' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Leave request approved' })
  async approveLeaveRequest(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    const approverId = req.user?.employeeId;
    return this.leavesService.approveLeaveRequest(id, approverId, comments);
  }

  @ApiTags('Leave Requests')
  @Put('requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject leave request',
    description:
      'Reject a leave request. Releases pending days back to balance.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the leave request',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['comments'],
      properties: {
        comments: {
          type: 'string',
          example: 'Insufficient coverage during requested period',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Leave request rejected' })
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Req() req: any,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const approverId = req.user?.employeeId;
    return this.leavesService.rejectLeaveRequest(id, approverId, comments);
  }

  // ==================== LEAVE BALANCES ====================

  @ApiTags('Leave Balances')
  @Get('balances/employee/:employeeId')
  @ApiOperation({
    summary: 'Get employee leave balances',
    description:
      'Returns all leave balances for an employee for the current year',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    example: 'EMP001',
  })
  @ApiResponse({ status: 200, description: 'Employee balances retrieved' })
  async getEmployeeBalances(@Param('employeeId') employeeId: string) {
    return this.leavesService.getEmployeeBalances(employeeId);
  }

  @ApiTags('Leave Balances')
  @Get('balances/employee/:employeeId/type/:leaveTypeId')
  @ApiOperation({
    summary: 'Get specific leave balance',
    description: 'Returns balance for a specific leave type and employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiParam({ name: 'leaveTypeId', description: 'Leave Type MongoDB ObjectId' })
  @ApiResponse({ status: 200, description: 'Balance retrieved' })
  async getBalance(
    @Param('employeeId') employeeId: string,
    @Param('leaveTypeId') leaveTypeId: string,
  ) {
    return this.leavesService.getBalance(employeeId, leaveTypeId);
  }

  @ApiTags('Leave Balances')
  @Get('balances/employee/:employeeId/history')
  @ApiOperation({
    summary: 'Get balance history',
    description: 'Returns balance history for all years for an employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({ status: 200, description: 'Balance history retrieved' })
  async getBalanceHistory(@Param('employeeId') employeeId: string) {
    return this.leavesService.getBalanceHistory(employeeId);
  }

  @ApiTags('Leave Balances')
  @Post('balances/employee/:employeeId/initialize')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Initialize employee balances',
    description: 'Creates initial balance records for a new employee',
  })
  @ApiParam({ name: 'employeeId', description: 'Employee ID' })
  @ApiResponse({ status: 201, description: 'Balances initialized' })
  async initializeBalances(@Param('employeeId') employeeId: string) {
    return this.leavesService.initializeBalances(employeeId);
  }

  @ApiTags('Leave Balances')
  @Put('balances/adjust')
  @ApiOperation({
    summary: 'Manual balance adjustment',
    description:
      'Manually adjust employee leave balance. Creates audit trail entry (BR 17).',
  })
  @ApiBody({ type: AdjustBalanceDto })
  @ApiResponse({ status: 200, description: 'Balance adjusted' })
  async adjustBalance(@Body() adjustBalanceDto: AdjustBalanceDto) {
    return this.leavesService.manualAdjustment(adjustBalanceDto);
  }

  // ==================== VACATION PACKAGES ====================

  @ApiTags('Vacation Packages')
  @Post('vacation-packages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new vacation package',
    description:
      'Creates a new vacation package with entitlement rules and accrual settings.',
  })
  @ApiBody({ type: CreateVacationPackageDto })
  @ApiResponse({ status: 201, description: 'Vacation package created' })
  async createVacationPackage(@Body() createDto: CreateVacationPackageDto) {
    return this.leavesService.createVacationPackage(createDto);
  }

  @ApiTags('Vacation Packages')
  @Get('vacation-packages')
  @ApiOperation({
    summary: 'Get all vacation packages',
    description: 'Returns a list of all active vacation packages',
  })
  @ApiResponse({ status: 200, description: 'List of vacation packages' })
  async findAllVacationPackages() {
    return this.leavesService.findAllVacationPackages();
  }

  @ApiTags('Vacation Packages')
  @Get('vacation-packages/:id')
  @ApiOperation({
    summary: 'Get vacation package by ID',
    description: 'Returns a single vacation package with complete details',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the vacation package',
  })
  @ApiResponse({ status: 200, description: 'Vacation package found' })
  async findVacationPackageById(@Param('id') id: string) {
    return this.leavesService.findVacationPackageById(id);
  }

  @ApiTags('Vacation Packages')
  @Put('vacation-packages/:id')
  @ApiOperation({
    summary: 'Update vacation package',
    description: 'Updates an existing vacation package configuration.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the vacation package',
  })
  @ApiBody({ type: UpdateVacationPackageDto })
  @ApiResponse({ status: 200, description: 'Vacation package updated' })
  async updateVacationPackage(
    @Param('id') id: string,
    @Body() updateDto: UpdateVacationPackageDto,
  ) {
    return this.leavesService.updateVacationPackage(id, updateDto);
  }

  @ApiTags('Vacation Packages')
  @Delete('vacation-packages/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate vacation package',
    description: 'Soft deletes a vacation package by marking it as inactive.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the vacation package',
  })
  @ApiResponse({ status: 204, description: 'Vacation package deactivated' })
  async deactivateVacationPackage(@Param('id') id: string) {
    return this.leavesService.deactivateVacationPackage(id);
  }

  // ==================== HOLIDAYS ====================

  @ApiTags('Holidays')
  @Post('holidays')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create holiday calendar',
    description:
      'Creates a new holiday calendar for a specific year and country.',
  })
  @ApiBody({ type: CreateHolidayCalendarDto })
  @ApiResponse({ status: 201, description: 'Holiday calendar created' })
  async createHolidayCalendar(@Body() createDto: CreateHolidayCalendarDto) {
    return this.leavesService.createHolidayCalendar(createDto);
  }

  @ApiTags('Holidays')
  @Get('holidays')
  @ApiOperation({
    summary: 'Get all holiday calendars',
    description: 'Returns a list of holiday calendars with optional filters',
  })
  @ApiQuery({ name: 'year', required: false, type: Number, example: 2025 })
  @ApiQuery({ name: 'country', required: false, type: String, example: 'EG' })
  @ApiResponse({ status: 200, description: 'List of holiday calendars' })
  async findAllHolidayCalendars(
    @Query('year') year?: number,
    @Query('country') country?: string,
  ) {
    const filter: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (year) filter.year = Number(year);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (country) filter.country = country;
    return this.leavesService.findAllHolidayCalendars(filter);
  }

  @ApiTags('Holidays')
  @Get('holidays/:year')
  @ApiOperation({
    summary: 'Get holiday calendar by year',
    description: 'Returns the active holiday calendar for a specific year.',
  })
  @ApiParam({ name: 'year', description: 'Calendar year', type: Number })
  @ApiResponse({ status: 200, description: 'Holiday calendar found' })
  async getCalendarByYear(@Param('year') year: number) {
    return this.leavesService.getCalendarByYear(year);
  }

  @ApiTags('Holidays')
  @Put('holidays/:id')
  @ApiOperation({
    summary: 'Update holiday calendar',
    description: 'Updates an existing holiday calendar.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId of the holiday calendar',
  })
  @ApiResponse({ status: 200, description: 'Holiday calendar updated' })
  async updateHolidayCalendar(@Param('id') id: string, @Body() updateDto: any) {
    return this.leavesService.updateHolidayCalendar(id, updateDto);
  }

  // ==================== APPROVAL WORKFLOWS ====================

  @ApiTags('Approvals')
  @Get('approvals/workflows')
  @ApiOperation({
    summary: 'Get all approval workflows',
    description:
      'Returns all active approval workflows configured in the system.',
  })
  @ApiResponse({ status: 200, description: 'List of approval workflows' })
  async findAllWorkflows() {
    return this.leavesService.findAllWorkflows();
  }

  @ApiTags('Approvals')
  @Post('approvals/workflows')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create approval workflow',
    description: 'Creates a new approval workflow configuration.',
  })
  @ApiResponse({ status: 201, description: 'Approval workflow created' })
  async createWorkflow(@Body() createDto: any) {
    return this.leavesService.createWorkflow(createDto);
  }
}
