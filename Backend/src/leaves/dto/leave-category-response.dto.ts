import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeaveCategoryResponseDto {
    @ApiProperty({
        description: 'Category ID',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'Category name',
        example: 'Paid Leave'
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Category description',
        example: 'Leaves that are paid by the company'
    })
    description?: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z'
    })
    updatedAt: Date;
}