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
exports.LeavePolicyResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const leave_type_response_dto_1 = require("./leave-type-response.dto");
class LeavePolicyResponseDto {
    id;
    leaveType;
    accrualMethod;
    monthlyRate;
    yearlyRate;
    carryForwardAllowed;
    maxCarryForward;
    expiryAfterMonths;
    roundingRule;
    minNoticeDays;
    maxConsecutiveDays;
    eligibility;
    createdAt;
    updatedAt;
}
exports.LeavePolicyResponseDto = LeavePolicyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Policy ID',
        example: '507f1f77bcf86cd799439011',
    }),
    __metadata("design:type", String)
], LeavePolicyResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Associated leave type',
        type: () => leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    __metadata("design:type", leave_type_response_dto_1.LeaveTypeResponseDto)
], LeavePolicyResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accrual method',
        example: 'monthly',
    }),
    __metadata("design:type", String)
], LeavePolicyResponseDto.prototype, "accrualMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Monthly accrual rate',
        example: 2.5,
    }),
    __metadata("design:type", Number)
], LeavePolicyResponseDto.prototype, "monthlyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Yearly accrual rate',
        example: 30,
    }),
    __metadata("design:type", Number)
], LeavePolicyResponseDto.prototype, "yearlyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Carry forward allowed',
        example: true,
    }),
    __metadata("design:type", Boolean)
], LeavePolicyResponseDto.prototype, "carryForwardAllowed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Maximum carry forward days',
        example: 15,
    }),
    __metadata("design:type", Number)
], LeavePolicyResponseDto.prototype, "maxCarryForward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Expiry after months',
        example: 3,
    }),
    __metadata("design:type", Number)
], LeavePolicyResponseDto.prototype, "expiryAfterMonths", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Rounding rule',
        example: 'round',
    }),
    __metadata("design:type", String)
], LeavePolicyResponseDto.prototype, "roundingRule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Minimum notice days',
        example: 3,
    }),
    __metadata("design:type", Number)
], LeavePolicyResponseDto.prototype, "minNoticeDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum consecutive days',
        example: 14,
    }),
    __metadata("design:type", Number)
], LeavePolicyResponseDto.prototype, "maxConsecutiveDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Eligibility criteria',
        example: {
            minTenureMonths: 6,
            positionsAllowed: ['Manager'],
            contractTypesAllowed: ['Full-time'],
        },
    }),
    __metadata("design:type", Object)
], LeavePolicyResponseDto.prototype, "eligibility", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeavePolicyResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeavePolicyResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=leave-policy-response.dto.js.map