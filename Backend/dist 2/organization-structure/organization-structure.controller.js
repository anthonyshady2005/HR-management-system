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
exports.OrganizationStructureController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const organization_structure_service_1 = require("./organization-structure.service");
const create_position_dto_1 = require("./dto/create-position.dto");
const update_position_dto_1 = require("./dto/update-position.dto");
const reassign_position_dto_1 = require("./dto/reassign-position.dto");
const create_department_dto_1 = require("./dto/create-department.dto");
const update_department_dto_1 = require("./dto/update-department.dto");
let OrganizationStructureController = class OrganizationStructureController {
    organizationStructureService;
    constructor(organizationStructureService) {
        this.organizationStructureService = organizationStructureService;
    }
    async createDepartment(dto) {
        return await this.organizationStructureService.createDepartment(dto);
    }
    async updateDepartment(id, dto) {
        return await this.organizationStructureService.updateDepartment(id, dto);
    }
    async createPosition(dto) {
        return await this.organizationStructureService.createPosition(dto);
    }
    async updatePosition(id, dto) {
        return await this.organizationStructureService.updatePosition(id, dto);
    }
    async reassignPosition(id, dto) {
        return await this.organizationStructureService.reassignPosition(id, dto);
    }
    async deactivatePosition(id) {
        return await this.organizationStructureService.deactivatePosition(id);
    }
    async getEmployeesByDepartment(id) {
        return await this.organizationStructureService.getEmployeesByDepartment(id);
    }
    async getEmployeesByPosition(id) {
        return await this.organizationStructureService.getEmployeesByPosition(id);
    }
};
exports.OrganizationStructureController = OrganizationStructureController;
__decorate([
    (0, common_1.Post)('departments'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new department' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Department created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Department code already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_department_dto_1.CreateDepartmentDto]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "createDepartment", null);
__decorate([
    (0, common_1.Patch)('departments/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update department attributes' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Department updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Department code already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_department_dto_1.UpdateDepartmentDto]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "updateDepartment", null);
__decorate([
    (0, common_1.Post)('positions'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new position' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Position created successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Position code already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_position_dto_1.CreatePositionDto]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "createPosition", null);
__decorate([
    (0, common_1.Patch)('positions/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update position attributes' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Position updated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Position code already exists' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_position_dto_1.UpdatePositionDto]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "updatePosition", null);
__decorate([
    (0, common_1.Patch)('positions/:id/reassign'),
    (0, swagger_1.ApiOperation)({ summary: 'Reassign position to a different department' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Position reassigned successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position or department not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Department is not active' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reassign_position_dto_1.ReassignPositionDto]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "reassignPosition", null);
__decorate([
    (0, common_1.Patch)('positions/:id/deactivate'),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a position' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Position deactivated successfully',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "deactivatePosition", null);
__decorate([
    (0, common_1.Get)('departments/:id/employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all employees by department' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of employees in the department',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Department not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "getEmployeesByDepartment", null);
__decorate([
    (0, common_1.Get)('positions/:id/employees'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all employees by position' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of employees in the position',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrganizationStructureController.prototype, "getEmployeesByPosition", null);
exports.OrganizationStructureController = OrganizationStructureController = __decorate([
    (0, swagger_1.ApiTags)('Organization Structure'),
    (0, common_1.Controller)('organization-structure'),
    __metadata("design:paramtypes", [organization_structure_service_1.OrganizationStructureService])
], OrganizationStructureController);
//# sourceMappingURL=organization-structure.controller.js.map