import { Model, Types } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { ProfileAuditLog } from './models/profile-audit-log.schema';
import { Position } from '../organization-structure/models/position.schema';
import { Department } from '../organization-structure/models/department.schema';
import { AppraisalRecord } from '../performance/models/appraisal-record.schema';
import { UpdateSelfEmployeeProfileDto } from './dto/update-self-profile.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { HrUpdateEmployeeProfileDto } from './dto/hr-update-employee-profile.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { DeactivateEmployeeDto } from './dto/deactivate-employee.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { EmployeeQualification } from './models/qualification.schema';
import { ChangeWorkflowRule } from './workflow-rule.schema';
import { ProfileSyncService } from './profile-sync.service';
export interface SearchEmployeeDto {
    name?: string;
    employeeNumber?: string;
    departmentId?: string;
    positionId?: string;
    status?: string;
    page?: number;
    limit?: number;
}
import { ProfileChangeStatus, SystemRole, EmployeeStatus } from './enums/employee-profile.enums';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
export declare class EmployeeProfileService {
    private readonly profileModel;
    private readonly changeRequestModel;
    private readonly positionModel;
    private readonly departmentModel;
    private readonly appraisalRecordModel;
    private readonly auditLogModel;
    private readonly systemRoleModel;
    private readonly qualificationModel;
    private readonly workflowRuleModel;
    private readonly syncService;
    constructor(profileModel: Model<EmployeeProfileDocument>, changeRequestModel: Model<EmployeeProfileChangeRequest>, positionModel: Model<Position>, departmentModel: Model<Department>, appraisalRecordModel: Model<AppraisalRecord>, auditLogModel: Model<ProfileAuditLog>, systemRoleModel: Model<EmployeeSystemRole>, qualificationModel: Model<EmployeeQualification>, workflowRuleModel: Model<ChangeWorkflowRule>, syncService: ProfileSyncService);
    private toId;
    getMyProfile(employeeId: string): Promise<{
        id: Types.ObjectId;
        employeeNumber: string;
        name: string;
        status: EmployeeStatus;
        dateOfHire: Date;
        payGrade: Types.ObjectId | null;
        position: Types.ObjectId | null;
        department: Types.ObjectId | null;
        contact: {
            email: string | undefined;
            mobilePhone: string | undefined;
            address: import("mongoose").FlattenMaps<import("./models/user-schema").Address> | undefined;
        };
        biography: string | undefined;
        profilePictureUrl: string | undefined;
        lastAppraisal: any;
        highestQualification: {
            establishmentName: string;
            graduationType: import("./enums/employee-profile.enums").GraduationType;
        } | null;
    }>;
    updateSelfProfile(employeeId: string, dto: UpdateSelfEmployeeProfileDto): Promise<{
        message: string;
        profileId: Types.ObjectId | undefined;
    }>;
    submitChangeRequest(employeeId: string, dto: CreateChangeRequestDto): Promise<{
        message: string;
        requestId: string;
        status: ProfileChangeStatus;
    }>;
    getTeamMembers(managerId: string): Promise<{
        teamMembers: {
            id: Types.ObjectId;
            name: string;
            status: EmployeeStatus;
            position: Types.ObjectId | null;
            department: Types.ObjectId | null;
            dateOfHire: Date;
        }[];
        count: number;
    }>;
    getTeamSummary(managerId: string): Promise<{
        managerDepartment: Types.ObjectId | null;
        totalTeamMembers: any;
        byPosition: any[];
        byDepartment: any[];
        byStatus: any[];
    }>;
    searchEmployees(dto: SearchEmployeeDto): Promise<{
        employees: {
            id: Types.ObjectId;
            employeeNumber: string;
            name: string;
            workEmail: string | undefined;
            personalEmail: string | undefined;
            mobilePhone: string | undefined;
            status: EmployeeStatus;
            position: Types.ObjectId | null;
            department: Types.ObjectId | null;
            payGrade: Types.ObjectId | null;
            dateOfHire: Date;
            profilePictureUrl: string | undefined;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private createAuditLog;
    getEmployeeById(employeeId: string): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, EmployeeProfile, {}, {}> & EmployeeProfile & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>>;
    hrUpdateEmployeeProfile(employeeId: string, hrAdminId: string, dto: HrUpdateEmployeeProfileDto): Promise<{
        message: string;
        employeeId: Types.ObjectId | undefined;
        changedFields: string[];
    }>;
    getPendingChangeRequests(page?: number, limit?: number): Promise<{
        requests: (import("mongoose").FlattenMaps<{
            requestId: string;
            employeeProfileId: Types.ObjectId;
            requestDescription: string;
            fieldChanges: {
                fieldName: string;
                oldValue: unknown;
                newValue: unknown;
            }[];
            reason?: string | undefined;
            status: ProfileChangeStatus;
            submittedAt: Date;
            processedByEmployeeId?: Types.ObjectId | undefined;
            processedAt?: Date | undefined;
            processingComments?: string | undefined;
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    processChangeRequest(requestId: string, hrAdminId: string, dto: ProcessChangeRequestDto): Promise<{
        message: string;
        requestId: string;
        status: ProfileChangeStatus.APPROVED | ProfileChangeStatus.REJECTED;
    }>;
    deactivateEmployee(employeeId: string, hrAdminId: string, dto: DeactivateEmployeeDto): Promise<{
        message: string;
        employeeId: string;
        previousStatus: EmployeeStatus;
        newStatus: EmployeeStatus;
        effectiveDate: Date;
    }>;
    assignRoles(employeeId: string, hrAdminId: string, dto: AssignRolesDto): Promise<{
        message: string;
        employeeId: string;
        roles: SystemRole[];
        permissions: string[];
    }>;
    getEmployeeRoles(employeeId: string): Promise<(import("mongoose").FlattenMaps<{
        employeeProfileId: Types.ObjectId;
        roles: SystemRole[];
        permissions: string[];
        isActive: boolean;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | {
        roles: never[];
        permissions: never[];
        isActive: false;
    }>;
    getAuditHistory(employeeId: string, page?: number, limit?: number): Promise<{
        logs: (import("mongoose").FlattenMaps<{
            employeeProfileId: Types.ObjectId;
            performedByEmployeeId: Types.ObjectId;
            action: string;
            changeRequestId?: string | undefined;
            previousValues?: {
                [x: string]: unknown;
            } | undefined;
            newValues?: {
                [x: string]: unknown;
            } | undefined;
            changedFields: string[];
            reason?: string | undefined;
            ipAddress?: string | undefined;
            performedAt: Date;
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private isExactFieldMatch;
}
