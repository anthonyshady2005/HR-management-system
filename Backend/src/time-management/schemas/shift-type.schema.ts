import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ShiftTypeDocument = HydratedDocument<ShiftType>;

@Schema({ timestamps: true })
export class ShiftType {

  @Prop({ type: Number, unique: true, required: true })
  shiftTypeId: number;   // Unique identifier

  @Prop({
    type: String,
    enum: ['normal', 'split', 'overnight', 'rotational'],
    required: true,
  })
  name: string;          // Shift type name

  @Prop({ type: String, required: true })
  startTime: string;     // When the shift starts

  @Prop({ type: String, required: true })
  endTime: string;       // When the shift ends

  @Prop({ type: Number, default: 0 })
  breakMin: number;      // Max allowed break minutes

  @Prop({ type: [String], default: [] })
  weeklyPattern: string[];  // e.g. ['Mon','Tue','Sat']

  @Prop({ type: Number, default: 0 })
  workingDaysCount: number;   // Min number of working days

  @Prop({ type: Number, default: 0 })
  gracePeriodMin: number;     // Allowed late arrival minutes

  @Prop({ type: Number, default: 0 })
  maxEarlyMin: number;        // Allowed early arrival minutes

  @Prop({ type: String })
  description: string;        // Explanation of shift type

  @Prop({ type: Number, required: true })
  createdBy: number;          // Admin who created it

  @Prop({ type: Number, required: true })
  updatedBy: number;          // Admin who last updated it

  // createdAt and updatedAt are added automatically by timestamps
}

export const ShiftTypeSchema = SchemaFactory.createForClass(ShiftType);
