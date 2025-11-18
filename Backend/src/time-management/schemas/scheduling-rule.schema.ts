import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SchedulingRuleDocument = HydratedDocument<SchedulingRule>;

@Schema({ timestamps: true })
export class SchedulingRule {

  @Prop({ type: Types.ObjectId, auto: true })
  id: Types.ObjectId;          // Unique identifier

  @Prop({ type: String, required: true })
  name: string;                // Description of the rule

  @Prop({
    type: String,
    enum: ['Flexible', 'WeeklyPattern', 'Rotational'],
    required: true,
  })
  ruleType: string;            // Rule classification

  @Prop({ type: String })
  flexStartRange: string;      // e.g., "08:00"

  @Prop({ type: String })
  flexEndRange: string;        // e.g., "12:00"

  @Prop({ type: Number })
  maxHoursPerDay: number;      // Used in compressed workweeks

  @Prop({ type: [String], default: [] })
  weeklyPattern: string[];     // Custom weekly patterns

  @Prop({ type: Number })
  rotationalDays: number;      // Cycle length for rotation

  @Prop({ type: [Types.ObjectId], ref: 'ShiftType', default: [] })
  shiftTypeIds: Types.ObjectId[]; // Shift types this rule applies to

  @Prop({ type: Boolean, default: true })
  isActive: boolean;           // Enabled / disabled

  @Prop({ type: Date })
  ruleStartDate: Date;         // Rule begins

  @Prop({ type: Date })
  effectiveDate: Date;         // Additional effective date

  @Prop({ type: Date })
  ruleEndDate: Date;           // Rule ends

  @Prop({ type: Number, required: true })
  createdBy: number;           // Admin who created

  @Prop({ type: Number, required: true })
  updatedBy: number;           // Admin who updated

  @Prop()
  createdAt: Date;             // Auto-assigned timestamp

  @Prop()
  updatedAt: Date;             // Auto-assigned timestamp
}

export const SchedulingRuleSchema =
  SchemaFactory.createForClass(SchedulingRule);
