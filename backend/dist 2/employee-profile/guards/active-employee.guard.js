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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveEmployeeGuard = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_profile_schema_1 = require("../models/employee-profile.schema");
const employee_profile_enums_1 = require("../enums/employee-profile.enums");
let ActiveEmployeeGuard = class ActiveEmployeeGuard {
    profileModel;
    blockedStatuses = new Set([
        employee_profile_enums_1.EmployeeStatus.TERMINATED,
        employee_profile_enums_1.EmployeeStatus.SUSPENDED,
        employee_profile_enums_1.EmployeeStatus.INACTIVE,
        employee_profile_enums_1.EmployeeStatus.RETIRED,
    ]);
    constructor(profileModel) {
        this.profileModel = profileModel;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const userId = req.user?.sub;
        if (!userId) {
            throw new common_1.ForbiddenException('Missing authenticated user context');
        }
        const profile = await this.profileModel
            .findById(userId)
            .select('status')
            .lean()
            .exec();
        if (!profile) {
            throw new common_1.NotFoundException('Employee profile not found');
        }
        if (this.blockedStatuses.has(profile.status)) {
            throw new common_1.ForbiddenException(`Access denied for status '${profile.status}'. Contact HR for assistance.`);
        }
        return true;
    }
};
exports.ActiveEmployeeGuard = ActiveEmployeeGuard;
exports.ActiveEmployeeGuard = ActiveEmployeeGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ActiveEmployeeGuard);
//# sourceMappingURL=active-employee.guard.js.map