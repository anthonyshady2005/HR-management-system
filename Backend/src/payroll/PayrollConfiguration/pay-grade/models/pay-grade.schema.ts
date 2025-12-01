import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PayGradeDocument = HydratedDocument<PayGrade>;

export enum PayGradeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

@Schema()
export class PayGrade {
  @Prop({ required: true })
  gradeCode: string;

  @Prop({ required: true })
  min_salary: number;

  @Prop({ required: true })
  max_salary: number;

  @Prop({
    required: true,
    enum: PayGradeStatus,
    default: PayGradeStatus.DRAFT,
  })
  status: PayGradeStatus;
}

export const PayGradeSchema = SchemaFactory.createForClass(PayGrade);
