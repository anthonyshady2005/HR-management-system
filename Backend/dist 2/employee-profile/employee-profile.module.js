"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeProfileModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const employee_profile_controller_1 = require("./employee-profile.controller");
const active_employee_guard_1 = require("./guards/active-employee.guard");
const employee_profile_service_1 = require("./employee-profile.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const candidate_schema_1 = require("./models/candidate.schema");
const employee_profile_schema_1 = require("./models/employee-profile.schema");
const employee_system_role_schema_1 = require("./models/employee-system-role.schema");
const ep_change_request_schema_1 = require("./models/ep-change-request.schema");
const profile_audit_log_schema_1 = require("./models/profile-audit-log.schema");
const department_schema_1 = require("../organization-structure/models/department.schema");
const qualification_schema_1 = require("./models/qualification.schema");
const position_schema_1 = require("../organization-structure/models/position.schema");
const appraisal_record_schema_1 = require("../performance/models/appraisal-record.schema");
const workflow_rule_schema_1 = require("./workflow-rule.schema");
const profile_sync_service_1 = require("./profile-sync.service");
let EmployeeProfileModule = class EmployeeProfileModule {
};
exports.EmployeeProfileModule = EmployeeProfileModule;
exports.EmployeeProfileModule = EmployeeProfileModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: candidate_schema_1.Candidate.name, schema: candidate_schema_1.CandidateSchema },
                { name: employee_profile_schema_1.EmployeeProfile.name, schema: employee_profile_schema_1.EmployeeProfileSchema },
                { name: employee_system_role_schema_1.EmployeeSystemRole.name, schema: employee_system_role_schema_1.EmployeeSystemRoleSchema },
                {
                    name: ep_change_request_schema_1.EmployeeProfileChangeRequest.name,
                    schema: ep_change_request_schema_1.EmployeeProfileChangeRequestSchema,
                },
                { name: qualification_schema_1.EmployeeQualification.name, schema: qualification_schema_1.EmployeeQualificationSchema },
                { name: profile_audit_log_schema_1.ProfileAuditLog.name, schema: profile_audit_log_schema_1.ProfileAuditLogSchema },
                { name: department_schema_1.Department.name, schema: department_schema_1.DepartmentSchema },
                { name: position_schema_1.Position.name, schema: position_schema_1.PositionSchema },
                { name: appraisal_record_schema_1.AppraisalRecord.name, schema: appraisal_record_schema_1.AppraisalRecordSchema },
                { name: workflow_rule_schema_1.ChangeWorkflowRule.name, schema: workflow_rule_schema_1.ChangeWorkflowRuleSchema },
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'DEFAULT_SECRET',
                signOptions: { expiresIn: '7d' },
            }),
        ],
        controllers: [employee_profile_controller_1.EmployeeProfileController],
        providers: [
            employee_profile_service_1.EmployeeProfileService,
            jwt_auth_guard_1.JwtAuthGuard,
            roles_guard_1.RolesGuard,
            profile_sync_service_1.ProfileSyncService,
            active_employee_guard_1.ActiveEmployeeGuard,
        ],
        exports: [employee_profile_service_1.EmployeeProfileService, mongoose_1.MongooseModule],
    })
], EmployeeProfileModule);
//# sourceMappingURL=employee-profile.module.js.map