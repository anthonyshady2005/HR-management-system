import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayTypeController } from './pay-type.controller';
import { PayTypeService } from './pay-type.service';
import { PayType, PayTypeSchema } from './models/pay-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'PayType', schema: PayTypeSchema }]),
  ],
  controllers: [PayTypeController],
  providers: [PayTypeService],
})
export class PayTypeModule {}
