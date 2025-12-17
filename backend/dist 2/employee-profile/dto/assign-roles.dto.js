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
exports.AssignRolesDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const employee_profile_enums_1 = require("../enums/employee-profile.enums");
class AssignRolesDto {
    roles;
    permissions;
    isActive;
    reason;
}
exports.AssignRolesDto = AssignRolesDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: employee_profile_enums_1.SystemRole,
        isArray: true,
        description: 'System roles to assign to the employee',
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AssignRolesDto.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional permissions to grant',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], AssignRolesDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the role assignment is active',
        default: true,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], AssignRolesDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reason for role assignment change' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AssignRolesDto.prototype, "reason", void 0);
//# sourceMappingURL=assign-roles.dto.js.map