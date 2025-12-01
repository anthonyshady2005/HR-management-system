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
exports.PayslipSchema = exports.Payslip = exports.PayslipBreakdown = exports.BreakdownDeduction = exports.BreakdownAllowance = exports.PayslipStatus = exports.EmploymentStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var EmploymentStatus;
(function (EmploymentStatus) {
    EmploymentStatus["NORMAL"] = "normal";
    EmploymentStatus["NEW_HIRE"] = "new_hire";
    EmploymentStatus["RESIGNED"] = "resigned";
    EmploymentStatus["TERMINATED"] = "terminated";
})(EmploymentStatus || (exports.EmploymentStatus = EmploymentStatus = {}));
var PayslipStatus;
(function (PayslipStatus) {
    PayslipStatus["DRAFT"] = "draft";
    PayslipStatus["PUBLISHED"] = "published";
    PayslipStatus["VIEWED"] = "viewed";
})(PayslipStatus || (exports.PayslipStatus = PayslipStatus = {}));
let BreakdownAllowance = class BreakdownAllowance {
    name;
    amount;
};
exports.BreakdownAllowance = BreakdownAllowance;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BreakdownAllowance.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], BreakdownAllowance.prototype, "amount", void 0);
exports.BreakdownAllowance = BreakdownAllowance = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], BreakdownAllowance);
let BreakdownDeduction = class BreakdownDeduction {
    name;
    amount;
};
exports.BreakdownDeduction = BreakdownDeduction;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BreakdownDeduction.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], BreakdownDeduction.prototype, "amount", void 0);
exports.BreakdownDeduction = BreakdownDeduction = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], BreakdownDeduction);
let PayslipBreakdown = class PayslipBreakdown {
    base;
    allowances;
    deductions;
};
exports.PayslipBreakdown = PayslipBreakdown;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], PayslipBreakdown.prototype, "base", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [BreakdownAllowance], default: [] }),
    __metadata("design:type", Array)
], PayslipBreakdown.prototype, "allowances", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [BreakdownDeduction], default: [] }),
    __metadata("design:type", Array)
], PayslipBreakdown.prototype, "deductions", void 0);
exports.PayslipBreakdown = PayslipBreakdown = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], PayslipBreakdown);
let Payslip = class Payslip {
    employeeId;
    periodId;
    employmentStatus;
    base;
    penalties;
    overtime;
    leaveEncashment;
    gross;
    taxes;
    insurance;
    net;
    finalPaid;
    breakdown;
    status;
    publishedAt;
};
exports.Payslip = Payslip;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EmployeeProfile', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payslip.prototype, "employeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'PayrollPeriod', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Payslip.prototype, "periodId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: EmploymentStatus,
        required: true,
        default: EmploymentStatus.NORMAL,
    }),
    __metadata("design:type", String)
], Payslip.prototype, "employmentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payslip.prototype, "base", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Number], default: [] }),
    __metadata("design:type", Array)
], Payslip.prototype, "penalties", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payslip.prototype, "overtime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Payslip.prototype, "leaveEncashment", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payslip.prototype, "gross", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payslip.prototype, "taxes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payslip.prototype, "insurance", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payslip.prototype, "net", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Payslip.prototype, "finalPaid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: PayslipBreakdown, required: true }),
    __metadata("design:type", PayslipBreakdown)
], Payslip.prototype, "breakdown", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        enum: PayslipStatus,
        required: true,
        default: PayslipStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Payslip.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Payslip.prototype, "publishedAt", void 0);
exports.Payslip = Payslip = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Payslip);
exports.PayslipSchema = mongoose_1.SchemaFactory.createForClass(Payslip);
//# sourceMappingURL=payslip.schema.js.map