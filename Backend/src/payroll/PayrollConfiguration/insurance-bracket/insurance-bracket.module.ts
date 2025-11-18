import { Module } from '@nestjs/common';
import { InsuranceBracketController } from './insurance-bracket.controller';
import { InsuranceBracketService } from './insurance-bracket.service';

@Module({
  controllers: [InsuranceBracketController],
  providers: [InsuranceBracketService]
})
export class InsuranceBracketModule {}
