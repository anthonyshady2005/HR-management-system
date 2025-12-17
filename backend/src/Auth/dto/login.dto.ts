import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  personalEmail: string;

  @IsString()
  password: string;
}
