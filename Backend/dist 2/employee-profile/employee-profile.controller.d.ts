import { EmployeeProfileService } from './employee-profile.service';
import { UpdateSelfEmployeeProfileDto } from './dto/update-self-profile.dto';
import { CreateChangeRequestDto } from './dto/create-change-request.dto';
import { SearchEmployeeDto } from './dto/search-employee.dto';
import { HrUpdateEmployeeProfileDto } from './dto/hr-update-employee-profile.dto';
import { ProcessChangeRequestDto } from './dto/process-change-request.dto';
import { DeactivateEmployeeDto } from './dto/deactivate-employee.dto';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { SystemRole } from './enums/employee-profile.enums';
import express from 'express';
export declare class EmployeeProfileController {
    private readonly profileService;
    constructor(profileService: EmployeeProfileService);
    getMe(req: express.Request): Promise<{
        id: import("mongoose").Types.ObjectId;
        employeeNumber: string;
        name: string;
        status: import("./enums/employee-profile.enums").EmployeeStatus;
        dateOfHire: Date;
        payGrade: import("mongoose").Types.ObjectId | null;
        position: import("mongoose").Types.ObjectId | null;
        department: import("mongoose").Types.ObjectId | null;
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
    updateMe(req: express.Request, dto: UpdateSelfEmployeeProfileDto): Promise<{
        message: string;
        profileId: import("mongoose").Types.ObjectId | undefined;
    }>;
    submitChangeRequest(req: express.Request, dto: CreateChangeRequestDto): Promise<{
        message: string;
        requestId: string;
        status: import("./enums/employee-profile.enums").ProfileChangeStatus;
    }>;
    getTeamMembers(req: express.Request): Promise<{
        teamMembers: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            status: import("./enums/employee-profile.enums").EmployeeStatus;
            position: import("mongoose").Types.ObjectId | null;
            department: import("mongoose").Types.ObjectId | null;
            dateOfHire: Date;
        }[];
        count: number;
    }>;
    getTeamSummary(req: express.Request): Promise<{
        managerDepartment: import("mongoose").Types.ObjectId | null;
        totalTeamMembers: any;
        byPosition: any[];
        byDepartment: any[];
        byStatus: any[];
    }>;
    searchEmployees(dto: SearchEmployeeDto): Promise<{
        employees: {
            id: import("mongoose").Types.ObjectId;
            employeeNumber: string;
            name: string;
            workEmail: string | undefined;
            personalEmail: string | undefined;
            mobilePhone: string | undefined;
            status: import("./enums/employee-profile.enums").EmployeeStatus;
            position: import("mongoose").Types.ObjectId | null;
            department: import("mongoose").Types.ObjectId | null;
            payGrade: import("mongoose").Types.ObjectId | null;
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
    getEmployeeById(employeeId: string): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./models/employee-profile.schema").EmployeeProfile, {}, {}> & import("./models/employee-profile.schema").EmployeeProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    hrUpdateEmployee(employeeId: string, req: express.Request, dto: HrUpdateEmployeeProfileDto): Promise<{
        message: string;
        employeeId: import("mongoose").Types.ObjectId | undefined;
        changedFields: string[];
    }>;
    getPendingChangeRequests(page?: number, limit?: number): Promise<{
        requests: (import("mongoose").FlattenMaps<{
            requestId: string;
            employeeProfileId: import("mongoose").Types.ObjectId;
            requestDescription: string;
            fieldChanges: {
                fieldName: string;
                oldValue: unknown;
                newValue: unknown;
            }[];
            reason?: string | undefined;
            status: import("./enums/employee-profile.enums").ProfileChangeStatus;
            submittedAt: Date;
            processedByEmployeeId?: import("mongoose").Types.ObjectId | undefined;
            processedAt?: Date | undefined;
            processingComments?: string | undefined;
        }> & {
            _id: import("mongoose").Types.ObjectId;
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
    processChangeRequest(requestId: string, req: express.Request, dto: ProcessChangeRequestDto): Promise<{
        message: string;
        requestId: string;
        status: import("./enums/employee-profile.enums").ProfileChangeStatus.APPROVED | import("./enums/employee-profile.enums").ProfileChangeStatus.REJECTED;
    }>;
    legacyProcessChangeRequest(requestId: string, req: express.Request, dto: ProcessChangeRequestDto): Promise<{
        message: string;
        requestId: string;
        status: import("./enums/employee-profile.enums").ProfileChangeStatus.APPROVED | import("./enums/employee-profile.enums").ProfileChangeStatus.REJECTED;
    }>;
    deactivateEmployee(employeeId: string, req: express.Request, dto: DeactivateEmployeeDto): Promise<{
        message: string;
        employeeId: string;
        previousStatus: import("./enums/employee-profile.enums").EmployeeStatus;
        newStatus: import("./enums/employee-profile.enums").EmployeeStatus;
        effectiveDate: Date;
    }>;
    assignRoles(employeeId: string, req: express.Request, dto: AssignRolesDto): Promise<{
        message: string;
        employeeId: string;
        roles: SystemRole[];
        permissions: string[];
    }>;
    getEmployeeRoles(employeeId: string): Promise<(import("mongoose").FlattenMaps<{
        employeeProfileId: import("mongoose").Types.ObjectId;
        roles: SystemRole[];
        permissions: string[];
        isActive: boolean;
    }> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | {
        roles: never[];
        permissions: never[];
        isActive: false;
    }>;
    getAuditHistory(employeeId: string, page?: number, limit?: number): Promise<{
        logs: (import("mongoose").FlattenMaps<{
            employeeProfileId: import("mongoose").Types.ObjectId;
            performedByEmployeeId: import("mongoose").Types.ObjectId;
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
            _id: import("mongoose").Types.ObjectId;
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
}
