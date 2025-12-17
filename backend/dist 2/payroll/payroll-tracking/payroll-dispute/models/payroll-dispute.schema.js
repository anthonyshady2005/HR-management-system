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
exports.PayrollDisputeSchema = exports.PayrollDispute = exports.PayrollDisputeStatus = exports.PayrollDisputeIssue = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PayrollDisputeIssue;
(function (PayrollDisputeIssue) {
    PayrollDisputeIssue["WRONG_DEDUCTION"] = "wrong_deduction";
    PayrollDisputeIssue["MISSING_ALLOWANCE"] = "missing_allowance";
    PayrollDisputeIssue["INCORRECT_TAX"] = "incorrect_tax";
    PayrollDisputeIssue["OVERPAYMENT"] = "overpayment";
    PayrollDisputeIssue["UNPAID_OVERTIME"] = "unpaid_overtime";
    PayrollDisputeIssue["INCORRECT_BENEFITS"] = "incorrect_benefits";
    PayrollDisputeIssue["MISSING_TAX_RELIEF"] = "missing_tax_relief";
    PayrollDisputeIssue["OTHER"] = "other";
})(PayrollDisputeIssue || (exports.PayrollDisputeIssue = PayrollDisputeIssue = {}));
var PayrollDisputeStatus;
(function (PayrollDisputeStatus) {
    PayrollDisputeStatus["SUBMITTED"] = "submitted";
    PayrollDisputeStatus["IN_REVIEW"] = "in_review";
    PayrollDisputeStatus["APPROVED"] = "approved";
    PayrollDisputeStatus["REJECTED"] = "rejected";
    PayrollDisputeStatus["RESOLVED"] = "resolved";
})(PayrollDisputeStatus || (exports.PayrollDisputeStatus = PayrollDisputeStatus = {}));
let PayrollDispute = class PayrollDispute {
    employee_id;
    payslip_id;
    issue;
    details;
    status;
    handler_user_id;
    decision_notes;
    decided_at;
};
exports.PayrollDispute = PayrollDispute;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, ref: 'EmployeeProfile' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollDispute.prototype, "employee_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, ref: 'Payslip' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollDispute.prototype, "payslip_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: PayrollDisputeIssue, required: true }),
    __metadata("design:type", String)
], PayrollDispute.prototype, "issue", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, required: true }),
    __metadata("design:type", String)
], PayrollDispute.prototype, "details", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: PayrollDisputeStatus,
        required: true,
        default: PayrollDisputeStatus.SUBMITTED,
    }),
    __metadata("design:type", String)
], PayrollDispute.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EmployeeProfile', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollDispute.prototype, "handler_user_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, trim: true, default: null }),
    __metadata("design:type", String)
], PayrollDispute.prototype, "decision_notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], PayrollDispute.prototype, "decided_at", void 0);
exports.PayrollDispute = PayrollDispute = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollDispute);
exports.PayrollDisputeSchema = mongoose_1.SchemaFactory.createForClass(PayrollDispute);
//# sourceMappingURL=payroll-dispute.schema.js.map