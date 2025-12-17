"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProfileSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSyncService = void 0;
const common_1 = require("@nestjs/common");
let ProfileSyncService = ProfileSyncService_1 = class ProfileSyncService {
    logger = new common_1.Logger(ProfileSyncService_1.name);
    emitStatusChanged(employeeId, oldStatus, newStatus) {
        this.logger.log(`SYNC statusChanged employeeId=${employeeId} ${oldStatus}->${newStatus}`);
    }
    emitPayGradeChanged(employeeId, oldPayGrade, newPayGrade) {
        this.logger.log(`SYNC payGradeChanged employeeId=${employeeId} ${oldPayGrade}=>${newPayGrade}`);
    }
    emitHierarchyChanged(employeeId, positionId, departmentId) {
        this.logger.log(`SYNC hierarchyChanged employeeId=${employeeId} position=${positionId} department=${departmentId}`);
    }
};
exports.ProfileSyncService = ProfileSyncService;
exports.ProfileSyncService = ProfileSyncService = ProfileSyncService_1 = __decorate([
    (0, common_1.Injectable)()
], ProfileSyncService);
//# sourceMappingURL=profile-sync.service.js.map