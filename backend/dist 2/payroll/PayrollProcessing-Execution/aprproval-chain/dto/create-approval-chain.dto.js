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
exports.CreateApprovalChainDto = void 0;
const class_validator_1 = require("class-validator");
class CreateApprovalChainDto {
    run_id;
    stage;
    status;
    approver_id;
    reason;
    acted_at;
}
exports.CreateApprovalChainDto = CreateApprovalChainDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateApprovalChainDto.prototype, "run_id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['payroll_review', 'payroll_manager', 'finance']),
    __metadata("design:type", String)
], CreateApprovalChainDto.prototype, "stage", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['approved', 'rejected']),
    __metadata("design:type", String)
], CreateApprovalChainDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApprovalChainDto.prototype, "approver_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApprovalChainDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApprovalChainDto.prototype, "acted_at", void 0);
//# sourceMappingURL=create-approval-chain.dto.js.map