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
exports.CreateChangeRequestDto = exports.FieldChangeDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class FieldChangeDto {
    fieldName;
    oldValue;
    newValue;
}
exports.FieldChangeDto = FieldChangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Field name to change', example: 'phone' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FieldChangeDto.prototype, "fieldName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Old value' }),
    __metadata("design:type", Object)
], FieldChangeDto.prototype, "oldValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New value' }),
    __metadata("design:type", Object)
], FieldChangeDto.prototype, "newValue", void 0);
class CreateChangeRequestDto {
    fields;
    reason;
}
exports.CreateChangeRequestDto = CreateChangeRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of field changes' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FieldChangeDto),
    __metadata("design:type", Array)
], CreateChangeRequestDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for the change request',
        example: 'Updated phone number',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChangeRequestDto.prototype, "reason", void 0);
//# sourceMappingURL=create-change-request.dto.js.map