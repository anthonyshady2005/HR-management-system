/**
 * # Contract – Create DTO
 *
 * DTO used to create an employment contract after offer acceptance.
 * Matches `Contract` schema core fields.
 */

import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreateContractDto {
  @IsMongoId()
  offerId!: string;

  @IsOptional()
  @IsDateString()
  acceptanceDate?: string;

  @IsNumber()
  grossSalary!: number;

  @IsOptional()
  @IsNumber()
  signingBonus?: number;

  @IsString()
  role!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsMongoId()
  documentId!: string;

  @IsOptional()
  @IsString()
  employeeSignatureUrl?: string;

  @IsOptional()
  @IsString()
  employerSignatureUrl?: string;

  @IsOptional()
  @IsDateString()
  employeeSignedAt?: string;

  @IsOptional()
  @IsDateString()
  employerSignedAt?: string;
}
