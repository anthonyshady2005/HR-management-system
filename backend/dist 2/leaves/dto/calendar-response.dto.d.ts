export declare class BlockedPeriodResponseDto {
    from: Date;
    to: Date;
    reason: string;
}
export declare class CalendarResponseDto {
    id: string;
    year: number;
    holidays?: string[];
    blockedPeriods?: BlockedPeriodResponseDto[];
    createdAt: Date;
    updatedAt: Date;
}
