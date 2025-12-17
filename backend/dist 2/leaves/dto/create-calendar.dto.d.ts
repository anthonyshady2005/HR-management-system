declare class BlockedPeriodDto {
    from: Date;
    to: Date;
    reason: string;
}
export declare class CreateCalendarDto {
    year: number;
    holidays?: string[];
    blockedPeriods?: BlockedPeriodDto[];
}
export {};
