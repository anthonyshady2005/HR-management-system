import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentController {
  @Post()
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully.' })
  create(@Body() dto: CreateDepartmentDto) {
    return { message: 'Create department stub' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'List of departments.' })
  findAll() {
    return { message: 'Get all departments stub' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by ID' })
  @ApiResponse({ status: 200, description: 'Department details.' })
  findOne(@Param('id') id: string) {
    return { message: `Get department ${id} stub` };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department by ID' })
  @ApiResponse({ status: 200, description: 'Department updated successfully.' })
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return { message: `Update department ${id} stub` };
  }
}
