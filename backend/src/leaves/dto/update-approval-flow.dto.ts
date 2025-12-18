import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsMongoId,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ApprovalStepStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class ApprovalFlowStepDto {
  @ApiProperty({
    description: 'Role in the approval flow',
    example: 'Manager',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Status of this approval step',
    example: 'pending',
    enum: ApprovalStepStatus,
  })
  @IsEnum(ApprovalStepStatus)
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({
    description: 'ID of the user who made the decision',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsOptional()
  decidedBy?: string;

  @ApiPropertyOptional({
    description: 'Date when the decision was made',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  decidedAt?: Date;
}

export class UpdateApprovalFlowDto {
  @ApiProperty({
    description: 'Updated approval flow steps',
    type: [ApprovalFlowStepDto],
    example: [
      {
        role: 'Manager',
        status: 'approved',
        decidedBy: '507f1f77bcf86cd799439011',
        decidedAt: '2024-01-15T10:30:00Z',
      },
      {
        role: 'HR',
        status: 'pending',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalFlowStepDto)
  @IsNotEmpty()
  approvalFlow: ApprovalFlowStepDto[];
}
