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
exports.PayrollClaimSchema = exports.PayrollClaim = exports.PayrollClaimStatus = exports.PayrollClaimType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PayrollClaimType;
(function (PayrollClaimType) {
    PayrollClaimType["REIMBURSEMENT"] = "reimbursement";
    PayrollClaimType["CORRECTION"] = "correction";
})(PayrollClaimType || (exports.PayrollClaimType = PayrollClaimType = {}));
var PayrollClaimStatus;
(function (PayrollClaimStatus) {
    PayrollClaimStatus["SUBMITTED"] = "submitted";
    PayrollClaimStatus["APPROVED"] = "approved";
    PayrollClaimStatus["REJECTED"] = "rejected";
    PayrollClaimStatus["REFUNDED"] = "refunded";
})(PayrollClaimStatus || (exports.PayrollClaimStatus = PayrollClaimStatus = {}));
let PayrollClaim = class PayrollClaim {
    employee_id;
    type;
    amount;
    reason;
    status;
    approver_id;
    approved_at;
};
exports.PayrollClaim = PayrollClaim;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, ref: 'EmployeeProfile' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollClaim.prototype, "employee_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: PayrollClaimType, required: true }),
    __metadata("design:type", String)
], PayrollClaim.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], PayrollClaim.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], PayrollClaim.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: PayrollClaimStatus,
        required: true,
        default: PayrollClaimStatus.SUBMITTED,
    }),
    __metadata("design:type", String)
], PayrollClaim.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EmployeeProfile', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollClaim.prototype, "approver_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], PayrollClaim.prototype, "approved_at", void 0);
exports.PayrollClaim = PayrollClaim = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollClaim);
exports.PayrollClaimSchema = mongoose_1.SchemaFactory.createForClass(PayrollClaim);
//# sourceMappingURL=payroll-claim.schema.js.map