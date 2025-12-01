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
exports.CreateCalendarDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BlockedPeriodDto {
    from;
    to;
    reason;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date of blocked period',
        example: '2024-12-20',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], BlockedPeriodDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date of blocked period',
        example: '2024-12-31',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], BlockedPeriodDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for blocking this period',
        example: 'Year-end closing',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], BlockedPeriodDto.prototype, "reason", void 0);
class CreateCalendarDto {
    year;
    holidays;
    blockedPeriods;
}
exports.CreateCalendarDto = CreateCalendarDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calendar year', example: 2024 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCalendarDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of holiday IDs from Time Management module',
        type: [String],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCalendarDto.prototype, "holidays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Blocked periods where leave requests are not allowed',
        type: [BlockedPeriodDto],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => BlockedPeriodDto),
    __metadata("design:type", Array)
], CreateCalendarDto.prototype, "blockedPeriods", void 0);
//# sourceMappingURL=create-calendar.dto.js.map