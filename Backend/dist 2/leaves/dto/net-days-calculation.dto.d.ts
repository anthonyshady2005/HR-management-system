export declare class NetDaysCalculationDto {
    employeeId: string;
    from: Date;
    to: Date;
}
export declare class NetDaysResponseDto {
    totalDays: number;
    weekendsExcluded: number;
    holidaysExcluded: number;
    netDays: number;
    holidayDates: string[];
}
