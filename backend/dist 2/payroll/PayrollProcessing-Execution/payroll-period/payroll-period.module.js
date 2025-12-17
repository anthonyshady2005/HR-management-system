"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollPeriodModule = void 0;
const common_1 = require("@nestjs/common");
const payroll_period_service_1 = require("./payroll-period.service");
const payroll_period_controller_1 = require("./payroll-period.controller");
let PayrollPeriodModule = class PayrollPeriodModule {
};
exports.PayrollPeriodModule = PayrollPeriodModule;
exports.PayrollPeriodModule = PayrollPeriodModule = __decorate([
    (0, common_1.Module)({
        controllers: [payroll_period_controller_1.PayrollPeriodController],
        providers: [payroll_period_service_1.PayrollPeriodService],
    })
], PayrollPeriodModule);
//# sourceMappingURL=payroll-period.module.js.map