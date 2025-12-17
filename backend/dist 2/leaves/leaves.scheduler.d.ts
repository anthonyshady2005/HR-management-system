import { LeavesService } from './leaves.service';
export declare class LeavesScheduler {
    private readonly leavesService;
    private readonly logger;
    constructor(leavesService: LeavesService);
    handleMonthlyAccrual(): Promise<void>;
    handleQuarterlyAccrual(): Promise<void>;
    handleYearlyAccrual(): Promise<void>;
    handleYearEndCarryForward(): Promise<void>;
    handleAutoEscalation(): Promise<void>;
}
