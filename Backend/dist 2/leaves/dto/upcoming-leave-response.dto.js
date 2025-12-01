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
exports.UpcomingLeaveResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UpcomingLeaveResponseDto {
    requestId;
    employeeId;
    employeeName;
    leaveType;
    from;
    to;
    durationDays;
    status;
}
exports.UpcomingLeaveResponseDto = UpcomingLeaveResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave request ID' }),
    __metadata("design:type", String)
], UpcomingLeaveResponseDto.prototype, "requestId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee ID' }),
    __metadata("design:type", String)
], UpcomingLeaveResponseDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Employee name' }),
    __metadata("design:type", String)
], UpcomingLeaveResponseDto.prototype, "employeeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Leave type' }),
    __metadata("design:type", String)
], UpcomingLeaveResponseDto.prototype, "leaveType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start date' }),
    __metadata("design:type", Date)
], UpcomingLeaveResponseDto.prototype, "from", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End date' }),
    __metadata("design:type", Date)
], UpcomingLeaveResponseDto.prototype, "to", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Duration in days' }),
    __metadata("design:type", Number)
], UpcomingLeaveResponseDto.prototype, "durationDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Request status' }),
    __metadata("design:type", String)
], UpcomingLeaveResponseDto.prototype, "status", void 0);
//# sourceMappingURL=upcoming-leave-response.dto.js.map