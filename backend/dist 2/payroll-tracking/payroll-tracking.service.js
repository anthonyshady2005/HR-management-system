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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollTrackingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const claims_schema_1 = require("./models/claims.schema");
const disputes_schema_1 = require("./models/disputes.schema");
const refunds_schema_1 = require("./models/refunds.schema");
const payroll_tracking_enum_1 = require("./enums/payroll-tracking-enum");
const payroll_report_dto_1 = require("./dto/payroll-report.dto");
const employee_profile_schema_1 = require("../employee-profile/models/employee-profile.schema");
const notification_log_schema_1 = require("../time-management/models/notification-log.schema");
const employee_system_role_schema_1 = require("../employee-profile/models/employee-system-role.schema");
const pdfkit_1 = __importDefault(require("pdfkit"));
let PayrollTrackingService = class PayrollTrackingService {
    claimsModel;
    disputesModel;
    refundsModel;
    paySlipModel;
    employeeProfileModel;
    notificationLogModel;
    employeeSystemRoleModel;
    constructor(claimsModel, disputesModel, refundsModel, paySlipModel, employeeProfileModel, notificationLogModel, employeeSystemRoleModel) {
        this.claimsModel = claimsModel;
        this.disputesModel = disputesModel;
        this.refundsModel = refundsModel;
        this.paySlipModel = paySlipModel;
        this.employeeProfileModel = employeeProfileModel;
        this.notificationLogModel = notificationLogModel;
        this.employeeSystemRoleModel = employeeSystemRoleModel;
    }
    async getEmployeePayslips(employeeId) {
        console.log(employeeId);
        return this.paySlipModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }
    async getPayslipDetails(payslipId) {
        const payslip = await this.paySlipModel.findById(payslipId).exec();
        if (!payslip)
            throw new common_1.NotFoundException('Payslip not found');
        return payslip;
    }
    async getSalaryHistory(employeeId) {
        return this.paySlipModel
            .find({ employeeId })
            .select('netPay createdAt')
            .sort({ createdAt: -1 })
            .exec();
    }
    async createDispute(createDisputeDto, employeeId) {
        const disputeCount = await this.disputesModel.countDocuments();
        const disputeId = `DISP-${(disputeCount + 1).toString().padStart(4, '0')}`;
        const newDispute = new this.disputesModel({
            ...createDisputeDto,
            employeeId,
            disputeId,
        });
        return newDispute.save();
    }
    async getDisputes(employeeId) {
        return this.disputesModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }
    async getAllDisputes() {
        return this.disputesModel.find().sort({ createdAt: -1 }).exec();
    }
    async getApprovedDisputes() {
        return this.disputesModel
            .find({ status: payroll_tracking_enum_1.DisputeStatus.APPROVED })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getPendingManagerApprovalDisputes() {
        return this.disputesModel
            .find({ status: payroll_tracking_enum_1.DisputeStatus.PENDING_MANAGER_APPROVAL })
            .sort({ createdAt: -1 })
            .exec();
    }
    async confirmDispute(disputeId, confirmDisputeDto, managerId) {
        const dispute = await this.disputesModel.findById(disputeId);
        if (!dispute)
            throw new common_1.NotFoundException('Dispute not found');
        if (dispute.status !== payroll_tracking_enum_1.DisputeStatus.PENDING_MANAGER_APPROVAL) {
            throw new common_1.NotFoundException('Dispute is not in PENDING_MANAGER_APPROVAL status');
        }
        if (confirmDisputeDto.approved) {
            dispute.status = payroll_tracking_enum_1.DisputeStatus.APPROVED;
            dispute.payrollManagerId = new mongoose_2.Types.ObjectId(managerId);
            if (confirmDisputeDto.comment) {
                dispute.resolutionComment = confirmDisputeDto.comment;
            }
            await dispute.save();
            await this.notifyFinanceStaff(`Dispute ${dispute.disputeId} has been approved by Manager.`);
            return { message: 'Dispute confirmed by manager', dispute };
        }
        else {
            dispute.status = payroll_tracking_enum_1.DisputeStatus.REJECTED;
            dispute.payrollManagerId = new mongoose_2.Types.ObjectId(managerId);
            dispute.rejectionReason = confirmDisputeDto.comment || 'Rejected by Manager';
            return dispute.save();
        }
    }
    async updateDisputeStatus(disputeId, updateDisputeStatusDto, staffId) {
        if (updateDisputeStatusDto.status === payroll_tracking_enum_1.DisputeStatus.APPROVED) {
            throw new Error('Payroll Specialist cannot set status to APPROVED directly.');
        }
        const dispute = await this.disputesModel.findByIdAndUpdate(disputeId, {
            ...updateDisputeStatusDto,
            payrollSpecialistId: new mongoose_2.Types.ObjectId(staffId),
        }, { new: true });
        if (!dispute)
            throw new common_1.NotFoundException('Dispute not found');
        return dispute;
    }
    async createClaim(createClaimDto, employeeId) {
        const claimCount = await this.claimsModel.countDocuments();
        const claimId = `CLAIM-${(claimCount + 1).toString().padStart(4, '0')}`;
        const newClaim = new this.claimsModel({
            ...createClaimDto,
            employeeId,
            claimId,
        });
        return newClaim.save();
    }
    async getClaims(employeeId) {
        return this.claimsModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }
    async getAllClaims() {
        return this.claimsModel.find().sort({ createdAt: -1 }).exec();
    }
    async getApprovedClaims() {
        return this.claimsModel
            .find({ status: payroll_tracking_enum_1.ClaimStatus.APPROVED })
            .sort({ createdAt: -1 })
            .exec();
    }
    async getPendingManagerApprovalClaims() {
        return this.claimsModel
            .find({ status: payroll_tracking_enum_1.ClaimStatus.PENDING_MANAGER_APPROVAL })
            .sort({ createdAt: -1 })
            .exec();
    }
    async confirmClaim(claimId, confirmClaimDto, managerId) {
        const claim = await this.claimsModel.findById(claimId);
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        if (claim.status !== payroll_tracking_enum_1.ClaimStatus.PENDING_MANAGER_APPROVAL) {
            throw new common_1.NotFoundException('Claim is not in PENDING_MANAGER_APPROVAL status');
        }
        if (confirmClaimDto.approved) {
            claim.status = payroll_tracking_enum_1.ClaimStatus.APPROVED;
            claim.payrollManagerId = new mongoose_2.Types.ObjectId(managerId);
            if (confirmClaimDto.comment) {
                claim.resolutionComment = confirmClaimDto.comment;
            }
            await claim.save();
            await this.notifyFinanceStaff(`Claim ${claim.claimId} has been approved by Manager.`);
            return { message: 'Claim confirmed by manager', claim };
        }
        else {
            claim.status = payroll_tracking_enum_1.ClaimStatus.REJECTED;
            claim.payrollManagerId = new mongoose_2.Types.ObjectId(managerId);
            claim.rejectionReason = confirmClaimDto.comment || 'Rejected by Manager';
            return claim.save();
        }
    }
    async updateClaimStatus(claimId, updateClaimStatusDto, staffId) {
        if (updateClaimStatusDto.status === payroll_tracking_enum_1.ClaimStatus.APPROVED) {
            throw new Error('Payroll Specialist cannot set status to APPROVED directly.');
        }
        const claim = await this.claimsModel.findByIdAndUpdate(claimId, {
            ...updateClaimStatusDto,
            payrollSpecialistId: new mongoose_2.Types.ObjectId(staffId),
        }, { new: true });
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        return claim;
    }
    async createRefundForDispute(disputeId, amount, description, financeStaffId) {
        try {
            console.log('Creating refund for dispute:', { disputeId, amount, description, financeStaffId });
            const dispute = await this.disputesModel.findById(disputeId);
            if (!dispute)
                throw new common_1.NotFoundException('Dispute not found');
            const refund = new this.refundsModel({
                disputeId: dispute._id,
                employeeId: dispute.employeeId,
                financeStaffId,
                refundDetails: {
                    description,
                    amount,
                },
                status: payroll_tracking_enum_1.RefundStatus.PENDING,
            });
            return await refund.save();
        }
        catch (error) {
            console.error('Error creating refund:', error);
            throw error;
        }
    }
    async createRefundForClaim(claimId, financeStaffId) {
        const claim = await this.claimsModel.findById(claimId);
        if (!claim)
            throw new common_1.NotFoundException('Claim not found');
        const refund = new this.refundsModel({
            claimId: claim._id,
            employeeId: claim.employeeId,
            financeStaffId,
            refundDetails: {
                description: `Refund for claim ${claim.claimId}`,
                amount: claim.approvedAmount || claim.amount,
            },
            status: payroll_tracking_enum_1.RefundStatus.PENDING,
        });
        return refund.save();
    }
    async generatePayslipPdf(payslipId) {
        const payslip = await this.paySlipModel
            .findById(payslipId)
            .populate('employeeId')
            .populate('payrollRunId')
            .exec();
        if (!payslip) {
            throw new common_1.NotFoundException('Payslip not found');
        }
        return this.buildPdfBuffer(payslip);
    }
    buildPdfBuffer(payslip) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            doc.fontSize(20).text('Payslip', { align: 'center' }).moveDown();
            const employee = payslip.employeeId || {};
            const payrollRun = payslip.payrollRunId || {};
            doc.fontSize(12);
            doc.text(`Employee Name: ${employee.firstName}`);
            doc.text(`Employee ID: ${employee.employeeNumber}`);
            doc.text(`Payroll Run: ${payrollRun.runId}`);
            doc.text(`Period: ${payrollRun.payrollPeriod}`);
            doc.text(`Payment Status: ${payslip.paymentStatus}`);
            doc.moveDown();
            doc.fontSize(14).text('Earnings', { underline: true });
            doc.moveDown(0.5);
            const earnings = payslip.earningsDetails;
            doc.fontSize(12).text(`Base Salary: ${earnings.baseSalary ?? 0}`);
            if (earnings.allowances && earnings.allowances.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Allowances:');
                doc.font('Helvetica');
                earnings.allowances.forEach((a) => {
                    doc.text(`- ${a.name || 'Allowance'}: ${a.amount ?? a.value ?? 0}`);
                });
            }
            if (earnings.bonuses && earnings.bonuses.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Bonuses:');
                doc.font('Helvetica');
                earnings.bonuses.forEach((b) => {
                    doc.text(`- ${b.name || 'Bonus'}: ${b.amount ?? b.value ?? 0}`);
                });
            }
            if (earnings.benefits && earnings.benefits.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Benefits:');
                doc.font('Helvetica');
                earnings.benefits.forEach((benefit) => {
                    doc.text(`- ${benefit.name || 'Benefit'}: ${benefit.amount ?? benefit.value ?? 0}`);
                });
            }
            if (earnings.refunds && earnings.refunds.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Refunds:');
                doc.font('Helvetica');
                earnings.refunds.forEach((r) => {
                    doc.text(`- ${r.reason || r.type || 'Refund'}: ${r.amount ?? 0}`);
                });
            }
            doc.moveDown();
            doc.fontSize(14).text('Deductions', { underline: true });
            doc.moveDown(0.5);
            const deductions = payslip.deductionsDetails;
            if (deductions.taxes && deductions.taxes.length > 0) {
                doc.font('Helvetica-Bold').text('Taxes:');
                doc.font('Helvetica');
                deductions.taxes.forEach((t) => {
                    doc.text(`- ${t.name || 'Tax'}: ${t.amount ?? t.value ?? 0}`);
                });
                doc.moveDown(0.3);
            }
            if (deductions.insurances && deductions.insurances.length > 0) {
                doc.font('Helvetica-Bold').text('Insurances:');
                doc.font('Helvetica');
                deductions.insurances.forEach((i) => {
                    doc.text(`- ${i.name || 'Insurance'}: ${i.amount ?? i.value ?? 0}`);
                });
                doc.moveDown(0.3);
            }
            if (deductions.penalties) {
                const p = deductions.penalties;
                doc.font('Helvetica-Bold').text('Penalties:');
                doc.font('Helvetica');
                if (Array.isArray(p.items)) {
                    p.items.forEach((item) => {
                        doc.text(`- ${item.reason || 'Penalty'}: ${item.amount ?? 0}`);
                    });
                }
                else {
                    doc.text(`- Total Penalties: ${p.total ?? 0}`);
                }
            }
            doc.moveDown();
            doc.fontSize(14).text('Summary', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12);
            doc.text(`Total Gross Salary: ${payslip.totalGrossSalary}`);
            doc.text(`Total Deductions: ${payslip.totaDeductions ?? 0}`);
            doc.text(`Net Pay: ${payslip.netPay}`, { underline: true });
            doc.end();
        });
    }
    async generateTaxDocumentPdf(payslipId) {
        const payslip = await this.paySlipModel
            .findById(payslipId)
            .populate('employeeId')
            .populate('payrollRunId')
            .exec();
        if (!payslip) {
            throw new common_1.NotFoundException('Payslip not found');
        }
        return this.buildTaxPdfBuffer(payslip);
    }
    buildTaxPdfBuffer(payslip) {
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));
            const employee = payslip.employeeId || {};
            const payrollRun = payslip.payrollRunId || {};
            const deductions = payslip.deductionsDetails || {};
            doc.fontSize(20).text('Tax Document', { align: 'center' }).moveDown();
            doc.fontSize(12);
            doc.text(`Employee Name: ${employee.firstName}`);
            doc.text(`Employee ID: ${employee.employeeNumber}`);
            doc.text(`Payroll Run: ${payrollRun.runId}`);
            doc.text(`Period: ${payrollRun.payrollPeriod}`);
            doc.text(`Payment Status: ${payslip.paymentStatus}`);
            doc.moveDown();
            doc.fontSize(14).text('Tax Breakdown', { underline: true });
            doc.moveDown(0.5);
            const taxes = deductions.taxes || [];
            const insurances = deductions.insurances || [];
            doc.fontSize(12);
            if (taxes.length === 0 && insurances.length === 0) {
                doc.text('No tax or insurance information available.');
            }
            else {
                if (taxes.length > 0) {
                    doc.font('Helvetica-Bold').text('Taxes:');
                    doc.font('Helvetica');
                    let totalTax = 0;
                    taxes.forEach((t) => {
                        const amount = t.amount ?? t.value ?? t.taxAmount ?? 0;
                        totalTax += amount;
                        doc.text(`- ${t.name || t.taxName || 'Tax'}: ${amount}`);
                    });
                    doc.moveDown(0.3);
                    doc.font('Helvetica-Bold').text(`Total Tax: ${totalTax}`);
                    doc.font('Helvetica');
                    doc.moveDown();
                }
                if (insurances.length > 0) {
                    doc.font('Helvetica-Bold').text('Insurances:');
                    doc.font('Helvetica');
                    let totalInsurance = 0;
                    insurances.forEach((i) => {
                        const amount = i.amount ?? i.value ?? i.insuranceAmount ?? 0;
                        totalInsurance += amount;
                        doc.text(`- ${i.name || i.insuranceName || 'Insurance'}: ${amount}`);
                    });
                    doc.moveDown(0.3);
                    doc.font('Helvetica-Bold').text(`Total Insurance Contributions: ${totalInsurance}`);
                    doc.font('Helvetica');
                    doc.moveDown();
                }
            }
            doc.fontSize(14).text('Summary', { underline: true });
            doc.moveDown(0.5);
            doc.fontSize(12);
            doc.text(`Total Gross Salary: ${payslip.totalGrossSalary}`);
            doc.text(`Total Deductions: ${payslip.totaDeductions ?? 0}`);
            doc.text(`Net Pay: ${payslip.netPay}`);
            doc.end();
        });
    }
    async getDepartmentPayrollReport(departmentId, query) {
        const { startDate, endDate } = query;
        const employees = await this.employeeProfileModel
            .find({ primaryDepartmentId: departmentId })
            .select('_id')
            .exec();
        const employeeIds = employees.map((e) => e._id);
        const aggregation = await this.paySlipModel.aggregate([
            {
                $match: {
                    employeeId: { $in: employeeIds },
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
                },
            },
            {
                $group: {
                    _id: null,
                    totalGrossSalary: { $sum: '$totalGrossSalary' },
                    totalNetPay: { $sum: '$netPay' },
                    totalDeductions: { $sum: '$totaDeductions' },
                    count: { $sum: 1 },
                },
            },
        ]);
        return (aggregation[0] || { totalGrossSalary: 0, totalNetPay: 0, totalDeductions: 0, count: 0 });
    }
    async getPayrollSummary(query) {
        const { type, date } = query;
        const reportDate = new Date(date);
        let startDate, endDate;
        if (type === payroll_report_dto_1.ReportType.MONTH) {
            startDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
            endDate = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0);
        }
        else {
            startDate = new Date(reportDate.getFullYear(), 0, 1);
            endDate = new Date(reportDate.getFullYear(), 11, 31);
        }
        const aggregation = await this.paySlipModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            },
            {
                $group: {
                    _id: null,
                    totalGrossSalary: { $sum: '$totalGrossSalary' },
                    totalNetPay: { $sum: '$netPay' },
                    totalDeductions: { $sum: '$totaDeductions' },
                    count: { $sum: 1 },
                },
            },
        ]);
        return (aggregation[0] || { totalGrossSalary: 0, totalNetPay: 0, totalDeductions: 0, count: 0 });
    }
    async getDeductionsBenefitsReport(query) {
        const { startDate, endDate } = query;
        const payslips = await this.paySlipModel
            .find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
        })
            .exec();
        let totalTaxes = 0;
        let totalInsurance = 0;
        let totalBenefits = 0;
        payslips.forEach((p) => {
            p.deductionsDetails?.taxes?.forEach((t) => {
                if (t.amount)
                    totalTaxes += t.amount;
            });
            p.deductionsDetails?.insurances?.forEach((i) => {
                if (i.amount)
                    totalInsurance += i.amount;
            });
            p.earningsDetails?.benefits?.forEach((b) => {
                if (b.amount)
                    totalBenefits += b.amount;
            });
        });
        return {
            totalTaxes,
            totalInsurance,
            totalBenefits,
            period: { startDate, endDate },
        };
    }
    async notifyFinanceStaff(message) {
        try {
            const financeRoles = await this.employeeSystemRoleModel.find({
                roles: 'Finance Staff',
                isActive: true,
            });
            const notifications = financeRoles.map((role) => ({
                to: role.employeeProfileId,
                type: 'PAYROLL_ALERT',
                message,
            }));
            if (notifications.length > 0) {
                await this.notificationLogModel.insertMany(notifications);
                console.log(`Sent ${notifications.length} notifications to Finance Staff.`);
            }
        }
        catch (error) {
            console.error('Error sending notifications:', error);
        }
    }
};
exports.PayrollTrackingService = PayrollTrackingService;
exports.PayrollTrackingService = PayrollTrackingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(claims_schema_1.claims.name)),
    __param(1, (0, mongoose_1.InjectModel)(disputes_schema_1.disputes.name)),
    __param(2, (0, mongoose_1.InjectModel)(refunds_schema_1.refunds.name)),
    __param(3, (0, mongoose_1.InjectModel)('paySlip')),
    __param(4, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __param(5, (0, mongoose_1.InjectModel)(notification_log_schema_1.NotificationLog.name)),
    __param(6, (0, mongoose_1.InjectModel)(employee_system_role_schema_1.EmployeeSystemRole.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], PayrollTrackingService);
//# sourceMappingURL=payroll-tracking.service.js.map