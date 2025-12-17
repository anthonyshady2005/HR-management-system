import { IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldChangeDto {
  @ApiProperty({ description: 'Field name to change', example: 'phone' })
  @IsString()
  fieldName: string;

  @ApiPropertyOptional({ description: 'Old value (from profile)', nullable: true })
  @IsOptional()
  oldValue: any;

  @ApiPropertyOptional({ description: 'New value (from form)', nullable: true })
  @IsOptional()
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
