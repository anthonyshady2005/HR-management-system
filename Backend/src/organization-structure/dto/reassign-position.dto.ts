import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export class ReassignPositionDto {
  @ApiProperty({ description: 'New Department ObjectId' })
  @IsNotEmpty()
  @IsMongoId()
  newDepartmentId: Types.ObjectId;
}

