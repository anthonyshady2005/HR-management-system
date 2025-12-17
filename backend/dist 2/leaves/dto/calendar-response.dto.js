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
exports.CalendarResponseDto = exports.BlockedPeriodResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class BlockedPeriodResponseDto {
    from;
    to;
    reason;
}
exports.BlockedPeriodResponseDto = BlockedPeriodResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date of blocked period' }),
    __metadata("design:type", Date)
], BlockedPeriodResponseDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date of blocked period' }),
    __metadata("design:type", Date)
], BlockedPeriodResponseDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for blocking this period' }),
    __metadata("design:type", String)
], BlockedPeriodResponseDto.prototype, "reason", void 0);
class CalendarResponseDto {
    id;
    year;
    holidays;
    blockedPeriods;
    createdAt;
    updatedAt;
}
exports.CalendarResponseDto = CalendarResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calendar ID' }),
    __metadata("design:type", String)
], CalendarResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calendar year' }),
    __metadata("design:type", Number)
], CalendarResponseDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of holiday IDs', type: [String] }),
    __metadata("design:type", Array)
], CalendarResponseDto.prototype, "holidays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Blocked periods',
        type: [BlockedPeriodResponseDto],
    }),
    __metadata("design:type", Array)
], CalendarResponseDto.prototype, "blockedPeriods", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], CalendarResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    __metadata("design:type", Date)
], CalendarResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=calendar-response.dto.js.map