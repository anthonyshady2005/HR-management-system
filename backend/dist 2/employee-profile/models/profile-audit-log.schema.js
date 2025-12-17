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
exports.ProfileAuditLogSchema = exports.ProfileAuditLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ProfileAuditLog = class ProfileAuditLog {
    employeeProfileId;
    performedByEmployeeId;
    action;
    changeRequestId;
    previousValues;
    newValues;
    changedFields;
    reason;
    ipAddress;
    performedAt;
};
exports.ProfileAuditLog = ProfileAuditLog;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'EmployeeProfile',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ProfileAuditLog.prototype, "employeeProfileId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'EmployeeProfile', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ProfileAuditLog.prototype, "performedByEmployeeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], ProfileAuditLog.prototype, "action", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProfileAuditLog.prototype, "changeRequestId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ProfileAuditLog.prototype, "previousValues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], ProfileAuditLog.prototype, "newValues", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProfileAuditLog.prototype, "changedFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProfileAuditLog.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], ProfileAuditLog.prototype, "ipAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: () => new Date() }),
    __metadata("design:type", Date)
], ProfileAuditLog.prototype, "performedAt", void 0);
exports.ProfileAuditLog = ProfileAuditLog = __decorate([
    (0, mongoose_1.Schema)({ collection: 'profile_audit_logs', timestamps: true })
], ProfileAuditLog);
exports.ProfileAuditLogSchema = mongoose_1.SchemaFactory.createForClass(ProfileAuditLog);
exports.ProfileAuditLogSchema.index({ employeeProfileId: 1, performedAt: -1 });
exports.ProfileAuditLogSchema.index({ performedByEmployeeId: 1, performedAt: -1 });
//# sourceMappingURL=profile-audit-log.schema.js.map