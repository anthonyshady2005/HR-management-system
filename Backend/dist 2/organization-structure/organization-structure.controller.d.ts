import { OrganizationStructureService } from './organization-structure.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ReassignPositionDto } from './dto/reassign-position.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class OrganizationStructureController {
    private readonly organizationStructureService;
    constructor(organizationStructureService: OrganizationStructureService);
    createDepartment(dto: CreateDepartmentDto): Promise<import("mongoose").Document<unknown, {}, import("./models/department.schema").Department, {}, {}> & import("./models/department.schema").Department & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<import("mongoose").Document<unknown, {}, import("./models/department.schema").Department, {}, {}> & import("./models/department.schema").Department & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    createPosition(dto: CreatePositionDto): Promise<import("mongoose").Document<unknown, {}, import("./models/position.schema").Position, {}, {}> & import("./models/position.schema").Position & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updatePosition(id: string, dto: UpdatePositionDto): Promise<import("mongoose").Document<unknown, {}, import("./models/position.schema").Position, {}, {}> & import("./models/position.schema").Position & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    reassignPosition(id: string, dto: ReassignPositionDto): Promise<import("mongoose").Document<unknown, {}, import("./models/position.schema").Position, {}, {}> & import("./models/position.schema").Position & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    deactivatePosition(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/position.schema").Position, {}, {}> & import("./models/position.schema").Position & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getEmployeesByDepartment(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../employee-profile/models/employee-profile.schema").EmployeeProfile, {}, {}> & import("../employee-profile/models/employee-profile.schema").EmployeeProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getEmployeesByPosition(id: string): Promise<(import("mongoose").Document<unknown, {}, import("../employee-profile/models/employee-profile.schema").EmployeeProfile, {}, {}> & import("../employee-profile/models/employee-profile.schema").EmployeeProfile & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
}
