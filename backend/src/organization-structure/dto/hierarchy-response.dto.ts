import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PositionNodeDto {
  @ApiProperty({ description: 'Position ID' })
  id: string;

  @ApiProperty({ description: 'Position title' })
  title: string;

  @ApiProperty({ description: 'Position code' })
  code: string;

  @ApiPropertyOptional({ description: 'Position description' })
  description?: string;

  @ApiProperty({ description: 'Department ID' })
  departmentId: string;

  @ApiPropertyOptional({ description: 'Reports to position ID' })
  reportsToPositionId?: string;

  @ApiProperty({ description: 'Is position active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'List of employees in this position' })
  employees?: EmployeeNodeDto[];

  @ApiPropertyOptional({ description: 'Direct reports (child positions)' })
  directReports?: PositionNodeDto[];
}

export class EmployeeNodeDto {
  @ApiProperty({ description: 'Employee profile ID' })
  id: string;

  @ApiProperty({ description: 'Employee number' })
  employeeNumber: string;

  @ApiPropertyOptional({ description: 'First name' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Work email' })
  workEmail?: string;
}

export class DepartmentNodeDto {
  @ApiProperty({ description: 'Department ID' })
  id: string;

  @ApiProperty({ description: 'Department name' })
  name: string;

  @ApiProperty({ description: 'Department code' })
  code: string;

  @ApiPropertyOptional({ description: 'Department description' })
  description?: string;

  @ApiProperty({ description: 'Is department active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Head position ID' })
  headPositionId?: string;

  @ApiProperty({ description: 'Positions in this department' })
  positions: PositionNodeDto[];
}

export class HierarchyResponseDto {
  @ApiProperty({ description: 'Root departments' })
  departments: DepartmentNodeDto[];

  @ApiProperty({ description: 'All positions in the hierarchy' })
  positions: PositionNodeDto[];

  @ApiProperty({ description: 'Total number of departments' })
  totalDepartments: number;

  @ApiProperty({ description: 'Total number of positions' })
  totalPositions: number;
}

export class EmployeeHierarchyResponseDto {
  @ApiPropertyOptional({ description: 'Employee position information (null if no assignment)' })
  currentPosition?: PositionNodeDto | null;

  @ApiProperty({ description: 'Reporting chain upward (managers)' })
  reportingChain: PositionNodeDto[];

  @ApiProperty({ description: 'Direct reports (team members)' })
  directReports: PositionNodeDto[];
}

export class TeamStructureResponseDto {
  @ApiProperty({ description: 'Manager position information' })
  managerPosition: PositionNodeDto;

  @ApiProperty({ description: 'All positions reporting to manager' })
  teamPositions: PositionNodeDto[];

  @ApiProperty({ description: 'Total team members (employees)' })
  totalTeamMembers: number;
}

