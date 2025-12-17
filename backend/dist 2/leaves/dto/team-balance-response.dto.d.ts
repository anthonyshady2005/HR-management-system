export declare class EmployeeBalanceDto {
    leaveType: string;
    remaining: number;
    taken: number;
    pending: number;
    carryForward: number;
}
export declare class TeamBalanceResponseDto {
    employeeId: string;
    employeeName: string;
    employeeNumber: string;
    balances: EmployeeBalanceDto[];
}
