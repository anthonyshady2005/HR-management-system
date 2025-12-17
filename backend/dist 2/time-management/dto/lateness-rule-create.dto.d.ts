export declare class LatenessRuleCreateDTO {
    name: string;
    description?: string;
    gracePeriodMinutes: number;
    deductionForEachMinute: number;
    active?: boolean;
}
