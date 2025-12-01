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
exports.CompanySettingsSchema = exports.CompanySettings = exports.CompanySettingsStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
var CompanySettingsStatus;
(function (CompanySettingsStatus) {
    CompanySettingsStatus["DRAFT"] = "draft";
    CompanySettingsStatus["ACTIVE"] = "active";
    CompanySettingsStatus["REJECTED"] = "rejected";
})(CompanySettingsStatus || (exports.CompanySettingsStatus = CompanySettingsStatus = {}));
let CompanySettings = class CompanySettings {
    pay_date;
    time_zone;
    currency;
    status;
};
exports.CompanySettings = CompanySettings;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], CompanySettings.prototype, "pay_date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "time_zone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CompanySettings.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: CompanySettingsStatus,
        default: CompanySettingsStatus.DRAFT,
    }),
    __metadata("design:type", String)
], CompanySettings.prototype, "status", void 0);
exports.CompanySettings = CompanySettings = __decorate([
    (0, mongoose_1.Schema)()
], CompanySettings);
exports.CompanySettingsSchema = mongoose_1.SchemaFactory.createForClass(CompanySettings);
//# sourceMappingURL=company-settings.schema.js.map