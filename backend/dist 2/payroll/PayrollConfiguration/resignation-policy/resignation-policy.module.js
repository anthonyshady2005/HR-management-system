"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResignationPolicyModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const resignation_policy_service_1 = require("./resignation-policy.service");
const resignation_policy_controller_1 = require("./resignation-policy.controller");
const resignation_policy_schema_1 = require("./models/resignation-policy.schema");
let ResignationPolicyModule = class ResignationPolicyModule {
};
exports.ResignationPolicyModule = ResignationPolicyModule;
exports.ResignationPolicyModule = ResignationPolicyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'ResignationPolicy', schema: resignation_policy_schema_1.ResignationPolicySchema },
            ]),
        ],
        providers: [resignation_policy_service_1.ResignationPolicyService],
        controllers: [resignation_policy_controller_1.ResignationPolicyController],
    })
], ResignationPolicyModule);
//# sourceMappingURL=resignation-policy.module.js.map