import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FieldChangeDto {
  @ApiProperty({ description: 'Field name to change', example: 'phone' })
  @IsString()
  fieldName: string;

  @ApiProperty({ description: 'Old value' })
  oldValue: any;

  @ApiProperty({ description: 'New value' })
  newValue: any;
}

export class CreateChangeRequestDto {
  @ApiProperty({ description: 'Array of field changes' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldChangeDto)
  fields: FieldChangeDto[];

  @ApiProperty({
    description: 'Reason for the change request',
    example: 'Updated phone number',
  })
  @IsString()
  reason: string;
}
