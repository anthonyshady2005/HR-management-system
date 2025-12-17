import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { claims, claimsDocument } from './models/claims.schema';
import { disputes, disputesDocument } from './models/disputes.schema';
import { refunds, refundsDocument } from './models/refunds.schema';
import {
  paySlip,
  PayslipDocument,
} from '../payroll-execution/models/payslip.schema';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ConfirmDisputeDto } from './dto/confirm-dispute.dto';
import { ConfirmClaimDto } from './dto/confirm-claim.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import {
  ClaimStatus,
  DisputeStatus,
  RefundStatus,
} from './enums/payroll-tracking-enum';
import {
  ReportPeriodDto,
  SummaryReportDto,
  ReportType,
} from './dto/payroll-report.dto';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../time-management/models/notification-log.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleDocument,
} from '../employee-profile/models/employee-system-role.schema';

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
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
  ) { }

  ////////////////////////// Employee Self-Service //////////////////////////
  async getEmployeePayslips(employeeId: Types.ObjectId) {
    // Populate payrollRun details so the client can sort/display by run createdAt
    // and show the payrollPeriod if needed.
    return this.paySlipModel
      .find({ employeeId })
      .populate('payrollRunId', 'payrollPeriod runId paymentStatus createdAt')
      .sort({ createdAt: -1 })
      .exec();
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
    return this.disputesModel
      .find({ employeeId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllDisputes() {
    return this.disputesModel
      .find()
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getApprovedDisputes() {
    return this.disputesModel
      .find({ status: DisputeStatus.APPROVED })
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingManagerApprovalDisputes() {
    const disputes = await this.disputesModel
      .find({ status: DisputeStatus.PENDING_MANAGER_APPROVAL })
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .exec();
    return disputes;
  }

  async confirmDispute(
    disputeId: string,
    confirmDisputeDto: ConfirmDisputeDto,
    managerId: string,
  ) {
    const dispute = await this.disputesModel.findById(disputeId);
    if (!dispute) throw new NotFoundException('Dispute not found');

    if (dispute.status !== DisputeStatus.PENDING_MANAGER_APPROVAL) {
      throw new NotFoundException(
        'Dispute is not in PENDING_MANAGER_APPROVAL status',
      );
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
      await this.notifyFinanceStaff(
        `Dispute ${dispute.disputeId} has been approved by Manager.`,
      );
      return { message: 'Dispute confirmed by manager', dispute };
    } else {
      // Rejection logic
      dispute.status = DisputeStatus.REJECTED;
      dispute.payrollManagerId = new Types.ObjectId(managerId) as any;
      // We use the existing rejectionReason field
      dispute.rejectionReason =
        confirmDisputeDto.comment || 'Rejected by Manager';
      return dispute.save();
    }
  }

  async updateDisputeStatus(
    disputeId: string,
    updateDisputeStatusDto: UpdateDisputeStatusDto,
    staffId: string,
  ) {
    if (updateDisputeStatusDto.status === DisputeStatus.APPROVED) {
      throw new Error(
        'Payroll Specialist cannot set status to APPROVED directly.',
      );
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
    return this.claimsModel
      .find()
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getApprovedClaims() {
    return this.claimsModel
      .find({ status: ClaimStatus.APPROVED })
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingManagerApprovalClaims() {
    return this.claimsModel
      .find({ status: ClaimStatus.PENDING_MANAGER_APPROVAL })
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async confirmClaim(
    claimId: string,
    confirmClaimDto: ConfirmClaimDto,
    managerId: string,
  ) {
    const claim = await this.claimsModel.findById(claimId);
    if (!claim) throw new NotFoundException('Claim not found');

    if (claim.status !== ClaimStatus.PENDING_MANAGER_APPROVAL) {
      throw new NotFoundException(
        'Claim is not in PENDING_MANAGER_APPROVAL status',
      );
    }

    if (confirmClaimDto.approved) {
      claim.status = ClaimStatus.APPROVED;
      claim.payrollManagerId = new Types.ObjectId(managerId) as any;
      if (confirmClaimDto.comment) {
        claim.resolutionComment = confirmClaimDto.comment;
      }
      await claim.save();
      await this.notifyFinanceStaff(
        `Claim ${claim.claimId} has been approved by Manager.`,
      );
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
      throw new Error(
        'Payroll Specialist cannot set status to APPROVED directly.',
      );
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
      console.log('Creating refund for dispute:', {
        disputeId,
        amount,
        description,
        financeStaffId,
      });
      const dispute = await this.disputesModel.findById(disputeId);
      if (!dispute) throw new NotFoundException('Dispute not found');

      // Check if refund was already generated by looking in refunds collection
      const existingRefund = await this.refundsModel.findOne({
        disputeId: dispute._id,
      });
      if (existingRefund) {
        throw new BadRequestException(
          'Refund has already been generated for this dispute',
        );
      }

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

    // Check if refund was already generated by looking in refunds collection
    const existingRefund = await this.refundsModel.findOne({
      claimId: claim._id,
    });
    if (existingRefund) {
      throw new BadRequestException(
        'Refund has already been generated for this claim',
      );
    }

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

  async getAllRefunds() {
    return this.refundsModel
      .find()
      .populate('claimId', 'claimId')
      .populate('disputeId', 'disputeId')
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })
      .exec();
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

  toNumber = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return Number(v) || 0;

    // Mongo/Mongoose Decimal128 or similar objects
    if (typeof v === 'object') {
      if (typeof v.toNumber === 'function') {
        const n = v.toNumber();
        return Number.isFinite(n) ? n : 0;
      }
      if (typeof v.toString === 'function') {
        const n = Number(v.toString());
        return Number.isFinite(n) ? n : 0;
      }
    }
    return 0;
  };

  private buildPdfBuffer(payslip: PayslipDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Helpers
      const money = (n: any) => {
        const num = typeof n === 'number' ? n : Number(n);
        if (!isFinite(num)) return '0.00';
        return num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const safeDate = (v: any) => {
        if (!v) return '—';
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
      };

      const sum = (arr: any[], getter: (x: any) => number) =>
        (arr || []).reduce((acc, x) => acc + (getter(x) || 0), 0);

      // --- HEADER ---
      doc.fontSize(20).text('Payslip', { align: 'center' }).moveDown();

      const employee: any = payslip.employeeId || {};
      const payrollRun: any = payslip.payrollRunId || {};

      // --- BASIC INFO ---
      doc.fontSize(12);
      doc.text(
        `Employee Name: ${[employee.firstName, employee.lastName].filter(Boolean).join(' ') || '—'}`,
      );
      doc.text(
        `Employee ID: ${employee.employeeNumber || employee._id || '—'}`,
      );
      doc.text(`Payroll Run: ${payrollRun.runId || '—'}`);
      doc.text(`Period: ${safeDate(payrollRun.payrollPeriod)}`);
      doc.text(`Payment Status: ${payslip.paymentStatus || '—'}`);
      doc.text(`Generated: ${safeDate(new Date())}`);
      doc.moveDown();

      // --- EARNINGS SECTION ---
      doc.fontSize(14).text('Earnings', { underline: true }).moveDown(0.5);

      const earnings: any = payslip.earningsDetails || {};
      const baseSalary = earnings.baseSalary ?? 0;
      doc.fontSize(12).text(`Base Salary: ${money(baseSalary)}`);

      // Allowances
      const allowances = earnings.allowances || [];
      if (allowances.length > 0) {
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text('Allowances:');
        doc.font('Helvetica');
        allowances.forEach((a: any) => {
          const name = a.name || a.allowanceName || 'Allowance';
          const amt = a.amount ?? a.value ?? a.allowanceAmount ?? 0;
          const desc = a.description ? ` (${a.description})` : '';
          doc.text(`- ${name}${desc}: ${money(amt)}`);
        });
        doc.text(
          `  Subtotal Allowances: ${money(sum(allowances, (a) => a.amount ?? a.value ?? 0))}`,
        );
      }

      // Bonuses
      const bonuses = earnings.bonuses || [];
      if (bonuses.length > 0) {
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text('Bonuses:');
        doc.font('Helvetica');
        bonuses.forEach((b: any) => {
          const name = b.name || b.bonusName || 'Bonus';
          const amt = b.amount ?? b.value ?? b.bonusAmount ?? 0;
          doc.text(`- ${name}: ${money(amt)}`);
        });
        doc.text(
          `  Subtotal Bonuses: ${money(sum(bonuses, (b) => b.amount ?? b.value ?? 0))}`,
        );
      }

      // Benefits
      const benefits = earnings.benefits || [];
      if (benefits.length > 0) {
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text('Benefits:');
        doc.font('Helvetica');
        benefits.forEach((b: any) => {
          const name = b.name || b.benefitName || 'Benefit';
          const amt = b.amount ?? b.value ?? b.benefitAmount ?? 0;
          doc.text(`- ${name}: ${money(amt)}`);
        });
        doc.text(
          `  Subtotal Benefits: ${money(sum(benefits, (b) => b.amount ?? b.value ?? 0))}`,
        );
      }

      // Refunds
      const refunds = earnings.refunds || [];
      if (refunds.length > 0) {
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text('Refunds:');
        doc.font('Helvetica');
        refunds.forEach((r: any) => {
          const label =
            r.description || r.reason || r.type || r.refundType || 'Refund';
          const amt = r.amount ?? r.value ?? 0;
          doc.text(`- ${label}: ${money(amt)}`);
        });
        doc.text(
          `  Subtotal Refunds: ${money(sum(refunds, (r) => r.amount ?? r.value ?? 0))}`,
        );
      }

      doc.moveDown();

      // --- DEDUCTIONS SECTION ---
      doc.fontSize(14).text('Deductions', { underline: true }).moveDown(0.5);

      const deductions: any = payslip.deductionsDetails || {};

      // Taxes
      const taxes = deductions.taxes || [];
      if (taxes.length > 0) {
        doc.font('Helvetica-Bold').text('Taxes:');
        doc.font('Helvetica');
        taxes.forEach((t: any) => {
          const name = t.name;
          const rateTxt = ` (${t.rate}%)`;
          const amt = t.toObject().amount;

          doc.text(`- ${name}${rateTxt}: ${money(amt)}`);
        });
        doc.text(
          `  Subtotal Taxes: ${money(sum(taxes, (t) => t.toObject().amount))}`,
        );
        doc.moveDown(0.3);
      }

      // Insurances
      const ins = deductions.insurances || [];
      if (ins.length > 0) {
        doc.font('Helvetica-Bold').text('Insurances:');
        doc.font('Helvetica');
        ins.forEach((i: any) => {
          const name = i.name || i.insuranceName || 'Insurance';
          const amt = i.amount ?? i.value ?? i.insuranceAmount ?? 0;
          doc.text(`- ${name}: ${money(amt)}`);
        });
        doc.text(
          `  Subtotal Insurances: ${money(sum(ins, (i) => i.amount ?? i.value ?? 0))}`,
        );
        doc.moveDown(0.3);
      }

      // Penalties
      const penObj: any = deductions.penalties;
      if (penObj) {
        doc.font('Helvetica-Bold').text('Penalties:');
        doc.font('Helvetica');

        const fromItems = Array.isArray(penObj.items) ? penObj.items : [];
        const fromPenalties = Array.isArray(penObj.penalties)
          ? penObj.penalties
          : [];

        if (fromPenalties.length > 0) {
          fromPenalties.forEach((it: any) => {
            const reason = it.reason || it.type || 'Penalty';
            const amt = it.amount ?? it.value ?? 0;
            doc.text(`- ${reason}: ${money(amt)}`);
          });
          doc.text(
            `  Subtotal Penalties: ${money(sum(fromPenalties, (x) => x.amount ?? x.value ?? 0))}`,
          );
        } else if (fromItems.length > 0) {
          fromItems.forEach((it: any) => {
            const reason = it.reason || it.type || 'Penalty';
            const amt = it.amount ?? it.value ?? 0;
            doc.text(`- ${reason}: ${money(amt)}`);
          });
          doc.text(
            `  Subtotal Penalties: ${money(sum(fromItems, (x) => x.amount ?? x.value ?? 0))}`,
          );
        } else if (
          typeof penObj.total === 'number' ||
          typeof penObj.totalPenalty === 'number'
        ) {
          doc.text(
            `- Total Penalties: ${money(penObj.totalPenalty ?? penObj.total)}`,
          );
        } else {
          doc.text(`- No penalty line items found.`);
        }

        doc.moveDown();
      }

      // --- TOTALS / SUMMARY ---
      doc.fontSize(14).text('Summary', { underline: true }).moveDown(0.5);
      doc.fontSize(12);

      doc.text(`Total Gross Salary: ${money(payslip.totalGrossSalary ?? 0)}`);
      doc.text(`Total Deductions: ${money(payslip.totaDeductions ?? 0)}`);
      doc.text(`Net Pay: ${money(payslip.netPay ?? 0)}`, { underline: true });

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

      // ---- Helpers (same idea as buildPdfBuffer, but stronger) ----
      const toNumber = (v: any): number => {
        if (v == null) return 0;
        if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
        if (typeof v === 'string') {
          const n = Number(v);
          return Number.isFinite(n) ? n : 0;
        }
        // Decimal128 or Mongoose numeric wrapper
        if (typeof v === 'object') {
          if (typeof v.toNumber === 'function') {
            const n = v.toNumber();
            return Number.isFinite(n) ? n : 0;
          }
          if (typeof v.toString === 'function') {
            const n = Number(v.toString());
            return Number.isFinite(n) ? n : 0;
          }
          // Mongo export format { $numberDecimal: "..." }
          if (v.$numberDecimal) {
            const n = Number(v.$numberDecimal);
            return Number.isFinite(n) ? n : 0;
          }
        }
        return 0;
      };

      const money = (v: any) =>
        toNumber(v).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

      const safeDate = (v: any) => {
        if (!v) return '—';
        const d = new Date(v);
        return isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
      };

      // ---- Data ----
      const employee: any = payslip.employeeId || {};
      const payrollRun: any = payslip.payrollRunId || {};
      const deductions: any = payslip.deductionsDetails || {};

      // --- HEADER ---
      doc.fontSize(20).text('Tax Document', { align: 'center' }).moveDown();

      // --- BASIC INFO ---
      doc.fontSize(12);
      doc.text(
        `Employee Name: ${[employee.firstName, employee.lastName].filter(Boolean).join(' ') || '—'}`,
      );
      doc.text(
        `Employee ID: ${employee.employeeNumber || employee._id || '—'}`,
      );
      doc.text(`Payroll Run: ${payrollRun.runId || '—'}`);
      doc.text(`Period: ${safeDate(payrollRun.payrollPeriod)}`);
      doc.text(`Payment Status: ${payslip.paymentStatus || '—'}`);
      doc.text(`Generated: ${safeDate(new Date())}`);
      doc.moveDown();

      // --- TAX DETAILS SECTION ---
      doc.fontSize(14).text('Tax Breakdown', { underline: true }).moveDown(0.5);
      doc.fontSize(12);

      const taxes = deductions.taxes || [];
      const insurances = deductions.insurances || [];

      if ((taxes?.length ?? 0) === 0 && (insurances?.length ?? 0) === 0) {
        doc.text('No tax or insurance information available.');
      } else {
        // Taxes
        if (taxes.length > 0) {
          doc.font('Helvetica-Bold').text('Taxes:');
          doc.font('Helvetica');

          const totalTax = taxes.reduce((acc: number, t: any) => {
            const obj = t?.toObject?.() ?? t; // supports Mongoose subdocs and plain objects
            const amt = toNumber(obj.amount ?? obj.value ?? obj.taxAmount ?? 0);
            const name = obj.name || obj.taxName || 'Tax';
            const rateTxt =
              typeof obj.rate === 'number' ? ` (${obj.rate}%)` : '';

            doc.text(`- ${name}${rateTxt}: ${money(amt)}`);
            return acc + amt;
          }, 0);

          doc.moveDown(0.3);
          doc.font('Helvetica-Bold').text(`Total Tax: ${money(totalTax)}`);
          doc.font('Helvetica');
          doc.moveDown();
        }
      }

      // --- SUMMARY SECTION ---
      doc.fontSize(14).text('Summary', { underline: true }).moveDown(0.5);
      doc.fontSize(12);

      doc.text(`Total Gross Salary: ${money(payslip.totalGrossSalary ?? 0)}`);
      doc.text(`Total Deductions: ${money(payslip.totaDeductions ?? 0)}`);
      doc.text(`Net Pay: ${money(payslip.netPay ?? 0)}`);

      doc.end();
    });
  }

  async getDepartmentPayrollReport(
    departmentId: string,
    query: ReportPeriodDto,
  ) {
    const { startDate, endDate } = query;

    // Convert departmentId to ObjectId for comparison
    const deptObjectId = new Types.ObjectId(departmentId);

    // 1. Find employees in the department
    const employees = await this.employeeProfileModel
      .find({ primaryDepartmentId: deptObjectId })
      .select('_id')
      .exec();
    const employeeIds = employees.map((e) => e._id);

    console.log(
      `[Department Report] Department: ${departmentId}, Employees found: ${employeeIds.length}`,
    );

    // If no employees found, return zeros
    if (employeeIds.length === 0) {
      console.log('[Department Report] No employees found for this department');
      return {
        totalGrossSalary: 0,
        totalNetPay: 0,
        totalDeductions: 0,
        count: 0,
      };
    }

    // 2. Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          employeeId: { $in: employeeIds },
        },
      },
    ];

    // If dates are provided, join with payrollRuns and filter by payrollPeriod
    if (startDate && endDate) {
      pipeline.push(
        {
          $lookup: {
            from: 'payrollruns',
            localField: 'payrollRunId',
            foreignField: '_id',
            as: 'payrollRun',
          },
        },
        {
          $unwind: '$payrollRun',
        },
        {
          $match: {
            'payrollRun.payrollPeriod': {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
      );
    }

    // Add grouping stage
    pipeline.push({
      $group: {
        _id: null,
        totalGrossSalary: { $sum: '$totalGrossSalary' },
        totalNetPay: { $sum: '$netPay' },
        totalDeductions: { $sum: '$totaDeductions' },
        count: { $sum: 1 },
      },
    });

    // 3. Aggregate payslips
    const aggregation = await this.paySlipModel.aggregate(pipeline);

    console.log(
      `[Department Report] Payslips found: ${aggregation[0]?.count || 0}`,
    );

    return (
      aggregation[0] || {
        totalGrossSalary: 0,
        totalNetPay: 0,
        totalDeductions: 0,
        count: 0,
      }
    );
  }

  async getPayrollSummary(query: SummaryReportDto) {
    const { type, date } = query;
    const reportDate = new Date(date);
    let startDate: Date, endDate: Date;

    if (type === ReportType.MONTH) {
      startDate = new Date(reportDate.getFullYear(), reportDate.getMonth(), 1);
      endDate = new Date(
        reportDate.getFullYear(),
        reportDate.getMonth() + 1,
        0,
      );
    } else {
      startDate = new Date(reportDate.getFullYear(), 0, 1);
      endDate = new Date(reportDate.getFullYear(), 11, 31);
    }

    // Join with payrollRuns to filter by payrollPeriod instead of createdAt
    const aggregation = await this.paySlipModel.aggregate([
      {
        $lookup: {
          from: 'payrollruns',
          localField: 'payrollRunId',
          foreignField: '_id',
          as: 'payrollRun',
        },
      },
      {
        $unwind: '$payrollRun',
      },
      {
        $match: {
          'payrollRun.payrollPeriod': { $gte: startDate, $lte: endDate },
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
      aggregation[0] || {
        totalGrossSalary: 0,
        totalNetPay: 0,
        totalDeductions: 0,
        count: 0,
      }
    );
  }

  async getDeductionsBenefitsReport(query: ReportPeriodDto) {
    const { startDate, endDate } = query;

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'payrollruns',
          localField: 'payrollRunId',
          foreignField: '_id',
          as: 'payrollRun',
        },
      },
      {
        $unwind: '$payrollRun',
      },
    ];

    // Only add date filter if both dates are provided
    if (startDate && endDate) {
      pipeline.push({
        $match: {
          'payrollRun.payrollPeriod': {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      });
    }

    const payslips = await this.paySlipModel.aggregate(pipeline);

    let totalTaxes = 0;
    let totalInsurance = 0;
    let totalBenefits = 0;

    payslips.forEach((p: any) => {
      p.deductionsDetails?.taxes?.forEach((t: any) => {
        if (t.amount) totalTaxes += t.amount;
      });
      p.deductionsDetails?.insurances?.forEach((i: any) => {
        if (i.amount) totalInsurance += i.amount;
      });
      p.earningsDetails?.benefits?.forEach((b: any) => {
        if (b.amount) totalBenefits += b.amount;
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
      console.log('[notifyFinanceStaff] Looking for Finance Staff users...');

      // Find all users with 'Finance Staff' role
      const financeRoles = await this.employeeSystemRoleModel.find({
        roles: 'Finance Staff',
        isActive: true,
      });

      console.log(
        `[notifyFinanceStaff] Found ${financeRoles.length} Finance Staff users`,
      );

      const notifications = financeRoles.map((role) => ({
        to: new Types.ObjectId(role.employeeProfileId),
        type: 'PAYROLL_ALERT',
        message,
      }));

      console.log(
        '[notifyFinanceStaff] Notifications to insert:',
        notifications.length,
      );

      if (notifications.length > 0) {
        const result =
          await this.notificationLogModel.insertMany(notifications);
        console.log(
          '[notifyFinanceStaff] insertMany result:',
          JSON.stringify(result.map((r) => r._id)),
        );
        console.log(
          `[notifyFinanceStaff] Sent ${result.length} notifications to Finance Staff.`,
        );
      } else {
        console.log(
          '[notifyFinanceStaff] No Finance Staff users found to notify',
        );
      }
    } catch (error) {
      console.error('[notifyFinanceStaff] Error sending notifications:', error);
      // Don't throw error to prevent blocking the main flow
    }
  }
}
