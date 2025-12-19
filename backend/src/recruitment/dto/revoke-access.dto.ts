/**
 * # Revoke Access DTO
 *
 * DTO used for System Admin to revoke system and account access (OFF-007)
 */

import {
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RevokeAccessDto {
  @ApiPropertyOptional({
    description: 'Reason for revoking access',
    example: 'Termination - Offboarding complete',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Whether to revoke all roles immediately',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  revokeAllRoles?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to revoke all permissions',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  revokeAllPermissions?: boolean;
}
