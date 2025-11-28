import { IsString, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  personalEmail: string;

  @IsString()
  nationalId: string;

  @IsString()
  @MinLength(5)
  password: string;
}
