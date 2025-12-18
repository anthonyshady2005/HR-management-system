import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectRoleDto {
  @ApiProperty({
    description: 'The role to set as current',
    example: 'HR Manager',
  })
  @IsString()
  @IsNotEmpty()
  role: string;
}
