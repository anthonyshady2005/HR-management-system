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
exports.EncashmentResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class EncashmentResponseDto {
    employeeId;
    leaveType;
    unusedDays;
    dailySalaryRate;
    encashmentAmount;
    formula;
}
exports.EncashmentResponseDto = EncashmentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    __metadata("design:type", String)
], EncashmentResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave type' }),
    __metadata("design:type", String)
], EncashmentResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unused leave days (capped at 30)' }),
    __metadata("design:type", Number)
], EncashmentResponseDto.prototype, "unusedDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Daily salary rate' }),
    __metadata("design:type", Number)
], EncashmentResponseDto.prototype, "dailySalaryRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total encashment amount' }),
    __metadata("design:type", Number)
], EncashmentResponseDto.prototype, "encashmentAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calculation formula used' }),
    __metadata("design:type", String)
], EncashmentResponseDto.prototype, "formula", void 0);
//# sourceMappingURL=encashment-response.dto.js.map