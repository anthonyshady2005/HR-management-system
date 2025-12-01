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
exports.PerformanceController = void 0;
const common_1 = require("@nestjs/common");
const performance_service_1 = require("./performance.service");
const CreateAppraisalTemplate_dto_1 = require("./DTOs/CreateAppraisalTemplate.dto");
const appraisal_template_schema_1 = require("./models/appraisal-template.schema");
const CreateAppraisalCycle_dto_1 = require("./DTOs/CreateAppraisalCycle.dto");
const appraisal_cycle_schema_1 = require("./models/appraisal-cycle.schema");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const employee_profile_enums_1 = require("../employee-profile/enums/employee-profile.enums");
const appraisal_assignment_schema_1 = require("./models/appraisal-assignment.schema");
const appraisal_record_schema_1 = require("./models/appraisal-record.schema");
const CreateAppraisalRecord_dto_1 = require("./DTOs/CreateAppraisalRecord.dto");
const UpdateAppraisalRecord_dto_1 = require("./DTOs/UpdateAppraisalRecord.dto");
const appraisal_dispute_schema_1 = require("./models/appraisal-dispute.schema");
const CreateAppraisalDispute_dto_1 = require("./DTOs/CreateAppraisalDispute.dto");
const UpdateAppraisalDispute_dto_1 = require("./DTOs/UpdateAppraisalDispute.dto");
let PerformanceController = class PerformanceController {
    performanceService;
    constructor(performanceService) {
        this.performanceService = performanceService;
    }
    async createAppraisalTemplate(dto) {
        return this.performanceService.createTemplate(dto);
    }
    async getAllTemplates() {
        return this.performanceService.getAllTemplates();
    }
    async createAppraisalCycle(dto) {
        return this.performanceService.createCycle(dto);
    }
    async getAllCycles() {
        return this.performanceService.getAllCycles();
    }
    async assignAppraisalsBulk(dtos) {
        return this.performanceService.assignAppraisalsBulk(dtos);
    }
    async getAssignmentsForManager(managerId) {
        return this.performanceService.getAssignmentsForManager(managerId);
    }
    async getAllAssignments() {
        return this.performanceService.getAllAssignments();
    }
    async createAppraisalRecord(dto) {
        return this.performanceService.createAppraisalRecord(dto);
    }
    async getRecords() {
        return this.performanceService.getRecords();
    }
    async updateAppraisalRecord(recordId, dto) {
        return this.performanceService.updateAppraisalRecord(recordId, dto);
    }
    async getDashboard(cycleId) {
        return this.performanceService.getDashboard(cycleId);
    }
    async getAppraisalProgress(cycleId) {
        return this.performanceService.getAppraisalProgress(cycleId);
    }
    async getEmployeeAppraisals(employeeId) {
        return this.performanceService.getEmployeeAppraisals(employeeId);
    }
    async createAppraisalDispute(dto) {
        return this.performanceService.createAppraisalDispute(dto);
    }
    async updateAppraisalDispute(disputeId, dto) {
        return this.performanceService.updateAppraisalDispute(disputeId, dto);
    }
    async getAllDisputes() {
        return this.performanceService.getAllDisputes();
    }
    async publishAppraisal(recordId, publishedByEmployeeId) {
        return this.performanceService.publishAppraisal(recordId, publishedByEmployeeId);
    }
    async getEmployeeAppraisalHistory(employeeId) {
        return this.performanceService.getEmployeeAppraisalHistory(employeeId);
    }
    async generateAppraisalReport(cycleId) {
        return this.performanceService.generateAppraisalReport(cycleId);
    }
};
exports.PerformanceController = PerformanceController;
__decorate([
    (0, common_1.Post)('template'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new appraisal template' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Appraisal template created successfully', type: appraisal_template_schema_1.AppraisalTemplate }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAppraisalTemplate_dto_1.CreateAppraisalTemplateDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "createAppraisalTemplate", null);
__decorate([
    (0, common_1.Get)('templates'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, swagger_1.ApiOperation)({ summary: 'Get all appraisal templates' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Templates retrieved successfully', type: [appraisal_template_schema_1.AppraisalTemplate] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getAllTemplates", null);
__decorate([
    (0, common_1.Post)('cycle'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new appraisal cycle' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Appraisal cycle created successfully', type: appraisal_cycle_schema_1.AppraisalCycle }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAppraisalCycle_dto_1.CreateAppraisalCycleDTO]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "createAppraisalCycle", null);
__decorate([
    (0, common_1.Get)('cycles'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, swagger_1.ApiOperation)({ summary: 'Get all appraisal cycles' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cycles retrieved successfully', type: [appraisal_cycle_schema_1.AppraisalCycle] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getAllCycles", null);
__decorate([
    (0, common_1.Post)('assignments/bulk'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Assign appraisal templates/cycles to employees and managers in bulk' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Appraisal assignments created successfully', type: [appraisal_cycle_schema_1.AppraisalCycle] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "assignAppraisalsBulk", null);
__decorate([
    (0, common_1.Get)('assignments/manager/:managerId'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, swagger_1.ApiOperation)({ summary: 'Get all appraisal assignments for a specific manager' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appraisal assignments retrieved successfully', type: [appraisal_assignment_schema_1.AppraisalAssignment] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid manager ID' }),
    __param(0, (0, common_1.Param)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getAssignmentsForManager", null);
__decorate([
    (0, common_1.Get)('assignments'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, swagger_1.ApiOperation)({ summary: 'Get all appraisal assignments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assignments retrieved successfully', type: [appraisal_assignment_schema_1.AppraisalAssignment] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getAllAssignments", null);
__decorate([
    (0, common_1.Post)('record'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new appraisal record' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Appraisal record created successfully', type: appraisal_record_schema_1.AppraisalRecord }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAppraisalRecord_dto_1.CreateAppraisalRecordDTO]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "createAppraisalRecord", null);
__decorate([
    (0, common_1.Get)('records'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all appraisal records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of all appraisal records', type: [appraisal_record_schema_1.AppraisalRecord] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getRecords", null);
__decorate([
    (0, common_1.Put)('record/:recordId'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, swagger_1.ApiOperation)({ summary: 'Update an appraisal record' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appraisal record updated successfully', type: appraisal_record_schema_1.AppraisalRecord }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAppraisalRecord_dto_1.UpdateAppraisalRecordDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "updateAppraisalRecord", null);
__decorate([
    (0, common_1.Get)('dashboard/:cycleId'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard data for a specific appraisal cycle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard data retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid cycle ID' }),
    __param(0, (0, common_1.Param)('cycleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('progress/:cycleId'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Monitor appraisal progress and get pending forms for a cycle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appraisal progress retrieved successfully', type: [appraisal_assignment_schema_1.AppraisalAssignment] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid cycle ID' }),
    __param(0, (0, common_1.Param)('cycleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getAppraisalProgress", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/appraisals'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'View final ratings, feedback, and development notes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appraisals retrieved successfully', type: [appraisal_record_schema_1.AppraisalRecord] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid employee ID' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getEmployeeAppraisals", null);
__decorate([
    (0, common_1.Post)('dispute'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Flag or raise a concern about a rating' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dispute created successfully', type: appraisal_dispute_schema_1.AppraisalDispute }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateAppraisalDispute_dto_1.CreateAppraisalDisputeDTO]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "createAppraisalDispute", null);
__decorate([
    (0, common_1.Put)('dispute/:disputeId'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update dispute status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispute updated successfully', type: appraisal_dispute_schema_1.AppraisalDispute }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    __param(0, (0, common_1.Param)('disputeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateAppraisalDispute_dto_1.UpdateAppraisalDisputeDto]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "updateAppraisalDispute", null);
__decorate([
    (0, common_1.Get)('disputes'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all disputes for HR Manager to resolve' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Disputes retrieved successfully', type: [appraisal_dispute_schema_1.AppraisalDispute] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getAllDisputes", null);
__decorate([
    (0, common_1.Post)('record/:recordId/publish'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Publish appraisal and automatically update employee profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appraisal published successfully', type: appraisal_record_schema_1.AppraisalRecord }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid record ID' }),
    __param(0, (0, common_1.Param)('recordId')),
    __param(1, (0, common_1.Body)('publishedByEmployeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "publishAppraisal", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId/history'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Access past appraisal history and multi-cycle trend views' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Appraisal history retrieved successfully', type: [appraisal_record_schema_1.AppraisalRecord] }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid employee ID' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "getEmployeeAppraisalHistory", null);
__decorate([
    (0, common_1.Get)('report/:cycleId'),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Generate and export outcome reports' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Report generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid cycle ID' }),
    __param(0, (0, common_1.Param)('cycleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PerformanceController.prototype, "generateAppraisalReport", null);
exports.PerformanceController = PerformanceController = __decorate([
    (0, swagger_1.ApiTags)('Performance'),
    (0, common_1.Controller)('performance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [performance_service_1.PerformanceService])
], PerformanceController);
//# sourceMappingURL=performance.controller.js.map