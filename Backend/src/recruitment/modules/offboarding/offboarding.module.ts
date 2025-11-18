import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OffboardingController } from './controllers/offboarding-cases.controller';
import {
  OffboardingCase,
  OffboardingCaseSchema,
  OffboardingChecklist,
  OffboardingChecklistSchema,
  ClearanceItem,
  ClearanceItemSchema,
  SystemRevocation,
  SystemRevocationSchema,
} from './schemas/offboarding-case.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OffboardingCase.name, schema: OffboardingCaseSchema },
      {
        name: OffboardingChecklist.name,
        schema: OffboardingChecklistSchema,
      },
      { name: ClearanceItem.name, schema: ClearanceItemSchema },
      { name: SystemRevocation.name, schema: SystemRevocationSchema },
    ]),
  ],
  controllers: [OffboardingController],
  providers: [],
  exports: [],
})
export class OffboardingModule {}

