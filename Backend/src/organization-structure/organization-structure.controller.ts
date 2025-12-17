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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationStructureService } from './organization-structure.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ReassignPositionDto } from './dto/reassign-position.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Organization Structure')
@Controller('organization-structure')
export class OrganizationStructureController {
  constructor(
    private readonly organizationStructureService: OrganizationStructureService,
  ) {}

  @Post('departments')
  @UseGuards(RolesGuard)
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR Manager, System Admin, or HR Admin role' })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return await this.organizationStructureService.createDepartment(dto);
  }

  @Patch('departments/:id')
  @UseGuards(RolesGuard)
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update department attributes' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR Manager, System Admin, or HR Admin role' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Department code already exists' })
  async updateDepartment(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return await this.organizationStructureService.updateDepartment(id, dto);
  }

  @Post('positions')
  @UseGuards(RolesGuard)
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({
    status: 201,
    description: 'Position created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR Manager, System Admin, or HR Admin role' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  @ApiResponse({ status: 409, description: 'Position code already exists' })
  async createPosition(@Body() dto: CreatePositionDto) {
    return await this.organizationStructureService.createPosition(dto);
  }

  @Patch('positions/:id')
  @UseGuards(RolesGuard)
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update position attributes' })
  @ApiResponse({
    status: 200,
    description: 'Position updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR Manager, System Admin, or HR Admin role' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiResponse({ status: 409, description: 'Position code already exists' })
  async updatePosition(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return await this.organizationStructureService.updatePosition(id, dto);
  }

  @Patch('positions/:id/reassign')
  @UseGuards(RolesGuard)
  @Roles('HR Manager', 'System Admin', 'HR Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reassign position to a different department' })
  @ApiResponse({
    status: 200,
    description: 'Position reassigned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR Manager, System Admin, or HR Admin role' })
  @ApiResponse({ status: 404, description: 'Position or department not found' })
  @ApiResponse({ status: 400, description: 'Department is not active' })
  async reassignPosition(
    @Param('id') id: string,
    @Body() dto: ReassignPositionDto,
  ) {
    return await this.organizationStructureService.reassignPosition(id, dto);
  }

  @Patch('positions/:id/deactivate')
  @UseGuards(RolesGuard)
  @Roles('HR Manager', 'System Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a position' })
  @ApiResponse({
    status: 200,
    description: 'Position deactivated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires HR Manager or System Admin role' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async deactivatePosition(@Param('id') id: string) {
    return await this.organizationStructureService.deactivatePosition(id);
  }

  @Get('departments/:id/employees')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all employees by department' })
  @ApiResponse({
    status: 200,
    description: 'List of employees in the department',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async getEmployeesByDepartment(@Param('id') id: string) {
    return await this.organizationStructureService.getEmployeesByDepartment(id);
  }

  @Get('positions/:id/employees')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all employees by position' })
  @ApiResponse({
    status: 200,
    description: 'List of employees in the position',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async getEmployeesByPosition(@Param('id') id: string) {
    return await this.organizationStructureService.getEmployeesByPosition(id);
  }

  @Get('departments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active departments' })
  @ApiResponse({
    status: 200,
    description: 'List of all active departments',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid or missing token' })
  async getAllDepartments() {
    return await this.organizationStructureService.getAllDepartments();
  }
}
