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
exports.PayrollPayslipViewLogSchema = exports.PayrollPayslipViewLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PayrollPayslipViewLog = class PayrollPayslipViewLog {
    payslip_id;
    employee_id;
    viewed_at;
    downloaded_at;
};
exports.PayrollPayslipViewLog = PayrollPayslipViewLog;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, ref: 'Payslip' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollPayslipViewLog.prototype, "payslip_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, required: true, ref: 'EmployeeProfile' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PayrollPayslipViewLog.prototype, "employee_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true, default: Date.now }),
    __metadata("design:type", Date)
], PayrollPayslipViewLog.prototype, "viewed_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], PayrollPayslipViewLog.prototype, "downloaded_at", void 0);
exports.PayrollPayslipViewLog = PayrollPayslipViewLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollPayslipViewLog);
exports.PayrollPayslipViewLogSchema = mongoose_1.SchemaFactory.createForClass(PayrollPayslipViewLog);
//# sourceMappingURL=payroll-payslip-view-log.schema.js.map