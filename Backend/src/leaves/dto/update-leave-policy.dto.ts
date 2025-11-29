import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateLeavePolicyDto } from './create-leave-policy.dto';

export class UpdateLeavePolicyDto extends PartialType(
    OmitType(CreateLeavePolicyDto, ['leaveTypeId'] as const)
) {}