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
exports.SystemBackupSchema = exports.systembackup = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let systembackup = class systembackup {
    backup_date;
};
exports.systembackup = systembackup;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], systembackup.prototype, "backup_date", void 0);
exports.systembackup = systembackup = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], systembackup);
exports.SystemBackupSchema = mongoose_1.SchemaFactory.createForClass(systembackup);
//# sourceMappingURL=backup.schema.js.map