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
exports.PayrollTrackingController = void 0;
const common_1 = require("@nestjs/common");
const payroll_tracking_service_1 = require("./payroll-tracking.service");
const create_dispute_dto_1 = require("./dto/create-dispute.dto");
const create_claim_dto_1 = require("./dto/create-claim.dto");
const update_dispute_status_dto_1 = require("./dto/update-dispute-status.dto");
const confirm_dispute_dto_1 = require("./dto/confirm-dispute.dto");
const confirm_claim_dto_1 = require("./dto/confirm-claim.dto");
const create_refund_dto_1 = require("./dto/create-refund.dto");
const update_claim_status_dto_1 = require("./dto/update-claim-status.dto");
const payroll_report_dto_1 = require("./dto/payroll-report.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let PayrollTrackingController = class PayrollTrackingController {
    payrollTrackingService;
    constructor(payrollTrackingService) {
        this.payrollTrackingService = payrollTrackingService;
    }
    async getMyPayslips(req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getEmployeePayslips(employeeId);
    }
    async getPayslipDetails(id) {
        return this.payrollTrackingService.getPayslipDetails(id);
    }
    async downloadPayslip(payslipId, req) {
        const buffer = await this.payrollTrackingService.generatePayslipPdf(payslipId);
        return new common_1.StreamableFile(buffer, {
            type: 'application/pdf',
            disposition: `attachment; filename="payslip-${payslipId}.pdf"`,
        });
    }
    async downloadTaxDocument(payslipId, req) {
        const buffer = await this.payrollTrackingService.generateTaxDocumentPdf(payslipId);
        return new common_1.StreamableFile(buffer, {
            type: 'application/pdf',
            disposition: `attachment; filename="tax-document-${payslipId}.pdf"`,
        });
    }
    async getMySalaryHistory(req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getSalaryHistory(employeeId);
    }
    async createDispute(createDisputeDto, req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.createDispute(createDisputeDto, employeeId);
    }
    async getMyDisputes(req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getDisputes(employeeId);
    }
    async getAllDisputes() {
        return this.payrollTrackingService.getAllDisputes();
    }
    async getApprovedDisputes() {
        return this.payrollTrackingService.getApprovedDisputes();
    }
    async confirmDispute(id, confirmDisputeDto, req) {
        return this.payrollTrackingService.confirmDispute(id, confirmDisputeDto, req.user._id);
    }
    async getPendingManagerApprovalDisputes() {
        return this.payrollTrackingService.getPendingManagerApprovalDisputes();
    }
    async updateDisputeStatus(id, updateDisputeStatusDto, req) {
        return this.payrollTrackingService.updateDisputeStatus(id, updateDisputeStatusDto, req.user._id);
    }
    async createClaim(createClaimDto, req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.createClaim(createClaimDto, employeeId);
    }
    async getMyClaims(req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getClaims(employeeId);
    }
    async getAllClaims() {
        return this.payrollTrackingService.getAllClaims();
    }
    async getApprovedClaims() {
        return this.payrollTrackingService.getApprovedClaims();
    }
    async confirmClaim(id, confirmClaimDto, req) {
        return this.payrollTrackingService.confirmClaim(id, confirmClaimDto, req.user._id);
    }
    async getPendingManagerApprovalClaims() {
        return this.payrollTrackingService.getPendingManagerApprovalClaims();
    }
    async updateClaimStatus(id, updateClaimStatusDto, req) {
        return this.payrollTrackingService.updateClaimStatus(id, updateClaimStatusDto, req.user._id);
    }
    async createRefundForDispute(id, createRefundDto, req) {
        const staffId = req.user._id;
        return this.payrollTrackingService.createRefundForDispute(id, createRefundDto.amount, createRefundDto.description, staffId);
    }
    async createRefundForClaim(id, req) {
        const staffId = req.user._id;
        return this.payrollTrackingService.createRefundForClaim(id, staffId);
    }
    async getDepartmentPayrollReport(departmentId, query) {
        return this.payrollTrackingService.getDepartmentPayrollReport(departmentId, query);
    }
    async getPayrollSummary(query) {
        return this.payrollTrackingService.getPayrollSummary(query);
    }
    async getDeductionsBenefitsReport(query) {
        return this.payrollTrackingService.getDeductionsBenefitsReport(query);
    }
};
exports.PayrollTrackingController = PayrollTrackingController;
__decorate([
    (0, common_1.Get)('payslips/me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getMyPayslips", null);
__decorate([
    (0, common_1.Get)('payslips/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getPayslipDetails", null);
__decorate([
    (0, common_1.Get)('payslips/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "downloadPayslip", null);
__decorate([
    (0, common_1.Get)('tax-documents/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "downloadTaxDocument", null);
__decorate([
    (0, common_1.Get)('history/me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getMySalaryHistory", null);
__decorate([
    (0, common_1.Post)('disputes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dispute_dto_1.CreateDisputeDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "createDispute", null);
__decorate([
    (0, common_1.Get)('disputes/me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getMyDisputes", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Specialist'),
    (0, common_1.Get)('disputes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getAllDisputes", null);
__decorate([
    (0, roles_decorator_1.Roles)('Finance Staff'),
    (0, common_1.Get)('disputes/approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getApprovedDisputes", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Manager'),
    (0, common_1.Patch)('disputes/:id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, confirm_dispute_dto_1.ConfirmDisputeDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "confirmDispute", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Manager'),
    (0, common_1.Get)('disputes/pending-approval'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getPendingManagerApprovalDisputes", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Specialist'),
    (0, common_1.Patch)('disputes/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_dispute_status_dto_1.UpdateDisputeStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "updateDisputeStatus", null);
__decorate([
    (0, common_1.Post)('claims'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_claim_dto_1.CreateClaimDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "createClaim", null);
__decorate([
    (0, common_1.Get)('claims/me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getMyClaims", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Specialist'),
    (0, common_1.Get)('claims'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getAllClaims", null);
__decorate([
    (0, roles_decorator_1.Roles)('Finance Staff'),
    (0, common_1.Get)('claims/approved'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getApprovedClaims", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Manager'),
    (0, common_1.Patch)('claims/:id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, confirm_claim_dto_1.ConfirmClaimDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "confirmClaim", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Manager'),
    (0, common_1.Get)('claims/pending-approval'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getPendingManagerApprovalClaims", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Specialist'),
    (0, common_1.Patch)('claims/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_claim_status_dto_1.UpdateClaimStatusDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "updateClaimStatus", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Manager'),
    (0, common_1.Post)('refunds/dispute/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_refund_dto_1.CreateRefundDto, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "createRefundForDispute", null);
__decorate([
    (0, roles_decorator_1.Roles)('Finance Staff'),
    (0, common_1.Post)('refunds/claim/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "createRefundForClaim", null);
__decorate([
    (0, roles_decorator_1.Roles)('Payroll Specialist'),
    (0, common_1.Post)('reports/department/:departmentId'),
    __param(0, (0, common_1.Param)('departmentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, payroll_report_dto_1.ReportPeriodDto]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getDepartmentPayrollReport", null);
__decorate([
    (0, roles_decorator_1.Roles)('Finance Staff'),
    (0, common_1.Post)('reports/summary'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_report_dto_1.SummaryReportDto]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getPayrollSummary", null);
__decorate([
    (0, roles_decorator_1.Roles)('Finance Staff'),
    (0, common_1.Post)('reports/deductions-benefits'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payroll_report_dto_1.ReportPeriodDto]),
    __metadata("design:returntype", Promise)
], PayrollTrackingController.prototype, "getDeductionsBenefitsReport", null);
exports.PayrollTrackingController = PayrollTrackingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('payroll-tracking'),
    __metadata("design:paramtypes", [payroll_tracking_service_1.PayrollTrackingService])
], PayrollTrackingController);
//# sourceMappingURL=payroll-tracking.controller.js.map