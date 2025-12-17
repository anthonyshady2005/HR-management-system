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
exports.ResignationPolicySchema = exports.ResignationPolicy = exports.ResignationPolicyStatus = exports.TerminationType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var TerminationType;
(function (TerminationType) {
    TerminationType["RESIGNATION"] = "resignation";
    TerminationType["TERMINATION"] = "termination";
})(TerminationType || (exports.TerminationType = TerminationType = {}));
var ResignationPolicyStatus;
(function (ResignationPolicyStatus) {
    ResignationPolicyStatus["DRAFT"] = "draft";
    ResignationPolicyStatus["ACTIVE"] = "active";
    ResignationPolicyStatus["ARCHIVED"] = "archived";
})(ResignationPolicyStatus || (exports.ResignationPolicyStatus = ResignationPolicyStatus = {}));
let ResignationPolicy = class ResignationPolicy {
    termination_type;
    compensation_amount;
    benefits;
    conditions;
    status;
};
exports.ResignationPolicy = ResignationPolicy;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: TerminationType }),
    __metadata("design:type", String)
], ResignationPolicy.prototype, "termination_type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], ResignationPolicy.prototype, "compensation_amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResignationPolicy.prototype, "benefits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ResignationPolicy.prototype, "conditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ResignationPolicyStatus,
        default: ResignationPolicyStatus.DRAFT,
    }),
    __metadata("design:type", String)
], ResignationPolicy.prototype, "status", void 0);
exports.ResignationPolicy = ResignationPolicy = __decorate([
    (0, mongoose_1.Schema)()
], ResignationPolicy);
exports.ResignationPolicySchema = mongoose_1.SchemaFactory.createForClass(ResignationPolicy);
//# sourceMappingURL=resignation-policy.schema.js.map