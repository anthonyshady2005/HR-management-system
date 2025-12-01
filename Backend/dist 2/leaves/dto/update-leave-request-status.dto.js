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
exports.UpdateLeaveRequestStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const leave_status_enum_1 = require("../enums/leave-status.enum");
class UpdateLeaveRequestStatusDto {
    status;
    decidedBy;
    role;
}
exports.UpdateLeaveRequestStatusDto = UpdateLeaveRequestStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New status for the leave request',
        example: 'approved',
        enum: leave_status_enum_1.LeaveStatus,
    }),
    (0, class_validator_1.IsEnum)(leave_status_enum_1.LeaveStatus),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateLeaveRequestStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of the user making the decision',
        example: '507f1f77bcf86cd799439014',
    }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateLeaveRequestStatusDto.prototype, "decidedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Role of the approver (Manager, HR)',
        example: 'Manager',
        maxLength: 50,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], UpdateLeaveRequestStatusDto.prototype, "role", void 0);
//# sourceMappingURL=update-leave-request-status.dto.js.map