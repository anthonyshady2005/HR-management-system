import { IsString, IsEmail, MinLength ,IsArray,IsOptional,IsEnum} from 'class-validator';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';
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

  
  @IsOptional()
  @IsArray()
  @IsEnum(SystemRole, { each: true })
  roles?: SystemRole[];
}
