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
exports.CreateEntitlementDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateEntitlementDto {
    employeeId;
    leaveTypeId;
    yearlyEntitlement;
    accruedActual;
    accruedRounded;
    carryForward;
}
exports.CreateEntitlementDto = CreateEntitlementDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the employee',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEntitlementDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the leave type',
        example: '507f1f77bcf86cd799439012',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEntitlementDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Yearly entitlement in days',
        example: 30,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEntitlementDto.prototype, "yearlyEntitlement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Actual accrued days',
        example: 15,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEntitlementDto.prototype, "accruedActual", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rounded accrued days',
        example: 15,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEntitlementDto.prototype, "accruedRounded", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Carry forward days from previous period',
        example: 5,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEntitlementDto.prototype, "carryForward", void 0);
//# sourceMappingURL=create-entitlement.dto.js.map