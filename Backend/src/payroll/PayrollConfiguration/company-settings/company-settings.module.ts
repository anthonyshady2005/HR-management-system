import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySettingsController } from './company-settings.controller';
import { CompanySettingsService } from './company-settings.service';
import {
  CompanySettings,
  CompanySettingsSchema,
} from './models/company-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CompanySettings', schema: CompanySettingsSchema },
    ]),
  ],
  controllers: [CompanySettingsController],
  providers: [CompanySettingsService],
})
export class CompanySettingsModule {}
