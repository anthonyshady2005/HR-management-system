import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfirmDisputeDto {
    @IsBoolean()
    @IsNotEmpty()
    approved: boolean;

    @IsString()
    @IsOptional()
    comment?: string;
}
