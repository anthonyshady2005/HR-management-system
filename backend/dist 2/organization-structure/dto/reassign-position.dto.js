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
exports.ReassignPositionDto = void 0;
const class_validator_1 = require("class-validator");
const mongoose_1 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
class ReassignPositionDto {
    newDepartmentId;
}
exports.ReassignPositionDto = ReassignPositionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New Department ObjectId' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ReassignPositionDto.prototype, "newDepartmentId", void 0);
//# sourceMappingURL=reassign-position.dto.js.map