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
exports.UpdateSelfEmployeeProfileDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class AddressUpdateDto {
    city;
    streetAddress;
    country;
}
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressUpdateDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressUpdateDto.prototype, "streetAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressUpdateDto.prototype, "country", void 0);
class UpdateSelfEmployeeProfileDto {
    mobilePhone;
    personalEmail;
    address;
    biography;
    profilePictureUrl;
}
exports.UpdateSelfEmployeeProfileDto = UpdateSelfEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mobile phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\+?[0-9\s\-()]{7,20}$/, {
        message: 'mobilePhone must be a valid phone number',
    }),
    __metadata("design:type", String)
], UpdateSelfEmployeeProfileDto.prototype, "mobilePhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Personal email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateSelfEmployeeProfileDto.prototype, "personalEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Address object' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressUpdateDto),
    __metadata("design:type", AddressUpdateDto)
], UpdateSelfEmployeeProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Short biography' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSelfEmployeeProfileDto.prototype, "biography", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Profile picture URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSelfEmployeeProfileDto.prototype, "profilePictureUrl", void 0);
//# sourceMappingURL=update-self-profile.dto.js.map