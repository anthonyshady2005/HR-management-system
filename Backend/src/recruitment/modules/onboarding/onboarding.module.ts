import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingController } from './controllers/onboarding-cases.controller';
import {
  OnboardingCase,
  OnboardingCaseSchema,
  OnboardingChecklist,
  OnboardingChecklistSchema,
  DocumentEntity,
  DocumentSchema,
  Provisioning,
  ProvisioningSchema,
} from './schemas/onboarding-case.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnboardingCase.name, schema: OnboardingCaseSchema },
      { name: OnboardingChecklist.name, schema: OnboardingChecklistSchema },
      { name: DocumentEntity.name, schema: DocumentSchema },
      { name: Provisioning.name, schema: ProvisioningSchema },
    ]),
  ],
  controllers: [OnboardingController],
  providers: [],
  exports: [],
})
export class OnboardingModule {}

