import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PayrollExecutionService } from '../../payroll-execution/payroll-execution.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { employeeSigningBonus } from '../../payroll-execution/models/EmployeeSigningBonus.schema';
import { signingBonus } from '../../payroll-configuration/models/signingBonus.schema';
import { EmployeeTerminationResignation } from '../../payroll-execution/models/EmployeeTerminationResignation.schema';
import { terminationAndResignationBenefits } from '../../payroll-configuration/models/terminationAndResignationBenefits';
import { ConfigStatus } from '../../payroll-configuration/enums/payroll-configuration-enums';
import { BonusStatus, BenefitStatus } from '../../payroll-execution/enums/payroll-execution-enum';

@Injectable()
export class PayrollIntegrationService {
  private readonly logger = new Logger(PayrollIntegrationService.name);

  constructor(
    @Inject(forwardRef(() => PayrollExecutionService))
    private payrollExecutionService: PayrollExecutionService,
    @InjectModel(employeeSigningBonus.name)
    private signingBonusModel: Model<any>,
    @InjectModel(signingBonus.name)
    private signingBonusConfigModel: Model<any>,
    @InjectModel(EmployeeTerminationResignation.name)
    private employeeTerminationModel: Model<any>,
    @InjectModel(terminationAndResignationBenefits.name)
    private terminationBenefitsConfigModel: Model<any>,
  ) {}

  /**
   * Process signing bonus for new employee
   */
  async processSigningBonus(
    employeeId: string,
    offerId: string,
    bonusAmount: number,
  ): Promise<void> {
    try {
      if (!bonusAmount || bonusAmount <= 0) {
        this.logger.log(
          `No signing bonus to process for employee ${employeeId}`,
        );
        return;
      }

      // Find signing bonus configuration by amount
      // Note: In production, you might want to match by position or create a generic one
      let bonusConfig = await this.signingBonusConfigModel
        .findOne({ amount: bonusAmount, status: ConfigStatus.APPROVED })
        .exec();

      if (!bonusConfig) {
        // Create a generic signing bonus config if none exists
        // In production, this should match by position or use a default
        bonusConfig = new this.signingBonusConfigModel({
          positionName: `Generic - ${bonusAmount}`,
          amount: bonusAmount,
          status: ConfigStatus.APPROVED,
        });
        await bonusConfig.save();
      }

      // Create employee signing bonus record
      const employeeBonus = new this.signingBonusModel({
        employeeId: new Types.ObjectId(employeeId),
        signingBonusId: bonusConfig._id,
        givenAmount: bonusAmount,
        status: BonusStatus.PENDING,
      });

      await employeeBonus.save();

      this.logger.log(
        `Signing bonus ${bonusAmount} processed for employee ${employeeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process signing bonus for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - bonus processing failure shouldn't break contract creation
    }
  }

  /**
   * Trigger payroll initiation for new employee
   * Note: Payroll is typically initiated per period, not per employee
   * This method logs that the employee should be included in next payroll run
   */
  async triggerPayrollInitiation(
    employeeId: string,
    startDate: Date,
  ): Promise<void> {
    try {
      this.logger.log(
        `Employee ${employeeId} should be included in payroll starting from ${startDate.toISOString()}`,
      );
      // Payroll execution service handles payroll runs per period
      // The employee will be automatically included in the next payroll run
      // based on their contractStartDate and department
    } catch (error) {
      this.logger.error(
        `Failed to trigger payroll initiation for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Process termination benefits
   * Creates termination benefit records for all approved termination benefit configurations
   * Similar to how signing bonuses are created for new employees
   */
  async processTerminationBenefits(
    employeeId: string,
    terminationId: string,
    terminationDate: Date,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing termination benefits for employee ${employeeId}, termination ${terminationId} on ${terminationDate.toISOString()}`,
      );

      // Find all approved termination benefit configurations
      const approvedBenefits = await this.terminationBenefitsConfigModel
        .find({ status: ConfigStatus.APPROVED })
        .exec();

      if (!approvedBenefits || approvedBenefits.length === 0) {
        this.logger.log(
          `No approved termination benefit configurations found for employee ${employeeId}`,
        );
        return;
      }

      // Create termination benefit records for each approved configuration
      for (const benefitConfig of approvedBenefits) {
        try {
          // Check if this benefit is already assigned to this employee for this termination
          const existingAssignment = await this.employeeTerminationModel
            .findOne({
              employeeId: new Types.ObjectId(employeeId),
              benefitId: benefitConfig._id,
              terminationId: new Types.ObjectId(terminationId),
            })
            .exec();

          if (existingAssignment) {
            this.logger.log(
              `Termination benefit ${benefitConfig.name} (${benefitConfig._id}) already assigned to employee ${employeeId} for termination ${terminationId}`,
            );
            continue;
          }

          // Create employee termination benefit record
          const employeeTerminationBenefit = new this.employeeTerminationModel({
            employeeId: new Types.ObjectId(employeeId),
            benefitId: benefitConfig._id,
            terminationId: new Types.ObjectId(terminationId),
            givenAmount: benefitConfig.amount,
            status: BenefitStatus.PENDING,
          });

          await employeeTerminationBenefit.save();

          this.logger.log(
            `Termination benefit ${benefitConfig.name} (amount: ${benefitConfig.amount}) created for employee ${employeeId}`,
          );
        } catch (benefitError) {
          this.logger.error(
            `Failed to create termination benefit ${benefitConfig.name} for employee ${employeeId}:`,
            benefitError instanceof Error ? benefitError.stack : undefined,
          );
          // Continue processing other benefits even if one fails
        }
      }

      this.logger.log(
        `Termination benefits processed for employee ${employeeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process termination benefits for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - termination benefit processing failure shouldn't break termination workflow
    }
  }
}

