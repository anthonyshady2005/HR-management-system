import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReportType {
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}

export class ReportPeriodDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}

export class SummaryReportDto {
    @IsEnum(ReportType)
    type: ReportType;

    @IsDateString()
    date: string;
}
