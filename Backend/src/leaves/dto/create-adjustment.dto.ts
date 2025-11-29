import { IsMongoId, IsNotEmpty, IsEnum, IsNumber, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdjustmentType } from '../enums/adjustment-type.enum';

export class CreateAdjustmentDto {
    @ApiProperty({
        description: 'ID of the employee',
        example: '507f1f77bcf86cd799439011'
    })
    @IsMongoId()
    @IsNotEmpty()
    employeeId: string;

    @ApiProperty({
        description: 'ID of the leave type',
        example: '507f1f77bcf86cd799439012'
    })
    @IsMongoId()
    @IsNotEmpty()
    leaveTypeId: string;

    @ApiProperty({
        description: 'Type of adjustment',
        example: 'add',
        enum: AdjustmentType
    })
    @IsEnum(AdjustmentType)
    @IsNotEmpty()
    adjustmentType: AdjustmentType;

    @ApiProperty({
        description: 'Amount of days to adjust',
        example: 5
    })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({
        description: 'Reason for the adjustment',
        example: 'Compensation for overtime work',
        maxLength: 500
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    reason: string;

    @ApiProperty({
        description: 'ID of the HR user making the adjustment',
        example: '507f1f77bcf86cd799439013'
    })
    @IsMongoId()
    @IsNotEmpty()
    hrUserId: string;
}