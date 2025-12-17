import { Model } from 'mongoose';
import { DepartmentDocument } from './models/department.schema';
import { PositionDocument } from './models/position.schema';
import { PositionAssignmentDocument } from './models/position-assignment.schema';
import { EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ReassignPositionDto } from './dto/reassign-position.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { StructureChangeLogService } from './structure-change-log.service';
export declare class OrganizationStructureService {
    private departmentModel;
    private positionModel;
    private positionAssignmentModel;
    private employeeProfileModel;
    private changeLogService;
    constructor(departmentModel: Model<DepartmentDocument>, positionModel: Model<PositionDocument>, positionAssignmentModel: Model<PositionAssignmentDocument>, employeeProfileModel: Model<EmployeeProfileDocument>, changeLogService: StructureChangeLogService);
    createDepartment(dto: CreateDepartmentDto): Promise<DepartmentDocument>;
    updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<DepartmentDocument>;
    createPosition(dto: CreatePositionDto): Promise<PositionDocument>;
    updatePosition(id: string, dto: UpdatePositionDto): Promise<PositionDocument>;
    reassignPosition(id: string, dto: ReassignPositionDto): Promise<PositionDocument>;
    deactivatePosition(id: string): Promise<PositionDocument>;
    getEmployeesByDepartment(departmentId: string): Promise<EmployeeProfileDocument[]>;
    getEmployeesByPosition(positionId: string): Promise<EmployeeProfileDocument[]>;
}
