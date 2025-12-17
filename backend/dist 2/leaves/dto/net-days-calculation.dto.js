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
exports.NetDaysResponseDto = exports.NetDaysCalculationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class NetDaysCalculationDto {
    employeeId;
    from;
    to;
}
exports.NetDaysCalculationDto = NetDaysCalculationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employee ID',
        example: '507f1f77bcf86cd799439011',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], NetDaysCalculationDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date', example: '2024-12-01' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], NetDaysCalculationDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date', example: '2024-12-10' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], NetDaysCalculationDto.prototype, "to", void 0);
class NetDaysResponseDto {
    totalDays;
    weekendsExcluded;
    holidaysExcluded;
    netDays;
    holidayDates;
}
exports.NetDaysResponseDto = NetDaysResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total calendar days' }),
    __metadata("design:type", Number)
], NetDaysResponseDto.prototype, "totalDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of weekends excluded' }),
    __metadata("design:type", Number)
], NetDaysResponseDto.prototype, "weekendsExcluded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of holidays excluded' }),
    __metadata("design:type", Number)
], NetDaysResponseDto.prototype, "holidaysExcluded", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Net working days (leave duration)' }),
    __metadata("design:type", Number)
], NetDaysResponseDto.prototype, "netDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of holidays in the period',
        type: [String],
    }),
    __metadata("design:type", Array)
], NetDaysResponseDto.prototype, "holidayDates", void 0);
//# sourceMappingURL=net-days-calculation.dto.js.map