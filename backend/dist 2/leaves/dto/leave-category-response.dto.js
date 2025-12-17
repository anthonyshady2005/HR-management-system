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
exports.LeaveCategoryResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class LeaveCategoryResponseDto {
    id;
    name;
    description;
    createdAt;
    updatedAt;
}
exports.LeaveCategoryResponseDto = LeaveCategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category ID',
        example: '507f1f77bcf86cd799439011',
    }),
    __metadata("design:type", String)
], LeaveCategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category name',
        example: 'Paid Leave',
    }),
    __metadata("design:type", String)
], LeaveCategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category description',
        example: 'Leaves that are paid by the company',
    }),
    __metadata("design:type", String)
], LeaveCategoryResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveCategoryResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-11-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], LeaveCategoryResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=leave-category-response.dto.js.map