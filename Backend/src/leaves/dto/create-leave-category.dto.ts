import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveCategoryDto {
    @ApiProperty({
        description: 'Name of the leave category',
        example: 'Paid Leave',
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({
        description: 'Description of the leave category',
        example: 'Leaves that are paid by the company',
        maxLength: 500
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;
}