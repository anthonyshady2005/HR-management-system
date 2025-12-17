import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfirmClaimDto {
    @IsBoolean()
    @IsNotEmpty()
    approved: boolean;

    @IsString()
    @IsOptional()
    comment?: string;
}
