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
exports.BonusPolicySchema = exports.BonusPolicy = exports.BonusPolicyStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var BonusPolicyStatus;
(function (BonusPolicyStatus) {
    BonusPolicyStatus["DRAFT"] = "draft";
    BonusPolicyStatus["ACTIVE"] = "active";
    BonusPolicyStatus["REJECTED"] = "rejected";
})(BonusPolicyStatus || (exports.BonusPolicyStatus = BonusPolicyStatus = {}));
let BonusPolicy = class BonusPolicy {
    name;
    amount;
    conditions;
    status;
};
exports.BonusPolicy = BonusPolicy;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BonusPolicy.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], BonusPolicy.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], BonusPolicy.prototype, "conditions", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: BonusPolicyStatus,
        default: BonusPolicyStatus.DRAFT,
    }),
    __metadata("design:type", String)
], BonusPolicy.prototype, "status", void 0);
exports.BonusPolicy = BonusPolicy = __decorate([
    (0, mongoose_1.Schema)()
], BonusPolicy);
exports.BonusPolicySchema = mongoose_1.SchemaFactory.createForClass(BonusPolicy);
//# sourceMappingURL=bonus-policy.schema.js.map