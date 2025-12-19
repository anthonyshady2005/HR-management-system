import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { StructureChangeRequestService } from './structure-change-request.service';
import { StructureApprovalService } from './structure-approval.service';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { UpdateChangeRequestDto } from './dto/update-change-request.dto';
import { ApproveChangeRequestDto } from './dto/approve-change-request.dto';
import { RejectChangeRequestDto } from './dto/reject-change-request.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Organization Structure - Change Requests')
@Controller('organization-structure/change-requests')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes with JWT auth and role-based access
export class StructureChangeRequestController {
  constructor(
    private readonly changeRequestService: StructureChangeRequestService,
    private readonly approvalService: StructureApprovalService,
  ) {}

  @Post()
  @Roles('Manager', 'department head', 'department employee', 'HR Manager', 'System Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new change request (SUBMITTED - ready for approval)' })
  @ApiResponse({
    status: 201,
    description: 'Change request created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data or missing required fields',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires Manager, department head, department employee, HR Manager, or System Admin role',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee not found',
  })
  async createChangeRequest(
    @Body() dto: CreateChangeRequestDto,
    @Request() req: any,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    if (!employeeId) {
      throw new BadRequestException('User ID not found in authentication token');
    }
    return await this.changeRequestService.createChangeRequest(
      dto,
      employeeId.toString(),
    );
  }

  @Patch(':id/submit')
  @Roles('Manager', 'HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit a change request (DRAFT → SUBMITTED)' })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({
    status: 200,
    description: 'Change request submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - request is not in DRAFT status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only requester can submit their own request',
  })
  @ApiResponse({
    status: 404,
    description: 'Change request not found',
  })
  async submitChangeRequest(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    return await this.changeRequestService.submitChangeRequest(id, employeeId);
  }

  @Get('all')
  @Roles('System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all change requests (System Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all change requests in the system',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires System Admin role' })
  async getAllChangeRequests() {
    return await this.changeRequestService.getAllChangeRequests();
  }

  @Get('my-requests')
  @Roles('Manager', 'department head', 'department employee', 'HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all change requests by the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of change requests',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires Manager, department head, department employee, HR Manager, or System Admin role',
  })
  async getMyChangeRequests(@Request() req: any) {
    const employeeId = req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    if (!employeeId) {
      throw new BadRequestException('User ID not found in authentication token');
    }
    return await this.changeRequestService.getChangeRequestsByRequester(
      employeeId.toString(),
    );
  }

  @Get('pending')
  @Roles('System Admin', 'HR Manager', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all pending change requests (for System Admin/HR Manager/HR Admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending change requests',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires System Admin, HR Manager, or HR Admin role',
  })
  async getPendingChangeRequests() {
    return await this.approvalService.getPendingApprovals();
  }

  @Post(':id/approve')
  @Roles('System Admin', 'HR Manager', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a change request' })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({
    status: 200,
    description: 'Change request approved and changes applied successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - request is not in SUBMITTED/UNDER_REVIEW status or failed to apply changes',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires System Admin, HR Manager, or HR Admin role, or cannot approve own request',
  })
  @ApiResponse({
    status: 404,
    description: 'Change request or approver not found',
  })
  async approveChangeRequest(
    @Param('id') id: string,
    @Body() dto: ApproveChangeRequestDto,
    @Request() req: any,
  ) {
    const approverId = req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    return await this.approvalService.approveChangeRequest(
      id,
      approverId,
      dto,
    );
  }

  @Post(':id/reject')
  @Roles('System Admin', 'HR Manager', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a change request' })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({
    status: 200,
    description: 'Change request rejected successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - request is not in SUBMITTED/UNDER_REVIEW status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires System Admin, HR Manager, or HR Admin role, or cannot reject own request',
  })
  @ApiResponse({
    status: 404,
    description: 'Change request or approver not found',
  })
  async rejectChangeRequest(
    @Param('id') id: string,
    @Body() dto: RejectChangeRequestDto,
    @Request() req: any,
  ) {
    const approverId = req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    return await this.approvalService.rejectChangeRequest(
      id,
      approverId,
      dto,
    );
  }

  @Get(':id')
  @Roles('Manager', 'department head', 'department employee', 'HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get change request by ID' })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({
    status: 200,
    description: 'Change request details',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires Manager, department head, department employee, HR Manager, or System Admin role',
  })
  @ApiResponse({
    status: 404,
    description: 'Change request not found',
  })
  async getChangeRequestById(@Param('id') id: string) {
    return await this.changeRequestService.getChangeRequestById(id);
  }

  @Get(':id/approval-history')
  @Roles('Manager', 'department head', 'department employee', 'HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get approval history for a change request' })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({
    status: 200,
    description: 'Approval history',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires Manager, department head, department employee, HR Manager, or System Admin role',
  })
  @ApiResponse({
    status: 404,
    description: 'Change request not found',
  })
  async getApprovalHistory(@Param('id') id: string) {
    return await this.approvalService.getApprovalHistory(id);
  }

  @Patch(':id')
  @Roles('Manager', 'HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a DRAFT change request' })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({
    status: 200,
    description: 'Change request updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - request is not in DRAFT status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only requester can update their own request',
  })
  @ApiResponse({
    status: 404,
    description: 'Change request not found',
  })
  async updateChangeRequest(
    @Param('id') id: string,
    @Body() dto: UpdateChangeRequestDto,
    @Request() req: any,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    return await this.changeRequestService.updateDraftRequest(
      id,
      dto,
      employeeId,
    );
  }

  @Delete(':id')
  @Roles('Manager', 'department head', 'department employee', 'HR Manager', 'System Admin')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a change request (DRAFT or SUBMITTED only)' })
  @ApiParam({ name: 'id', description: 'Change request ID' })
  @ApiResponse({
    status: 200,
    description: 'Change request canceled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - request cannot be canceled in current status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only requester can cancel their own request',
  })
  @ApiResponse({
    status: 404,
    description: 'Change request not found',
  })
  async cancelChangeRequest(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const employeeId = req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    return await this.changeRequestService.cancelChangeRequest(id, employeeId);
  }
}

