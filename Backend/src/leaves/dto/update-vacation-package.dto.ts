import { PartialType } from '@nestjs/mapped-types';
import { CreateVacationPackageDto } from './create-vacation-package.dto';

export class UpdateVacationPackageDto extends PartialType(CreateVacationPackageDto) {}