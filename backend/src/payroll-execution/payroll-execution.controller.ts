import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PayrollExecutionService } from './payroll-execution.service';
import {
  InitiatePayrollDto,
  ApprovePayrollDto,
  PayrollRejectionDto,
} from './dtos/payroll-execution.dto';
import { ApproveSigningBonusDto } from './dtos/signing-bonus-approval.dto';
import { ApproveTerminationBenefitDto } from './dtos/termination-benefit-approval.dto';
import { LockPayrollDto, UnlockPayrollDto } from './dtos/lock-payroll.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll-execution')
export class PayrollExecutionController {
  constructor(
    private readonly payrollExecutionService: PayrollExecutionService,
  ) {}
  @Roles('Payroll Specialist')
  @Post('initiate')
  async initiatePayroll(@Body() dto: InitiatePayrollDto) {
    return this.payrollExecutionService.initiatePayroll(dto);
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get('runs')
  async getAllRuns() {
    return this.payrollExecutionService.getAllRuns();
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get('departments')
  async getDepartments() {
    return this.payrollExecutionService.getDepartments();
  }

  @Roles('Payroll Specialist')
  @Get('pending-items')
  async getPendingItems() {
    return this.payrollExecutionService.getPendingItems();
  }

  @Roles('Payroll Specialist')
  @Get('pending-payroll-items')
  async getPendingPayrollItems() {
    return this.payrollExecutionService.getPendingPayrollItems();
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get('exceptions')
  async getAllExceptions() {
    return this.payrollExecutionService.getAllExceptions();
  }

  @Roles('Payroll Manager')
  @Post('exceptions/:detailId/resolve')
  async resolveException(
    @Param('detailId') detailId: string,
    @Body() dto: { resolution: string; resolvedBy: string },
  ) {
    return this.payrollExecutionService.resolveException(
      detailId,
      dto.resolution,
      dto.resolvedBy,
    );
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff', 'HR Manager')
  @Get('payslips')
  async getAllPayslips(@Query('status') status?: string) {
    return this.payrollExecutionService.getAllPayslips(status);
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get(':runId/exceptions')
  async getRunExceptions(@Param('runId') runId: string) {
    return this.payrollExecutionService.getRunExceptions(runId);
  }

  // Phase 0: Signing Bonus Endpoints (REQ-PY-28, 29)
  @Roles('Payroll Specialist')
  @Post('signing-bonuses/:id/approve')
  async approveSigningBonus(
    @Param('id') id: string,
    @Body() dto: ApproveSigningBonusDto,
  ) {
    return this.payrollExecutionService.approveSigningBonus(
      id,
      dto.status || 'approved',
      dto.approverId,
      dto.reason,
    );
  }

  @Roles('Payroll Specialist')
  @Put('signing-bonuses/:id')
  async editSigningBonus(@Param('id') id: string, @Body() updateData: any) {
    return this.payrollExecutionService.editSigningBonus(id, updateData);
  }

  // Phase 0: Termination Benefit Endpoints (REQ-PY-31, 32)
  @Roles('Payroll Specialist')
  @Post('termination-benefits/:id/approve')
  async approveTerminationBenefit(
    @Param('id') id: string,
    @Body() dto: ApproveTerminationBenefitDto,
  ) {
    return this.payrollExecutionService.approveTerminationBenefit(
      id,
      dto.status,
      dto.approverId,
      dto.reason,
    );
  }

  @Roles('Payroll Specialist')
  @Put('termination-benefits/:id')
  async editTerminationBenefit(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.payrollExecutionService.editTerminationBenefit(id, updateData);
  }

  // ==================== EMPLOYEE SIGNING BONUS ASSIGNMENT ====================
  // These endpoints are used by the Recruitment subsystem to create signing bonus assignments

  @Roles('Payroll Specialist', 'HR Manager')
  @Post('employee-signing-bonuses')
  async assignSigningBonusToEmployee(
    @Body()
    dto: {
      employeeId: string;
      signingBonusId: string;
      givenAmount?: number;
    },
  ) {
    return this.payrollExecutionService.assignSigningBonusToEmployee(
      dto.employeeId,
      dto.signingBonusId,
      dto.givenAmount,
    );
  }

  @Roles('Payroll Specialist', 'HR Manager', 'Payroll Manager')
  @Get('employee-signing-bonuses')
  async getEmployeeSigningBonuses(@Query('employeeId') employeeId?: string) {
    return this.payrollExecutionService.getEmployeeSigningBonuses(employeeId);
  }

  @Roles('Payroll Specialist', 'HR Manager')
  @Put('employee-signing-bonuses/:id')
  async updateEmployeeSigningBonus(
    @Param('id') id: string,
    @Body() dto: { givenAmount?: number; status?: string },
  ) {
    return this.payrollExecutionService.updateEmployeeSigningBonus(
      id,
      dto as any,
    );
  }

  @Roles('Payroll Specialist', 'HR Manager')
  @Post('employee-signing-bonuses/:id/delete')
  async deleteEmployeeSigningBonus(@Param('id') id: string) {
    return this.payrollExecutionService.deleteEmployeeSigningBonus(id);
  }

  // ==================== EMPLOYEE TERMINATION BENEFIT ASSIGNMENT ====================
  // These endpoints are used by the Recruitment subsystem to create termination benefit assignments

  @Roles('Payroll Specialist', 'HR Manager')
  @Post('employee-termination-benefits')
  async assignTerminationBenefitToEmployee(
    @Body()
    dto: {
      employeeId: string;
      benefitId: string;
      terminationId: string;
      givenAmount?: number;
    },
  ) {
    return this.payrollExecutionService.assignTerminationBenefitToEmployee(
      dto.employeeId,
      dto.benefitId,
      dto.terminationId,
      dto.givenAmount,
    );
  }

  @Roles('Payroll Specialist', 'HR Manager', 'Payroll Manager')
  @Get('employee-termination-benefits')
  async getEmployeeTerminationBenefits(
    @Query('employeeId') employeeId?: string,
  ) {
    return this.payrollExecutionService.getEmployeeTerminationBenefits(
      employeeId,
    );
  }

  @Roles('Payroll Specialist', 'HR Manager')
  @Put('employee-termination-benefits/:id')
  async updateEmployeeTerminationBenefit(
    @Param('id') id: string,
    @Body() dto: { givenAmount?: number; status?: string },
  ) {
    return this.payrollExecutionService.updateEmployeeTerminationBenefit(
      id,
      dto as any,
    );
  }

  @Roles('Payroll Specialist', 'HR Manager')
  @Post('employee-termination-benefits/:id/delete')
  async deleteEmployeeTerminationBenefit(@Param('id') id: string) {
    return this.payrollExecutionService.deleteEmployeeTerminationBenefit(id);
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get(':runId')
  async getRun(@Param('runId') runId: string) {
    return this.payrollExecutionService.getRun(runId);
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get(':runId/details')
  async getDraftDetails(@Param('runId') runId: string) {
    return this.payrollExecutionService.getDraftDetails(runId);
  }

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get(':runId/payslips')
  async getRunPayslips(@Param('runId') runId: string) {
    return this.payrollExecutionService.getRunPayslips(runId);
  }

  @Roles('Payroll Specialist')
  @Post(':runId/review')
  async reviewPayroll(@Param('runId') runId: string) {
    return this.payrollExecutionService.reviewPayroll(runId);
  }

  @Roles('Payroll Manager')
  @Post(':runId/approvePayrollManager/:payrollManagerId')
  async approvePayrollManager(
    @Param('runId') runId: string,
    @Param('payrollManagerId') payrollManagerId: string,
  ) {
    return this.payrollExecutionService.approvePayrollManager(
      runId,
      payrollManagerId,
    );
  }

  @Roles('Payroll Manager')
  @Post(':runId/rejectPayrollManager/:payrollManagerId')
  async rejectPayrollManager(
    @Param('runId') runId: string,
    @Param('payrollManagerId') payrollManagerId: string,
    @Body() dto: PayrollRejectionDto,
  ) {
    return this.payrollExecutionService.rejectPayrollManager(
      runId,
      payrollManagerId,
      dto.reason,
    );
  }

  @Roles('Finance Staff')
  @Post(':runId/approveFinanceStaff/:financeStaffId')
  async approveFinancialStaff(
    @Param('runId') runId: string,
    @Param('financeStaffId') financeStaffId: string,
  ) {
    return this.payrollExecutionService.approveFinancialStaff(
      runId,
      financeStaffId,
    );
  }

  @Roles('Payroll Specialist')
  @Post(':runId/revertToUnderReview/:specialistId')
  async revertToUnderReview(
    @Param('runId') runId: string,
    @Param('specialistId') specialistId: string,
  ) {
    return this.payrollExecutionService.revertToUnderReview(
      runId,
      specialistId,
    );
  }

  @Roles('Finance Staff')
  @Post(':runId/rejectFinanceStaff/:financeStaffId')
  async rejectFinancialStaff(
    @Param('runId') runId: string,
    @Param('financeStaffId') financeStaffId: string,
    @Body() dto: PayrollRejectionDto,
  ) {
    return this.payrollExecutionService.rejectFinancialStaff(
      runId,
      financeStaffId,
      dto.reason,
    );
  }

  // ==================== BANK DETAILS MANAGEMENT ====================
  // REFACTORED: Moved from employee-profile to avoid conflicts

  @Roles('Payroll Specialist', 'Payroll Manager', 'Finance Staff')
  @Get('employees/bank-details')
  async getEmployeeBankDetails(@Query() query: any) {
    return this.payrollExecutionService.getEmployeeBankDetails(query);
  }

  @Roles('Payroll Manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('employees/:employeeId/bank-details')
  async updateEmployeeBankDetails(
    @Param('employeeId') employeeId: string,
    @Body() dto: { bankName: string; bankAccountNumber: string },
  ) {
    // Note: Using POST as proxy for PATCH/PUT if needed, or stick to PATCH
    // The previous implementation used PATCH. Let's use PATCH for consistency with REST.
    // However, NestJS uses @Patch() decorator.
    return this.payrollExecutionService.updateEmployeeBankDetails(employeeId, dto);
  }

  // Support PATCH method as well
  @Roles('Payroll Manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('employees/:employeeId/bank-details')
  async updateEmployeeBankDetailsPut(
    @Param('employeeId') employeeId: string,
    @Body() dto: { bankName: string; bankAccountNumber: string },
  ) {
    return this.payrollExecutionService.updateEmployeeBankDetails(employeeId, dto);
  }

  @Roles('Payroll Manager')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('employees/:employeeId/bank-details')
  async updateEmployeeBankDetailsPatch(
    @Param('employeeId') employeeId: string,
    @Body() dto: { bankName: string; bankAccountNumber: string },
  ) {
    return this.payrollExecutionService.updateEmployeeBankDetails(employeeId, dto);
  }

  // Lock/Unlock Endpoints (REQ-PY-7, 19)

  @Roles('Payroll Manager')
  @Post(':runId/lock')
  async lockPayroll(
    @Param('runId') runId: string,
    @Body() dto: LockPayrollDto,
  ) {
    return this.payrollExecutionService.lockPayroll(runId, dto.managerId);
  }

  @Roles('Payroll Manager')
  @Post(':runId/unlock')
  async unlockPayroll(
    @Param('runId') runId: string,
    @Body() dto: UnlockPayrollDto,
  ) {
    return this.payrollExecutionService.unlockPayroll(
      runId,
      dto.managerId,
      dto.reason,
    );
  }

  @Roles('Payroll Specialist')
  @Post(':runId/execute')
  async executePayroll(@Param('runId') runId: string) {
    return this.payrollExecutionService.executePayroll(runId);
  }

  // REQ-PY-4: Auto-generate draft payroll runs
  @Roles('Payroll Manager', 'Payroll Specialist')
  @Post('auto-generate-drafts')
  async autoGenerateDrafts(@Body() dto: { triggeredBy: string }) {
    return this.payrollExecutionService.autoGenerateDraftPayrolls(
      dto.triggeredBy,
    );
  }
}
