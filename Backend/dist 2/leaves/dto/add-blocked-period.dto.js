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
exports.AddBlockedPeriodDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class AddBlockedPeriodDto {
    from;
    to;
    reason;
}
exports.AddBlockedPeriodDto = AddBlockedPeriodDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date of blocked period',
        example: '2024-12-20',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], AddBlockedPeriodDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date of blocked period',
        example: '2024-12-31',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Date)
], AddBlockedPeriodDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for blocking this period',
        example: 'Year-end closing',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AddBlockedPeriodDto.prototype, "reason", void 0);
//# sourceMappingURL=add-blocked-period.dto.js.map