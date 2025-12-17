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
exports.PayGradeSchema = exports.PayGrade = exports.PayGradeStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PayGradeStatus;
(function (PayGradeStatus) {
    PayGradeStatus["DRAFT"] = "draft";
    PayGradeStatus["ACTIVE"] = "active";
    PayGradeStatus["REJECTED"] = "rejected";
})(PayGradeStatus || (exports.PayGradeStatus = PayGradeStatus = {}));
let PayGrade = class PayGrade {
    gradeCode;
    min_salary;
    max_salary;
    status;
};
exports.PayGrade = PayGrade;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayGrade.prototype, "gradeCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PayGrade.prototype, "min_salary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PayGrade.prototype, "max_salary", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: PayGradeStatus,
        default: PayGradeStatus.DRAFT,
    }),
    __metadata("design:type", String)
], PayGrade.prototype, "status", void 0);
exports.PayGrade = PayGrade = __decorate([
    (0, mongoose_1.Schema)()
], PayGrade);
exports.PayGradeSchema = mongoose_1.SchemaFactory.createForClass(PayGrade);
//# sourceMappingURL=pay-grade.schema.js.map