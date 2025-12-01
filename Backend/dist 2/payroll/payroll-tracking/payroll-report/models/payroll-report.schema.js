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
exports.PayrollReportSchema = exports.PayrollReport = exports.PayrollReportType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PayrollReportType;
(function (PayrollReportType) {
    PayrollReportType["DEPARTMENT_SUMMARY"] = "department_summary";
    PayrollReportType["MONTH_SUMMARY"] = "month_summary";
    PayrollReportType["YEAR_SUMMARY"] = "year_summary";
    PayrollReportType["TAX_INSURANCE_BENEFITS"] = "tax_insurance_benefits";
})(PayrollReportType || (exports.PayrollReportType = PayrollReportType = {}));
let PayrollReport = class PayrollReport {
    type;
    period_start;
    period_end;
    department_id;
    generated_by;
    data;
};
exports.PayrollReport = PayrollReport;
__decorate([
    (0, mongoose_1.Prop)({ type: PayrollReportType, required: true }),
    __metadata("design:type", String)
], PayrollReport.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], PayrollReport.prototype, "period_start", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true }),
    __metadata("design:type", Date)
], PayrollReport.prototype, "period_end", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Department', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollReport.prototype, "department_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, ref: 'EmployeeProfile' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollReport.prototype, "generated_by", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], PayrollReport.prototype, "data", void 0);
exports.PayrollReport = PayrollReport = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollReport);
exports.PayrollReportSchema = mongoose_1.SchemaFactory.createForClass(PayrollReport);
//# sourceMappingURL=payroll-report.schema.js.map