import { Module } from '@nestjs/common';
import { AprprovalChainService } from './aprproval-chain.service';
import { AprprovalChainController } from './aprproval-chain.controller';

@Module({
  controllers: [AprprovalChainController],
  providers: [AprprovalChainService],
})
export class AprprovalChainModule {}
