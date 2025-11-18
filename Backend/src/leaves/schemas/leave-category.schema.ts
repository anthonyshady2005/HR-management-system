import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type LeaveCategoryDocument = HydratedDocument<LeaveCategory>;

@Schema({ timestamps: true })
export class LeaveCategory extends Document {
  @ApiProperty({
    description: 'Unique identifier for the leave category',
    example: 'CAT-PAID',
  })
  @Prop({ required: true, unique: true })
  categoryId: string;

  @ApiProperty({
    description:
      'Display name of the category (e.g., Paid Leave, Unpaid Leave, Special Leave)',
    example: 'Paid Leave',
  })
  @Prop({ required: true })
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of this leave category',
    example: 'Leave types that are compensated from employee salary',
  })
  @Prop()
  description: string;

  @ApiProperty({
    description: 'Whether this category is active in the system',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;
}

export const LeaveCategorySchema = SchemaFactory.createForClass(LeaveCategory);

// Indexes
LeaveCategorySchema.index({ categoryId: 1 });
