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
exports.TeamBalanceResponseDto = exports.EmployeeBalanceDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class EmployeeBalanceDto {
    leaveType;
    remaining;
    taken;
    pending;
    carryForward;
}
exports.EmployeeBalanceDto = EmployeeBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave type name' }),
    __metadata("design:type", String)
], EmployeeBalanceDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Remaining balance' }),
    __metadata("design:type", Number)
], EmployeeBalanceDto.prototype, "remaining", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Days taken' }),
    __metadata("design:type", Number)
], EmployeeBalanceDto.prototype, "taken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pending days' }),
    __metadata("design:type", Number)
], EmployeeBalanceDto.prototype, "pending", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Carry forward days' }),
    __metadata("design:type", Number)
], EmployeeBalanceDto.prototype, "carryForward", void 0);
class TeamBalanceResponseDto {
    employeeId;
    employeeName;
    employeeNumber;
    balances;
}
exports.TeamBalanceResponseDto = TeamBalanceResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    __metadata("design:type", String)
], TeamBalanceResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee name' }),
    __metadata("design:type", String)
], TeamBalanceResponseDto.prototype, "employeeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee number' }),
    __metadata("design:type", String)
], TeamBalanceResponseDto.prototype, "employeeNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave balances by type',
        type: [EmployeeBalanceDto],
    }),
    __metadata("design:type", Array)
], TeamBalanceResponseDto.prototype, "balances", void 0);
//# sourceMappingURL=team-balance-response.dto.js.map