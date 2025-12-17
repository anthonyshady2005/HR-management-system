export declare class ProfileSyncService {
    private readonly logger;
    emitStatusChanged(employeeId: string, oldStatus: string, newStatus: string): void;
    emitPayGradeChanged(employeeId: string, oldPayGrade: string | undefined, newPayGrade: string | undefined): void;
    emitHierarchyChanged(employeeId: string, positionId?: string, departmentId?: string): void;
}
