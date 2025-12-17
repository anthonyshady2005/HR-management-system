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
var LeavesScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeavesScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const leaves_service_1 = require("./leaves.service");
let LeavesScheduler = LeavesScheduler_1 = class LeavesScheduler {
    leavesService;
    logger = new common_1.Logger(LeavesScheduler_1.name);
    constructor(leavesService) {
        this.leavesService = leavesService;
    }
    async handleMonthlyAccrual() {
        this.logger.log('Starting monthly accrual process...');
        try {
            const result = await this.leavesService.runAccrualProcess('monthly');
            this.logger.log(`Monthly accrual completed: ${result.processed} employees processed, ${result.failed.length} failed`);
            if (result.failed.length > 0) {
                this.logger.warn(`Failed accruals: ${JSON.stringify(result.failed, null, 2)}`);
            }
        }
        catch (error) {
            this.logger.error(`Monthly accrual process failed: ${error.message}`, error.stack);
        }
    }
    async handleQuarterlyAccrual() {
        this.logger.log('Starting quarterly accrual process...');
        try {
            const result = await this.leavesService.runAccrualProcess('quarterly');
            this.logger.log(`Quarterly accrual completed: ${result.processed} employees processed, ${result.failed.length} failed`);
            if (result.failed.length > 0) {
                this.logger.warn(`Failed accruals: ${JSON.stringify(result.failed, null, 2)}`);
            }
        }
        catch (error) {
            this.logger.error(`Quarterly accrual process failed: ${error.message}`, error.stack);
        }
    }
    async handleYearlyAccrual() {
        this.logger.log('Starting yearly accrual process...');
        try {
            const result = await this.leavesService.runAccrualProcess('yearly');
            this.logger.log(`Yearly accrual completed: ${result.processed} employees processed, ${result.failed.length} failed`);
            if (result.failed.length > 0) {
                this.logger.warn(`Failed accruals: ${JSON.stringify(result.failed, null, 2)}`);
            }
        }
        catch (error) {
            this.logger.error(`Yearly accrual process failed: ${error.message}`, error.stack);
        }
    }
    async handleYearEndCarryForward() {
        this.logger.log('Starting year-end carry-forward process...');
        try {
            const result = await this.leavesService.runYearEndCarryForward();
            this.logger.log(`Year-end carry-forward completed: ${result.processed} employees processed, ` +
                `${result.capped.length} capped at max limit, ${result.failed.length} failed`);
            if (result.capped.length > 0) {
                this.logger.log(`Capped carry-forwards: ${JSON.stringify(result.capped, null, 2)}`);
            }
            if (result.failed.length > 0) {
                this.logger.warn(`Failed carry-forwards: ${JSON.stringify(result.failed, null, 2)}`);
            }
        }
        catch (error) {
            this.logger.error(`Year-end carry-forward process failed: ${error.message}`, error.stack);
        }
    }
    async handleAutoEscalation() {
        this.logger.log('Running auto-escalation check...');
        try {
            const result = await this.leavesService.escalateStaleApprovals();
            this.logger.log(`Auto-escalation completed: ${result.escalated} requests escalated, ${result.errors.length} errors`);
            if (result.errors.length > 0) {
                this.logger.error(`Escalation errors: ${result.errors.join('; ')}`);
            }
        }
        catch (error) {
            this.logger.error(`Auto-escalation failed: ${error.message}`, error.stack);
        }
    }
};
exports.LeavesScheduler = LeavesScheduler;
__decorate([
    (0, schedule_1.Cron)('0 0 1 * *', {
        name: 'monthly-accrual',
        timeZone: 'UTC',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesScheduler.prototype, "handleMonthlyAccrual", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 1,4,7,10 *', {
        name: 'quarterly-accrual',
        timeZone: 'UTC',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesScheduler.prototype, "handleQuarterlyAccrual", null);
__decorate([
    (0, schedule_1.Cron)('0 0 1 1 *', {
        name: 'yearly-accrual',
        timeZone: 'UTC',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesScheduler.prototype, "handleYearlyAccrual", null);
__decorate([
    (0, schedule_1.Cron)('50 23 31 12 *', {
        name: 'year-end-carry-forward',
        timeZone: 'UTC',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesScheduler.prototype, "handleYearEndCarryForward", null);
__decorate([
    (0, schedule_1.Cron)('0 * * * *', {
        name: 'auto-escalation',
        timeZone: 'UTC',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeavesScheduler.prototype, "handleAutoEscalation", null);
exports.LeavesScheduler = LeavesScheduler = LeavesScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [leaves_service_1.LeavesService])
], LeavesScheduler);
//# sourceMappingURL=leaves.scheduler.js.map