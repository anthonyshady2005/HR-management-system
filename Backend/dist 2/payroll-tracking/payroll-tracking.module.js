"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollTrackingModule = void 0;
const common_1 = require("@nestjs/common");
const payroll_tracking_service_1 = require("./payroll-tracking.service");
const payroll_tracking_controller_1 = require("./payroll-tracking.controller");
const mongoose_1 = require("@nestjs/mongoose");
const claims_schema_1 = require("./models/claims.schema");
const disputes_schema_1 = require("./models/disputes.schema");
const refunds_schema_1 = require("./models/refunds.schema");
const payslip_schema_1 = require("../payroll-execution/models/payslip.schema");
const employee_profile_schema_1 = require("../employee-profile/models/employee-profile.schema");
const notification_log_schema_1 = require("../time-management/models/notification-log.schema");
const employee_system_role_schema_1 = require("../employee-profile/models/employee-system-role.schema");
let PayrollTrackingModule = class PayrollTrackingModule {
};
exports.PayrollTrackingModule = PayrollTrackingModule;
exports.PayrollTrackingModule = PayrollTrackingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: claims_schema_1.claims.name, schema: claims_schema_1.claimsSchema },
                { name: disputes_schema_1.disputes.name, schema: disputes_schema_1.disputesSchema },
                { name: refunds_schema_1.refunds.name, schema: refunds_schema_1.refundsSchema },
                { name: 'paySlip', schema: payslip_schema_1.paySlipSchema },
                { name: 'EmployeeProfile', schema: employee_profile_schema_1.EmployeeProfileSchema },
                { name: 'NotificationLog', schema: notification_log_schema_1.NotificationLogSchema },
                { name: 'EmployeeSystemRole', schema: employee_system_role_schema_1.EmployeeSystemRoleSchema },
            ]),
        ],
        providers: [payroll_tracking_service_1.PayrollTrackingService],
        controllers: [payroll_tracking_controller_1.PayrollTrackingController],
        exports: [payroll_tracking_service_1.PayrollTrackingService],
    })
], PayrollTrackingModule);
//# sourceMappingURL=payroll-tracking.module.js.map