import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class DelegateApprovalDto {
  @ApiProperty({
    description: 'User ID of the person delegating (original approver)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsNotEmpty()
  @IsMongoId()
  fromUserId: string;

  @ApiProperty({
    description: 'User ID of the delegate who will approve instead',
    example: '507f1f77bcf86cd799439012',
  })
  @IsNotEmpty()
  @IsMongoId()
  toUserId: string;

  @ApiProperty({ description: 'Role being delegated', example: 'Manager' })
  @IsNotEmpty()
  role: string;
}
