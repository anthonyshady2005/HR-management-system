/* eslint-disable prettier/prettier */
import { IsArray, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SystemRole } from '../enums/employee-profile.enums';

/**
 * DTO for assigning roles and permissions to an employee (US-E7-05).
 */
export class AssignRolesDto {
  @ApiProperty({
    enum: SystemRole,
    isArray: true,
    description: 'System roles to assign to the employee',
  })
  @IsArray()
  @IsString({ each: true })
  roles: SystemRole[];

  @ApiPropertyOptional({
    description: 'Additional permissions to grant',
      })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({
    description: 'Whether the role assignment is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Reason for role assignment change' })
  @IsOptional()
  @IsString()
  reason?: string;
}
