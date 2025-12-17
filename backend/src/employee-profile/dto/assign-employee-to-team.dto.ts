import { IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignEmployeeToTeamDto {
  @ApiProperty({
    description: 'ID of the employee to assign to the manager\'s team',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsString()
  employeeId: string;
}

