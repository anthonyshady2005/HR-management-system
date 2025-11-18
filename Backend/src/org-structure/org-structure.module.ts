import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Department, DepartmentSchema } from './models/department.schema';
import { Position, PositionSchema } from './models/position.schema';
import { OrganizationController } from './organization.controller';
import { PositionController } from './controllers/position.controller';
import { DepartmentController } from './controllers/department.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
    ]),
  ],
  controllers: [OrganizationController, DepartmentController, PositionController],
  providers: [],
  exports: [],
})
export class OrganizationModule {}
