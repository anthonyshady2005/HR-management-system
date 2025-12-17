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
exports.UpdateBalanceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateBalanceDto {
    yearlyEntitlement;
    accruedActual;
    accruedRounded;
    carryForward;
    taken;
    pending;
}
exports.UpdateBalanceDto = UpdateBalanceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated yearly entitlement',
        example: 30,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "yearlyEntitlement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated actual accrued days',
        example: 15,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "accruedActual", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated rounded accrued days',
        example: 15,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "accruedRounded", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated carry forward days',
        example: 5,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "carryForward", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated taken days',
        example: 10,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "taken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated pending days',
        example: 5,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateBalanceDto.prototype, "pending", void 0);
//# sourceMappingURL=update-balance.dto.js.map