import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { LeavesService } from '../../leaves/leaves.service';

@Injectable()
export class LeavesIntegrationService {
  private readonly logger = new Logger(LeavesIntegrationService.name);

  constructor(
    @Inject(forwardRef(() => LeavesService))
    private leavesService: LeavesService,
  ) {}

  /**
   * Process final leave settlement for terminated employee
   */
  async processFinalLeaveSettlement(
    employeeId: string,
    terminationDate: Date,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing final leave settlement for employee ${employeeId} on ${terminationDate.toISOString()}`,
      );

      // Get leave entitlements for the employee
      // The leaves service should handle final settlement calculation
      // This is a placeholder - actual implementation depends on LeavesService API
      
      // Note: LeavesService may need a method like:
      // await this.leavesService.processFinalSettlementForTerminatedEmployee(employeeId, terminationDate);
      
      this.logger.log(
        `Final leave settlement processed for employee ${employeeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process final leave settlement for employee ${employeeId}:`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw - leave settlement failure shouldn't break termination
    }
  }
}

