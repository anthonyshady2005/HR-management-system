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
exports.PayrollRunSchema = exports.PayrollRun = exports.PayrollAnomaly = exports.PayrollRunStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var PayrollRunStatus;
(function (PayrollRunStatus) {
    PayrollRunStatus["INITIATED"] = "initiated";
    PayrollRunStatus["PROCESSING"] = "processing";
    PayrollRunStatus["UNDER_REVIEW"] = "review";
    PayrollRunStatus["APPROVAL_PENDING"] = "approval_pending";
    PayrollRunStatus["FINANCE_REVIEW"] = "finance_review";
    PayrollRunStatus["COMPLETED"] = "completed";
    PayrollRunStatus["FAILED"] = "failed";
})(PayrollRunStatus || (exports.PayrollRunStatus = PayrollRunStatus = {}));
class PayrollAnomaly {
    code;
    description;
    resolved;
    employee_id;
}
exports.PayrollAnomaly = PayrollAnomaly;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayrollAnomaly.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], PayrollAnomaly.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], PayrollAnomaly.prototype, "resolved", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EmployeeProfile', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollAnomaly.prototype, "employee_id", void 0);
let PayrollRun = class PayrollRun {
    period_id;
    department_id;
    initiated_by;
    status;
    anomalies;
};
exports.PayrollRun = PayrollRun;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'PayrollPeriod',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollRun.prototype, "period_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Department',
        required: false,
        default: null,
    }),
    __metadata("design:type", Object)
], PayrollRun.prototype, "department_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        type: mongoose_2.Types.ObjectId,
        ref: 'EmployeeProfile'
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollRun.prototype, "initiated_by", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(PayrollRunStatus),
        default: PayrollRunStatus.INITIATED,
    }),
    __metadata("design:type", String)
], PayrollRun.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                code: { type: String, required: true },
                description: { type: String },
                resolved: { type: Boolean, default: false },
                employee_id: { type: mongoose_2.Types.ObjectId, ref: 'EmployeeProfile', required: true },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], PayrollRun.prototype, "anomalies", void 0);
exports.PayrollRun = PayrollRun = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollRun);
exports.PayrollRunSchema = mongoose_1.SchemaFactory.createForClass(PayrollRun);
//# sourceMappingURL=payroll-run.schema.js.map