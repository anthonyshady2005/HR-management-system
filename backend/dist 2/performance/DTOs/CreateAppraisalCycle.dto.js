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
exports.CreateAppraisalCycleDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const performance_enums_1 = require("../enums/performance.enums");
class CycleTemplateAssignmentDTO {
    templateId;
    departmentIds;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CycleTemplateAssignmentDTO.prototype, "templateId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Departments assigned to this template', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CycleTemplateAssignmentDTO.prototype, "departmentIds", void 0);
class CreateAppraisalCycleDTO {
    name;
    description;
    cycleType;
    startDate;
    endDate;
    managerDueDate;
    employeeAcknowledgementDueDate;
    templateAssignments;
    status;
    archivedAt;
    publishedAt;
    closedAt;
}
exports.CreateAppraisalCycleDTO = CreateAppraisalCycleDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the appraisal cycle' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDTO.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Description of the cycle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDTO.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: performance_enums_1.AppraisalTemplateType }),
    (0, class_validator_1.IsEnum)(performance_enums_1.AppraisalTemplateType),
    __metadata("design:type", String)
], CreateAppraisalCycleDTO.prototype, "cycleType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Date }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAppraisalCycleDTO.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: Date }),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAppraisalCycleDTO.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Date }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAppraisalCycleDTO.prototype, "managerDueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Date }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAppraisalCycleDTO.prototype, "employeeAcknowledgementDueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [CycleTemplateAssignmentDTO] }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CycleTemplateAssignmentDTO),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateAppraisalCycleDTO.prototype, "templateAssignments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: performance_enums_1.AppraisalCycleStatus }),
    (0, class_validator_1.IsEnum)(performance_enums_1.AppraisalCycleStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAppraisalCycleDTO.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Date }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAppraisalCycleDTO.prototype, "archivedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Date }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAppraisalCycleDTO.prototype, "publishedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: Date }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateAppraisalCycleDTO.prototype, "closedAt", void 0);
//# sourceMappingURL=CreateAppraisalCycle.dto.js.map