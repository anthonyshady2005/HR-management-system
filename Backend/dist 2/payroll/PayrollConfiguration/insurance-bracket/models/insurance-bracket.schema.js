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
exports.InsuranceBracketSchema = exports.insuranceBracket = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let insuranceBracket = class insuranceBracket {
    insurance_type;
    salary_range_min;
    salary_range_max;
    employee_contribution_percentage;
    employer_contribution_percentage;
    status;
    notes;
};
exports.insuranceBracket = insuranceBracket;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['health', 'social', 'life', 'other'] }),
    __metadata("design:type", String)
], insuranceBracket.prototype, "insurance_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], insuranceBracket.prototype, "salary_range_min", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], insuranceBracket.prototype, "salary_range_max", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], insuranceBracket.prototype, "employee_contribution_percentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], insuranceBracket.prototype, "employer_contribution_percentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['draft', 'active', 'rejected'], default: 'draft' }),
    __metadata("design:type", String)
], insuranceBracket.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", String)
], insuranceBracket.prototype, "notes", void 0);
exports.insuranceBracket = insuranceBracket = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], insuranceBracket);
exports.InsuranceBracketSchema = mongoose_1.SchemaFactory.createForClass(insuranceBracket);
//# sourceMappingURL=insurance-bracket.schema.js.map