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
exports.ShiftCreateDTO = void 0;
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
const enums_1 = require("../models/enums");
class ShiftCreateDTO {
    name;
    shiftType;
    startTime;
    endTime;
    punchPolicy;
    graceInMinutes;
    graceOutMinutes;
    requiresApprovalForOvertime;
    active;
}
exports.ShiftCreateDTO = ShiftCreateDTO;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShiftCreateDTO.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ShiftCreateDTO.prototype, "shiftType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShiftCreateDTO.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ShiftCreateDTO.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.PunchPolicy),
    __metadata("design:type", String)
], ShiftCreateDTO.prototype, "punchPolicy", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ShiftCreateDTO.prototype, "graceInMinutes", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ShiftCreateDTO.prototype, "graceOutMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ShiftCreateDTO.prototype, "requiresApprovalForOvertime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ShiftCreateDTO.prototype, "active", void 0);
//# sourceMappingURL=shift-create.dto.js.map