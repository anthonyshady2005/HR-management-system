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
exports.LeaveEntitlementResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const leave_type_response_dto_1 = require("./leave-type-response.dto");
class LeaveEntitlementResponseDto {
    id;
    employeeId;
    leaveType;
    yearlyEntitlement;
    accruedActual;
    accruedRounded;
    carryForward;
    taken;
    pending;
    remaining;
    lastAccrualDate;
    nextResetDate;
    createdAt;
    updatedAt;
}
exports.LeaveEntitlementResponseDto = LeaveEntitlementResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Entitlement ID',
        example: '507f1f77bcf86cd799439011',
    }),
    __metadata("design:type", String)
], LeaveEntitlementResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employee ID',
        example: '507f1f77bcf86cd799439012',
    }),
    __metadata("design:type", String)
], LeaveEntitlementResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave type details',
        type: () => leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    __metadata("design:type", leave_type_response_dto_1.LeaveTypeResponseDto)
], LeaveEntitlementResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Yearly entitlement',
        example: 30,
    }),
    __metadata("design:type", Number)
], LeaveEntitlementResponseDto.prototype, "yearlyEntitlement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Actual accrued days',
        example: 15,
    }),
    __metadata("design:type", Number)
], LeaveEntitlementResponseDto.prototype, "accruedActual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rounded accrued days',
        example: 15,
    }),
    __metadata("design:type", Number)
], LeaveEntitlementResponseDto.prototype, "accruedRounded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Carry forward days',
        example: 5,
    }),
    __metadata("design:type", Number)
], LeaveEntitlementResponseDto.prototype, "carryForward", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Taken days',
        example: 10,
    }),
    __metadata("design:type", Number)
], LeaveEntitlementResponseDto.prototype, "taken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pending days',
        example: 5,
    }),
    __metadata("design:type", Number)
], LeaveEntitlementResponseDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Remaining days',
        example: 20,
    }),
    __metadata("design:type", Number)
], LeaveEntitlementResponseDto.prototype, "remaining", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last accrual date',
        example: '2024-11-01T00:00:00Z',
    }),
    __metadata("design:type", Date)
], LeaveEntitlementResponseDto.prototype, "lastAccrualDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Next reset date',
        example: '2025-01-01T00:00:00Z',
    }),
    __metadata("design:type", Date)
], LeaveEntitlementResponseDto.prototype, "nextResetDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveEntitlementResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveEntitlementResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=leave-entitlement-response.dto.js.map