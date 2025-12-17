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
exports.CreateOfferDto = exports.OfferApproverDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const approval_status_enum_1 = require("../enums/approval-status.enum");
class OfferApproverDto {
    employeeId;
    role;
    status;
    actionDate;
    comment;
}
exports.OfferApproverDto = OfferApproverDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], OfferApproverDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfferApproverDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(approval_status_enum_1.ApprovalStatus),
    __metadata("design:type", String)
], OfferApproverDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], OfferApproverDto.prototype, "actionDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OfferApproverDto.prototype, "comment", void 0);
class CreateOfferDto {
    applicationId;
    candidateId;
    hrEmployeeId;
    grossSalary;
    signingBonus;
    benefits;
    conditions;
    insurances;
    content;
    role;
    deadline;
    approvers;
}
exports.CreateOfferDto = CreateOfferDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "applicationId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "candidateId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "hrEmployeeId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "grossSalary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "signingBonus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "benefits", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "conditions", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "insurances", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "deadline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OfferApproverDto),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "approvers", void 0);
//# sourceMappingURL=create-offer.dto.js.map