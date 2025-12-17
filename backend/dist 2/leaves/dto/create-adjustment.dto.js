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
exports.CreateAdjustmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const adjustment_type_enum_1 = require("../enums/adjustment-type.enum");
class CreateAdjustmentDto {
    employeeId;
    leaveTypeId;
    adjustmentType;
    amount;
    reason;
    hrUserId;
}
exports.CreateAdjustmentDto = CreateAdjustmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the employee',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAdjustmentDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the leave type',
        example: '507f1f77bcf86cd799439012',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAdjustmentDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of adjustment',
        example: 'add',
        enum: adjustment_type_enum_1.AdjustmentType,
    }),
    (0, class_validator_1.IsEnum)(adjustment_type_enum_1.AdjustmentType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAdjustmentDto.prototype, "adjustmentType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount of days to adjust',
        example: 5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateAdjustmentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for the adjustment',
        example: 'Compensation for overtime work',
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateAdjustmentDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the HR user making the adjustment',
        example: '507f1f77bcf86cd799439013',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAdjustmentDto.prototype, "hrUserId", void 0);
//# sourceMappingURL=create-adjustment.dto.js.map