import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrganizationStructureService } from './organization-structure.service';
import { HierarchyViewService } from './hierarchy-view.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ReassignPositionDto } from './dto/reassign-position.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Request } from '@nestjs/common';

@ApiTags('Organization Structure')
@Controller('organization-structure')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect all routes with JWT auth and role-based access
export class OrganizationStructureController {
  constructor(
    private readonly organizationStructureService: OrganizationStructureService,
    private readonly hierarchyViewService: HierarchyViewService,
  ) { }

  @Post('departments')
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires HR Manager, System Admin, or HR Admin role',
  })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return await this.organizationStructureService.createDepartment(dto);
  }

  @Patch('departments/:id')
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update department attributes' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires HR Manager, System Admin, or HR Admin role',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return await this.organizationStructureService.updateDepartment(id, dto);
  }

  @Post('positions')
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({
    status: 201,
    description: 'Position created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires HR Manager, System Admin, or HR Admin role',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Position code already exists' })
  async createPosition(@Body() dto: CreatePositionDto) {
    return await this.organizationStructureService.createPosition(dto);
  }

  @Patch('positions/:id')
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update position attributes' })
  @ApiResponse({
    status: 200,
    description: 'Position updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires HR Manager, System Admin, or HR Admin role',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiResponse({ status: 409, description: 'Position code already exists' })
  async updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return await this.organizationStructureService.updatePosition(id, dto);
  }

  @Patch('positions/:id/reassign')
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reassign position to a different department' })
  @ApiResponse({
    status: 200,
    description: 'Position reassigned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires HR Manager, System Admin, or HR Admin role',
  })
  @ApiResponse({ status: 404, description: 'Position or department not found' })
  @ApiResponse({ status: 400, description: 'Department is not active' })
  async reassignPosition(
    @Param('id') id: string,
    @Body() dto: ReassignPositionDto,
  ) {
    return await this.organizationStructureService.reassignPosition(id, dto);
  }

  @Patch('positions/:id/deactivate')
  @Roles('HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deactivate a position (delimiting - preserves history)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Position deactivated successfully (delimited with historical records preserved)',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires HR Manager or System Admin role',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async deactivatePosition(@Param('id') id: string) {
    return await this.organizationStructureService.deactivatePosition(id);
  }

  @Patch('positions/:id/freeze')
  @Roles('HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Freeze a position (prevent new assignments, keep existing active)',
  })
  @ApiResponse({
    status: 200,
    description: 'Position frozen successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - position is already inactive or frozen',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires HR Manager or System Admin role',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async freezePosition(@Param('id') id: string) {
    return await this.organizationStructureService.freezePosition(id);
  }

  @Patch('positions/:id/unfreeze')
  @Roles('HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfreeze a position' })
  @ApiResponse({
    status: 200,
    description: 'Position unfrozen successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - position is not frozen',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires HR Manager or System Admin role',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async unfreezePosition(@Param('id') id: string) {
    return await this.organizationStructureService.unfreezePosition(id);
  }

  @Patch('departments/:id/deactivate')
  @Roles('HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a department' })
  @ApiResponse({
    status: 200,
    description: 'Department deactivated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - department has active positions',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires HR Manager or System Admin role',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async deactivateDepartment(@Param('id') id: string) {
    return await this.organizationStructureService.deactivateDepartment(id);
  }

  @Get('departments/:id/employees')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all employees by department' })
  @ApiResponse({
    status: 200,
    description: 'List of employees in the department',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getEmployeesByDepartment(@Param('id') id: string) {
    return await this.organizationStructureService.getEmployeesByDepartment(id);
  }

  @Get('positions')
  @Roles('System Admin', 'HR Admin', 'HR Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({
    status: 200,
    description: 'List of all positions in the system',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires System Admin, HR Admin or HR Manager role',
  })
  async getAllPositions() {
    return await this.organizationStructureService.getAllPositions();
  }

  // IMPORTANT: This must be declared BEFORE `GET positions/:id`.
  // Otherwise, the string literal `list` will be captured by the `:id` param route.
  @Get('positions/list')
  // Used by UI dropdowns; allow managers/department heads to open change-request dialogs.
  @Roles(
    'HR Manager',
    'System Admin',
    'HR Admin',
    'HR Employee',
    'department head',
    'Manager',
    'Employee',
    'department employee',
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active positions (for dropdowns)' })
  @ApiResponse({ status: 200, description: 'List of active positions' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires HR Manager, System Admin, or HR Admin role',
  })
  async getPositionsList() {
    return this.organizationStructureService.getPositions();
  }

  @Get('positions/:id')
  @Roles('System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a position by ID (System Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Position details',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires System Admin role',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async getPositionById(@Param('id') id: string) {
    return await this.organizationStructureService.getPositionById(id);
  }

  @Get('positions/:id/employees')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all employees by position' })
  @ApiResponse({
    status: 200,
    description: 'List of employees in the position',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async getEmployeesByPosition(@Param('id') id: string) {
    return await this.organizationStructureService.getEmployeesByPosition(id);
  }

  @Get('hierarchy')
  @Roles('System Admin', 'HR Manager')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get full organizational hierarchy (System Admin/HR Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Full organizational hierarchy',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires System Admin or HR Manager role',
  })
  async getFullHierarchy() {
    return await this.hierarchyViewService.getFullOrganizationalHierarchy();
  }

  @Get('hierarchy/my-structure')
  @Roles(
    'Employee',
    'department employee',
    'Manager',
    'HR Manager',
    'System Admin',
    'department head',
    'HR Employee',
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get employee hierarchy (own structure)' })
  @ApiResponse({
    status: 200,
    description: 'Employee hierarchy with reporting chain and direct reports',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires Employee, department employee, Manager, HR Manager, System Admin, or department head role',
  })
  @ApiResponse({
    status: 404,
    description: 'Employee or position assignment not found',
  })
  async getMyStructure(@Request() req: any) {
    const employeeId =
      req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    return await this.hierarchyViewService.getEmployeeHierarchy(employeeId);
  }

  @Get('hierarchy/my-team')
  @Roles('Manager', 'HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get manager team structure' })
  @ApiResponse({
    status: 200,
    description:
      'Manager team structure with all reporting positions and employees',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires Manager, HR Manager, or System Admin role',
  })
  @ApiResponse({
    status: 404,
    description: 'Manager or position assignment not found',
  })
  async getMyTeam(@Request() req: any) {
    const managerId =
      req.user?.employeeId || req.user?.id || req.user?._id || req.user?.sub;
    return await this.hierarchyViewService.getManagerTeamStructure(managerId);
  }

  @Get('hierarchy/department/:id')
  @Roles(
    'Employee',
    'department employee',
    'Manager',
    'HR Manager',
    'System Admin',
    'department head',
    'HR Employee',
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department hierarchy' })
  @ApiResponse({
    status: 200,
    description: 'Department hierarchy with all positions',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires Employee, department employee, Manager, HR Manager, System Admin, or department head role',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getDepartmentHierarchy(@Param('id') id: string) {
    return await this.hierarchyViewService.getDepartmentHierarchy(id);
  }

  @Get('hierarchy/chart')
  @Roles('System Admin', 'HR Manager')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get organizational hierarchy in chart format (for visualization)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Organizational hierarchy formatted for graphical chart consumption',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires System Admin or HR Manager role',
  })
  async getHierarchyChart() {
    const hierarchy =
      await this.hierarchyViewService.getFullOrganizationalHierarchy();
    // Format for chart consumption (tree structure with nodes and edges)
    const nodes: any[] = [];
    const edges: any[] = [];

    // Add department nodes
    hierarchy.departments.forEach((dept) => {
      nodes.push({
        id: `dept-${dept.id}`,
        type: 'department',
        label: dept.name,
        data: dept,
      });
    });

    // Add position nodes and edges
    hierarchy.positions.forEach((pos) => {
      nodes.push({
        id: `pos-${pos.id}`,
        type: 'position',
        label: pos.title,
        data: pos,
        parent: pos.reportsToPositionId
          ? `pos-${pos.reportsToPositionId}`
          : `dept-${pos.departmentId}`,
      });

      if (pos.reportsToPositionId) {
        edges.push({
          from: `pos-${pos.id}`,
          to: `pos-${pos.reportsToPositionId}`,
          type: 'reports-to',
        });
      } else {
        edges.push({
          from: `pos-${pos.id}`,
          to: `dept-${pos.departmentId}`,
          type: 'belongs-to',
        });
      }
    });

    return {
      nodes,
      edges,
      metadata: {
        totalDepartments: hierarchy.totalDepartments,
        totalPositions: hierarchy.totalPositions,
      },
    };
  }

  @Get('departments')
  // Used by UI dropdowns; allow managers/department heads to open change-request dialogs.
  @Roles(
    'HR Manager',
    'System Admin',
    'HR Admin',
    'HR Employee',
    'department head',
    'Manager',
    'Employee',
    'department employee',
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active departments (for dropdowns)' })
  @ApiResponse({ status: 200, description: 'List of active departments' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - requires HR Manager, System Admin, or HR Admin role',
  })
  async getDepartments() {
    return this.organizationStructureService.getDepartments();
  }

  @Get('departments/all')
  @Roles('System Admin', 'Payroll Specialist', 'Payroll Manager', 'Finance Staff' ,'Hr Admin', 'Hr Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all departments (System Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all departments',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires System Admin, Payroll Specialist, Payroll Manager, Finance Staff, Hr Admin, Hr Manager role',
  })
  async getAllDepartments() {
    return await this.organizationStructureService.getAllDepartments();
  }
}
