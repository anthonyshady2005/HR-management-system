import { Controller, Post, Body, Get, Param, Put, UseGuards } from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';
import { InitiatePayrollDto, ApprovePayrollDto, PayrollRejectionDto } from './dtos/payroll-execution.dto';
import { ApproveSigningBonusDto } from './dtos/signing-bonus-approval.dto';
import { ApproveTerminationBenefitDto } from './dtos/termination-benefit-approval.dto';
import { LockPayrollDto, UnlockPayrollDto } from './dtos/lock-payroll.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard) 
@Controller('payroll-execution')
export class PayrollExecutionController {
    constructor(private readonly payrollExecutionService: PayrollExecutionService) {}
    @Roles('Payroll Specialist')
    @Post('initiate')
    async initiatePayroll(@Body() dto: InitiatePayrollDto) {
        return this.payrollExecutionService.initiatePayroll(dto);
    }

    @Roles('Payroll Specialist')
    @Get('pending-items')
    async getPendingItems() {
        return this.payrollExecutionService.getPendingItems();
    }

    // Phase 0: Signing Bonus Endpoints (REQ-PY-28, 29)
    @Roles('Payroll Specialist')
    @Post('signing-bonuses/:id/approve')
    async approveSigningBonus(@Param('id') id: string, @Body() dto: ApproveSigningBonusDto) {
        return this.payrollExecutionService.approveSigningBonus(id, dto.approverId, dto.reason);
    }
    
    @Roles('Payroll Specialist')
    @Put('signing-bonuses/:id')
    async editSigningBonus(@Param('id') id: string, @Body() updateData: any) {
        return this.payrollExecutionService.editSigningBonus(id, updateData);
    }

    // Phase 0: Termination Benefit Endpoints (REQ-PY-31, 32)
    @Roles('Payroll Specialist')
    @Post('termination-benefits/:id/approve')
    async approveTerminationBenefit(@Param('id') id: string, @Body() dto: ApproveTerminationBenefitDto) {
        return this.payrollExecutionService.approveTerminationBenefit(id, dto.status, dto.approverId, dto.reason);
    }

    @Roles('Payroll Specialist')
    @Put('termination-benefits/:id')
    async editTerminationBenefit(@Param('id') id: string, @Body() updateData: any) {
        return this.payrollExecutionService.editTerminationBenefit(id, updateData);
    }

    @Roles('Payroll Specialist','Payroll Manager','Finance Staff')
    @Get(':runId')
    async getRun(@Param('runId') runId: string) {
        return this.payrollExecutionService.getRun(runId);
    }

    @Roles('Payroll Specialist','Payroll Manager','Finance Staff')
    @Get(':runId/details')
    async getDraftDetails(@Param('runId') runId: string) {
        return this.payrollExecutionService.getDraftDetails(runId);
    }

    @Roles('Payroll Specialist')
    @Post(':runId/review')
    async reviewPayroll(@Param('runId') runId: string) {
        return this.payrollExecutionService.reviewPayroll(runId);
    }

    @Roles('Payroll Manager')
    @Post(':runId/approvePayrollManager/:payrollManagerId')
    async approvePayrollManager(@Param('runId') runId: string, @Param('payrollManagerId') payrollManagerId: string) {
        return this.payrollExecutionService.approvePayrollManager(runId, payrollManagerId);
    }

    @Roles('Payroll Manager')
    @Post(':runId/rejectPayrollManager/:payrollManagerId')
    async rejectPayrollManager(@Param('runId') runId: string, @Param('payrollManagerId') payrollManagerId: string, @Body() dto: PayrollRejectionDto) {
        return this.payrollExecutionService.rejectPayrollManager(runId, payrollManagerId, dto.reason);
    }

    @Roles('Finance Staff')
    @Post(':runId/approveFinanceStaff/:financeStaffId')
    async approveFinancialStaff(@Param('runId') runId: string, @Param('financeStaffId') financeStaffId: string) {
        return this.payrollExecutionService.approveFinancialStaff(runId, financeStaffId);
    }

    @Roles('Finance Staff')
    @Post(':runId/rejectFinanceStaff/:financeStaffId')
    async rejectFinancialStaff(@Param('runId') runId: string, @Param('financeStaffId') financeStaffId: string, @Body() dto: PayrollRejectionDto) {
        return this.payrollExecutionService.rejectFinancialStaff(runId, financeStaffId, dto.reason);
    }

    // Lock/Unlock Endpoints (REQ-PY-7, 19)
    
    @Roles('Payroll Manager')
    @Post(':runId/lock')
    async lockPayroll(@Param('runId') runId: string, @Body() dto: LockPayrollDto) {
        return this.payrollExecutionService.lockPayroll(runId, dto.managerId);
    }

    @Roles('Payroll Manager')
    @Post(':runId/unlock')
    async unlockPayroll(@Param('runId') runId: string, @Body() dto: UnlockPayrollDto) {
        return this.payrollExecutionService.unlockPayroll(runId, dto.managerId, dto.reason);
    }
    
    @Roles('Payroll Specialist')
    @Post(':runId/execute')
    async executePayroll(@Param('runId') runId: string) {
        return this.payrollExecutionService.executePayroll(runId);
    }
}


