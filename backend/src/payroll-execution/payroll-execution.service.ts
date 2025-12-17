import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { payrollRuns, payrollRunsDocument } from './models/payrollRuns.schema';
import { paySlip, PayslipDocument } from './models/payslip.schema';
import {
  employeePayrollDetails,
  employeePayrollDetailsDocument,
} from './models/employeePayrollDetails.schema';
import { employeeSigningBonus } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation } from './models/EmployeeTerminationResignation.schema';
import { signingBonus } from '../payroll-configuration/models/signingBonus.schema';
import {
  terminationAndResignationBenefits,
  terminationAndResignationBenefitsSchema,
} from '../payroll-configuration/models/terminationAndResignationBenefits';
import { InitiatePayrollDto } from './dtos/payroll-execution.dto';
import {
  PayRollStatus,
  PayRollPaymentStatus,
  BankStatus,
  PaySlipPaymentStatus,
  BonusStatus,
  BenefitStatus,
} from './enums/payroll-execution-enum';

// Import models from other subsystems (not services)
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import {
  taxRules,
  taxRulesDocument,
} from '../payroll-configuration/models/taxRules.schema';
import {
  insuranceBrackets,
  insuranceBracketsDocument,
} from '../payroll-configuration/models/insuranceBrackets.schema';
import {
  payGrade,
  payGradeDocument,
} from '../payroll-configuration/models/payGrades.schema';
import {
  allowance,
  allowanceDocument,
} from '../payroll-configuration/models/allowance.schema';
import {
  refunds,
  refundsDocument,
} from '../payroll-tracking/models/refunds.schema';
import { ConfigStatus } from '../payroll-configuration/enums/payroll-configuration-enums';
import { RefundStatus } from '../payroll-tracking/enums/payroll-tracking-enum';
import {
  AttendanceRecord,
  AttendanceRecordDocument,
} from '../time-management/models/attendance-record.schema';
import {
  LeaveRequest,
  LeaveRequestDocument,
} from '../leaves/models/leave-request.schema';
import { LeaveStatus } from '../leaves/enums/leave-status.enum';
import {
  LeaveType,
  LeaveTypeDocument,
} from '../leaves/models/leave-type.schema';
import {
  Position,
  PositionDocument,
} from '../organization-structure/models/position.schema';
import {
  Department,
  DepartmentDocument,
} from '../organization-structure/models/department.schema';

@Injectable()
export class PayrollExecutionService {
  constructor(
    // Payroll Execution Models
    @InjectModel(payrollRuns.name)
    private payrollRunsModel: Model<payrollRunsDocument>,
    @InjectModel(paySlip.name) private paySlipModel: Model<PayslipDocument>,
    @InjectModel(employeePayrollDetails.name)
    private employeePayrollDetailsModel: Model<employeePayrollDetailsDocument>,
    @InjectModel(employeeSigningBonus.name)
    private employeeSigningBonusModel: Model<any>,
    @InjectModel(EmployeeTerminationResignation.name)
    private employeeTerminationModel: Model<any>,
    @InjectModel(signingBonus.name)
    private signingBonusConfigModel: Model<any>,
    @InjectModel(terminationAndResignationBenefits.name)
    private terminationBenefitsConfigModel: Model<any>,

    // Models from other subsystems (injected directly)
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(taxRules.name) private taxRulesModel: Model<taxRulesDocument>,
    @InjectModel(insuranceBrackets.name)
    private insuranceBracketsModel: Model<insuranceBracketsDocument>,
    @InjectModel(payGrade.name) private payGradeModel: Model<payGradeDocument>,
    @InjectModel(allowance.name)
    private allowanceModel: Model<allowanceDocument>,
    @InjectModel(refunds.name) private refundsModel: Model<refundsDocument>,
    @InjectModel(AttendanceRecord.name)
    private attendanceRecordModel: Model<AttendanceRecordDocument>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) { }

  async initiatePayroll(dto: InitiatePayrollDto) {
    // 1. Check if run exists
    const existingRun = await this.payrollRunsModel.findOne({
      payrollPeriod: new Date(dto.period),
    });
    if (existingRun) {
      throw new BadRequestException(
        'Payroll run for this period already exists',
      );
    }

    // 2. Fetch Employees for this payroll run (by department)
    const employees = await this.employeeProfileModel
      .find({
        primaryDepartmentId: new Types.ObjectId(dto.primaryDepartmentId),
      })
      .exec();

    const employeeIds = employees.map((emp) => emp._id);

    // 3. Check for pending items - only for employees in this payroll run
    const pendingSigningBonuses =
      await this.employeeSigningBonusModel.countDocuments({
        status: BonusStatus.PENDING,
        employeeId: { $in: employeeIds },
      });

    const pendingTerminationBenefits =
      await this.employeeTerminationModel.countDocuments({
        status: BenefitStatus.PENDING,
        employeeId: { $in: employeeIds },
      });

    if (pendingSigningBonuses > 0 || pendingTerminationBenefits > 0) {
      const pendingItems: string[] = [];
      if (pendingSigningBonuses > 0) {
        pendingItems.push(`${pendingSigningBonuses} pending signing bonus(es)`);
      }
      if (pendingTerminationBenefits > 0) {
        pendingItems.push(
          `${pendingTerminationBenefits} pending termination benefit(s)`,
        );
      }
      throw new BadRequestException(
        `Cannot initiate payroll run. Please resolve pending items first: ${pendingItems.join(', ')}`,
      );
    }

    // 4. Create Draft Run
    const run = new this.payrollRunsModel({
      runId: `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`, // Simple ID generation
      payrollPeriod: new Date(dto.period),
      status: PayRollStatus.DRAFT,
      entity: dto.entity,
      employees: 0,
      exceptions: 0,
      totalnetpay: 0,
      payrollSpecialistId: new Types.ObjectId(dto.payrollSpecialistId),
      paymentStatus: PayRollPaymentStatus.PENDING,
    });
    await run.save();

    let totalNetPay = 0;
    let employeeCount = 0;

    // 5. Process Each Employee
    for (const emp of employees) {
      try {
        // Fetch pay grade directly from database - REQUIRED, no fallback
        const payGrade = await this.payGradeModel
          .findOne({
            _id: emp.payGradeId,
            status: ConfigStatus.APPROVED,
          })
          .exec();

        // Replace the throw with a soft skip
        if (!payGrade) {
          console.error(
            `Skipping employee ${emp._id}: pay grade not found or not approved`,
          );
          run.exceptions = (run.exceptions || 0) + 1;
          continue; // go to next employee without crashing this one
        }

        // Fetch allowances directly from database
        const allowances = await this.allowanceModel
          .find({
            status: ConfigStatus.APPROVED,
          })
          .exec();
        const totalAllowances = allowances.reduce(
          (sum, allowance) => sum + allowance.amount,
          0,
        );

        // REQ-PY-2: Calculate proration factor for mid-month hires and terminations
        const periodStart = new Date(dto.period);
        const periodEnd = new Date(
          periodStart.getFullYear(),
          periodStart.getMonth() + 1,
          0, // Last day of month
        );
        const totalDaysInMonth = periodEnd.getDate();

        let effectiveStartDate = periodStart;
        let effectiveEndDate = periodEnd;
        let prorationFactor = 1.0;
        let isProrated = false;

        // Check if employee was hired mid-month
        const hireDate = emp.dateOfHire ? new Date(emp.dateOfHire) : null;
        if (hireDate && hireDate > periodStart && hireDate <= periodEnd) {
          effectiveStartDate = hireDate;
          isProrated = true;
        }

        // Check if employee was terminated/resigned mid-month (statusEffectiveFrom for terminated employees)
        const terminationDate = emp.statusEffectiveFrom
          ? new Date(emp.statusEffectiveFrom)
          : null;
        if (
          terminationDate &&
          emp.status !== 'ACTIVE' &&
          terminationDate >= periodStart &&
          terminationDate < periodEnd
        ) {
          effectiveEndDate = terminationDate;
          isProrated = true;
        }

        // Calculate proration factor based on working days
        if (isProrated) {
          const effectiveDays = Math.max(
            0,
            Math.ceil(
              (effectiveEndDate.getTime() - effectiveStartDate.getTime()) /
              (1000 * 60 * 60 * 24),
            ) + 1,
          );
          prorationFactor = effectiveDays / totalDaysInMonth;
        }

        // Calculate Gross Salary = Base Pay + Allowances (BR 31)
        // Apply proration factor for mid-month hires/terminations
        const baseSalary = Math.round(payGrade.baseSalary * prorationFactor);
        const grossSalary = Math.round(payGrade.grossSalary * prorationFactor); // Already includes base + allowances

        // Calculate Taxes using progressive tax brackets (BR 5, 6)
        // Fetch tax rules directly from database
        const taxRules = await this.taxRulesModel
          .find({
            status: ConfigStatus.APPROVED,
          })
          .exec();
        let totalTax = 0;
        const taxBreakdown: { name: string; rate: number; amount: number }[] =
          [];

        for (const rule of taxRules) {
          const taxAmount = grossSalary * (rule.rate / 100);
          totalTax += taxAmount;
          taxBreakdown.push({
            name: rule.name,
            rate: rule.rate,
            amount: taxAmount,
          });
        }

        // Calculate Insurance using salary brackets (BR 7, 8)
        // Fetch insurance brackets directly from database
        const insuranceBrackets = await this.insuranceBracketsModel
          .find({
            status: ConfigStatus.APPROVED,
          })
          .exec();
        let totalInsurance = 0;
        let totalEmployerInsurance = 0;
        const insuranceBreakdown: {
          name: string;
          minSalary: number;
          maxSalary: number;
          employeeRate: number;
          employerRate: number;
          employeeAmount: number;
          employerAmount: number;
        }[] = [];

        for (const bracket of insuranceBrackets) {
          // Check if salary falls within this bracket
          if (
            grossSalary >= bracket.minSalary &&
            grossSalary <= bracket.maxSalary
          ) {
            const employeeAmount = grossSalary * (bracket.employeeRate / 100);
            const employerAmount = grossSalary * (bracket.employerRate / 100);

            totalInsurance += employeeAmount;
            totalEmployerInsurance += employerAmount;

            insuranceBreakdown.push({
              name: bracket.name,
              minSalary: bracket.minSalary,
              maxSalary: bracket.maxSalary,
              employeeRate: bracket.employeeRate,
              employerRate: bracket.employerRate,
              employeeAmount,
              employerAmount,
            });
          }
        }

        // Calculate Net Salary = Gross - Taxes - Insurance (BR 35)
        const netSalary = grossSalary - totalTax - totalInsurance;

        // Fetch penalties from time management
        // Calculate penalties based on missing days and hours
        let penaltyAmount = 0;
        const penaltyReasons: string[] = [];

        // 1. Get Attendance Records for the period
        const startDate = new Date(dto.period);
        const endDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          0,
        ); // End of month

        const attendanceRecords = await this.attendanceRecordModel
          .find({
            employeeId: emp._id,
            'punches.time': { $gte: startDate, $lte: endDate },
            finalisedForPayroll: true,
          })
          .exec();

        // 2. Get Approved Leaves for the period (populate leaveTypeId to check if paid)
        const approvedLeaves = await this.leaveRequestModel
          .find({
            employeeId: emp._id,
            status: LeaveStatus.APPROVED,
            'dates.from': { $lte: endDate },
            'dates.to': { $gte: startDate },
          })
          .populate('leaveTypeId')
          .exec();

        // 3. Calculate Missing Days Penalty
        // Count total working days and missing days in the month
        let totalWorkingDays = 0;
        let missingDays = 0;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          const dayOfWeek = currentDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            // Skip weekends (0=Sun, 6=Sat)
            totalWorkingDays++;

            // Check if day is covered by attendance
            const hasAttendance = attendanceRecords.some((record) =>
              record.punches.some(
                (p) =>
                  new Date(p.time).toDateString() ===
                  currentDate.toDateString(),
              ),
            );

            // Check if day is covered by PAID leave (unpaid leave should still be deducted)
            const hasPaidLeave = approvedLeaves.some((leave) => {
              const isWithinDates =
                currentDate >= new Date(leave.dates.from) &&
                currentDate <= new Date(leave.dates.to);
              const leaveType = leave.leaveTypeId as any;
              const isPaid = leaveType?.paid === true;
              return isWithinDates && isPaid;
            });

            if (!hasAttendance && !hasPaidLeave) {
              missingDays++;
            }
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Apply missing days penalty
        if (missingDays > 0) {
          // Penalty: Deduct daily salary for each missing day
          // Use 22 working days as standard month for daily rate
          const dailySalary = netSalary / 22;
          const missingDaysPenalty = missingDays * dailySalary;
          penaltyAmount += missingDaysPenalty;
          penaltyReasons.push(`Missing ${missingDays} days`);
        }

        // 4. Calculate Missing Hours Penalty (to avoid double-counting with missing days)
        // Per requirements: TAs should work 42 hours/week, so 42 * 5 weeks = 210 hours/month
        // But only penalize for hours on ATTENDED days (days not already penalized above)
        const HOURS_PER_DAY = 8.4; // 42 hours/week ÷ 5 days = 8.4 hours/day
        const attendedDays = totalWorkingDays - missingDays;
        const expectedHoursForAttendedDays = attendedDays * HOURS_PER_DAY;

        const totalMinutesWorked = attendanceRecords.reduce(
          (sum, record) => sum + (record.totalWorkMinutes || 0),
          0,
        );
        const totalHoursWorked = totalMinutesWorked / 60;

        // Only penalize if worked less hours than expected FOR THE DAYS ACTUALLY ATTENDED
        if (totalHoursWorked < expectedHoursForAttendedDays) {
          const missingHours = expectedHoursForAttendedDays - totalHoursWorked;
          // Calculate hourly rate based on full month expectations (210 hours)
          const EXPECTED_MONTHLY_HOURS = 210; // 42 hours/week * 5 weeks
          const hourlyRate = netSalary / EXPECTED_MONTHLY_HOURS;
          const missingHoursPenalty = missingHours * hourlyRate;

          penaltyAmount += missingHoursPenalty;
          penaltyReasons.push(`Missing ${missingHours.toFixed(1)} hours`);
        }

        // Fetch pending refunds directly from database
        const refunds = await this.refundsModel
          .find({
            employeeId: emp._id,
            status: RefundStatus.PENDING, // Use PENDING status
          })
          .exec();
        const totalRefunds = refunds.reduce(
          (sum, refund) => sum + (refund.refundDetails?.amount || 0),
          0,
        );

        // Mark refunds as PAID since they are now included in this payroll run
        if (refunds.length > 0) {
          const refundIds = refunds.map(r => r._id);
          await this.refundsModel.updateMany(
            { _id: { $in: refundIds } },
            { status: RefundStatus.PAID, paidInPayrollRunId: run._id },
          );
        }

        let signingBonusAmount = 0;
        let signingBonusName = '';
        let employeePositionTitle = ''; // Will store position title for signing bonus positionName

        // Fetch employee's position to get positionName for signing bonus
        if (emp.primaryPositionId) {
          const position = await this.positionModel
            .findById(emp.primaryPositionId)
            .exec();
          if (position) {
            employeePositionTitle = position.title; // e.g., "Junior TA", "Mid TA", "Senior TA"
          }
        }

        const signingBonus = await this.employeeSigningBonusModel
          .findOne({
            employeeId: emp._id,
            status: BonusStatus.APPROVED,
          })
          .populate('signingBonusId')
          .exec();

        if (signingBonus && signingBonus.signingBonusId) {
          signingBonusAmount =
            signingBonus.givenAmount ||
            (signingBonus.signingBonusId as any).amount ||
            0;
          signingBonusName = 'Signing Bonus';

          // Update status to PAID
          signingBonus.status = BonusStatus.PAID;
          signingBonus.paymentDate = new Date();
          await signingBonus.save();
        }

        // --- NEW: Fetch and Process Termination Benefit ---
        let terminationBenefitAmount = 0;
        let terminationBenefitName = '';
        const terminationBenefit = await this.employeeTerminationModel
          .findOne({
            employeeId: emp._id,
            status: BenefitStatus.APPROVED,
          })
          .populate('benefitId')
          .exec();

        if (terminationBenefit && terminationBenefit.benefitId) {
          terminationBenefitAmount =
            (terminationBenefit.benefitId as any).amount || 0;
          terminationBenefitName = 'Termination Benefit';

          // Update status to PAID
          terminationBenefit.status = BenefitStatus.PAID;
          await terminationBenefit.save();
        }

        // Calculate Final Pay = Net Salary - Penalties + Refunds + Bonuses + Benefits
        const netPay =
          netSalary -
          penaltyAmount +
          totalRefunds +
          signingBonusAmount +
          terminationBenefitAmount;

        // Total deductions for reporting
        const deductions = totalTax + totalInsurance + penaltyAmount;

        const bank = emp.bankAccountNumber;
        let bankStatus = '';
        if (bank) {
          bankStatus = BankStatus.VALID;
        } else {
          bankStatus = BankStatus.MISSING;
        }

        // Set initial exceptions during payroll initiation
        let initialExceptions = '';
        if (netPay < 0) {
          initialExceptions = 'Negative Net Pay';
        }
        if (bankStatus === BankStatus.MISSING) {
          if (initialExceptions) initialExceptions += ', ';
          initialExceptions += 'Missing Bank Details';
        }

        // Create Payroll Details
        const details = new this.employeePayrollDetailsModel({
          employeeId: emp._id,
          baseSalary,
          allowances: totalAllowances,
          deductions,
          netSalary,
          netPay,
          bankStatus,
          payrollRunId: run._id,
          exceptions: initialExceptions || null,
          bonus: signingBonusAmount,
          benefit: terminationBenefitAmount,
        });
        await details.save();

        // Increment exception count if there are any exceptions
        if (initialExceptions) {
          run.exceptions = (run.exceptions || 0) + 1;
        }

        // Create Payslip with detailed breakdown - use plain objects to avoid unique constraint issues
        const payslipData = {
          employeeId: emp._id,
          payrollRunId: run._id,
          earningsDetails: {
            baseSalary,
            allowances: allowances.map((a) => ({
              name: a.name,
              amount: a.amount,
              description: '',
            })),
            bonuses:
              signingBonusAmount > 0
                ? [
                  {
                    positionName:
                      employeePositionTitle && employeePositionTitle.trim()
                        ? employeePositionTitle.trim()
                        : `SigningBonus-${run.runId}-${emp._id.toString()}`,
                    amount: signingBonusAmount,
                    status: ConfigStatus.APPROVED,
                  },
                ]
                : [],
            benefits:
              terminationBenefitAmount > 0
                ? [
                  {
                    name: terminationBenefitName,
                    amount: terminationBenefitAmount,
                    type: 'Termination Benefit',
                  },
                ]
                : [],
            refunds: refunds.map((r: any) => ({
              description: r.refundDetails?.description || 'Refund issued',
              amount: r.refundDetails?.amount || 0,
            })),
          },
          deductionsDetails: {
            taxes: taxBreakdown.map((t) => ({
              name: t.name,
              rate: t.rate,
              amount: t.amount,
            })),
            insurances: insuranceBreakdown.map((i) => ({
              name: i.name,
              amount: i.employeeAmount,
              status: ConfigStatus.APPROVED,
              minSalary: i.minSalary,
              maxSalary: i.maxSalary,
              employeeRate: i.employeeRate,
              employerRate: i.employerRate,
            })),
            penalties: {
              employeeId: emp._id,
              penalties:
                penaltyAmount > 0
                  ? penaltyReasons.map((reason) => ({
                    reason,
                    amount: penaltyAmount,
                  }))
                  : [],
            },
          },
          totalGrossSalary: grossSalary + signingBonusAmount + terminationBenefitAmount,
          totaDeductions: deductions,
          netPay,
          paymentStatus: PaySlipPaymentStatus.PENDING,
        };

        // Use insertOne to bypass Mongoose's embedded schema validation
        await this.paySlipModel.collection.insertOne(payslipData);
        // Alternatively, use create with validateBeforeSave: false if insertOne causes type issues
        // await this.paySlipModel.create(payslipData);

        totalNetPay += netPay;
        employeeCount++;
      } catch (error) {
        // Log error and continue with next employee
        console.error(`Error processing employee ${emp._id}:`, error.message);
        run.exceptions = (run.exceptions || 0) + 1;
      }
    }

    // 5. Update Run Totals
    run.employees = employeeCount;
    run.totalnetpay = totalNetPay;
    await run.save();

    return run;
  }

  async getAllRuns() {
    return this.payrollRunsModel
      .find()
      .populate('payrollSpecialistId', 'firstName lastName')
      .populate('payrollManagerId', 'firstName lastName')
      .lean()
      .exec();
  }

  async getRun(runId: string) {
    return this.payrollRunsModel.findById(runId);
  }

  async getDraftDetails(runId: string) {
    return this.employeePayrollDetailsModel
      .find({ payrollRunId: runId })
      .populate('employeeId', 'firstName lastName employeeId');
  }

  // Get payslips with full deduction details for a run
  async getRunPayslips(runId: string) {
    return this.paySlipModel
      .find({ payrollRunId: runId })
      .populate('employeeId', 'firstName lastName employeeId')
      .lean()
      .exec();
  }

  async reviewPayroll(runId: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Run not found');

    if (
      run.status !== PayRollStatus.DRAFT &&
      run.status !== PayRollStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        'Cannot review a payroll run that is not in DRAFT or UNDER_REVIEW status',
      );
    }

    const details = await this.employeePayrollDetailsModel.find({
      payrollRunId: runId,
    });
    let employeesWithExceptions = 0;

    for (const detail of details) {
      let issues: string = '';
      let hasException = false;

      // START MODIFICATION: details
      // Check if bank details have been added since run creation
      if (detail.bankStatus === BankStatus.MISSING) {
        const currentEmployee = await this.employeeProfileModel.findById(
          detail.employeeId,
        );
        if (
          currentEmployee &&
          currentEmployee.bankName &&
          currentEmployee.bankAccountNumber
        ) {
          detail.bankStatus = BankStatus.VALID;
        }
      }
      // END MODIFICATION

      if (detail.netPay < 0) {
        issues += 'Negative Net Pay';
        hasException = true;
      }

      if (detail.bankStatus === BankStatus.MISSING) {
        if (issues) issues += ', ';
        issues += 'Missing Bank Details';
        hasException = true;
      }

      // NEW: Check for salary spikes (Pay > Gross Salary + Bonuses)
      // Salary spike detection should include bonuses in the comparison
      // We flag if Net Pay > (Gross Salary + Signing Bonus + Termination Benefit)
      // This catches cases where there are calculation errors or unexpected additions

      const gross = detail.baseSalary + detail.allowances;
      const signingBonus = (detail as any).bonus || 0;
      const terminationBenefit = (detail as any).benefit || 0;
      const expectedMaxPay = gross + signingBonus + terminationBenefit;

      if (detail.netPay > expectedMaxPay) {
        if (issues) issues += ', ';
        issues += 'Salary Spike';
        hasException = true;
      }

      // Update exceptions field - if no issues, set to empty/null
      detail.exceptions = issues || '';
      await detail.save();

      if (issues) {
        employeesWithExceptions++; // Count employees with at least one exception
      }
    }

    run.exceptions = employeesWithExceptions;
    run.status = PayRollStatus.UNDER_REVIEW;
    await run.save();
    return run;
  }

  async approvePayrollManager(runId: string, managerId: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Run not found');

    if (run.status !== PayRollStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Payroll run must be in UNDER_REVIEW status to be approved by manager',
      );
    }

    run.status = PayRollStatus.PENDING_FINANCE_APPROVAL;
    run.payrollManagerId = new Types.ObjectId(managerId) as any;
    run.managerApprovalDate = new Date();

    await run.save();
    return run;
  }

  async rejectPayrollManager(runId: string, managerId: string, reason: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Run not found');

    if (run.status !== PayRollStatus.UNDER_REVIEW) {
      throw new BadRequestException(
        'Payroll run must be in UNDER_REVIEW status to be rejected by manager',
      );
    }

    run.status = PayRollStatus.REJECTED;
    run.rejectionReason = reason;
    // Optionally track who rejected it if schema supports it

    await run.save();
    return run;
  }

  // Revert rejected payroll run back to UNDER_REVIEW status (for Payroll Specialist)
  async revertToUnderReview(runId: string, specialistId: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Run not found');

    if (run.status !== PayRollStatus.REJECTED) {
      throw new BadRequestException(
        'Payroll run must be in REJECTED status to be reverted to under review',
      );
    }

    run.status = PayRollStatus.UNDER_REVIEW;
    run.rejectionReason = undefined; // Clear the rejection reason
    run.payrollSpecialistId = new Types.ObjectId(specialistId) as any;

    await run.save();
    return run;
  }

  async approveFinancialStaff(runId: string, staffId: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Run not found');

    if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
      throw new BadRequestException(
        'Payroll run must be in PENDING_FINANCE_APPROVAL status to be approved by finance',
      );
    }

    run.status = PayRollStatus.APPROVED;
    run.financeStaffId = new Types.ObjectId(staffId) as any;
    run.financeApprovalDate = new Date();
    run.paymentStatus = PayRollPaymentStatus.PAID;

    await run.save();

    // Update all payslips for this run to PAID status
    await this.paySlipModel.updateMany(
      { payrollRunId: run._id },
      { paymentStatus: PaySlipPaymentStatus.PAID },
    );

    // Get all employee IDs included in this payroll run
    const payslips = await this.paySlipModel.find({ payrollRunId: run._id }).select('employeeId').exec();
    const employeeIds = payslips.map(p => p.employeeId);

    // Update pending refunds for these employees to PAID status
    await this.refundsModel.updateMany(
      {
        employeeId: { $in: employeeIds },
        status: RefundStatus.PENDING
      },
      {
        status: RefundStatus.PAID,
        paidInPayrollRunId: run._id
      },
    );

    return run;
  }

  async rejectFinancialStaff(runId: string, staffId: string, reason: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Run not found');

    if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
      throw new BadRequestException(
        'Payroll run must be in PENDING_FINANCE_APPROVAL status to be rejected by finance',
      );
    }

    run.status = PayRollStatus.REJECTED;
    run.rejectionReason = reason;

    await run.save();

    // Revert refunds back to PENDING so they can be included in the next payroll run
    await this.refundsModel.updateMany(
      { paidInPayrollRunId: run._id },
      { status: RefundStatus.PENDING, $unset: { paidInPayrollRunId: 1 } },
    );

    return run;
  }

  async executePayroll(runId: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Run not found');

    // In a real system, this would trigger bank transfers, email payslips, etc.
    // Here we just ensure it's locked/paid.
    run.status = PayRollStatus.LOCKED;
    run.paymentStatus = PayRollPaymentStatus.PAID;
    await run.save();

    // Update payslips to PAID
    await this.paySlipModel.updateMany(
      { payrollRunId: run._id },
      { paymentStatus: PaySlipPaymentStatus.PAID },
    );

    // Get all employee IDs included in this payroll run
    const payslips = await this.paySlipModel.find({ payrollRunId: run._id }).select('employeeId').exec();
    const employeeIds = payslips.map(p => p.employeeId);

    // Update pending refunds for these employees to PAID status
    await this.refundsModel.updateMany(
      {
        employeeId: { $in: employeeIds },
        status: RefundStatus.PENDING
      },
      {
        status: RefundStatus.PAID,
        paidInPayrollRunId: run._id
      },
    );

    return run;
  }

  async getPendingItems() {
    // REQ-PY-28, 31: Query signing bonuses and termination benefits with 'draft' status
    // These are configuration records that need approval before being used in payroll
    const bonuses = await this.signingBonusConfigModel
      .find({ status: 'draft' })
      .populate('createdBy');
    const benefits = await this.terminationBenefitsConfigModel
      .find({ status: 'draft' })
      .populate('createdBy');
    return { bonuses, benefits };
  }

  async getPendingPayrollItems() {
    const pendingBonuses = await this.employeeSigningBonusModel.countDocuments({
      status: BonusStatus.PENDING,
    });

    const pendingBenefits = await this.employeeTerminationModel.countDocuments({
      status: BenefitStatus.PENDING,
    });

    return { pendingBonuses, pendingBenefits };
  }

  // Phase 0: Signing Bonus Approval (REQ-PY-28, 29)
  async approveSigningBonus(
    bonusId: string,
    status: string,
    approverId: string,
    reason?: string,
  ) {
    const bonus = await this.signingBonusConfigModel.findById(bonusId);
    if (!bonus) throw new NotFoundException('Signing bonus not found');

    // Accept both 'approved'/'rejected' (lowercase) and 'APPROVED'/'REJECTED' (uppercase)
    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus === 'APPROVED') {
      bonus.status = BonusStatus.APPROVED;
    } else if (normalizedStatus === 'REJECTED') {
      bonus.status = BonusStatus.REJECTED;
    } else {
      bonus.status = BonusStatus.APPROVED; // Default to approved for backwards compatibility
    }
    await bonus.save();

    return bonus;
  }

  async editSigningBonus(bonusId: string, updateData: any) {
    const bonus = await this.signingBonusConfigModel.findById(bonusId);
    if (!bonus) throw new NotFoundException('Signing bonus not found');

    if (bonus.status !== 'draft') {
      throw new BadRequestException('Can only edit draft signing bonuses');
    }

    Object.assign(bonus, updateData);
    await bonus.save();
    return bonus;
  }

  // Phase 0: Termination Benefit Approval (REQ-PY-31, 32)
  async approveTerminationBenefit(
    benefitId: string,
    status: string,
    approverId: string,
    reason?: string,
  ) {
    const benefit =
      await this.terminationBenefitsConfigModel.findById(benefitId);
    if (!benefit) throw new NotFoundException('Termination benefit not found');

    // Accept both lowercase and uppercase status values
    const normalizedStatus = status?.toUpperCase();
    if (normalizedStatus === 'APPROVED') {
      benefit.status = 'approved';
    } else if (normalizedStatus === 'REJECTED') {
      benefit.status = 'rejected';
    } else {
      benefit.status = 'approved'; // Default to approved for backwards compatibility
    }
    await benefit.save();

    return benefit;
  }

  async editTerminationBenefit(benefitId: string, updateData: any) {
    const benefit =
      await this.terminationBenefitsConfigModel.findById(benefitId);
    if (!benefit) throw new NotFoundException('Termination benefit not found');

    if (benefit.status !== 'draft') {
      throw new BadRequestException('Can only edit draft termination benefits');
    }

    Object.assign(benefit, updateData);
    await benefit.save();
    return benefit;
  }

  // ==================== EMPLOYEE SIGNING BONUS ASSIGNMENT ====================

  /**
   * Assign a signing bonus to an employee
   * Logic:
   * 1. Check that the signing bonus configuration exists and is approved
   * 2. Check that the employee exists
   * 3. Create an employee signing bonus record linking the employee to the bonus
   * 4. The givenAmount can be customized per employee (defaults to config amount)
   * 5. Status starts as PENDING and needs to be approved before payroll processing
   */
  async assignSigningBonusToEmployee(
    employeeId: string,
    signingBonusId: string,
    givenAmount?: number,
  ) {
    // Validate employee exists
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    // Validate signing bonus config exists
    const signingBonusConfig =
      await this.signingBonusConfigModel.findById(signingBonusId);
    if (!signingBonusConfig)
      throw new NotFoundException('Signing bonus configuration not found');

    // Check if employee already has this signing bonus assigned
    const existingAssignment = await this.employeeSigningBonusModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      signingBonusId: new Types.ObjectId(signingBonusId),
    });
    if (existingAssignment) {
      throw new BadRequestException(
        'This signing bonus is already assigned to this employee',
      );
    }

    // Create the employee signing bonus record
    const employeeSigningBonus = new this.employeeSigningBonusModel({
      employeeId: new Types.ObjectId(employeeId),
      signingBonusId: new Types.ObjectId(signingBonusId),
      givenAmount: givenAmount ?? signingBonusConfig.amount,
      status: BonusStatus.PENDING,
    });

    await employeeSigningBonus.save();
    return employeeSigningBonus;
  }

  /**
   * Get all employee signing bonus assignments
   */
  async getEmployeeSigningBonuses(employeeId?: string) {
    const query: any = {};
    if (employeeId) {
      query.employeeId = new Types.ObjectId(employeeId);
    }

    return this.employeeSigningBonusModel
      .find(query)
      .populate('employeeId', 'firstName lastName employeeId email')
      .populate('signingBonusId', 'positionName amount status')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Update an employee signing bonus assignment
   */
  async updateEmployeeSigningBonus(
    id: string,
    updateData: { givenAmount?: number; status?: BonusStatus },
  ) {
    const record = await this.employeeSigningBonusModel.findById(id);
    if (!record)
      throw new NotFoundException(
        'Employee signing bonus assignment not found',
      );

    if (updateData.givenAmount !== undefined) {
      record.givenAmount = updateData.givenAmount;
    }
    if (updateData.status) {
      record.status = updateData.status;
    }

    await record.save();
    return record;
  }

  /**
   * Delete an employee signing bonus assignment
   */
  async deleteEmployeeSigningBonus(id: string) {
    const record = await this.employeeSigningBonusModel.findById(id);
    if (!record)
      throw new NotFoundException(
        'Employee signing bonus assignment not found',
      );

    if (record.status === BonusStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid signing bonus');
    }

    await this.employeeSigningBonusModel.findByIdAndDelete(id);
    return {
      message: 'Employee signing bonus assignment deleted successfully',
    };
  }

  // ==================== EMPLOYEE TERMINATION BENEFIT ASSIGNMENT ====================

  /**
   * Assign a termination benefit to an employee
   * Logic:
   * 1. Check that the termination benefit configuration exists and is approved
   * 2. Check that the employee exists
   * 3. Require a termination request ID (linked to the employee's termination process)
   * 4. Create an employee termination benefit record
   * 5. The givenAmount can be customized per employee (defaults to config amount)
   * 6. Status starts as PENDING and needs to be approved before payroll processing
   */
  async assignTerminationBenefitToEmployee(
    employeeId: string,
    benefitId: string,
    terminationId: string,
    givenAmount?: number,
  ) {
    // Validate employee exists
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) throw new NotFoundException('Employee not found');

    // Validate termination benefit config exists
    const benefitConfig =
      await this.terminationBenefitsConfigModel.findById(benefitId);
    if (!benefitConfig)
      throw new NotFoundException(
        'Termination benefit configuration not found',
      );

    // Check if employee already has this benefit assigned for this termination
    const existingAssignment = await this.employeeTerminationModel.findOne({
      employeeId: new Types.ObjectId(employeeId),
      benefitId: new Types.ObjectId(benefitId),
      terminationId: new Types.ObjectId(terminationId),
    });
    if (existingAssignment) {
      throw new BadRequestException(
        'This termination benefit is already assigned to this employee for this termination',
      );
    }

    // Create the employee termination benefit record
    const employeeTerminationBenefit = new this.employeeTerminationModel({
      employeeId: new Types.ObjectId(employeeId),
      benefitId: new Types.ObjectId(benefitId),
      terminationId: new Types.ObjectId(terminationId),
      givenAmount: givenAmount ?? benefitConfig.amount,
      status: BenefitStatus.PENDING,
    });

    await employeeTerminationBenefit.save();
    return employeeTerminationBenefit;
  }

  /**
   * Get all employee termination benefit assignments
   */
  async getEmployeeTerminationBenefits(employeeId?: string) {
    const query: any = {};
    if (employeeId) {
      query.employeeId = new Types.ObjectId(employeeId);
    }

    return this.employeeTerminationModel
      .find(query)
      .populate('employeeId', 'firstName lastName employeeId email')
      .populate('benefitId', 'name amount status')
      .populate('terminationId')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Update an employee termination benefit assignment
   */
  async updateEmployeeTerminationBenefit(
    id: string,
    updateData: { givenAmount?: number; status?: BenefitStatus },
  ) {
    const record = await this.employeeTerminationModel.findById(id);
    if (!record)
      throw new NotFoundException(
        'Employee termination benefit assignment not found',
      );

    if (updateData.givenAmount !== undefined) {
      record.givenAmount = updateData.givenAmount;
    }
    if (updateData.status) {
      record.status = updateData.status;
    }

    await record.save();
    return record;
  }

  /**
   * Delete an employee termination benefit assignment
   */
  async deleteEmployeeTerminationBenefit(id: string) {
    const record = await this.employeeTerminationModel.findById(id);
    if (!record)
      throw new NotFoundException(
        'Employee termination benefit assignment not found',
      );

    if (record.status === BenefitStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid termination benefit');
    }

    await this.employeeTerminationModel.findByIdAndDelete(id);
    return {
      message: 'Employee termination benefit assignment deleted successfully',
    };
  }

  // Lock/Unlock Functionality (REQ-PY-7, 19)
  async lockPayroll(runId: string, managerId: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Payroll run not found');

    if (run.status !== PayRollStatus.APPROVED) {
      throw new BadRequestException('Can only lock approved payroll runs');
    }

    run.status = PayRollStatus.LOCKED;
    // Note: lockedBy and lockedAt fields would need to be added to schema
    // run.lockedBy = new Types.ObjectId(managerId) as any;
    // run.lockedAt = new Date();
    await run.save();

    return run;
  }

  async unlockPayroll(runId: string, managerId: string, reason: string) {
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Payroll run not found');

    if (run.status !== PayRollStatus.LOCKED) {
      throw new BadRequestException('Can only unlock locked payroll runs');
    }

    run.status = PayRollStatus.UNLOCKED;
    run.unlockReason = reason;
    // Note: unlockedBy and unlockedAt fields would need to be added to schema
    // run.unlockedBy = new Types.ObjectId(managerId) as any;
    // run.unlockedAt = new Date();
    await run.save();

    return run;
  }

  async getAllExceptions() {
    try {
      console.log('Fetching all exceptions...');

      // Get all employee payroll details that have exceptions
      // Query for records that either:
      // 1. Have exceptions field populated (non-null, non-empty string)
      // 2. Have bankStatus = 'missing' (Missing Bank Details)
      // 3. Have netPay < 0 (Negative Net Pay)
      const allExceptions = await this.employeePayrollDetailsModel
        .find({
          $or: [
            { exceptions: { $exists: true, $nin: [null, ''] } },
            { bankStatus: BankStatus.MISSING },
            { netPay: { $lt: 0 } },
          ],
        })
        .populate({
          path: 'employeeId',
          select: 'firstName lastName employeeId bankName bankAccountNumber',
        })
        .populate({
          path: 'payrollRunId',
          select: 'runId payrollPeriod entity status',
        })
        .sort({ createdAt: -1 })
        .lean();

      // Enrich the results with computed exception types for records that don't have the field set
      const enrichedExceptions = allExceptions.map((record: any) => {
        if (!record.exceptions) {
          const issues: string[] = [];
          if (record.bankStatus === BankStatus.MISSING) {
            issues.push('Missing Bank Details');
          }
          if (record.netPay < 0) {
            issues.push('Negative Net Pay');
          }
          record.exceptions = issues.join(', ');
        }
        return record;
      });

      console.log(`Found ${enrichedExceptions.length} exceptions`);
      return enrichedExceptions;
    } catch (error) {
      console.error('Error in getAllExceptions:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  async getRunExceptions(runId: string) {
    // Get exceptions for a specific payroll run
    const run = await this.payrollRunsModel.findById(runId);
    if (!run) throw new NotFoundException('Payroll run not found');

    // Query for records that either:
    // 1. Have exceptions field populated (non-null, non-empty string)
    // 2. Have bankStatus = 'missing' (Missing Bank Details)
    // 3. Have netPay < 0 (Negative Net Pay)
    const exceptions = await this.employeePayrollDetailsModel
      .find({
        payrollRunId: runId,
        $or: [
          { exceptions: { $exists: true, $nin: [null, ''] } },
          { bankStatus: BankStatus.MISSING },
          { netPay: { $lt: 0 } },
        ],
      })
      .populate({
        path: 'employeeId',
        select: 'firstName lastName employeeId bankName bankAccountNumber',
      })
      .sort({ createdAt: -1 })
      .lean();

    // Enrich the results with computed exception types for records that don't have the field set
    const enrichedExceptions = exceptions.map((record: any) => {
      if (!record.exceptions) {
        const issues: string[] = [];
        if (record.bankStatus === BankStatus.MISSING) {
          issues.push('Missing Bank Details');
        }
        if (record.netPay < 0) {
          issues.push('Negative Net Pay');
        }
        record.exceptions = issues.join(', ');
      }
      return record;
    });

    return enrichedExceptions;
  }

  // ==================== EXCEPTION RESOLUTION ====================

  /**
   * Resolve an exception manually (Payroll Manager only)
   * This allows the manager to mark an exception as resolved with a reason
   */
  async resolveException(
    detailId: string,
    resolution: string,
    resolvedBy: string,
  ) {
    const detail = await this.employeePayrollDetailsModel.findById(detailId);
    if (!detail) {
      throw new NotFoundException('Payroll detail record not found');
    }

    // Clear the exception and add resolution note
    const previousException = detail.exceptions;
    detail.exceptions = '';
    (detail as any).exceptionResolution = {
      previousException,
      resolution,
      resolvedBy: new Types.ObjectId(resolvedBy),
      resolvedAt: new Date(),
    };

    // Check if we can also update the bankStatus if it was missing
    if (detail.bankStatus === BankStatus.MISSING) {
      const currentEmployee = await this.employeeProfileModel.findById(
        detail.employeeId,
      );
      if (
        currentEmployee &&
        currentEmployee.bankName &&
        currentEmployee.bankAccountNumber
      ) {
        detail.bankStatus = BankStatus.VALID;
      }
    }

    await detail.save();

    // Update the run's exception count
    const run = await this.payrollRunsModel.findById(detail.payrollRunId);
    if (run && run.exceptions > 0) {
      // Recalculate total exceptions for this run to be safe
      const exceptionCount = await this.employeePayrollDetailsModel.countDocuments({
        payrollRunId: detail.payrollRunId,
        $or: [
          { exceptions: { $exists: true, $nin: [null, ''] } },
          { bankStatus: BankStatus.MISSING },
          { netPay: { $lt: 0 } },
        ],
      });
      run.exceptions = exceptionCount;
      await run.save();
    }

    return {
      message: 'Exception resolved successfully',
      detail,
    };
  }

  /**
   * Get all payslips with optional status filter
   */
  async getAllPayslips(status?: string) {
    const query: any = {};

    if (status && status !== 'all') {
      query.paymentStatus = status.toUpperCase();
    }

    const payslips = await this.paySlipModel
      .find(query)
      .populate({
        path: 'employeeId',
        select:
          'firstName lastName employeeId email bankName bankAccountNumber',
      })
      .populate({
        path: 'payrollRunId',
        select: 'runId payrollPeriod entity status',
      })
      .sort({ createdAt: -1 })
      .lean();

    return payslips;
  }

  // Get payslips by run ID with full details (using .lean() to preserve all fields)
  async getPayslipsByRunId(runId: string) {
    const payslips = await this.paySlipModel
      .find({ payrollRunId: new Types.ObjectId(runId) })
      .populate({
        path: 'employeeId',
        select:
          'firstName lastName employeeId email bankName bankAccountNumber',
      })
      .lean(); // Use lean() to get plain objects with all fields preserved

    return payslips;
  }

  /**
   * REQ-PY-4: Auto-generate draft payroll runs for all departments
   * This can be triggered manually or via a cron job
   */
  async autoGenerateDraftPayrolls(triggeredBy: string) {
    const results = {
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [] as { department: string; status: string; message: string }[],
    };

    try {
      // Get all unique departments that have active employees
      const departmentsWithEmployees = await this.employeeProfileModel.distinct(
        'primaryDepartmentId',
        {
          status: 'ACTIVE',
        },
      );

      if (departmentsWithEmployees.length === 0) {
        return {
          ...results,
          message: 'No departments with active employees found',
        };
      }

      // Current period (first day of current month)
      const today = new Date();
      const period = new Date(today.getFullYear(), today.getMonth(), 1);
      const periodString = period.toISOString();

      // Process each department
      for (const deptId of departmentsWithEmployees) {
        if (!deptId) continue;

        try {
          // Fetch department details to get the name
          const department = await this.departmentModel.findById(deptId).lean();
          const deptName = department?.name || `Department-${deptId.toString().slice(-6)}`;

          // Check if payroll run already exists for this period and department
          const existingRun = await this.payrollRunsModel.findOne({
            payrollPeriod: new Date(periodString),
            entity: deptName,
          });

          if (existingRun) {
            results.skipped++;
            results.details.push({
              department: deptName,
              status: 'skipped',
              message: 'Payroll run already exists for this period',
            });
            continue;
          }

          // Create draft payroll run for this department
          const run = new this.payrollRunsModel({
            runId: `DRAFT-${deptName.replace(/\s+/g, '-')}-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
            payrollPeriod: new Date(periodString),
            status: PayRollStatus.DRAFT,
            entity: deptName,
            employees: 0,
            exceptions: 0,
            totalnetpay: 0,
            payrollSpecialistId: new Types.ObjectId(triggeredBy),
            paymentStatus: PayRollPaymentStatus.PENDING,
          });
          await run.save();

          results.successful++;
          results.details.push({
            department: deptName,
            status: 'success',
            message: `Draft payroll created: ${run.runId}`,
          });
        } catch (error: any) {
          const deptName = `Department-${deptId.toString().slice(-6)}`;
          results.failed++;
          results.details.push({
            department: deptName,
            status: 'failed',
            message: error.message,
          });
        }
      }

      return {
        ...results,
        message: `Auto-generate completed: ${results.successful} successful, ${results.skipped} skipped, ${results.failed} failed`,
      };
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to auto-generate draft payrolls: ${error.message}`,
      );
    }
  }


  // Refactored Bank Details Logic (moved from employee-profile)
  
  async getEmployeeBankDetails(query: any) {
    const limit = query.limit ? parseInt(query.limit) : 1000;
    
    // Build filter
    const filter: any = {};
    if (query.name) {
      const nameRegex = new RegExp(query.name, 'i');
      filter.$or = [
        { firstName: nameRegex },
        { lastName: nameRegex },
        { fullName: nameRegex },
      ];
    }
    // Only return active employees or as needed
    filter.status = 'ACTIVE';

    const employees = await this.employeeProfileModel
      .find(filter)
      .select('employeeNumber firstName lastName fullName workEmail bankName bankAccountNumber')
      .limit(limit)
      .lean()
      .exec();

    return {
      employees: employees.map(emp => ({
        id: emp._id,
        employeeNumber: emp.employeeNumber,
        name: emp.fullName || `${emp.firstName} ${emp.lastName}`,
        workEmail: emp.workEmail,
        bankName: emp.bankName,
        bankAccountNumber: emp.bankAccountNumber
      }))
    };
  }

  async updateEmployeeBankDetails(employeeId: string, dto: { bankName: string; bankAccountNumber: string; changeReason?: string }) {
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee id');
    }

    const update = {
      bankName: dto.bankName,
      bankAccountNumber: dto.bankAccountNumber
    };

    const updated = await this.employeeProfileModel
      .findByIdAndUpdate(employeeId, { $set: update }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Employee not found');
    }

    return updated;
  }
}
