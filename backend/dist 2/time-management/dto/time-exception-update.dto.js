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
exports.TimeExceptionUpdateDTO = void 0;
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
const enums_1 = require("../models/enums");
class TimeExceptionUpdateDTO {
    employeeId;
    type;
    attendanceRecordId;
    assignedTo;
    status;
    reason;
}
exports.TimeExceptionUpdateDTO = TimeExceptionUpdateDTO;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], TimeExceptionUpdateDTO.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.TimeExceptionType),
    __metadata("design:type", String)
], TimeExceptionUpdateDTO.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], TimeExceptionUpdateDTO.prototype, "attendanceRecordId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], TimeExceptionUpdateDTO.prototype, "assignedTo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.TimeExceptionStatus),
    __metadata("design:type", String)
], TimeExceptionUpdateDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TimeExceptionUpdateDTO.prototype, "reason", void 0);
//# sourceMappingURL=time-exception-update.dto.js.map