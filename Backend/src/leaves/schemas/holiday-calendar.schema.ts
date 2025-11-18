import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type HolidayCalendarDocument = HydratedDocument<HolidayCalendar>;

@Schema({ _id: false })
export class Holiday {
  @ApiProperty({
    description: 'Date of the holiday',
    example: '2025-01-01',
  })
  @Prop({ required: true })
  date: Date;

  @ApiProperty({
    description: 'Name of the holiday',
    example: "New Year's Day",
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Whether this is a national/official holiday',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isNational: boolean;

  @ApiProperty({
    description: 'Whether this is an optional holiday',
    example: false,
    default: false,
  })
  @Prop({ default: false })
  isOptional: boolean;

  @ApiPropertyOptional({
    description: 'Additional description or notes',
    example: 'Public holiday as per labor law',
  })
  @Prop()
  description: string;
}

@Schema({ timestamps: true })
export class HolidayCalendar extends Document {
  @ApiProperty({
    description: 'Unique calendar identifier',
    example: 'CAL-EG-2025',
  })
  @Prop({ required: true })
  calendarId: string;

  @ApiProperty({
    description: 'Calendar year',
    example: 2025,
  })
  @Prop({ required: true })
  year: number;

  @ApiProperty({
    description: 'Country code (ISO 2-letter format)',
    example: 'EG',
    default: 'EG',
  })
  @Prop({ default: 'EG' })
  country: string;

  @ApiProperty({
    description:
      'List of holidays for this year. Used in net days calculation (BR 23: holidays excluded from leave days).',
    type: [Holiday],
  })
  @Prop({ type: [Holiday], default: [] })
  holidays: Holiday[];

  @ApiProperty({
    description:
      'Weekend days (0=Sunday, 1=Monday, ..., 6=Saturday). Used in net days calculation (BR 23).',
    example: [5, 6],
    type: [Number],
  })
  @Prop({ type: [Number], default: [5, 6] })
  weekendDays: number[];

  @ApiProperty({
    description: 'Whether this calendar is active',
    example: true,
    default: true,
  })
  @Prop({ default: true })
  isActive: boolean;
}

export const HolidayCalendarSchema =
  SchemaFactory.createForClass(HolidayCalendar);

// Indexes
HolidayCalendarSchema.index({ year: 1, country: 1 }, { unique: true });
HolidayCalendarSchema.index({ 'holidays.date': 1 });
