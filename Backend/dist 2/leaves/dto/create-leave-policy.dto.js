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
exports.CreateLeavePolicyDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const accrual_method_enum_1 = require("../enums/accrual-method.enum");
const rounding_rule_enum_1 = require("../enums/rounding-rule.enum");
class CreateLeavePolicyDto {
    leaveTypeId;
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
}
exports.CreateLeavePolicyDto = CreateLeavePolicyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the leave type this policy applies to',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLeavePolicyDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Accrual method for this leave type',
        example: 'monthly',
        enum: accrual_method_enum_1.AccrualMethod,
        default: accrual_method_enum_1.AccrualMethod.MONTHLY,
    }),
    (0, class_validator_1.IsEnum)(accrual_method_enum_1.AccrualMethod),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeavePolicyDto.prototype, "accrualMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Monthly accrual rate in days',
        example: 2.5,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "monthlyRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Yearly accrual rate in days',
        example: 30,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "yearlyRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether carry forward is allowed',
        example: true,
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLeavePolicyDto.prototype, "carryForwardAllowed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum days that can be carried forward',
        example: 15,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "maxCarryForward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Number of months after which carried forward leave expires',
        example: 3,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "expiryAfterMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Rounding rule for accrued leave',
        example: 'round',
        enum: rounding_rule_enum_1.RoundingRule,
        default: rounding_rule_enum_1.RoundingRule.NONE,
    }),
    (0, class_validator_1.IsEnum)(rounding_rule_enum_1.RoundingRule),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeavePolicyDto.prototype, "roundingRule", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum notice days required before taking leave',
        example: 3,
        minimum: 0,
        default: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "minNoticeDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum consecutive days allowed for this leave type',
        example: 14,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeavePolicyDto.prototype, "maxConsecutiveDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Eligibility criteria for this leave type',
        example: {
            minTenureMonths: 6,
            positionsAllowed: ['Manager', 'Senior Developer'],
            contractTypesAllowed: ['Full-time', 'Part-time'],
        },
    }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateLeavePolicyDto.prototype, "eligibility", void 0);
//# sourceMappingURL=create-leave-policy.dto.js.map