"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationStructureService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const department_schema_1 = require("./models/department.schema");
const position_schema_1 = require("./models/position.schema");
const position_assignment_schema_1 = require("./models/position-assignment.schema");
const employee_profile_schema_1 = require("../employee-profile/models/employee-profile.schema");
const structure_change_log_service_1 = require("./structure-change-log.service");
const organization_structure_enums_1 = require("./enums/organization-structure.enums");
let OrganizationStructureService = class OrganizationStructureService {
    departmentModel;
    positionModel;
    positionAssignmentModel;
    employeeProfileModel;
    changeLogService;
    constructor(departmentModel, positionModel, positionAssignmentModel, employeeProfileModel, changeLogService) {
        this.departmentModel = departmentModel;
        this.positionModel = positionModel;
        this.positionAssignmentModel = positionAssignmentModel;
        this.employeeProfileModel = employeeProfileModel;
        this.changeLogService = changeLogService;
    }
    async createDepartment(dto) {
        const existingDepartment = await this.departmentModel.findOne({
            code: dto.dep_code,
        });
        if (existingDepartment) {
            throw new common_1.ConflictException(`Department with code ${dto.dep_code} already exists`);
        }
        const departmentData = {
            name: dto.dep_name,
            code: dto.dep_code,
            isActive: dto.status === 'active',
        };
        const department = new this.departmentModel(departmentData);
        const savedDepartment = await department.save();
        const afterSnapshot = savedDepartment.toObject();
        await this.changeLogService.logChange(organization_structure_enums_1.ChangeLogAction.CREATED, 'Department', savedDepartment._id, null, afterSnapshot);
        return savedDepartment;
    }
    async updateDepartment(id, dto) {
        const department = await this.departmentModel.findById(id);
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        const beforeSnapshot = department.toObject();
        if (dto.dep_code && dto.dep_code !== department.code) {
            const existingDepartment = await this.departmentModel.findOne({
                code: dto.dep_code,
            });
            if (existingDepartment) {
                throw new common_1.ConflictException(`Department with code ${dto.dep_code} already exists`);
            }
        }
        const updateData = {};
        if (dto.dep_name !== undefined)
            updateData.name = dto.dep_name;
        if (dto.dep_code !== undefined)
            updateData.code = dto.dep_code;
        if (dto.status !== undefined)
            updateData.isActive = dto.status === 'active';
        const updatedDepartment = await this.departmentModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedDepartment) {
            throw new common_1.NotFoundException(`Department with ID ${id} not found`);
        }
        const afterSnapshot = updatedDepartment.toObject();
        await this.changeLogService.logChange(organization_structure_enums_1.ChangeLogAction.UPDATED, 'Department', updatedDepartment._id, beforeSnapshot, afterSnapshot);
        return updatedDepartment;
    }
    async createPosition(dto) {
        const department = await this.departmentModel.findById(dto.departmentId);
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${dto.departmentId} not found`);
        }
        if (!department.isActive) {
            throw new common_1.BadRequestException(`Department with ID ${dto.departmentId} is not active`);
        }
        if (dto.reportsTo) {
            const reportsToPosition = await this.positionModel.findById(dto.reportsTo);
            if (!reportsToPosition) {
                throw new common_1.NotFoundException(`Position with ID ${dto.reportsTo} not found`);
            }
            if (!reportsToPosition.isActive) {
                throw new common_1.BadRequestException(`Position with ID ${dto.reportsTo} is not active`);
            }
        }
        const existingPosition = await this.positionModel.findOne({
            code: dto.code,
        });
        if (existingPosition) {
            throw new common_1.ConflictException(`Position with code ${dto.code} already exists`);
        }
        const positionData = {
            title: dto.title,
            code: dto.code,
            departmentId: dto.departmentId,
            reportsToPositionId: dto.reportsTo,
            isActive: dto.status === 'active',
        };
        const position = new this.positionModel(positionData);
        const savedPosition = await position.save();
        const afterSnapshot = savedPosition.toObject();
        await this.changeLogService.logChange(organization_structure_enums_1.ChangeLogAction.CREATED, 'Position', savedPosition._id, null, afterSnapshot);
        return savedPosition;
    }
    async updatePosition(id, dto) {
        const position = await this.positionModel.findById(id);
        if (!position) {
            throw new common_1.NotFoundException(`Position with ID ${id} not found`);
        }
        const beforeSnapshot = position.toObject();
        if (dto.departmentId) {
            const department = await this.departmentModel.findById(dto.departmentId);
            if (!department) {
                throw new common_1.NotFoundException(`Department with ID ${dto.departmentId} not found`);
            }
            if (!department.isActive) {
                throw new common_1.BadRequestException(`Department with ID ${dto.departmentId} is not active`);
            }
        }
        if (dto.reportsTo) {
            const reportsToPosition = await this.positionModel.findById(dto.reportsTo);
            if (!reportsToPosition) {
                throw new common_1.NotFoundException(`Position with ID ${dto.reportsTo} not found`);
            }
            if (!reportsToPosition.isActive) {
                throw new common_1.BadRequestException(`Position with ID ${dto.reportsTo} is not active`);
            }
        }
        if (dto.code && dto.code !== position.code) {
            const existingPosition = await this.positionModel.findOne({
                code: dto.code,
            });
            if (existingPosition) {
                throw new common_1.ConflictException(`Position with code ${dto.code} already exists`);
            }
        }
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.code !== undefined)
            updateData.code = dto.code;
        if (dto.departmentId !== undefined)
            updateData.departmentId = dto.departmentId;
        if (dto.reportsTo !== undefined)
            updateData.reportsToPositionId = dto.reportsTo;
        if (dto.status !== undefined)
            updateData.isActive = dto.status === 'active';
        const updatedPosition = await this.positionModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPosition) {
            throw new common_1.NotFoundException(`Position with ID ${id} not found`);
        }
        const afterSnapshot = updatedPosition.toObject();
        await this.changeLogService.logChange(organization_structure_enums_1.ChangeLogAction.UPDATED, 'Position', updatedPosition._id, beforeSnapshot, afterSnapshot);
        return updatedPosition;
    }
    async reassignPosition(id, dto) {
        const position = await this.positionModel.findById(id);
        if (!position) {
            throw new common_1.NotFoundException(`Position with ID ${id} not found`);
        }
        const newDepartment = await this.departmentModel.findById(dto.newDepartmentId);
        if (!newDepartment) {
            throw new common_1.NotFoundException(`Department with ID ${dto.newDepartmentId} not found`);
        }
        if (!newDepartment.isActive) {
            throw new common_1.BadRequestException(`Department with ID ${dto.newDepartmentId} is not active`);
        }
        const beforeSnapshot = position.toObject();
        const updatedPosition = await this.positionModel.findByIdAndUpdate(id, { departmentId: dto.newDepartmentId }, { new: true });
        if (!updatedPosition) {
            throw new common_1.NotFoundException(`Position with ID ${id} not found`);
        }
        const afterSnapshot = updatedPosition.toObject();
        await this.changeLogService.logChange(organization_structure_enums_1.ChangeLogAction.REASSIGNED, 'Position', updatedPosition._id, beforeSnapshot, afterSnapshot);
        return updatedPosition;
    }
    async deactivatePosition(id) {
        const position = await this.positionModel.findById(id);
        if (!position) {
            throw new common_1.NotFoundException(`Position with ID ${id} not found`);
        }
        const activeAssignments = await this.positionAssignmentModel.find({
            positionId: id,
            endDate: null,
        });
        if (activeAssignments.length > 0) {
            const endDate = new Date();
            await this.positionAssignmentModel.updateMany({ positionId: id, endDate: null }, { endDate });
        }
        const beforeSnapshot = position.toObject();
        const updatedPosition = await this.positionModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!updatedPosition) {
            throw new common_1.NotFoundException(`Position with ID ${id} not found`);
        }
        const afterSnapshot = updatedPosition.toObject();
        await this.changeLogService.logChange(organization_structure_enums_1.ChangeLogAction.DEACTIVATED, 'Position', updatedPosition._id, beforeSnapshot, afterSnapshot);
        return updatedPosition;
    }
    async getEmployeesByDepartment(departmentId) {
        const department = await this.departmentModel.findById(departmentId);
        if (!department) {
            throw new common_1.NotFoundException(`Department with ID ${departmentId} not found`);
        }
        const assignments = await this.positionAssignmentModel
            .find({
            departmentId: new mongoose_2.Types.ObjectId(departmentId),
            endDate: null,
        })
            .select('employeeProfileId')
            .lean()
            .exec();
        const employeeIds = [
            ...new Set(assignments.map((assignment) => assignment.employeeProfileId.toString())),
        ].map((id) => new mongoose_2.Types.ObjectId(id));
        const employees = await this.employeeProfileModel
            .find({
            _id: { $in: employeeIds },
        })
            .exec();
        return employees;
    }
    async getEmployeesByPosition(positionId) {
        const position = await this.positionModel.findById(positionId);
        if (!position) {
            throw new common_1.NotFoundException(`Position with ID ${positionId} not found`);
        }
        const assignments = await this.positionAssignmentModel
            .find({
            positionId: new mongoose_2.Types.ObjectId(positionId),
            endDate: null,
        })
            .select('employeeProfileId')
            .lean()
            .exec();
        const employeeIds = [
            ...new Set(assignments.map((assignment) => assignment.employeeProfileId.toString())),
        ].map((id) => new mongoose_2.Types.ObjectId(id));
        const employees = await this.employeeProfileModel
            .find({
            _id: { $in: employeeIds },
        })
            .exec();
        return employees;
    }
};
exports.OrganizationStructureService = OrganizationStructureService;
exports.OrganizationStructureService = OrganizationStructureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(1, (0, mongoose_1.InjectModel)(position_schema_1.Position.name)),
    __param(2, (0, mongoose_1.InjectModel)(position_assignment_schema_1.PositionAssignment.name)),
    __param(3, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        structure_change_log_service_1.StructureChangeLogService])
], OrganizationStructureService);
//# sourceMappingURL=organization-structure.service.js.map