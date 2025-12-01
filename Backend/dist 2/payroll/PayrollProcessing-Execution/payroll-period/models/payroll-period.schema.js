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
exports.PayrollPeriodSchema = exports.PayrollPeriod = exports.PayrollPeriodStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PayrollPeriodStatus;
(function (PayrollPeriodStatus) {
    PayrollPeriodStatus["PLANNED"] = "planned";
    PayrollPeriodStatus["OPEN"] = "open";
    PayrollPeriodStatus["UNDER_REVIEW"] = "under_review";
    PayrollPeriodStatus["WAITING_FINANCE"] = "waiting_finance";
    PayrollPeriodStatus["LOCKED"] = "locked";
    PayrollPeriodStatus["PAID"] = "paid";
    PayrollPeriodStatus["REOPENED"] = "reopened";
})(PayrollPeriodStatus || (exports.PayrollPeriodStatus = PayrollPeriodStatus = {}));
let PayrollPeriod = class PayrollPeriod {
    month;
    year;
    status;
    opened_at;
    closed_at;
};
exports.PayrollPeriod = PayrollPeriod;
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        min: 1,
        max: 12
    }),
    __metadata("design:type", Number)
], PayrollPeriod.prototype, "month", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true,
        min: 1000
    }),
    __metadata("design:type", Number)
], PayrollPeriod.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: Object.values(PayrollPeriodStatus),
        default: PayrollPeriodStatus.PLANNED,
    }),
    __metadata("design:type", String)
], PayrollPeriod.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PayrollPeriod.prototype, "opened_at", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PayrollPeriod.prototype, "closed_at", void 0);
exports.PayrollPeriod = PayrollPeriod = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PayrollPeriod);
exports.PayrollPeriodSchema = mongoose_1.SchemaFactory.createForClass(PayrollPeriod);
//# sourceMappingURL=payroll-period.schema.js.map