import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LeavesService } from './leaves.service';

/**
 * LeavesScheduler
 *
 * Automated cron jobs for leave accrual and carry-forward processing.
 *
 * Schedule:
 * - Monthly accrual: 1st of each month at midnight
 * - Quarterly accrual: 1st of Jan/Apr/Jul/Oct at midnight
 * - Yearly accrual: January 1st at midnight
 * - Year-end carry-forward: December 31st at 11:50 PM
 */
@Injectable()
export class LeavesScheduler {
  private readonly logger = new Logger(LeavesScheduler.name);

  constructor(private readonly leavesService: LeavesService) {}

  /**
   * Monthly Accrual Job
   *
   * Runs on the 1st of each month at 00:00 (midnight).
   * Processes accrual for all employees with MONTHLY accrual method.
   *
   * @cron '0 0 1 * *' - minute hour day-of-month month day-of-week
   */
  @Cron('0 0 1 * *', {
    name: 'monthly-accrual',
    timeZone: 'UTC',
  })
  async handleMonthlyAccrual() {
    this.logger.log('Starting monthly accrual process...');

    try {
      const result = await this.leavesService.runAccrualProcess('monthly');

      this.logger.log(
        `Monthly accrual completed: ${result.processed} employees processed, ${result.failed.length} failed`,
      );

      if (result.failed.length > 0) {
        this.logger.warn(
          `Failed accruals: ${JSON.stringify(result.failed, null, 2)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Monthly accrual process failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Quarterly Accrual Job
   *
   * Runs on the 1st of January, April, July, and October at 00:00 (midnight).
   * Processes accrual for all employees with PER_TERM (quarterly) accrual method.
   *
   * @cron '0 0 1 1,4,7,10 *' - minute hour day-of-month month day-of-week
   */
  @Cron('0 0 1 1,4,7,10 *', {
    name: 'quarterly-accrual',
    timeZone: 'UTC',
  })
  async handleQuarterlyAccrual() {
    this.logger.log('Starting quarterly accrual process...');

    try {
      const result = await this.leavesService.runAccrualProcess('quarterly');

      this.logger.log(
        `Quarterly accrual completed: ${result.processed} employees processed, ${result.failed.length} failed`,
      );

      if (result.failed.length > 0) {
        this.logger.warn(
          `Failed accruals: ${JSON.stringify(result.failed, null, 2)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Quarterly accrual process failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Yearly Accrual Job
   *
   * Runs on January 1st at 00:00 (midnight).
   * Processes accrual for all employees with YEARLY accrual method.
   *
   * @cron '0 0 1 1 *' - minute hour day-of-month month day-of-week
   */
  @Cron('0 0 1 1 *', {
    name: 'yearly-accrual',
    timeZone: 'UTC',
  })
  async handleYearlyAccrual() {
    this.logger.log('Starting yearly accrual process...');

    try {
      const result = await this.leavesService.runAccrualProcess('yearly');

      this.logger.log(
        `Yearly accrual completed: ${result.processed} employees processed, ${result.failed.length} failed`,
      );

      if (result.failed.length > 0) {
        this.logger.warn(
          `Failed accruals: ${JSON.stringify(result.failed, null, 2)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Yearly accrual process failed: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Year-End Carry-Forward Job
   *
   * Runs on December 31st at 23:50 (11:50 PM).
   * Processes carry-forward for all employees, applying caps and expiry rules.
   *
   * @cron '50 23 31 12 *' - minute hour day-of-month month day-of-week
   */
  @Cron('50 23 31 12 *', {
    name: 'year-end-carry-forward',
    timeZone: 'UTC',
  })
  async handleYearEndCarryForward() {
    this.logger.log('Starting year-end carry-forward process...');

    try {
      const result = await this.leavesService.runYearEndCarryForward();

      this.logger.log(
        `Year-end carry-forward completed: ${result.processed} employees processed, ` +
          `${result.capped.length} capped at max limit, ${result.failed.length} failed`,
      );

      if (result.capped.length > 0) {
        this.logger.log(
          `Capped carry-forwards: ${JSON.stringify(result.capped, null, 2)}`,
        );
      }

      if (result.failed.length > 0) {
        this.logger.warn(
          `Failed carry-forwards: ${JSON.stringify(result.failed, null, 2)}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Year-end carry-forward process failed: ${error.message}`,
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
