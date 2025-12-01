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
exports.LeaveAdjustmentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const leave_type_response_dto_1 = require("./leave-type-response.dto");
class LeaveAdjustmentResponseDto {
    id;
    employeeId;
    leaveType;
    adjustmentType;
    amount;
    reason;
    hrUserId;
    createdAt;
    updatedAt;
}
exports.LeaveAdjustmentResponseDto = LeaveAdjustmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Adjustment ID',
        example: '507f1f77bcf86cd799439011',
    }),
    __metadata("design:type", String)
], LeaveAdjustmentResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employee ID',
        example: '507f1f77bcf86cd799439012',
    }),
    __metadata("design:type", String)
], LeaveAdjustmentResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave type details',
        type: () => leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    __metadata("design:type", leave_type_response_dto_1.LeaveTypeResponseDto)
], LeaveAdjustmentResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of adjustment',
        example: 'add',
    }),
    __metadata("design:type", String)
], LeaveAdjustmentResponseDto.prototype, "adjustmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount adjusted',
        example: 5,
    }),
    __metadata("design:type", Number)
], LeaveAdjustmentResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for adjustment',
        example: 'Compensation for overtime work',
    }),
    __metadata("design:type", String)
], LeaveAdjustmentResponseDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'HR user who made the adjustment',
        example: '507f1f77bcf86cd799439013',
    }),
    __metadata("design:type", String)
], LeaveAdjustmentResponseDto.prototype, "hrUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveAdjustmentResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveAdjustmentResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=leave-adjustment-response.dto.js.map