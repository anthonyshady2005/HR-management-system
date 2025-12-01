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
exports.LeaveTypeResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const leave_category_response_dto_1 = require("./leave-category-response.dto");
class LeaveTypeResponseDto {
    id;
    code;
    name;
    category;
    description;
    paid;
    deductible;
    requiresAttachment;
    attachmentType;
    minTenureMonths;
    maxDurationDays;
    createdAt;
    updatedAt;
}
exports.LeaveTypeResponseDto = LeaveTypeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave Type ID',
        example: '507f1f77bcf86cd799439011',
    }),
    __metadata("design:type", String)
], LeaveTypeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave type code',
        example: 'ANN',
    }),
    __metadata("design:type", String)
], LeaveTypeResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave type name',
        example: 'Annual Leave',
    }),
    __metadata("design:type", String)
], LeaveTypeResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Associated leave category',
        type: () => leave_category_response_dto_1.LeaveCategoryResponseDto,
    }),
    __metadata("design:type", leave_category_response_dto_1.LeaveCategoryResponseDto)
], LeaveTypeResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Leave type description',
        example: 'Annual vacation leave for employees',
    }),
    __metadata("design:type", String)
], LeaveTypeResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this leave is paid',
        example: true,
    }),
    __metadata("design:type", Boolean)
], LeaveTypeResponseDto.prototype, "paid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this leave is deductible',
        example: true,
    }),
    __metadata("design:type", Boolean)
], LeaveTypeResponseDto.prototype, "deductible", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether attachment is required',
        example: false,
    }),
    __metadata("design:type", Boolean)
], LeaveTypeResponseDto.prototype, "requiresAttachment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Type of attachment required',
        example: 'medical',
    }),
    __metadata("design:type", String)
], LeaveTypeResponseDto.prototype, "attachmentType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum tenure required in months',
        example: 6,
    }),
    __metadata("design:type", Number)
], LeaveTypeResponseDto.prototype, "minTenureMonths", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum duration in days',
        example: 30,
    }),
    __metadata("design:type", Number)
], LeaveTypeResponseDto.prototype, "maxDurationDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveTypeResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveTypeResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=leave-type-response.dto.js.map