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
exports.BalanceSummaryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const leave_type_response_dto_1 = require("./leave-type-response.dto");
class BalanceSummaryResponseDto {
    leaveType;
    yearlyEntitlement;
    carryForward;
    totalAvailable;
    taken;
    pending;
    accruedActual;
    accruedRounded;
    remaining;
    lastAccrualDate;
    nextResetDate;
}
exports.BalanceSummaryResponseDto = BalanceSummaryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave type details',
        type: () => leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    __metadata("design:type", leave_type_response_dto_1.LeaveTypeResponseDto)
], BalanceSummaryResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Yearly entitlement',
        example: 30,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "yearlyEntitlement", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Carry forward from previous period',
        example: 5,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "carryForward", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total available days',
        example: 35,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "totalAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days taken',
        example: 10,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "taken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days pending approval',
        example: 5,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accrued days (actual, pre-rounding)',
        example: 12.4,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "accruedActual", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accrued days (rounded)',
        example: 12,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "accruedRounded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Days remaining',
        example: 20,
    }),
    __metadata("design:type", Number)
], BalanceSummaryResponseDto.prototype, "remaining", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last accrual date',
        example: '2024-11-01T00:00:00Z',
    }),
    __metadata("design:type", Date)
], BalanceSummaryResponseDto.prototype, "lastAccrualDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Next reset date',
        example: '2025-01-01T00:00:00Z',
    }),
    __metadata("design:type", Date)
], BalanceSummaryResponseDto.prototype, "nextResetDate", void 0);
//# sourceMappingURL=balance-summary-response.dto.js.map