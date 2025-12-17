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
exports.SubmitLeaveRequestDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class LeaveDateRangeDto {
    from;
    to;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave start date',
        example: '2024-12-01',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], LeaveDateRangeDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave end date',
        example: '2024-12-05',
    }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], LeaveDateRangeDto.prototype, "to", void 0);
class SubmitLeaveRequestDto {
    employeeId;
    leaveTypeId;
    dates;
    durationDays;
    justification;
    attachmentId;
}
exports.SubmitLeaveRequestDto = SubmitLeaveRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the employee requesting leave',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitLeaveRequestDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the leave type',
        example: '507f1f77bcf86cd799439012',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SubmitLeaveRequestDto.prototype, "leaveTypeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave date range',
        type: LeaveDateRangeDto,
    }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => LeaveDateRangeDto),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", LeaveDateRangeDto)
], SubmitLeaveRequestDto.prototype, "dates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Duration of leave in days',
        example: 5,
        minimum: 0.5,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.5),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], SubmitLeaveRequestDto.prototype, "durationDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Justification for the leave request',
        example: 'Family vacation',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], SubmitLeaveRequestDto.prototype, "justification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the attachment document (if required)',
        example: '507f1f77bcf86cd799439013',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SubmitLeaveRequestDto.prototype, "attachmentId", void 0);
//# sourceMappingURL=submit-leave-request.dto.js.map