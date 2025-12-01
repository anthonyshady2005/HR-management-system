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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveRequestQueryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const leave_status_enum_1 = require("../enums/leave-status.enum");
class LeaveRequestQueryDto {
    employeeId;
    leaveTypeId;
    status;
    startDate;
    endDate;
    departmentId;
    sortBy;
    sortOrder;
}
exports.LeaveRequestQueryDto = LeaveRequestQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by employee ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by leave type ID',
        example: '507f1f77bcf86cd799439012',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by status',
        example: 'pending',
        enum: leave_status_enum_1.LeaveStatus,
    }),
    (0, class_validator_1.IsEnum)(leave_status_enum_1.LeaveStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by start date (YYYY-MM-DD)',
        example: '2024-01-01',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by end date (YYYY-MM-DD)',
        example: '2024-12-31',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Filter by department ID (matches employee primaryDepartmentId)',
        example: '507f1f77bcf86cd799439099',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort by field',
        example: 'dates.from',
        enum: ['dates.from', 'createdAt'],
    }),
    (0, class_validator_1.IsIn)(['dates.from', 'createdAt']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc'],
    }),
    (0, class_validator_1.IsIn)(['asc', 'desc']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], LeaveRequestQueryDto.prototype, "sortOrder", void 0);
//# sourceMappingURL=leave-request-query.dto.js.map