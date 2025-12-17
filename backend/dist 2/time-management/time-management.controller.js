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
exports.TimeManagementController = void 0;
const common_1 = require("@nestjs/common");
const time_management_service_1 = require("./time-management.service");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const employee_profile_enums_1 = require("../employee-profile/enums/employee-profile.enums");
const shift_create_dto_1 = require("./dto/shift-create.dto");
const shift_update_dto_1 = require("./dto/shift-update.dto");
const shift_assignment_create_dto_1 = require("./dto/shift-assignment-create.dto");
const shift_assignment_update_dto_1 = require("./dto/shift-assignment-update.dto");
const schedule_rule_create_dto_1 = require("./dto/schedule-rule-create.dto");
const schedule_rule_update_dto_1 = require("./dto/schedule-rule-update.dto");
const shift_type_create_dto_1 = require("./dto/shift-type-create.dto");
const shift_type_update_dto_1 = require("./dto/shift-type-update.dto");
const mongoose_1 = require("mongoose");
const enums_1 = require("./models/enums");
let TimeManagementController = class TimeManagementController {
    timeManagementService;
    constructor(timeManagementService) {
        this.timeManagementService = timeManagementService;
    }
    assignShiftToEmployee(dto) {
        return this.timeManagementService.assignShiftToEmployee(dto);
    }
    assignShiftToDepartment(departmentId, dto) {
        const deptObjId = new mongoose_1.Types.ObjectId(departmentId);
        return this.timeManagementService.assignShiftToDepartment(deptObjId, dto);
    }
    assignShiftToPosition(positionId, dto) {
        const posObjId = new mongoose_1.Types.ObjectId(positionId);
        return this.timeManagementService.assignShiftToPosition(posObjId, dto);
    }
    updateShiftAssignment(id, dto) {
        return this.timeManagementService.updateShiftAssignment(id, dto);
    }
    expireShiftAssignmentsAutomatically() {
        return this.timeManagementService.expireShiftAssignmentsAutomatically();
    }
    createShiftType(dto) {
        return this.timeManagementService.createShiftType(dto);
    }
    getAllShiftTypes() {
        return this.timeManagementService.getAllShiftTypes();
    }
    updateShiftType(id, dto) {
        return this.timeManagementService.updateShiftType(id, dto);
    }
    deactivateShiftType(id) {
        return this.timeManagementService.deactivateShiftType(id);
    }
    createShift(dto) {
        return this.timeManagementService.createShift(dto);
    }
    getAllShifts() {
        return this.timeManagementService.getAllShifts();
    }
    updateShift(id, dto) {
        return this.timeManagementService.updateShift(id, dto);
    }
    deactivateShift(id) {
        return this.timeManagementService.deactivateShift(id);
    }
    createScheduleRule(dto) {
        return this.timeManagementService.createScheduleRule(dto);
    }
    getAllScheduleRules() {
        return this.timeManagementService.getAllScheduleRules();
    }
    updateScheduleRule(id, dto) {
        return this.timeManagementService.updateScheduleRule(id, dto);
    }
    deactivateScheduleRule(id) {
        return this.timeManagementService.deactivateScheduleRule(id);
    }
    notifyUpcomingShiftExpiry(daysBefore) {
        const days = daysBefore ? Number(daysBefore) : undefined;
        return this.timeManagementService.notifyUpcomingShiftExpiry(days);
    }
    handleShiftExpiryCron() {
        return this.timeManagementService.handleShiftExpiryCron();
    }
    logPunchFromExternalSheet(input) {
        return this.timeManagementService.logPunchFromExternalSheet(input);
    }
    clockIn(employeeIdentifier) {
        return this.timeManagementService.clockIn(employeeIdentifier);
    }
    clockOut(employeeIdentifier) {
        return this.timeManagementService.clockOut(employeeIdentifier);
    }
    correctAttendance(input) {
        return this.timeManagementService.correctAttendance(input);
    }
    syncAttendanceWithPayroll() {
        return this.timeManagementService.runDailyPayrollSync();
    }
    createOvertimeRule(dto) {
        return this.timeManagementService.createOvertimeRule(dto);
    }
    updateOvertimeRule(ruleId, dto) {
        return this.timeManagementService.updateOvertimeRule(new mongoose_1.Types.ObjectId(ruleId), dto);
    }
    approveOvertimeRule(ruleId) {
        return this.timeManagementService.approveOvertimeRule(new mongoose_1.Types.ObjectId(ruleId));
    }
    toggleOvertimeRule(ruleId, activate) {
        return this.timeManagementService.toggleOvertimeRule(new mongoose_1.Types.ObjectId(ruleId), activate);
    }
    listOvertimeRules(filter) {
        return this.timeManagementService.listOvertimeRules(filter);
    }
    createLatenessRule(dto) {
        return this.timeManagementService.createLatenessRule(dto);
    }
    updateLatenessRule(ruleId, dto) {
        return this.timeManagementService.updateLatenessRule(new mongoose_1.Types.ObjectId(ruleId), dto);
    }
    toggleLatenessRule(ruleId, activate) {
        return this.timeManagementService.toggleLatenessRule(new mongoose_1.Types.ObjectId(ruleId), activate);
    }
    listLatenessRules(filter) {
        return this.timeManagementService.listLatenessRules(filter);
    }
    getRepeatedLatenessCount(employeeId, days) {
        const period = days ? Number(days) : 30;
        return this.timeManagementService.countLatenessExceptions(new mongoose_1.Types.ObjectId(employeeId), period);
    }
    async handleRepeatedLatenessManually(input) {
        const attendance = await this.timeManagementService.getAttendanceRecordById(new mongoose_1.Types.ObjectId(input.attendanceRecordId));
        return this.timeManagementService.handleRepeatedLateness(attendance, input.shiftStartTime);
    }
    submitAttendanceCorrectionRequest(dto) {
        return this.timeManagementService.submitAttendanceCorrectionRequest({
            employeeId: new mongoose_1.Types.ObjectId(dto.employeeId),
            attendanceRecordId: new mongoose_1.Types.ObjectId(dto.attendanceRecordId),
            reason: dto.reason,
        });
    }
    getMyCorrectionRequests(employeeId) {
        return this.timeManagementService.getMyCorrectionRequests(new mongoose_1.Types.ObjectId(employeeId));
    }
    async reviewCorrectionRequest(requestId, dto) {
        const allowed = [
            enums_1.CorrectionRequestStatus.APPROVED,
            enums_1.CorrectionRequestStatus.REJECTED,
        ];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException('Invalid status. Only APPROVED or REJECTED are allowed.');
        }
        return this.timeManagementService.reviewCorrectionRequest(new mongoose_1.Types.ObjectId(requestId), dto.status, new mongoose_1.Types.ObjectId(dto.reviewerId));
    }
    getPendingTimeExceptionsForReview(reviewerId) {
        return this.timeManagementService.getPendingTimeExceptionsForReview(new mongoose_1.Types.ObjectId(reviewerId));
    }
    async reviewTimeException(exceptionId, dto) {
        const allowed = [
            enums_1.TimeExceptionStatus.APPROVED,
            enums_1.TimeExceptionStatus.REJECTED,
        ];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException('Invalid status. Only APPROVED or REJECTED are allowed.');
        }
        return this.timeManagementService.reviewTimeException(new mongoose_1.Types.ObjectId(exceptionId), new mongoose_1.Types.ObjectId(dto.reviewerId), dto.status, dto.comment);
    }
    getPendingCorrectionRequests() {
        return this.timeManagementService.getPendingCorrectionRequests();
    }
    async reviewCorrectionRequestWorkflow(requestId, dto) {
        const allowed = [
            enums_1.CorrectionRequestStatus.APPROVED,
            enums_1.CorrectionRequestStatus.REJECTED,
        ];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException('Invalid status. Only APPROVED or REJECTED are allowed.');
        }
        return this.timeManagementService.reviewCorrectionRequestWorkflow(new mongoose_1.Types.ObjectId(requestId), new mongoose_1.Types.ObjectId(dto.reviewerId), dto.status);
    }
    autoEscalateUnresolvedExceptions() {
        return this.timeManagementService.autoEscalateUnresolvedExceptions();
    }
    autoEscalateStaleCorrectionRequestsForPayroll() {
        return this.timeManagementService.autoEscalateStaleCorrectionRequestsForPayroll();
    }
    submitPermissionRequest(dto) {
        return this.timeManagementService.submitPermissionRequest({
            employeeId: new mongoose_1.Types.ObjectId(dto.employeeId),
            attendanceRecordId: new mongoose_1.Types.ObjectId(dto.attendanceRecordId),
            type: dto.type,
            minutesRequested: dto.minutesRequested,
            reason: dto.reason,
        });
    }
    async reviewPermissionRequest(exceptionId, dto) {
        const allowed = [
            enums_1.TimeExceptionStatus.APPROVED,
            enums_1.TimeExceptionStatus.REJECTED,
        ];
        if (!allowed.includes(dto.status)) {
            throw new common_1.BadRequestException('Invalid status. Only APPROVED or REJECTED are allowed.');
        }
        return this.timeManagementService.reviewPermissionRequest(new mongoose_1.Types.ObjectId(exceptionId), new mongoose_1.Types.ObjectId(dto.reviewerId), dto.status, dto.comment);
    }
    getApprovedPermissionsForPayroll(employeeId, start, end) {
        return this.timeManagementService.getApprovedPermissionsForPayroll(new mongoose_1.Types.ObjectId(employeeId), { start: new Date(start), end: new Date(end) });
    }
    autoEscalatePendingPermissions() {
        return this.timeManagementService.autoEscalatePendingPermissions();
    }
    integrateVacationPackages(employeeId, dto) {
        return this.timeManagementService.integrateVacationPackages(new mongoose_1.Types.ObjectId(employeeId), {
            start: new Date(dto.start),
            end: new Date(dto.end),
        });
    }
    createHoliday(dto) {
        return this.timeManagementService.createHoliday({
            type: dto.type,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            name: dto.name,
        });
    }
    applyHolidayRange(employeeId, dto) {
        return this.timeManagementService.applyHolidayRange(new mongoose_1.Types.ObjectId(employeeId), {
            start: new Date(dto.start),
            end: new Date(dto.end),
        });
    }
    escalatePendingRequestsBeforePayroll(dto) {
        return this.timeManagementService.escalatePendingRequestsBeforePayroll(new Date(dto.cutoff));
    }
    async generateOvertimeReport(start, end, exportCsv) {
        return this.timeManagementService.generateOvertimeReport({ start: new Date(start), end: new Date(end) }, exportCsv === 'true');
    }
    async generateExceptionReport(start, end, exportCsv) {
        return this.timeManagementService.generateExceptionReport({ start: new Date(start), end: new Date(end) }, exportCsv === 'true');
    }
    syncCrossModuleData(dto) {
        return this.timeManagementService.syncCrossModuleData({
            start: new Date(dto.start),
            end: new Date(dto.end),
        });
    }
};
exports.TimeManagementController = TimeManagementController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('shift-assignments/employee'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_assignment_create_dto_1.ShiftAssignmentCreateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "assignShiftToEmployee", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('shift-assignments/department/:departmentId'),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_assignment_create_dto_1.ShiftAssignmentCreateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "assignShiftToDepartment", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('shift-assignments/position/:positionId'),
    __param(0, (0, common_1.Param)('positionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_assignment_create_dto_1.ShiftAssignmentCreateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "assignShiftToPosition", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Patch)('shift-assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_assignment_update_dto_1.ShiftAssignmentUpdateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "updateShiftAssignment", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('shift-assignments/expire'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "expireShiftAssignmentsAutomatically", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('shift-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_type_create_dto_1.ShiftTypeCreateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "createShiftType", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Get)('shift-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getAllShiftTypes", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Patch)('shift-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_type_update_dto_1.ShiftTypeUpdateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "updateShiftType", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Delete)('shift-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "deactivateShiftType", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('shifts'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [shift_create_dto_1.ShiftCreateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "createShift", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Get)('shifts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getAllShifts", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Patch)('shifts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, shift_update_dto_1.ShiftUpdateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "updateShift", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Delete)('shifts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "deactivateShift", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('schedule-rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [schedule_rule_create_dto_1.ScheduleRuleCreateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "createScheduleRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Get)('schedule-rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getAllScheduleRules", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Patch)('schedule-rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, schedule_rule_update_dto_1.ScheduleRuleUpdateDTO]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "updateScheduleRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Delete)('schedule-rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "deactivateScheduleRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('shift-assignments/notify-expiry'),
    __param(0, (0, common_1.Query)('daysBefore')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "notifyUpcomingShiftExpiry", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('shift-assignments/expiry-cycle'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "handleShiftExpiryCron", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.PAYROLL_SPECIALIST),
    (0, common_1.Post)('attendance/external-punch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "logPunchFromExternalSheet", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE, employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('attendance/clock-in'),
    __param(0, (0, common_1.Body)('employeeIdentifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "clockIn", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE, employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('attendance/clock-out'),
    __param(0, (0, common_1.Body)('employeeIdentifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "clockOut", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('attendance/manual-corrections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "correctAttendance", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.PAYROLL_SPECIALIST),
    (0, common_1.Post)('attendance/sync/payroll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "syncAttendanceWithPayroll", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('overtime-rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "createOvertimeRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Patch)('overtime-rules/:ruleId'),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "updateOvertimeRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('overtime-rules/:ruleId/approve'),
    __param(0, (0, common_1.Param)('ruleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "approveOvertimeRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('overtime-rules/:ruleId/toggle'),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)('activate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "toggleOvertimeRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.PAYROLL_SPECIALIST),
    (0, common_1.Get)('overtime-rules'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "listOvertimeRules", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('lateness-rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "createLatenessRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Patch)('lateness-rules/:ruleId'),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "updateLatenessRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('lateness-rules/:ruleId/toggle'),
    __param(0, (0, common_1.Param)('ruleId')),
    __param(1, (0, common_1.Body)('activate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "toggleLatenessRule", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.PAYROLL_SPECIALIST),
    (0, common_1.Get)('lateness-rules'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "listLatenessRules", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, common_1.Get)('lateness/repeated/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getRepeatedLatenessCount", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD),
    (0, common_1.Post)('lateness/handle'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimeManagementController.prototype, "handleRepeatedLatenessManually", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('attendance-corrections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "submitAttendanceCorrectionRequest", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)('attendance-corrections/my/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getMyCorrectionRequests", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Patch)('attendance-corrections/:requestId/review'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TimeManagementController.prototype, "reviewCorrectionRequest", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)('time-exceptions/pending/:reviewerId'),
    __param(0, (0, common_1.Param)('reviewerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getPendingTimeExceptionsForReview", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Patch)('time-exceptions/:exceptionId/review'),
    __param(0, (0, common_1.Param)('exceptionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TimeManagementController.prototype, "reviewTimeException", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)('correction-requests/pending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getPendingCorrectionRequests", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Patch)('correction-requests/:requestId/review'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TimeManagementController.prototype, "reviewCorrectionRequestWorkflow", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('time-exceptions/escalate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "autoEscalateUnresolvedExceptions", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('correction-requests/escalate-payroll'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "autoEscalateStaleCorrectionRequestsForPayroll", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_EMPLOYEE, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('permissions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "submitPermissionRequest", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.DEPARTMENT_HEAD, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Patch)('permissions/:exceptionId/review'),
    __param(0, (0, common_1.Param)('exceptionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TimeManagementController.prototype, "reviewPermissionRequest", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.PAYROLL_SPECIALIST, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)('permissions/approved/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "getApprovedPermissionsForPayroll", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('permissions/escalate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "autoEscalatePendingPermissions", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Post)('vacation/integrate/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "integrateVacationPackages", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('holidays'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "createHoliday", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('holidays/apply/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "applyHolidayRange", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN),
    (0, common_1.Post)('escalations/payroll'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "escalatePendingRequestsBeforePayroll", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.PAYROLL_SPECIALIST, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)('reports/overtime'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('exportCsv')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TimeManagementController.prototype, "generateOvertimeReport", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.HR_MANAGER, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.PAYROLL_SPECIALIST, employee_profile_enums_1.SystemRole.SYSTEM_ADMIN),
    (0, common_1.Get)('reports/exceptions'),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('exportCsv')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TimeManagementController.prototype, "generateExceptionReport", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(employee_profile_enums_1.SystemRole.SYSTEM_ADMIN, employee_profile_enums_1.SystemRole.HR_ADMIN, employee_profile_enums_1.SystemRole.HR_MANAGER),
    (0, common_1.Post)('sync/cross-modules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimeManagementController.prototype, "syncCrossModuleData", null);
exports.TimeManagementController = TimeManagementController = __decorate([
    (0, common_1.Controller)('time-management'),
    __metadata("design:paramtypes", [time_management_service_1.TimeManagementService])
], TimeManagementController);
//# sourceMappingURL=time-management.controller.js.map