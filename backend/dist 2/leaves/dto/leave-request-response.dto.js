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
exports.LeaveRequestResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const leave_type_response_dto_1 = require("./leave-type-response.dto");
class ApprovalFlowItemDto {
    role;
    status;
    decidedBy;
    decidedAt;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role in approval flow',
        example: 'Manager',
    }),
    __metadata("design:type", String)
], ApprovalFlowItemDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Status of this approval step',
        example: 'pending',
    }),
    __metadata("design:type", String)
], ApprovalFlowItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID of user who decided',
        example: '507f1f77bcf86cd799439014',
    }),
    __metadata("design:type", String)
], ApprovalFlowItemDto.prototype, "decidedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Decision timestamp',
        example: '2024-11-16T14:30:00Z',
    }),
    __metadata("design:type", Date)
], ApprovalFlowItemDto.prototype, "decidedAt", void 0);
class LeaveRequestResponseDto {
    id;
    employeeId;
    leaveType;
    dates;
    durationDays;
    justification;
    attachmentId;
    approvalFlow;
    status;
    irregularPatternFlag;
    createdAt;
    updatedAt;
}
exports.LeaveRequestResponseDto = LeaveRequestResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave request ID',
        example: '507f1f77bcf86cd799439011',
    }),
    __metadata("design:type", String)
], LeaveRequestResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Employee ID',
        example: '507f1f77bcf86cd799439012',
    }),
    __metadata("design:type", String)
], LeaveRequestResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave type details',
        type: () => leave_type_response_dto_1.LeaveTypeResponseDto,
    }),
    __metadata("design:type", leave_type_response_dto_1.LeaveTypeResponseDto)
], LeaveRequestResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Leave date range',
        example: { from: '2024-12-01', to: '2024-12-05' },
    }),
    __metadata("design:type", Object)
], LeaveRequestResponseDto.prototype, "dates", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Duration in days',
        example: 5,
    }),
    __metadata("design:type", Number)
], LeaveRequestResponseDto.prototype, "durationDays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Justification provided',
        example: 'Family vacation',
    }),
    __metadata("design:type", String)
], LeaveRequestResponseDto.prototype, "justification", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Attachment ID',
        example: '507f1f77bcf86cd799439013',
    }),
    __metadata("design:type", String)
], LeaveRequestResponseDto.prototype, "attachmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Approval flow steps',
        type: [ApprovalFlowItemDto],
    }),
    __metadata("design:type", Array)
], LeaveRequestResponseDto.prototype, "approvalFlow", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Overall request status',
        example: 'pending',
    }),
    __metadata("design:type", String)
], LeaveRequestResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Irregular pattern flag',
        example: false,
    }),
    __metadata("design:type", Boolean)
], LeaveRequestResponseDto.prototype, "irregularPatternFlag", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveRequestResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveRequestResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=leave-request-response.dto.js.map