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
exports.PayTypeSchema = exports.PayType = exports.PayTypeStatus = exports.PayTypeName = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var PayTypeName;
(function (PayTypeName) {
    PayTypeName["HOURLY"] = "hourly";
    PayTypeName["DAILY"] = "daily";
    PayTypeName["WEEKLY"] = "weekly";
    PayTypeName["MONTHLY"] = "monthly";
    PayTypeName["CONTRACT_BASED"] = "contract-based";
})(PayTypeName || (exports.PayTypeName = PayTypeName = {}));
var PayTypeStatus;
(function (PayTypeStatus) {
    PayTypeStatus["DRAFT"] = "draft";
    PayTypeStatus["ACTIVE"] = "active";
    PayTypeStatus["REJECTED"] = "rejected";
})(PayTypeStatus || (exports.PayTypeStatus = PayTypeStatus = {}));
let PayType = class PayType {
    name;
    status;
};
exports.PayType = PayType;
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PayTypeName }),
    __metadata("design:type", String)
], PayType.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: PayTypeStatus, default: PayTypeStatus.DRAFT }),
    __metadata("design:type", String)
], PayType.prototype, "status", void 0);
exports.PayType = PayType = __decorate([
    (0, mongoose_1.Schema)()
], PayType);
exports.PayTypeSchema = mongoose_1.SchemaFactory.createForClass(PayType);
//# sourceMappingURL=pay-type.schema.js.map