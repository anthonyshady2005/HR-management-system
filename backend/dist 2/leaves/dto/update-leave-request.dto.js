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
exports.UpdateLeaveRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateLeaveRequestDto {
    fromDate;
    toDate;
    durationDays;
    justification;
    attachmentId;
}
exports.UpdateLeaveRequestDto = UpdateLeaveRequestDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated start date',
        example: '2024-12-01',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateLeaveRequestDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated end date',
        example: '2024-12-05',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateLeaveRequestDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Updated duration in days', example: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateLeaveRequestDto.prototype, "durationDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Updated justification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeaveRequestDto.prototype, "justification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Updated attachment ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeaveRequestDto.prototype, "attachmentId", void 0);
//# sourceMappingURL=update-leave-request.dto.js.map