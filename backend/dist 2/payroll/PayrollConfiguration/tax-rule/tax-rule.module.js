"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRuleModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const tax_rule_controller_1 = require("./tax-rule.controller");
const tax_rule_service_1 = require("./tax-rule.service");
const tax_rule_schema_1 = require("./models/tax-rule.schema");
let TaxRuleModule = class TaxRuleModule {
};
exports.TaxRuleModule = TaxRuleModule;
exports.TaxRuleModule = TaxRuleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: tax_rule_schema_1.TaxRule.name, schema: tax_rule_schema_1.TaxRuleSchema }]),
        ],
        controllers: [tax_rule_controller_1.TaxRuleController],
        providers: [tax_rule_service_1.TaxRuleService],
        exports: [tax_rule_service_1.TaxRuleService],
    })
], TaxRuleModule);
//# sourceMappingURL=tax-rule.module.js.map