import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { claims, claimsDocument } from './models/claims.schema';
import { disputes, disputesDocument } from './models/disputes.schema';
import { refunds, refundsDocument } from './models/refunds.schema';
import { paySlip, PayslipDocument } from '../payroll-execution/models/payslip.schema';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ConfirmDisputeDto } from './dto/confirm-dispute.dto';
import { ConfirmClaimDto } from './dto/confirm-claim.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { ClaimStatus, DisputeStatus, RefundStatus } from './enums/payroll-tracking-enum';
import { ReportPeriodDto, SummaryReportDto, ReportType } from './dto/payroll-report.dto';
import {
    EmployeeProfile,
    EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { NotificationLog, NotificationLogDocument } from '../time-management/models/notification-log.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';

import PDFDocument from 'pdfkit';

@Injectable()
export class PayrollTrackingService {
    constructor(
        @InjectModel(claims.name) private claimsModel: Model<claimsDocument>,
        @InjectModel(disputes.name) private disputesModel: Model<disputesDocument>,
        @InjectModel(refunds.name) private refundsModel: Model<refundsDocument>,
        @InjectModel('paySlip') private paySlipModel: Model<PayslipDocument>,
        @InjectModel(EmployeeProfile.name)
        private employeeProfileModel: Model<EmployeeProfileDocument>,
        @InjectModel(NotificationLog.name) private notificationLogModel: Model<NotificationLogDocument>,
        @InjectModel(EmployeeSystemRole.name) private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    ) { }

    ////////////////////////// Employee Self-Service //////////////////////////
    async getEmployeePayslips(employeeId: Types.ObjectId) {
        console.log(employeeId);
        return this.paySlipModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }

    async getPayslipDetails(payslipId: string) {
        const payslip = await this.paySlipModel.findById(payslipId).exec();
        if (!payslip) throw new NotFoundException('Payslip not found');
        return payslip;
    }

    async getSalaryHistory(employeeId: string) {
        return this.paySlipModel
            .find({ employeeId })
            .select('netPay createdAt')
            .sort({ createdAt: -1 })
            .exec();
    }

    ////////////////////////// Disputes //////////////////////////
    async createDispute(createDisputeDto: CreateDisputeDto, employeeId: string) {
        // calculate new dispute id
        const disputeCount = await this.disputesModel.countDocuments();
        const disputeId = `DISP-${(disputeCount + 1).toString().padStart(4, '0')}`;

        // create new dispute
        const newDispute = new this.disputesModel({
            ...createDisputeDto,
            employeeId,
            disputeId,
        });
        return newDispute.save();
    }

    async getDisputes(employeeId: string) {
        return this.disputesModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }

    async getAllDisputes() {
        return this.disputesModel.find().sort({ createdAt: -1 }).exec();
    }

    async getApprovedDisputes() {
        return this.disputesModel
            .find({ status: DisputeStatus.APPROVED })
            .sort({ createdAt: -1 })
            .exec();
    }

    async getPendingManagerApprovalDisputes() {
        return this.disputesModel
            .find({ status: DisputeStatus.PENDING_MANAGER_APPROVAL })
            .sort({ createdAt: -1 })
            .exec();
    }

    async confirmDispute(disputeId: string, confirmDisputeDto: ConfirmDisputeDto, managerId: string) {
        const dispute = await this.disputesModel.findById(disputeId);
        if (!dispute) throw new NotFoundException('Dispute not found');

        if (dispute.status !== DisputeStatus.PENDING_MANAGER_APPROVAL) {
            throw new NotFoundException('Dispute is not in PENDING_MANAGER_APPROVAL status');
        }

        if (confirmDisputeDto.approved) {
            // Logic for confirmation
            dispute.status = DisputeStatus.APPROVED;
            dispute.payrollManagerId = new Types.ObjectId(managerId) as any;
            // We use the existing resolutionComment field to store the manager's comment
            if (confirmDisputeDto.comment) {
                dispute.resolutionComment = confirmDisputeDto.comment;
            }
            await dispute.save();
            await this.notifyFinanceStaff(`Dispute ${dispute.disputeId} has been approved by Manager.`);
            return { message: 'Dispute confirmed by manager', dispute };
        } else {
            // Rejection logic
            dispute.status = DisputeStatus.REJECTED;
            dispute.payrollManagerId = new Types.ObjectId(managerId) as any;
            // We use the existing rejectionReason field
            dispute.rejectionReason = confirmDisputeDto.comment || 'Rejected by Manager';
            return dispute.save();
        }
    }

    async updateDisputeStatus(
        disputeId: string,
        updateDisputeStatusDto: UpdateDisputeStatusDto,
        staffId: string,
    ) {
        if (updateDisputeStatusDto.status === DisputeStatus.APPROVED) {
            throw new Error('Payroll Specialist cannot set status to APPROVED directly.');
        }
        const dispute = await this.disputesModel.findByIdAndUpdate(
            disputeId,
            {
                ...updateDisputeStatusDto,
                payrollSpecialistId: new Types.ObjectId(staffId),
            },
            { new: true },
        );
        if (!dispute) throw new NotFoundException('Dispute not found');

        return dispute;
    }

    ////////////////////////// Claims //////////////////////////
    async createClaim(createClaimDto: CreateClaimDto, employeeId: string) {
        const claimCount = await this.claimsModel.countDocuments();
        const claimId = `CLAIM-${(claimCount + 1).toString().padStart(4, '0')}`;

        const newClaim = new this.claimsModel({
            ...createClaimDto,
            employeeId,
            claimId,
        });
        return newClaim.save();
    }

    async getClaims(employeeId: string) {
        return this.claimsModel.find({ employeeId }).sort({ createdAt: -1 }).exec();
    }

    async getAllClaims() {
        return this.claimsModel.find().sort({ createdAt: -1 }).exec();
    }

    async getApprovedClaims() {
        return this.claimsModel
            .find({ status: ClaimStatus.APPROVED })
            .sort({ createdAt: -1 })
            .exec();
    }

    async getPendingManagerApprovalClaims() {
        return this.claimsModel
            .find({ status: ClaimStatus.PENDING_MANAGER_APPROVAL })
            .sort({ createdAt: -1 })
            .exec();
    }

    async confirmClaim(claimId: string, confirmClaimDto: ConfirmClaimDto, managerId: string) {
        const claim = await this.claimsModel.findById(claimId);
        if (!claim) throw new NotFoundException('Claim not found');

        if (claim.status !== ClaimStatus.PENDING_MANAGER_APPROVAL) {
            throw new NotFoundException('Claim is not in PENDING_MANAGER_APPROVAL status');
        }

        if (confirmClaimDto.approved) {
            claim.status = ClaimStatus.APPROVED;
            claim.payrollManagerId = new Types.ObjectId(managerId) as any;
            if (confirmClaimDto.comment) {
                claim.resolutionComment = confirmClaimDto.comment;
            }
            await claim.save();
            await this.notifyFinanceStaff(`Claim ${claim.claimId} has been approved by Manager.`);
            return { message: 'Claim confirmed by manager', claim };
        } else {
            claim.status = ClaimStatus.REJECTED;
            claim.payrollManagerId = new Types.ObjectId(managerId) as any;
            claim.rejectionReason = confirmClaimDto.comment || 'Rejected by Manager';
            return claim.save();
        }
    }

    async updateClaimStatus(
        claimId: string,
        updateClaimStatusDto: UpdateClaimStatusDto,
        staffId: string,
    ) {
        if (updateClaimStatusDto.status === ClaimStatus.APPROVED) {
            throw new Error('Payroll Specialist cannot set status to APPROVED directly.');
        }
        const claim = await this.claimsModel.findByIdAndUpdate(
            claimId,
            {
                ...updateClaimStatusDto,
                payrollSpecialistId: new Types.ObjectId(staffId),
            },
            { new: true },
        );
        if (!claim) throw new NotFoundException('Claim not found');
        return claim;
    }

    ////////////////////////// Refunds //////////////////////////
    async createRefundForDispute(
        disputeId: string,
        amount: number,
        description: string,
        financeStaffId: string,
    ) {
        try {
            console.log('Creating refund for dispute:', { disputeId, amount, description, financeStaffId });
            const dispute = await this.disputesModel.findById(disputeId);
            if (!dispute) throw new NotFoundException('Dispute not found');

            const refund = new this.refundsModel({
                disputeId: dispute._id,
                employeeId: dispute.employeeId,
                financeStaffId,
                refundDetails: {
                    description,
                    amount,
                },
                status: RefundStatus.PENDING,
            });
            return await refund.save();
        } catch (error) {
            console.error('Error creating refund:', error);
            throw error;
        }
    }

    async createRefundForClaim(claimId: string, financeStaffId: string) {
        const claim = await this.claimsModel.findById(claimId);
        if (!claim) throw new NotFoundException('Claim not found');

        const refund = new this.refundsModel({
            claimId: claim._id,
            employeeId: claim.employeeId,
            financeStaffId,
            refundDetails: {
                description: `Refund for claim ${claim.claimId}`,
                amount: claim.approvedAmount || claim.amount,
            },
            status: RefundStatus.PENDING,
        });
        return refund.save();
    }

    ////////////////////////// Reports //////////////////////////
    async generatePayslipPdf(payslipId: string): Promise<Buffer> {
        const payslip = await this.paySlipModel
            .findById(payslipId)
            .populate('employeeId') // so we can access employee details
            .populate('payrollRunId') // if needed
            .exec();

        if (!payslip) {
            throw new NotFoundException('Payslip not found');
        }

        return this.buildPdfBuffer(payslip);
    }

    private buildPdfBuffer(payslip: PayslipDocument): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // --- HEADER ---
            doc.fontSize(20).text('Payslip', { align: 'center' }).moveDown();

            const employee: any = payslip.employeeId || {};
            const payrollRun: any = payslip.payrollRunId || {};

            // --- BASIC INFO ---
            doc.fontSize(12);
            doc.text(`Employee Name: ${employee.firstName}`);
            doc.text(`Employee ID: ${employee.employeeNumber}`);
            doc.text(`Payroll Run: ${payrollRun.runId}`);
            doc.text(`Period: ${payrollRun.payrollPeriod}`);
            doc.text(`Payment Status: ${payslip.paymentStatus}`);
            doc.moveDown();

            // --- EARNINGS SECTION ---
            doc.fontSize(14).text('Earnings', { underline: true });
            doc.moveDown(0.5);

            const earnings = payslip.earningsDetails;

            doc.fontSize(12).text(`Base Salary: ${earnings.baseSalary ?? 0}`);

            // Allowances
            if (earnings.allowances && earnings.allowances.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Allowances:');
                doc.font('Helvetica');
                earnings.allowances.forEach((a: any) => {
                    // adjust fields based on your actual schema (e.g. a.name, a.amount)
                    doc.text(`- ${a.name || 'Allowance'}: ${a.amount ?? a.value ?? 0}`);
                });
            }

            // Bonuses
            if (earnings.bonuses && earnings.bonuses.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Bonuses:');
                doc.font('Helvetica');
                earnings.bonuses.forEach((b: any) => {
                    doc.text(`- ${b.name || 'Bonus'}: ${b.amount ?? b.value ?? 0}`);
                });
            }

            // Benefits
            if (earnings.benefits && earnings.benefits.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Benefits:');
                doc.font('Helvetica');
                earnings.benefits.forEach((benefit: any) => {
                    doc.text(
                        `- ${benefit.name || 'Benefit'}: ${benefit.amount ?? benefit.value ?? 0}`,
                    );
                });
            }

            // Refunds
            if (earnings.refunds && earnings.refunds.length > 0) {
                doc.moveDown(0.3);
                doc.font('Helvetica-Bold').text('Refunds:');
                doc.font('Helvetica');
                earnings.refunds.forEach((r: any) => {
                    doc.text(`- ${r.reason || r.type || 'Refund'}: ${r.amount ?? 0}`);
                });
            }

            doc.moveDown();

            // --- DEDUCTIONS SECTION ---
            doc.fontSize(14).text('Deductions', { underline: true });
            doc.moveDown(0.5);

            const deductions = payslip.deductionsDetails;

            // Taxes
            if (deductions.taxes && deductions.taxes.length > 0) {
                doc.font('Helvetica-Bold').text('Taxes:');
                doc.font('Helvetica');
                deductions.taxes.forEach((t: any) => {
                    doc.text(`- ${t.name || 'Tax'}: ${t.amount ?? t.value ?? 0}`);
                });
                doc.moveDown(0.3);
            }

            // Insurances
            if (deductions.insurances && deductions.insurances.length > 0) {
                doc.font('Helvetica-Bold').text('Insurances:');
                doc.font('Helvetica');
                deductions.insurances.forEach((i: any) => {
                    doc.text(`- ${i.name || 'Insurance'}: ${i.amount ?? i.value ?? 0}`);
                });
                doc.moveDown(0.3);
            }

            // Penalties
            if (deductions.penalties) {
                const p: any = deductions.penalties;
                doc.font('Helvetica-Bold').text('Penalties:');
                doc.font('Helvetica');
                // adjust according to your schema (e.g. p.totalPenalty, p.items[], etc.)
                if (Array.isArray(p.items)) {
                    p.items.forEach((item: any) => {
                        doc.text(`- ${item.reason || 'Penalty'}: ${item.amount ?? 0}`);
                    });
                } else {
                    doc.text(`- Total Penalties: ${p.total ?? 0}`);
                }
            }

            doc.moveDown();

            // --- TOTALS ---
            doc.fontSize(14).text('Summary', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12);
            doc.text(`Total Gross Salary: ${payslip.totalGrossSalary}`);
            doc.text(`Total Deductions: ${payslip.totaDeductions ?? 0}`);
            doc.text(`Net Pay: ${payslip.netPay}`, { underline: true });

            doc.end();
        });
    }

    async generateTaxDocumentPdf(payslipId: string): Promise<Buffer> {
        const payslip = await this.paySlipModel
            .findById(payslipId)
            .populate('employeeId')
            .populate('payrollRunId')
            .exec();

        if (!payslip) {
            throw new NotFoundException('Payslip not found');
        }

        return this.buildTaxPdfBuffer(payslip);
    }

    private buildTaxPdfBuffer(payslip: PayslipDocument): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            const employee: any = payslip.employeeId || {};
            const payrollRun: any = payslip.payrollRunId || {};
            const deductions = payslip.deductionsDetails || ({} as any);

            // --- HEADER ---
            doc.fontSize(20).text('Tax Document', { align: 'center' }).moveDown();

            // --- BASIC INFO ---
            doc.fontSize(12);
            doc.text(`Employee Name: ${employee.firstName}`);
            doc.text(`Employee ID: ${employee.employeeNumber}`);
            doc.text(`Payroll Run: ${payrollRun.runId}`);
            doc.text(`Period: ${payrollRun.payrollPeriod}`);
            doc.text(`Payment Status: ${payslip.paymentStatus}`);
            doc.moveDown();

            // --- TAX DETAILS SECTION ---
            doc.fontSize(14).text('Tax Breakdown', { underline: true });
            doc.moveDown(0.5);

            const taxes = deductions.taxes || [];
            const insurances = deductions.insurances || [];

            doc.fontSize(12);

            if (taxes.length === 0 && insurances.length === 0) {
                doc.text('No tax or insurance information available.');
            } else {
                // Taxes
                if (taxes.length > 0) {
                    doc.font('Helvetica-Bold').text('Taxes:');
                    doc.font('Helvetica');
                    let totalTax = 0;

                    taxes.forEach((t: any) => {
                        const amount = t.amount ?? t.value ?? t.taxAmount ?? 0;
                        totalTax += amount;
                        doc.text(`- ${t.name || t.taxName || 'Tax'}: ${amount}`);
                    });

                    doc.moveDown(0.3);
                    doc.font('Helvetica-Bold').text(`Total Tax: ${totalTax}`);
                    doc.font('Helvetica');
                    doc.moveDown();
                }

                // Insurances (often considered part of statutory deductions)
                if (insurances.length > 0) {
                    doc.font('Helvetica-Bold').text('Insurances:');
                    doc.font('Helvetica');
                    let totalInsurance = 0;

                    insurances.forEach((i: any) => {
                        const amount = i.amount ?? i.value ?? i.insuranceAmount ?? 0;
                        totalInsurance += amount;
                        doc.text(`- ${i.name || i.insuranceName || 'Insurance'}: ${amount}`);
                    });

                    doc.moveDown(0.3);
                    doc.font('Helvetica-Bold').text(
                        `Total Insurance Contributions: ${totalInsurance}`,
                    );
                    doc.font('Helvetica');
                    doc.moveDown();
                }
            }

            // --- SUMMARY SECTION (based on payslip totals) ---
            doc.fontSize(14).text('Summary', { underline: true });
            doc.moveDown(0.5);

            doc.fontSize(12);
            doc.text(`Total Gross Salary: ${payslip.totalGrossSalary}`);
            doc.text(`Total Deductions: ${payslip.totaDeductions ?? 0}`);
            doc.text(`Net Pay: ${payslip.netPay}`);

            doc.end();
        });
    }

    async getDepartmentPayrollReport(departmentId: string, query: ReportPeriodDto) {
        const { startDate, endDate } = query;

        // 1. Find employees in the department
        const employees = await this.employeeProfileModel
            .find({ primaryDepartmentId: departmentId })
            .select('_id')
            .exec();
        const employeeIds = employees.map((e) => e._id);

        // 2. Aggregate payslips for these employees within the date range
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
                    totalDeductions: { $sum: '$totaDeductions' }, // Note: typo in schema 'totaDeductions'
                    count: { $sum: 1 },
                },
            },
        ]);

        return (
            aggregation[0] || { totalGrossSalary: 0, totalNetPay: 0, totalDeductions: 0, count: 0 }
        );
    }

    async getPayrollSummary(query: SummaryReportDto) {
        const { type, date } = query;
        const reportDate = new Date(date);
        let startDate: Date, endDate: Date;

        if (type === ReportType.MONTH) {
            startDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
            endDate = new Date(reportDate.getFullYear(), reportDate.getMonth() + 1, 0);
        } else {
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

        return (
            aggregation[0] || { totalGrossSalary: 0, totalNetPay: 0, totalDeductions: 0, count: 0 }
        );
    }

    async getDeductionsBenefitsReport(query: ReportPeriodDto) {
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
                if ((t as any).amount) totalTaxes += (t as any).amount;
            });
            p.deductionsDetails?.insurances?.forEach((i) => {
                if ((i as any).amount) totalInsurance += (i as any).amount;
            });
            p.earningsDetails?.benefits?.forEach((b) => {
                if ((b as any).amount) totalBenefits += (b as any).amount;
            });
        });

        return {
            totalTaxes,
            totalInsurance,
            totalBenefits,
            period: { startDate, endDate },
        };
    }

    private async notifyFinanceStaff(message: string) {
        try {
            // Find all users with 'Finance Staff' role
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
        } catch (error) {
            console.error('Error sending notifications:', error);
            // Don't throw error to prevent blocking the main flow
        }
    }
}

