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
exports.PayrollPolicySchema = exports.PayrollPolicy = exports.PolicyStatus = exports.Applicability = exports.PolicyType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PolicyType;
(function (PolicyType) {
    PolicyType["Misconduct"] = "Misconduct";
    PolicyType["Leaves"] = "Leaves";
    PolicyType["Allowance"] = "Allowance";
})(PolicyType || (exports.PolicyType = PolicyType = {}));
var Applicability;
(function (Applicability) {
    Applicability["AllEmployees"] = "All employees";
    Applicability["FullTime"] = "Full-time";
    Applicability["PartTime"] = "Part-time";
    Applicability["Temporary"] = "Temporary";
})(Applicability || (exports.Applicability = Applicability = {}));
var PolicyStatus;
(function (PolicyStatus) {
    PolicyStatus["Draft"] = "draft";
    PolicyStatus["Active"] = "active";
    PolicyStatus["Archived"] = "rejected";
})(PolicyStatus || (exports.PolicyStatus = PolicyStatus = {}));
let PayrollPolicy = class PayrollPolicy {
    name;
    policyType;
    description;
    effectiveDate;
    lawReference;
    ruleDefinition;
    applicability;
    status;
};
exports.PayrollPolicy = PayrollPolicy;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayrollPolicy.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PolicyType }),
    __metadata("design:type", String)
], PayrollPolicy.prototype, "policyType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], PayrollPolicy.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PayrollPolicy.prototype, "effectiveDate", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], PayrollPolicy.prototype, "lawReference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Number], required: true, min: 0, max: 100 }),
    __metadata("design:type", Array)
], PayrollPolicy.prototype, "ruleDefinition", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Applicability }),
    __metadata("design:type", String)
], PayrollPolicy.prototype, "applicability", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PolicyStatus, default: PolicyStatus.Draft }),
    __metadata("design:type", String)
], PayrollPolicy.prototype, "status", void 0);
exports.PayrollPolicy = PayrollPolicy = __decorate([
    (0, mongoose_1.Schema)()
], PayrollPolicy);
exports.PayrollPolicySchema = mongoose_1.SchemaFactory.createForClass(PayrollPolicy);
//# sourceMappingURL=payroll-policy.schema.js.map