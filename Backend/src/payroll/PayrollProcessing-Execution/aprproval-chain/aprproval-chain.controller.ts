import { Controller } from '@nestjs/common';
import { AprprovalChainService } from './aprproval-chain.service';

@Controller('aprproval-chain')
export class AprprovalChainController {
  constructor(private readonly aprprovalChainService: AprprovalChainService) {}
}
