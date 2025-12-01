export declare enum ReportType {
    MONTH = "MONTH",
    YEAR = "YEAR"
}
export declare class ReportPeriodDto {
    startDate: string;
    endDate: string;
}
export declare class SummaryReportDto {
    type: ReportType;
    date: string;
}
