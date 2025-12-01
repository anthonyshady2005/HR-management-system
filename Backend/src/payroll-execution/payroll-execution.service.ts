import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { payrollRuns, payrollRunsDocument } from './models/payrollRuns.schema';
import { paySlip, PayslipDocument } from './models/payslip.schema';
import { employeePayrollDetails, employeePayrollDetailsDocument } from './models/employeePayrollDetails.schema';
import { employeeSigningBonus } from './models/EmployeeSigningBonus.schema';
import { EmployeeTerminationResignation } from './models/EmployeeTerminationResignation.schema';
import { InitiatePayrollDto } from './dtos/payroll-execution.dto';
import { PayRollStatus, PayRollPaymentStatus, BankStatus, PaySlipPaymentStatus, BonusStatus, BenefitStatus } from './enums/payroll-execution-enum';

// Import models from other subsystems (not services)
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { taxRules, taxRulesDocument } from '../payroll-configuration/models/taxRules.schema';
import { insuranceBrackets, insuranceBracketsDocument } from '../payroll-configuration/models/insuranceBrackets.schema';
import { payGrade, payGradeDocument } from '../payroll-configuration/models/payGrades.schema';
import { allowance, allowanceDocument } from '../payroll-configuration/models/allowance.schema';
import { refunds, refundsDocument } from '../payroll-tracking/models/refunds.schema';
import { ConfigStatus } from '../payroll-configuration/enums/payroll-configuration-enums';
import { RefundStatus } from '../payroll-tracking/enums/payroll-tracking-enum';
import { AttendanceRecord, AttendanceRecordDocument } from '../time-management/models/attendance-record.schema';
import { LeaveRequest, LeaveRequestDocument } from '../leaves/models/leave-request.schema';
import { LeaveStatus } from '../leaves/enums/leave-status.enum';
import { LeaveType, LeaveTypeDocument } from '../leaves/models/leave-type.schema';
import { Position, PositionDocument } from '../organization-structure/models/position.schema';

@Injectable()
export class PayrollExecutionService {
    constructor(
        // Payroll Execution Models
        @InjectModel(payrollRuns.name) private payrollRunsModel: Model<payrollRunsDocument>,
        @InjectModel(paySlip.name) private paySlipModel: Model<PayslipDocument>,
        @InjectModel(employeePayrollDetails.name) private employeePayrollDetailsModel: Model<employeePayrollDetailsDocument>,
        @InjectModel(employeeSigningBonus.name) private signingBonusModel: Model<any>, 
        @InjectModel(EmployeeTerminationResignation.name) private terminationModel: Model<any>,
        
        // Models from other subsystems (injected directly)
        @InjectModel(EmployeeProfile.name) private employeeProfileModel: Model<EmployeeProfileDocument>,
        @InjectModel(taxRules.name) private taxRulesModel: Model<taxRulesDocument>,
        @InjectModel(insuranceBrackets.name) private insuranceBracketsModel: Model<insuranceBracketsDocument>,
        @InjectModel(payGrade.name) private payGradeModel: Model<payGradeDocument>,
        @InjectModel(allowance.name) private allowanceModel: Model<allowanceDocument>,
        @InjectModel(refunds.name) private refundsModel: Model<refundsDocument>,
        @InjectModel(AttendanceRecord.name) private attendanceRecordModel: Model<AttendanceRecordDocument>,
        @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
        @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveTypeDocument>,
        @InjectModel(Position.name) private positionModel: Model<PositionDocument>,
    ) {}

    

    async initiatePayroll(dto: InitiatePayrollDto) {
        // 1. Check if run exists
        const existingRun = await this.payrollRunsModel.findOne({ payrollPeriod: new Date(dto.period) });
        if (existingRun) {
            throw new BadRequestException('Payroll run for this period already exists');
        }

        // 2. Create Draft Run
        const run = new this.payrollRunsModel({
            runId: `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`, // Simple ID generation
            payrollPeriod: new Date(dto.period),
            status: PayRollStatus.DRAFT,
            entity: dto.entity,
            employees: 0,
            exceptions: 0,
            totalnetpay: 0,
            payrollSpecialistId: new Types.ObjectId(dto.payrollSpecialistId),
            paymentStatus: PayRollPaymentStatus.PENDING
        });
        await run.save();

        // 3. Fetch Employees directly from database
        // Query employee profiles using injected model
        const employees = await this.employeeProfileModel.find({ primaryDepartmentId: new Types.ObjectId(dto.primaryDepartmentId) }).exec();

        let totalNetPay = 0;
        let employeeCount = 0;

        // 4. Process Each Employee
        for (const emp of employees) {
            try {
                // Fetch pay grade directly from database - REQUIRED, no fallback
                const payGrade = await this.payGradeModel.findOne({ 
                    _id: emp.payGradeId, 
                    status: ConfigStatus.APPROVED 
                }).exec();
                
                // Replace the throw with a soft skip
                if (!payGrade) {
                    console.error(`Skipping employee ${emp._id}: pay grade not found or not approved`);
                    run.exceptions = (run.exceptions || 0) + 1;
                    continue; // go to next employee without crashing this one
                }

                // Fetch allowances directly from database
                const allowances = await this.allowanceModel.find({ 
                    status: ConfigStatus.APPROVED 
                }).exec();
                const totalAllowances = allowances.reduce((sum, allowance) => sum + allowance.amount, 0);

                // Calculate Gross Salary = Base Pay + Allowances (BR 31)
                const baseSalary = payGrade.baseSalary;
                const grossSalary = payGrade.grossSalary; // Already includes base + allowances

                // Calculate Taxes using progressive tax brackets (BR 5, 6)
                // Fetch tax rules directly from database
                const taxRules = await this.taxRulesModel.find({ 
                    status: ConfigStatus.APPROVED 
                }).exec();
                let totalTax = 0;
                const taxBreakdown: { name: string; rate: number; amount: number }[] = [];
                
                for (const rule of taxRules) {
                    const taxAmount = grossSalary * (rule.rate / 100);
                    totalTax += taxAmount;
                    taxBreakdown.push({
                        name: rule.name,
                        rate: rule.rate,
                        amount: taxAmount
                    });
                }

                // Calculate Insurance using salary brackets (BR 7, 8)
                // Fetch insurance brackets directly from database
                const insuranceBrackets = await this.insuranceBracketsModel.find({ 
                    status: ConfigStatus.APPROVED 
                }).exec();
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
                    if (grossSalary >= bracket.minSalary && grossSalary <= bracket.maxSalary) {
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
                            employerAmount
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
                const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // End of month

                const attendanceRecords = await this.attendanceRecordModel.find({
                    employeeId: emp._id,
                    'punches.time': { $gte: startDate, $lte: endDate },
                    finalisedForPayroll:true
                }).exec();

                // 2. Get Approved Leaves for the period (populate leaveTypeId to check if paid)
                const approvedLeaves = await this.leaveRequestModel.find({
                    employeeId: emp._id,
                    status: LeaveStatus.APPROVED,
                    'dates.from': { $lte: endDate },
                    'dates.to': { $gte: startDate }
                }).populate('leaveTypeId').exec();

                // 3. Calculate Missing Days Penalty
                // Count total working days and missing days in the month
                let totalWorkingDays = 0;
                let missingDays = 0;
                const currentDate = new Date(startDate);
                
                while (currentDate <= endDate) {
                    const dayOfWeek = currentDate.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends (0=Sun, 6=Sat)
                        totalWorkingDays++;
                        
                        // Check if day is covered by attendance
                        const hasAttendance = attendanceRecords.some(record => 
                            record.punches.some(p => 
                                new Date(p.time).toDateString() === currentDate.toDateString()
                            )
                        );

                        // Check if day is covered by PAID leave (unpaid leave should still be deducted)
                        const hasPaidLeave = approvedLeaves.some(leave => {
                            const isWithinDates = currentDate >= new Date(leave.dates.from) && currentDate <= new Date(leave.dates.to);
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
                
                const totalMinutesWorked = attendanceRecords.reduce((sum, record) => sum + (record.totalWorkMinutes || 0), 0);
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
                const refunds = await this.refundsModel.find({
                    employeeId: emp._id,
                    status: RefundStatus.PENDING // Use PENDING status
                }).exec();
                const totalRefunds = refunds.reduce((sum, refund) => sum + (refund.refundDetails?.amount || 0), 0);

               
                let signingBonusAmount = 0;
                let signingBonusName = '';
                let employeePositionTitle = ''; // Will store position title for signing bonus positionName
                
                // Fetch employee's position to get positionName for signing bonus
                if (emp.primaryPositionId) {
                    const position = await this.positionModel.findById(emp.primaryPositionId).exec();
                    if (position) {
                        employeePositionTitle = position.title; // e.g., "Junior TA", "Mid TA", "Senior TA"
                    }
                }
                
                const signingBonus = await this.signingBonusModel.findOne({
                    employeeId: emp._id,
                    status: BonusStatus.APPROVED
                }).populate('signingBonusId').exec();

                if (signingBonus && signingBonus.signingBonusId) {
                    signingBonusAmount = (signingBonus.signingBonusId as any).givenAmount || 0;
                    signingBonusName =  'Signing Bonus';
                    
                    // Update status to PAID
                    signingBonus.status = BonusStatus.PAID;
                    signingBonus.paymentDate = new Date();
                    await signingBonus.save();
                }

                // --- NEW: Fetch and Process Termination Benefit ---
                let terminationBenefitAmount = 0;
                let terminationBenefitName = '';
                const terminationBenefit = await this.terminationModel.findOne({
                    employeeId: emp._id,
                    status: BenefitStatus.APPROVED
                }).populate('benefitId').exec();

                if (terminationBenefit && terminationBenefit.benefitId) {
                    terminationBenefitAmount = (terminationBenefit.benefitId as any).amount || 0;
                    terminationBenefitName =  'Termination Benefit';

                    // Update status to PAID
                    terminationBenefit.status = BenefitStatus.PAID;
                    await terminationBenefit.save();
                }

                // Calculate Final Pay = Net Salary - Penalties + Refunds + Bonuses + Benefits
                const netPay = netSalary - penaltyAmount + totalRefunds + signingBonusAmount + terminationBenefitAmount;

                // Total deductions for reporting
                const deductions = totalTax + totalInsurance + penaltyAmount;


                const bank= emp.bankAccountNumber
                let bankStatus=""
                if(bank){
                     bankStatus=BankStatus.VALID
                }
                else{ bankStatus=BankStatus.MISSING } 
       
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
                    exceptions: netPay < 0 ? 'Negative Net Pay' : null,
                    bonus: signingBonusAmount,
                    benefit: terminationBenefitAmount
                });
                await details.save();

                // Create Payslip with detailed breakdown
                const payslip = new this.paySlipModel({
                    employeeId: emp._id,
                    payrollRunId: run._id,
                    earningsDetails: {
                        baseSalary,
                        allowances: allowances.map(a => Object.assign({}, {
                            name: a.name,
                            amount: a.amount,
                            description: '',
                            // Omit schema fields like _id, status, createdBy, etc.
                        })),
                        // Store signing bonus as embedded signingBonus-shaped docs with positionName from employee's position
                        // If position is not found, fallback to a unique generated name to satisfy unique index
                        // Never use null - always ensure a non-null string value
                        bonuses: signingBonusAmount > 0 ? [{
                            positionName: (employeePositionTitle && employeePositionTitle.trim()) 
                                ? employeePositionTitle.trim() 
                                : `SigningBonus-${run.runId}-${emp._id.toString()}`,
                            amount: signingBonusAmount,
                            status: ConfigStatus.APPROVED
                        }] : [],
                        benefits: terminationBenefitAmount > 0 ? [{
                            name: terminationBenefitName,
                            amount: terminationBenefitAmount,
                            type: 'Termination Benefit'
                        }] : [],
                        refunds: refunds.map((r: any) => ({
                            description: r.refundDetails?.description || 'Refund issued',
                            amount: r.refundDetails?.amount || 0
                        }))
                    },
                    deductionsDetails: {
                        taxes: taxBreakdown.map(t => ({
                            name: t.name,
                            rate: t.rate,
                            amount: t.amount
                        })),
                        insurances: insuranceBreakdown.map(i => ({
                            // Shape must match insuranceBrackets schema used in deductionsDetails.insurances
                            name: i.name,
                            amount: i.employeeAmount,
                            status: ConfigStatus.APPROVED,
                            minSalary: i.minSalary,
                            maxSalary: i.maxSalary,
                            employeeRate: i.employeeRate,
                            employerRate: i.employerRate
                        })),
                        penalties: { 
                            employeeId: emp._id, 
                            penalties: penaltyAmount > 0 ? penaltyReasons.map(reason => ({ reason, amount: 0 })) : [] // Amount is total, reasons listed
                        }
                    },
                    totalGrossSalary: grossSalary,
                    totaDeductions: deductions,
                    netPay,
                    paymentStatus: PaySlipPaymentStatus.PENDING
                });
                await payslip.save();

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

    async getRun(runId: string) {
        return this.payrollRunsModel.findById(runId);
    }

    async getDraftDetails(runId: string) {
        return this.employeePayrollDetailsModel.find({ payrollRunId: runId });
    }

    async reviewPayroll(runId: string) {
        const run = await this.payrollRunsModel.findById(runId);
        if (!run) throw new NotFoundException('Run not found');

        if (run.status !== PayRollStatus.DRAFT && run.status !== PayRollStatus.UNDER_REVIEW) {
            throw new BadRequestException('Cannot review a payroll run that is not in DRAFT or UNDER_REVIEW status');
        }

        const details = await this.employeePayrollDetailsModel.find({ payrollRunId: runId });
        let exceptions = 0;

        for (const detail of details) {
            let issues: string = '';
            
            if (detail.netPay < 0){ 
                issues += 'Negative Net Pay';
                exceptions++;
            }

            if (detail.bankStatus === BankStatus.MISSING) {
                if (issues) issues += ', ';
                issues += 'Missing Bank Details';
                exceptions++;
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
                exceptions++;
            }

            if (issues) {
                detail.exceptions = issues;
                await detail.save();
            }
        }

        run.exceptions = exceptions;
        run.status = PayRollStatus.UNDER_REVIEW;
        await run.save();
        return run;
    }

    async approvePayrollManager(runId: string, managerId: string) {
        const run = await this.payrollRunsModel.findById(runId);
        if (!run) throw new NotFoundException('Run not found');

        if (run.status !== PayRollStatus.UNDER_REVIEW) {
             throw new BadRequestException('Payroll run must be in UNDER_REVIEW status to be approved by manager');
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
             throw new BadRequestException('Payroll run must be in UNDER_REVIEW status to be rejected by manager');
        }

        run.status = PayRollStatus.REJECTED;
        run.rejectionReason = reason;
        // Optionally track who rejected it if schema supports it
        
        await run.save();
        return run;
    }

    async approveFinancialStaff(runId: string, staffId: string) {
        const run = await this.payrollRunsModel.findById(runId);
        if (!run) throw new NotFoundException('Run not found');

        if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
             throw new BadRequestException('Payroll run must be in PENDING_FINANCE_APPROVAL status to be approved by finance');
        }

        run.status = PayRollStatus.APPROVED;
        run.financeStaffId = new Types.ObjectId(staffId) as any;
        run.financeApprovalDate = new Date();
        run.paymentStatus = PayRollPaymentStatus.PAID;

        await run.save();
        return run;
    }

    async rejectFinancialStaff(runId: string, staffId: string, reason: string) {
        const run = await this.payrollRunsModel.findById(runId);
        if (!run) throw new NotFoundException('Run not found');

        if (run.status !== PayRollStatus.PENDING_FINANCE_APPROVAL) {
             throw new BadRequestException('Payroll run must be in PENDING_FINANCE_APPROVAL status to be rejected by finance');
        }

        run.status = PayRollStatus.REJECTED;
        run.rejectionReason = reason;
        
        await run.save();
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
         await this.paySlipModel.updateMany({ payrollRunId: run._id }, { paymentStatus: PaySlipPaymentStatus.PAID });
         
         return run;
    }

    async getPendingItems() {
        const bonuses = await this.signingBonusModel.find({ status: 'pending' });
        const benefits = await this.terminationModel.find({ status: 'pending' });
        return { bonuses, benefits };
    }

    // Phase 0: Signing Bonus Approval (REQ-PY-28, 29)
    // Phase 0: Signing Bonus Approval (REQ-PY-28, 29)
    async approveSigningBonus(bonusId: string, approverId: string, reason?: string) {
        const bonus = await this.signingBonusModel.findById(bonusId);
        if (!bonus) throw new NotFoundException('Signing bonus not found');

        bonus.status = BonusStatus.APPROVED;
        await bonus.save();

        return bonus;
    }

    async editSigningBonus(bonusId: string, updateData: any) {
        const bonus = await this.signingBonusModel.findById(bonusId);
        if (!bonus) throw new NotFoundException('Signing bonus not found');
        
        if (bonus.status !== 'pending') {
            throw new BadRequestException('Can only edit pending signing bonuses');
        }

        Object.assign(bonus, updateData);
        await bonus.save();
        return bonus;
    }

    // Phase 0: Termination Benefit Approval (REQ-PY-31, 32)
    async approveTerminationBenefit(benefitId: string, status: string, approverId: string, reason?: string) {
        const benefit = await this.terminationModel.findById(benefitId);
        if (!benefit) throw new NotFoundException('Termination benefit not found');

        benefit.status = status;
        await benefit.save();

        return benefit;
    }

    async editTerminationBenefit(benefitId: string, updateData: any) {
        const benefit = await this.terminationModel.findById(benefitId);
        if (!benefit) throw new NotFoundException('Termination benefit not found');
        
        if (benefit.status !== 'pending') {
            throw new BadRequestException('Can only edit pending termination benefits');
        }

        Object.assign(benefit, updateData);
        await benefit.save();
        return benefit;
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
}