import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type insuranceBracketDocument = HydratedDocument<insuranceBracket>;

@Schema({ timestamps: true })
export class insuranceBracket {
  // Type of insurance (health, social, etc.)
  @Prop({ required: true, enum: ['health', 'social', 'life', 'other'] })
  insurance_type: string;

  // Minimum salary for the bracket
  @Prop({ required: true })
  salary_range_min: number;

  // Maximum salary for the bracket
  @Prop({ required: true })
  salary_range_max: number;

  // Employee contribution percentage (e.g., 5.5)
  @Prop({ required: true })
  employee_contribution_percentage: number;

  // Employer contribution percentage
  @Prop({ required: true })
  employer_contribution_percentage: number;

  // Lifecycle status
  @Prop({ required: true, enum: ['draft', 'active', 'rejected'], default: 'draft' })
  status: string;

  // Optional approver or notes field
  @Prop({ type: String, required: false })
  notes?: string;
}

export const InsuranceBracketSchema = SchemaFactory.createForClass(insuranceBracket);
