import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeavesService } from './leaves.service';


@Injectable()
export class LeavesScheduler {
  private readonly logger = new Logger(LeavesScheduler.name);

  constructor(private readonly leavesService: LeavesService) {}



  /**
   * Daily maintenance job
   *
   * Runs daily to:
   * - Reset entitlements whose nextResetDate has passed and reapply policy accrual
   * - Trigger the appropriate accrual process on period boundaries (month/quarter/year)
   *
   * @cron '0 2 * * *' - daily at 02:00 UTC
   */
  @Cron('0 2 * * *', {
    name: 'daily-maintenance',
    timeZone: 'UTC',
  })
  async handleDailyMaintenance() {
    this.logger.log('Running daily maintenance for leaves...');

    try {
      await this.leavesService.runDailyResetAndAccrual();
      await this.leavesService.runAccrualProcess(); // process all accrual methods daily based on lastAccrualDate
    } catch (error) {
      this.logger.error(
        `Daily maintenance process failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Auto-Escalation Job (BR-28)
   *
   * Runs every hour to check for stale approvals.
   * Escalates pending requests after 48 hours (configurable via AUTO_ESCALATION_HOURS env var).
   * Uses Organization Structure (reportsToPositionId) for escalation hierarchy.
   *
   * @cron '0 * * * *' - minute hour day-of-month month day-of-week (every hour)
   */
  @Cron('0 * * * *', {
    name: 'auto-escalation',
    timeZone: 'UTC',
  })
  async handleAutoEscalation() {
    this.logger.log('Running auto-escalation check...');

    try {
      const result = await this.leavesService.escalateStaleApprovals();

      this.logger.log(
        `Auto-escalation completed: ${result.escalated} requests escalated, ${result.errors.length} errors`,
      );

      if (result.errors.length > 0) {
        this.logger.error(`Escalation errors: ${result.errors.join('; ')}`);
      }
    } catch (error) {
      this.logger.error(
        `Auto-escalation failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
