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
exports.CreateLeaveTypeDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const attachment_type_enum_1 = require("../enums/attachment-type.enum");
class CreateLeaveTypeDto {
    code;
    name;
    categoryId;
    description;
    paid;
    deductible;
    requiresAttachment;
    attachmentType;
    minTenureMonths;
    maxDurationDays;
}
exports.CreateLeaveTypeDto = CreateLeaveTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique code for the leave type',
        example: 'ANN',
        maxLength: 10,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(10),
    __metadata("design:type", String)
], CreateLeaveTypeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Name of the leave type',
        example: 'Annual Leave',
        maxLength: 100,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateLeaveTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the leave category',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLeaveTypeDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Description of the leave type',
        example: 'Annual vacation leave for employees',
        maxLength: 500,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateLeaveTypeDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether this leave type is paid',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLeaveTypeDto.prototype, "paid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether this leave is deductible from balance',
        example: true,
        default: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLeaveTypeDto.prototype, "deductible", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether this leave type requires attachment',
        example: false,
        default: false,
    }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateLeaveTypeDto.prototype, "requiresAttachment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of attachment required',
        example: 'medical',
        enum: attachment_type_enum_1.AttachmentType,
    }),
    (0, class_validator_1.IsEnum)(attachment_type_enum_1.AttachmentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateLeaveTypeDto.prototype, "attachmentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum tenure in months required for this leave',
        example: 6,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeaveTypeDto.prototype, "minTenureMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum duration in days for this leave type',
        example: 30,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateLeaveTypeDto.prototype, "maxDurationDays", void 0);
//# sourceMappingURL=create-leave-type.dto.js.map