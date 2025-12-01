import { PerformanceService } from './performance.service';
import { CreateAppraisalTemplateDto } from './DTOs/CreateAppraisalTemplate.dto';
import { AppraisalTemplate } from './models/appraisal-template.schema';
import { CreateAppraisalCycleDTO } from './DTOs/CreateAppraisalCycle.dto';
import { AppraisalCycle } from './models/appraisal-cycle.schema';
import { CreateAppraisalAssignmentDTO } from './DTOs/CreateAppraisalAssignment.dto';
import { AppraisalAssignment } from './models/appraisal-assignment.schema';
import { AppraisalRecord } from './models/appraisal-record.schema';
import { CreateAppraisalRecordDTO } from './DTOs/CreateAppraisalRecord.dto';
import { UpdateAppraisalRecordDto } from './DTOs/UpdateAppraisalRecord.dto';
import { AppraisalDispute } from './models/appraisal-dispute.schema';
import { CreateAppraisalDisputeDTO } from './DTOs/CreateAppraisalDispute.dto';
import { UpdateAppraisalDisputeDto } from './DTOs/UpdateAppraisalDispute.dto';
export declare class PerformanceController {
    private readonly performanceService;
    constructor(performanceService: PerformanceService);
    createAppraisalTemplate(dto: CreateAppraisalTemplateDto): Promise<AppraisalTemplate>;
    getAllTemplates(): Promise<AppraisalTemplate[]>;
    createAppraisalCycle(dto: CreateAppraisalCycleDTO): Promise<AppraisalCycle>;
    getAllCycles(): Promise<AppraisalCycle[]>;
    assignAppraisalsBulk(dtos: CreateAppraisalAssignmentDTO[]): Promise<AppraisalAssignment[]>;
    getAssignmentsForManager(managerId: string): Promise<AppraisalAssignment[]>;
    getAllAssignments(): Promise<AppraisalAssignment[]>;
    createAppraisalRecord(dto: CreateAppraisalRecordDTO): Promise<AppraisalRecord>;
    getRecords(): Promise<AppraisalRecord[]>;
    updateAppraisalRecord(recordId: string, dto: UpdateAppraisalRecordDto): Promise<AppraisalRecord>;
    getDashboard(cycleId: string): Promise<any[]>;
    getAppraisalProgress(cycleId: string): Promise<AppraisalAssignment[]>;
    getEmployeeAppraisals(employeeId: string): Promise<AppraisalRecord[]>;
    createAppraisalDispute(dto: CreateAppraisalDisputeDTO): Promise<AppraisalDispute>;
    updateAppraisalDispute(disputeId: string, dto: UpdateAppraisalDisputeDto): Promise<AppraisalDispute>;
    getAllDisputes(): Promise<AppraisalDispute[]>;
    publishAppraisal(recordId: string, publishedByEmployeeId: string): Promise<AppraisalRecord>;
    getEmployeeAppraisalHistory(employeeId: string): Promise<AppraisalRecord[]>;
    generateAppraisalReport(cycleId: string): Promise<{
        cycleId: import("mongoose").Types.ObjectId;
        cycleName: string;
        cycleType: import("./enums/performance.enums").AppraisalTemplateType;
        startDate: Date;
        endDate: Date;
        totalAppraisals: number;
        publishedAppraisals: number;
        averageScore: number;
        scoreDistribution: {
            excellent: number;
            good: number;
            satisfactory: number;
            needsImprovement: number;
        };
        records: {
            employeeId: import("mongoose").Types.ObjectId;
            score: number | undefined;
            rating: string | undefined;
            status: import("./enums/performance.enums").AppraisalRecordStatus;
        }[];
    }>;
}
