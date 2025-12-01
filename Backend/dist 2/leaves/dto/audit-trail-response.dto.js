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
exports.AuditTrailResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class AuditTrailResponseDto {
    adjustmentId;
    employeeId;
    leaveType;
    adjustmentType;
    amount;
    reason;
    hrUserId;
    hrUserName;
    createdAt;
}
exports.AuditTrailResponseDto = AuditTrailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adjustment ID' }),
    __metadata("design:type", String)
], AuditTrailResponseDto.prototype, "adjustmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    __metadata("design:type", String)
], AuditTrailResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave type' }),
    __metadata("design:type", String)
], AuditTrailResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Adjustment type (ADD, DEDUCT, ENCASHMENT)' }),
    __metadata("design:type", String)
], AuditTrailResponseDto.prototype, "adjustmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Amount adjusted' }),
    __metadata("design:type", Number)
], AuditTrailResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for adjustment' }),
    __metadata("design:type", String)
], AuditTrailResponseDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HR user who made the adjustment' }),
    __metadata("design:type", String)
], AuditTrailResponseDto.prototype, "hrUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HR user name' }),
    __metadata("design:type", String)
], AuditTrailResponseDto.prototype, "hrUserName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of adjustment' }),
    __metadata("design:type", Date)
], AuditTrailResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=audit-trail-response.dto.js.map