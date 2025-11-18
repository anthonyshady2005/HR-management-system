// holiday.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HolidayDocument = HydratedDocument<Holiday>;

@Schema({ timestamps: true })
export class Holiday {
  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId; // Unique identifier

  @Prop({ type: Date, required: true })
  date: Date; // Exact holiday or weekly rest day

  @Prop({ type: String, required: true, trim: true })
  name: string; // Holiday name

  @Prop({ type: Boolean, required: true })
  isHoliday: boolean; // Official holiday flag

  @Prop({ type: Boolean, required: true })
  isWeeklyRestDay: boolean; // Weekly rest day flag

  @Prop({ type: Number, required: true })
  appliesToYear: number; // Year the holiday belongs to

  @Prop({ type: String, required: true, trim: true })
  appliesToLocation: string; // e.g., "Egypt", "UAE", "KSA", or "All"

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  createdBy: Types.ObjectId; // HR/Admin who created this

  @Prop()
  createdAt: Date; // Auto timestamp from @Schema({ timestamps: true })

  @Prop()
  updatedAt: Date; // Auto timestamp from @Schema({ timestamps: true })
}

export const HolidaySchema = SchemaFactory.createForClass(Holiday);
