import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';

@ApiTags('Positions')
@Controller('positions')
export class PositionController {
  @Post()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, description: 'Position created successfully.' })
  create(@Body() dto: CreatePositionDto) {
    return { message: 'Create position stub' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'List of positions.' })
  findAll() {
    return { message: 'Get all positions stub' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a position by ID' })
  @ApiResponse({ status: 200, description: 'Position details.' })
  findOne(@Param('id') id: string) {
    return { message: `Get position ${id} stub` };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a position by ID' })
  @ApiResponse({ status: 200, description: 'Position updated successfully.' })
  update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return { message: `Update position ${id} stub` };
  }
}
