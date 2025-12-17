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
exports.TaxRuleSchema = exports.TaxRule = exports.TaxRuleStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var TaxRuleStatus;
(function (TaxRuleStatus) {
    TaxRuleStatus["Draft"] = "draft";
    TaxRuleStatus["Active"] = "active";
})(TaxRuleStatus || (exports.TaxRuleStatus = TaxRuleStatus = {}));
let TaxRule = class TaxRule {
    name;
    percentage;
    status;
};
exports.TaxRule = TaxRule;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], TaxRule.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], TaxRule.prototype, "percentage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TaxRuleStatus, default: TaxRuleStatus.Draft }),
    __metadata("design:type", String)
], TaxRule.prototype, "status", void 0);
exports.TaxRule = TaxRule = __decorate([
    (0, mongoose_1.Schema)()
], TaxRule);
exports.TaxRuleSchema = mongoose_1.SchemaFactory.createForClass(TaxRule);
//# sourceMappingURL=tax-rule.schema.js.map