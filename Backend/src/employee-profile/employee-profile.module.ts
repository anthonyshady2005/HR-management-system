import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeeProfileController } from './controllers/employee-profile.controller';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from './schemas/employee-profile.schema';
import {
  EmployeeChangeRequest,
  EmployeeChangeRequestSchema,
} from './schemas/employee-change-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      {
        name: EmployeeChangeRequest.name,
        schema: EmployeeChangeRequestSchema,
      },
    ]),
  ],
  controllers: [EmployeeProfileController],
  providers: [],
  exports: [],
})
export class EmployeeModule {}
