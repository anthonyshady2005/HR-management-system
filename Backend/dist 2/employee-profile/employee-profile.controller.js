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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeProfileController = void 0;
const common_1 = require("@nestjs/common");
const employee_profile_service_1 = require("./employee-profile.service");
const update_self_profile_dto_1 = require("./dto/update-self-profile.dto");
const create_change_request_dto_1 = require("./dto/create-change-request.dto");
const search_employee_dto_1 = require("./dto/search-employee.dto");
const hr_update_employee_profile_dto_1 = require("./dto/hr-update-employee-profile.dto");
const process_change_request_dto_1 = require("./dto/process-change-request.dto");
const deactivate_employee_dto_1 = require("./dto/deactivate-employee.dto");
const assign_roles_dto_1 = require("./dto/assign-roles.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const active_employee_guard_1 = require("./guards/active-employee.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const employee_profile_enums_1 = require("./enums/employee-profile.enums");
const express_1 = __importDefault(require("express"));
let EmployeeProfileController = class EmployeeProfileController {
    profileService;
    constructor(profileService) {
        this.profileService = profileService;
    }
    getMe(req) {
        const userId = req.user?.sub;
        return this.profileService.getMyProfile(userId);
    }
    updateMe(req, dto) {
        const userId = req.user?.sub;
        return this.profileService.updateSelfProfile(userId, dto);
    }
    submitChangeRequest(req, dto) {
        const userId = req.user?.sub;
        return this.profileService.submitChangeRequest(userId, dto);
    }
    getTeamMembers(req) {
        const userId = req.user?.sub;
        return this.profileService.getTeamMembers(userId);
    }
    getTeamSummary(req) {
        const userId = req.user?.sub;
        return this.profileService.getTeamSummary(userId);
    }
    searchEmployees(dto) {
        return this.profileService.searchEmployees(dto);
    }
    getEmployeeById(employeeId) {
        return this.profileService.getEmployeeById(employeeId);
    }
    hrUpdateEmployee(employeeId, req, dto) {
        const hrAdminId = req.user?.sub;
        return this.profileService.hrUpdateEmployeeProfile(employeeId, hrAdminId, dto);
    }
    getPendingChangeRequests(page, limit) {
        return this.profileService.getPendingChangeRequests(page || 1, limit || 20);
    }
    processChangeRequest(requestId, req, dto) {
        const hrAdminId = req.user?.sub;
        return this.profileService.processChangeRequest(requestId, hrAdminId, dto);
    }
    legacyProcessChangeRequest(requestId, req, dto) {
        const hrAdminId = req.user?.sub;
        return this.profileService.processChangeRequest(requestId, hrAdminId, dto);
    }
    deactivateEmployee(employeeId, req, dto) {
        const hrAdminId = req.user?.sub;
        return this.profileService.deactivateEmployee(employeeId, hrAdminId, dto);
    }
    assignRoles(employeeId, req, dto) {
        const hrAdminId = req.user?.sub;
        return this.profileService.assignRoles(employeeId, hrAdminId, dto);
    }
    getEmployeeRoles(employeeId) {
        return this.profileService.getEmployeeRoles(employeeId);
    }
    getAuditHistory(employeeId, page, limit) {
        return this.profileService.getAuditHistory(employeeId, page || 1, limit || 50);
    }
};
exports.EmployeeProfileController = EmployeeProfileController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_employee_guard_1.ActiveEmployeeGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "getMe", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_employee_guard_1.ActiveEmployeeGuard),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_self_profile_dto_1.UpdateSelfEmployeeProfileDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "updateMe", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, active_employee_guard_1.ActiveEmployeeGuard),
    (0, common_1.Post)('me/change-requests'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_change_request_dto_1.CreateChangeRequestDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "submitChangeRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, common_1.Get)('manager/team'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "getTeamMembers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, common_1.Get)('manager/team/summary'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "getTeamSummary", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_EMPLOYEE),
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_employee_dto_1.SearchEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "searchEmployees", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, common_1.Get)(':employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "getEmployeeById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Patch)(':employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, hr_update_employee_profile_dto_1.HrUpdateEmployeeProfileDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "hrUpdateEmployee", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, common_1.Get)('change-requests/pending'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "getPendingChangeRequests", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, common_1.Patch)('change-requests/:requestId/process'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, process_change_request_dto_1.ProcessChangeRequestDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "processChangeRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, common_1.Put)('change-requests/:requestId'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, process_change_request_dto_1.ProcessChangeRequestDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "legacyProcessChangeRequest", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)(':employeeId/deactivate'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, deactivate_employee_dto_1.DeactivateEmployeeDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "deactivateEmployee", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)(':employeeId/roles'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, assign_roles_dto_1.AssignRolesDto]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "assignRoles", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)(':employeeId/roles'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "getEmployeeRoles", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)(':employeeId/audit-history'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], EmployeeProfileController.prototype, "getAuditHistory", null);
exports.EmployeeProfileController = EmployeeProfileController = __decorate([
    (0, common_1.Controller)('employee-profile'),
    __metadata("design:paramtypes", [employee_profile_service_1.EmployeeProfileService])
], EmployeeProfileController);
//# sourceMappingURL=employee-profile.controller.js.map