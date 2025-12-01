import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRefundDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    description: string;
}
