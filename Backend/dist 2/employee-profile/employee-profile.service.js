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
exports.EmployeeProfileService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_profile_schema_1 = require("./models/employee-profile.schema");
const ep_change_request_schema_1 = require("./models/ep-change-request.schema");
const profile_audit_log_schema_1 = require("./models/profile-audit-log.schema");
const position_schema_1 = require("../organization-structure/models/position.schema");
const department_schema_1 = require("../organization-structure/models/department.schema");
const appraisal_record_schema_1 = require("../performance/models/appraisal-record.schema");
const qualification_schema_1 = require("./models/qualification.schema");
const workflow_rule_schema_1 = require("./workflow-rule.schema");
const profile_sync_service_1 = require("./profile-sync.service");
const employee_profile_enums_1 = require("./enums/employee-profile.enums");
const employee_system_role_schema_1 = require("./models/employee-system-role.schema");
const SELF_EDITABLE_FIELDS = new Set([
    'mobilePhone',
    'personalEmail',
    'address',
    'biography',
    'profilePictureUrl',
]);
const GOVERNED_FIELDS = new Set([
    'primaryPositionId',
    'primaryDepartmentId',
    'supervisorPositionId',
    'payGradeId',
    'firstName',
    'middleName',
    'lastName',
    'nationalId',
    'maritalStatus',
]);
let EmployeeProfileService = class EmployeeProfileService {
    profileModel;
    changeRequestModel;
    positionModel;
    departmentModel;
    appraisalRecordModel;
    auditLogModel;
    systemRoleModel;
    qualificationModel;
    workflowRuleModel;
    syncService;
    constructor(profileModel, changeRequestModel, positionModel, departmentModel, appraisalRecordModel, auditLogModel, systemRoleModel, qualificationModel, workflowRuleModel, syncService) {
        this.profileModel = profileModel;
        this.changeRequestModel = changeRequestModel;
        this.positionModel = positionModel;
        this.departmentModel = departmentModel;
        this.appraisalRecordModel = appraisalRecordModel;
        this.auditLogModel = auditLogModel;
        this.systemRoleModel = systemRoleModel;
        this.qualificationModel = qualificationModel;
        this.workflowRuleModel = workflowRuleModel;
        this.syncService = syncService;
    }
    toId(val) {
        return val instanceof mongoose_2.Types.ObjectId
            ? val.toHexString()
            : typeof val === 'string'
                ? val
                : undefined;
    }
    async getMyProfile(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        const profile = await this.profileModel
            .findById(employeeId)
            .populate('primaryPositionId')
            .populate('primaryDepartmentId')
            .populate('payGradeId')
            .lean()
            .exec();
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        let lastAppraisal = undefined;
        if (profile.lastAppraisalRecordId) {
            lastAppraisal = await this.appraisalRecordModel
                .findById(profile.lastAppraisalRecordId)
                .select('totalScore overallRatingLabel cycleId templateId createdAt')
                .lean()
                .exec();
        }
        else {
            lastAppraisal = await this.appraisalRecordModel
                .findOne({ employeeProfileId: profile._id })
                .sort({ createdAt: -1 })
                .select('totalScore overallRatingLabel cycleId templateId createdAt')
                .lean()
                .exec();
        }
        const qualification = await this.qualificationModel
            .find({ employeeProfileId: profile._id })
            .sort({ createdAt: -1 })
            .limit(1)
            .lean()
            .exec();
        return {
            id: profile._id,
            employeeNumber: profile.employeeNumber,
            name: profile.fullName || `${profile.firstName} ${profile.lastName}`,
            status: profile.status,
            dateOfHire: profile.dateOfHire,
            payGrade: profile.payGradeId || null,
            position: profile.primaryPositionId || null,
            department: profile.primaryDepartmentId || null,
            contact: {
                email: profile.workEmail || profile.personalEmail,
                mobilePhone: profile.mobilePhone,
                address: profile.address,
            },
            biography: profile.biography,
            profilePictureUrl: profile.profilePictureUrl,
            lastAppraisal: lastAppraisal || null,
            highestQualification: qualification[0]
                ? {
                    establishmentName: qualification[0].establishmentName,
                    graduationType: qualification[0].graduationType,
                }
                : null,
        };
    }
    async updateSelfProfile(employeeId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
        if (!currentProfile)
            throw new common_1.NotFoundException('Profile not found');
        const update = {};
        const changedFields = [];
        const previousValues = {};
        const newValues = {};
        for (const key of Object.keys(dto)) {
            if (!SELF_EDITABLE_FIELDS.has(key)) {
                throw new common_1.BadRequestException(`Field '${String(key)}' is not self-editable`);
            }
            if (key === 'address' && dto.address) {
                update['address'] = {
                    city: dto.address.city,
                    streetAddress: dto.address.streetAddress,
                    country: dto.address.country,
                };
                changedFields.push('address');
                previousValues['address'] = currentProfile.address;
                newValues['address'] = update['address'];
            }
            else {
                update[key] = dto[key];
                changedFields.push(key);
                previousValues[key] = currentProfile[key];
                newValues[key] = dto[key];
            }
        }
        const updated = await this.profileModel
            .findByIdAndUpdate(employeeId, { $set: update }, { new: true })
            .lean()
            .exec();
        await this.createAuditLog(new mongoose_2.Types.ObjectId(employeeId), new mongoose_2.Types.ObjectId(employeeId), 'SELF_UPDATE', changedFields, previousValues, newValues);
        return { message: 'Profile updated', profileId: updated?._id };
    }
    async submitChangeRequest(employeeId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        if (!dto.fields || dto.fields.length === 0) {
            throw new common_1.BadRequestException('At least one field change is required');
        }
        for (const change of dto.fields) {
            if (!GOVERNED_FIELDS.has(change.fieldName)) {
                throw new common_1.BadRequestException(`Field '${change.fieldName}' cannot be changed via request or is not governed here`);
            }
        }
        const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        const description = dto.fields
            .map((f) => `${f.fieldName}: '${String(f.oldValue)}' -> '${String(f.newValue)}'`)
            .join('; ');
        const created = await this.changeRequestModel.create({
            requestId,
            employeeProfileId: new mongoose_2.Types.ObjectId(employeeId),
            requestDescription: description,
            fieldChanges: dto.fields,
            reason: dto.reason,
            status: employee_profile_enums_1.ProfileChangeStatus.PENDING,
        });
        const requestedFields = dto.fields.map((f) => f.fieldName).sort();
        const rules = await this.workflowRuleModel.find({ autoApprove: true }).lean().exec();
        const autoApprove = rules.some((r) => r.autoApprove && this.isExactFieldMatch(r.fieldNames, requestedFields));
        if (autoApprove) {
            const update = {};
            for (const change of dto.fields) {
                if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId', 'payGradeId'].includes(change.fieldName)) {
                    update[change.fieldName] = new mongoose_2.Types.ObjectId(String(change.newValue));
                }
                else {
                    update[change.fieldName] = change.newValue;
                }
            }
            await this.profileModel.findByIdAndUpdate(employeeId, { $set: update }).exec();
            created.status = employee_profile_enums_1.ProfileChangeStatus.APPROVED;
            created.processedByEmployeeId = new mongoose_2.Types.ObjectId(employeeId);
            created.processedAt = new Date();
            await created.save();
            await this.createAuditLog(new mongoose_2.Types.ObjectId(employeeId), new mongoose_2.Types.ObjectId(employeeId), 'CHANGE_REQUEST_AUTO_APPROVED', dto.fields.map((f) => f.fieldName), Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.oldValue])), Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.newValue])), dto.reason, requestId);
        }
        await this.createAuditLog(new mongoose_2.Types.ObjectId(employeeId), new mongoose_2.Types.ObjectId(employeeId), 'CHANGE_REQUEST_SUBMITTED', dto.fields.map((f) => f.fieldName), Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.oldValue])), Object.fromEntries(dto.fields.map((f) => [f.fieldName, f.newValue])), dto.reason, requestId);
        return {
            message: 'Change request submitted',
            requestId: created.requestId,
            status: created.status,
        };
    }
    async getTeamMembers(managerId) {
        if (!mongoose_2.Types.ObjectId.isValid(managerId)) {
            throw new common_1.BadRequestException('Invalid manager id');
        }
        const manager = await this.profileModel
            .findById(managerId)
            .select('primaryPositionId')
            .lean()
            .exec();
        if (!manager) {
            throw new common_1.NotFoundException('Manager profile not found');
        }
        if (!manager.primaryPositionId) {
            return { teamMembers: [], count: 0 };
        }
        const teamMembers = await this.profileModel
            .find({ supervisorPositionId: manager.primaryPositionId })
            .populate('primaryPositionId', 'code title')
            .populate('primaryDepartmentId', 'code name')
            .select('employeeNumber firstName lastName fullName workEmail profilePictureUrl status primaryPositionId primaryDepartmentId dateOfHire')
            .lean()
            .exec();
        return {
            teamMembers: teamMembers.map((member) => ({
                id: member._id,
                name: member.fullName || `${member.firstName} ${member.lastName}`,
                status: member.status,
                position: member.primaryPositionId || null,
                department: member.primaryDepartmentId || null,
                dateOfHire: member.dateOfHire,
            })),
            count: teamMembers.length,
        };
    }
    async getTeamSummary(managerId) {
        if (!mongoose_2.Types.ObjectId.isValid(managerId)) {
            throw new common_1.BadRequestException('Invalid manager id');
        }
        const manager = await this.profileModel
            .findById(managerId)
            .select('primaryPositionId primaryDepartmentId')
            .populate('primaryDepartmentId', 'code name')
            .lean()
            .exec();
        if (!manager) {
            throw new common_1.NotFoundException('Manager profile not found');
        }
        if (!manager.primaryPositionId) {
            return {
                managerDepartment: manager.primaryDepartmentId || null,
                totalTeamMembers: 0,
                byPosition: [],
                byDepartment: [],
                byStatus: [],
            };
        }
        const byPosition = await this.profileModel.aggregate([
            { $match: { supervisorPositionId: manager.primaryPositionId } },
            {
                $lookup: {
                    from: 'positions',
                    localField: 'primaryPositionId',
                    foreignField: '_id',
                    as: 'position',
                },
            },
            { $unwind: { path: '$position', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$primaryPositionId',
                    title: { $first: '$position.title' },
                    code: { $first: '$position.code' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const byDepartment = await this.profileModel.aggregate([
            { $match: { supervisorPositionId: manager.primaryPositionId } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'primaryDepartmentId',
                    foreignField: '_id',
                    as: 'department',
                },
            },
            { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$primaryDepartmentId',
                    name: { $first: '$department.name' },
                    code: { $first: '$department.code' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const byStatus = await this.profileModel.aggregate([
            { $match: { supervisorPositionId: manager.primaryPositionId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const totalTeamMembers = byStatus.reduce((sum, s) => sum + s.count, 0);
        return {
            managerDepartment: manager.primaryDepartmentId || null,
            totalTeamMembers,
            byPosition,
            byDepartment,
            byStatus,
        };
    }
    async searchEmployees(dto) {
        const filter = {};
        if (dto.name) {
            const nameRegex = new RegExp(dto.name, 'i');
            filter.$or = [
                { firstName: nameRegex },
                { lastName: nameRegex },
                { fullName: nameRegex },
            ];
        }
        if (dto.employeeNumber) {
            filter.employeeNumber = new RegExp(dto.employeeNumber, 'i');
        }
        if (dto.departmentId && mongoose_2.Types.ObjectId.isValid(dto.departmentId)) {
            filter.primaryDepartmentId = new mongoose_2.Types.ObjectId(dto.departmentId);
        }
        if (dto.positionId && mongoose_2.Types.ObjectId.isValid(dto.positionId)) {
            filter.primaryPositionId = new mongoose_2.Types.ObjectId(dto.positionId);
        }
        if (dto.status) {
            filter.status = dto.status;
        }
        const page = dto.page || 1;
        const limit = dto.limit || 20;
        const skip = (page - 1) * limit;
        const [employees, total] = await Promise.all([
            this.profileModel
                .find(filter)
                .populate('primaryPositionId', 'code title')
                .populate('primaryDepartmentId', 'code name')
                .populate('payGradeId', 'name minSalary maxSalary')
                .select('employeeNumber firstName lastName fullName workEmail personalEmail mobilePhone status primaryPositionId primaryDepartmentId payGradeId dateOfHire profilePictureUrl')
                .skip(skip)
                .limit(limit)
                .sort({ employeeNumber: 1 })
                .lean()
                .exec(),
            this.profileModel.countDocuments(filter).exec(),
        ]);
        return {
            employees: employees.map((emp) => ({
                id: emp._id,
                employeeNumber: emp.employeeNumber,
                name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
                workEmail: emp.workEmail,
                personalEmail: emp.personalEmail,
                mobilePhone: emp.mobilePhone,
                status: emp.status,
                position: emp.primaryPositionId || null,
                department: emp.primaryDepartmentId || null,
                payGrade: emp.payGradeId || null,
                dateOfHire: emp.dateOfHire,
                profilePictureUrl: emp.profilePictureUrl,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async createAuditLog(employeeProfileId, performedByEmployeeId, action, changedFields, previousValues, newValues, reason, changeRequestId) {
        await this.auditLogModel.create({
            employeeProfileId,
            performedByEmployeeId,
            action,
            changedFields,
            previousValues,
            newValues,
            reason,
            changeRequestId,
            performedAt: new Date(),
        });
    }
    async getEmployeeById(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        const profile = await this.profileModel
            .findById(employeeId)
            .populate('primaryPositionId')
            .populate('primaryDepartmentId')
            .populate('supervisorPositionId')
            .populate('payGradeId')
            .lean()
            .exec();
        if (!profile) {
            throw new common_1.NotFoundException('Employee profile not found');
        }
        return profile;
    }
    async hrUpdateEmployeeProfile(employeeId, hrAdminId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        if (!mongoose_2.Types.ObjectId.isValid(hrAdminId)) {
            throw new common_1.BadRequestException('Invalid HR admin id');
        }
        const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
        if (!currentProfile) {
            throw new common_1.NotFoundException('Employee profile not found');
        }
        const { changeReason, ...updateFields } = dto;
        const update = {};
        const changedFields = [];
        const previousValues = {};
        const newValues = {};
        for (const [key, value] of Object.entries(updateFields)) {
            if (value !== undefined) {
                if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId', 'payGradeId'].includes(key) && typeof value === 'string') {
                    update[key] = new mongoose_2.Types.ObjectId(value);
                }
                else {
                    update[key] = value;
                }
                changedFields.push(key);
                previousValues[key] = currentProfile[key];
                newValues[key] = value;
            }
        }
        if (updateFields.firstName || updateFields.lastName) {
            const firstName = updateFields.firstName || currentProfile.firstName;
            const lastName = updateFields.lastName || currentProfile.lastName;
            update.fullName = `${firstName} ${lastName}`;
            changedFields.push('fullName');
        }
        if (changedFields.length === 0) {
            throw new common_1.BadRequestException('No fields to update');
        }
        const updated = await this.profileModel
            .findByIdAndUpdate(employeeId, { $set: update }, { new: true })
            .lean()
            .exec();
        if (changedFields.includes('status')) {
            this.syncService.emitStatusChanged(employeeId, String(previousValues['status']), String(newValues['status']));
        }
        if (changedFields.some((f) => ['primaryPositionId', 'primaryDepartmentId'].includes(f))) {
            this.syncService.emitHierarchyChanged(employeeId, this.toId(update['primaryPositionId']), this.toId(update['primaryDepartmentId']));
        }
        if (changedFields.includes('payGradeId')) {
            this.syncService.emitPayGradeChanged(employeeId, this.toId(previousValues['payGradeId']), this.toId(newValues['payGradeId']));
        }
        await this.createAuditLog(new mongoose_2.Types.ObjectId(employeeId), new mongoose_2.Types.ObjectId(hrAdminId), 'HR_UPDATE', changedFields, previousValues, newValues, changeReason);
        return {
            message: 'Employee profile updated successfully',
            employeeId: updated?._id,
            changedFields,
        };
    }
    async getPendingChangeRequests(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            this.changeRequestModel
                .find({ status: employee_profile_enums_1.ProfileChangeStatus.PENDING })
                .populate('employeeProfileId', 'employeeNumber firstName lastName fullName')
                .sort({ submittedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.changeRequestModel.countDocuments({ status: employee_profile_enums_1.ProfileChangeStatus.PENDING }).exec(),
        ]);
        return {
            requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async processChangeRequest(requestId, hrAdminId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(hrAdminId)) {
            throw new common_1.BadRequestException('Invalid HR admin id');
        }
        const request = await this.changeRequestModel.findOne({ requestId }).exec();
        if (!request) {
            throw new common_1.NotFoundException('Change request not found');
        }
        if (request.status !== employee_profile_enums_1.ProfileChangeStatus.PENDING) {
            throw new common_1.BadRequestException('Change request has already been processed');
        }
        request.status = dto.status;
        request.processedByEmployeeId = new mongoose_2.Types.ObjectId(hrAdminId);
        request.processedAt = new Date();
        request.processingComments = dto.comments;
        await request.save();
        if (dto.status === employee_profile_enums_1.ProfileChangeStatus.APPROVED && request.fieldChanges?.length > 0) {
            const update = {};
            const newValues = {};
            for (const change of request.fieldChanges) {
                if (['primaryPositionId', 'primaryDepartmentId', 'supervisorPositionId', 'payGradeId'].includes(change.fieldName)) {
                    update[change.fieldName] = new mongoose_2.Types.ObjectId(change.newValue);
                }
                else {
                    update[change.fieldName] = change.newValue;
                }
                newValues[change.fieldName] = change.newValue;
            }
            await this.profileModel.findByIdAndUpdate(request.employeeProfileId, { $set: update }).exec();
            const changedFieldNames = request.fieldChanges.map((f) => f.fieldName);
            if (changedFieldNames.some((f) => ['primaryPositionId', 'primaryDepartmentId'].includes(f))) {
                this.syncService.emitHierarchyChanged(String(request.employeeProfileId), this.toId(update['primaryPositionId']), this.toId(update['primaryDepartmentId']));
            }
            if (changedFieldNames.includes('payGradeId')) {
                this.syncService.emitPayGradeChanged(String(request.employeeProfileId), undefined, this.toId(update['payGradeId']));
            }
            if (changedFieldNames.includes('status')) {
                const oldStatus = request.fieldChanges.find(f => f.fieldName === 'status')?.oldValue;
                const oldStatusStr = typeof oldStatus === 'string' ? oldStatus : undefined;
                const newStatusStr = typeof update['status'] === 'string' ? update['status'] : undefined;
                this.syncService.emitStatusChanged(String(request.employeeProfileId), oldStatusStr ?? '', newStatusStr ?? '');
            }
            await this.createAuditLog(request.employeeProfileId, new mongoose_2.Types.ObjectId(hrAdminId), 'CHANGE_REQUEST_APPROVED', request.fieldChanges.map((f) => f.fieldName), Object.fromEntries(request.fieldChanges.map((f) => [f.fieldName, f.oldValue])), newValues, dto.comments, requestId);
        }
        else {
            await this.createAuditLog(request.employeeProfileId, new mongoose_2.Types.ObjectId(hrAdminId), 'CHANGE_REQUEST_REJECTED', [], undefined, undefined, dto.comments, requestId);
        }
        return {
            message: `Change request ${dto.status.toLowerCase()}`,
            requestId,
            status: dto.status,
        };
    }
    async deactivateEmployee(employeeId, hrAdminId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        if (!mongoose_2.Types.ObjectId.isValid(hrAdminId)) {
            throw new common_1.BadRequestException('Invalid HR admin id');
        }
        const currentProfile = await this.profileModel.findById(employeeId).lean().exec();
        if (!currentProfile) {
            throw new common_1.NotFoundException('Employee profile not found');
        }
        const previousStatus = currentProfile.status;
        const effectiveDate = dto.effectiveDate || new Date();
        await this.profileModel.findByIdAndUpdate(employeeId, {
            $set: {
                status: dto.status,
                statusEffectiveFrom: effectiveDate,
            },
        }).exec();
        this.syncService.emitStatusChanged(employeeId, previousStatus, dto.status);
        await this.createAuditLog(new mongoose_2.Types.ObjectId(employeeId), new mongoose_2.Types.ObjectId(hrAdminId), 'DEACTIVATE', ['status', 'statusEffectiveFrom'], { status: previousStatus, statusEffectiveFrom: currentProfile.statusEffectiveFrom }, { status: dto.status, statusEffectiveFrom: effectiveDate }, dto.reason);
        return {
            message: `Employee status changed to ${dto.status}`,
            employeeId,
            previousStatus,
            newStatus: dto.status,
            effectiveDate,
        };
    }
    async assignRoles(employeeId, hrAdminId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        if (!mongoose_2.Types.ObjectId.isValid(hrAdminId)) {
            throw new common_1.BadRequestException('Invalid HR admin id');
        }
        const employee = await this.profileModel.findById(employeeId).select('_id').lean().exec();
        if (!employee) {
            throw new common_1.NotFoundException('Employee profile not found');
        }
        const currentRoles = await this.systemRoleModel
            .findOne({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) })
            .lean()
            .exec();
        const previousRoles = currentRoles?.roles || [];
        const previousPermissions = currentRoles?.permissions || [];
        const result = await this.systemRoleModel.findOneAndUpdate({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) }, {
            $set: {
                roles: dto.roles,
                permissions: dto.permissions || [],
                isActive: dto.isActive ?? true,
            },
        }, { upsert: true, new: true }).exec();
        await this.createAuditLog(new mongoose_2.Types.ObjectId(employeeId), new mongoose_2.Types.ObjectId(hrAdminId), 'ROLE_ASSIGNMENT', ['roles', 'permissions', 'isActive'], { roles: previousRoles, permissions: previousPermissions }, { roles: dto.roles, permissions: dto.permissions || [], isActive: dto.isActive ?? true }, dto.reason);
        return {
            message: 'Roles assigned successfully',
            employeeId,
            roles: dto.roles,
            permissions: dto.permissions || [],
        };
    }
    async getEmployeeRoles(employeeId) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        const roles = await this.systemRoleModel
            .findOne({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) })
            .lean()
            .exec();
        return roles || { roles: [], permissions: [], isActive: false };
    }
    async getAuditHistory(employeeId, page = 1, limit = 50) {
        if (!mongoose_2.Types.ObjectId.isValid(employeeId)) {
            throw new common_1.BadRequestException('Invalid employee id');
        }
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.auditLogModel
                .find({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) })
                .populate('performedByEmployeeId', 'employeeNumber firstName lastName fullName')
                .sort({ performedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean()
                .exec(),
            this.auditLogModel.countDocuments({ employeeProfileId: new mongoose_2.Types.ObjectId(employeeId) }).exec(),
        ]);
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    isExactFieldMatch(ruleFields, requestedFields) {
        const sortedRuleFields = [...ruleFields].sort();
        return (sortedRuleFields.length === requestedFields.length &&
            sortedRuleFields.every((field, index) => field === requestedFields[index]));
    }
};
exports.EmployeeProfileService = EmployeeProfileService;
exports.EmployeeProfileService = EmployeeProfileService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __param(1, (0, mongoose_1.InjectModel)(ep_change_request_schema_1.EmployeeProfileChangeRequest.name)),
    __param(2, (0, mongoose_1.InjectModel)(position_schema_1.Position.name)),
    __param(3, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(4, (0, mongoose_1.InjectModel)(appraisal_record_schema_1.AppraisalRecord.name)),
    __param(5, (0, mongoose_1.InjectModel)(profile_audit_log_schema_1.ProfileAuditLog.name)),
    __param(6, (0, mongoose_1.InjectModel)(employee_system_role_schema_1.EmployeeSystemRole.name)),
    __param(7, (0, mongoose_1.InjectModel)(qualification_schema_1.EmployeeQualification.name)),
    __param(8, (0, mongoose_1.InjectModel)(workflow_rule_schema_1.ChangeWorkflowRule.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        profile_sync_service_1.ProfileSyncService])
], EmployeeProfileService);
//# sourceMappingURL=employee-profile.service.js.map