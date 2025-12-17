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
exports.UpdateEmployeeProfileDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateEmployeeProfileDto {
    firstName;
    lastName;
    email;
    phone;
    employmentStatus;
    positionId;
    systemRoles;
    isActive;
    profilePictureUrl;
}
exports.UpdateEmployeeProfileDto = UpdateEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'First name of the employee',
        example: 'John',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Last name of the employee',
        example: 'Doe',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Work email address',
        example: 'john.doe@company.com',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Phone number', example: '+1234567890' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Employment status',
        enum: ['Active', 'OnProbation', 'Suspended', 'Terminated', 'Resigned'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['Active', 'OnProbation', 'Suspended', 'Terminated', 'Resigned']),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "employmentStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Position ID reference from Organization Structure module',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "positionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'System roles',
        example: ['EMPLOYEE', 'MANAGER'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateEmployeeProfileDto.prototype, "systemRoles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Active status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateEmployeeProfileDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Profile picture URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "profilePictureUrl", void 0);
//# sourceMappingURL=update-employee-profile.dto.js.map