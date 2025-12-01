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
exports.HrUpdateEmployeeProfileDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const employee_profile_enums_1 = require("../enums/employee-profile.enums");
class AddressDto {
    city;
    streetAddress;
    country;
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "country", void 0);
class HrUpdateEmployeeProfileDto {
    firstName;
    middleName;
    lastName;
    nationalId;
    gender;
    maritalStatus;
    dateOfBirth;
    personalEmail;
    workEmail;
    mobilePhone;
    homePhone;
    address;
    profilePictureUrl;
    biography;
    employeeNumber;
    dateOfHire;
    contractStartDate;
    contractEndDate;
    contractType;
    workType;
    status;
    statusEffectiveFrom;
    primaryPositionId;
    primaryDepartmentId;
    supervisorPositionId;
    payGradeId;
    changeReason;
}
exports.HrUpdateEmployeeProfileDto = HrUpdateEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "middleName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "nationalId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_profile_enums_1.Gender),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "gender", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_profile_enums_1.MaritalStatus),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "maritalStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], HrUpdateEmployeeProfileDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "personalEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "workEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "mobilePhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "homePhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], HrUpdateEmployeeProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "profilePictureUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "biography", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "employeeNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], HrUpdateEmployeeProfileDto.prototype, "dateOfHire", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], HrUpdateEmployeeProfileDto.prototype, "contractStartDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], HrUpdateEmployeeProfileDto.prototype, "contractEndDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: employee_profile_enums_1.ContractType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_profile_enums_1.ContractType),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "contractType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: employee_profile_enums_1.WorkType }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_profile_enums_1.WorkType),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "workType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: employee_profile_enums_1.EmployeeStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(employee_profile_enums_1.EmployeeStatus),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], HrUpdateEmployeeProfileDto.prototype, "statusEffectiveFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "primaryPositionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "primaryDepartmentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "supervisorPositionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "payGradeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for this update (for audit trail)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HrUpdateEmployeeProfileDto.prototype, "changeReason", void 0);
//# sourceMappingURL=hr-update-employee-profile.dto.js.map