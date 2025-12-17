import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    UseGuards,
    Req,
    StreamableFile,
} from '@nestjs/common';
import { PayrollTrackingService } from './payroll-tracking.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { ConfirmDisputeDto } from './dto/confirm-dispute.dto';
import { ConfirmClaimDto } from './dto/confirm-claim.dto';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { ReportPeriodDto, SummaryReportDto } from './dto/payroll-report.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard) // app;ies to all routes unless @Public
@Controller('payroll-tracking')
export class PayrollTrackingController {
    constructor(private readonly payrollTrackingService: PayrollTrackingService) { }

    ////////////////////////// Employee Self-Service //////////////////////////

    // Get all user's payslips
    @Get('payslips/me')
    async getMyPayslips(@Req() req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getEmployeePayslips(employeeId);
    }

    // Get specific payslip
    @Get('payslips/:id')
    async getPayslipDetails(@Param('id') id: string) {
        return this.payrollTrackingService.getPayslipDetails(id);
    }

    // Dowload the user's payslip
    @Get('payslips/:id/download')
    async downloadPayslip(
        @Param('id') payslipId: string,
        @Req() req: any,
    ): Promise<StreamableFile> {
        const buffer = await this.payrollTrackingService.generatePayslipPdf(payslipId);

        return new StreamableFile(buffer, {
            type: 'application/pdf',
            disposition: `attachment; filename="payslip-${payslipId}.pdf"`,
        });
    }

    // Download the user's tax document related to a payslip
    @Get('tax-documents/:id/download')
    async downloadTaxDocument(
        @Param('id') payslipId: string,
        @Req() req: any,
    ): Promise<StreamableFile> {
        const buffer = await this.payrollTrackingService.generateTaxDocumentPdf(payslipId);

        return new StreamableFile(buffer, {
            type: 'application/pdf',
            disposition: `attachment; filename="tax-document-${payslipId}.pdf"`,
        });
    }

    // Get all user's salaries
    @Get('history/me')
    async getMySalaryHistory(@Req() req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getSalaryHistory(employeeId);
    }

    ////////////////////////// Disputes //////////////////////////

    // Creates a new dispute
    @Post('disputes')
    async createDispute(@Body() createDisputeDto: CreateDisputeDto, @Req() req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.createDispute(createDisputeDto, employeeId);
    }

    // Gets all user's disputes
    @Get('disputes/me')
    async getMyDisputes(@Req() req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getDisputes(employeeId);
    }

    // Get all disputes made by all users (Payroll Specialist)
    @Roles('Payroll Specialist')
    @Get('disputes')
    async getAllDisputes() {
        return this.payrollTrackingService.getAllDisputes();
    }

    // Get all approved disputes (Finance Staff)
    @Roles('Finance Staff')
    @Get('disputes/approved')
    async getApprovedDisputes() {
        return this.payrollTrackingService.getApprovedDisputes();
    }

    // Confirm dispute (Payroll Manager)
    @Roles('Payroll Manager')
    @Patch('disputes/:id/confirm')
    async confirmDispute(
        @Param('id') id: string,
        @Body() confirmDisputeDto: ConfirmDisputeDto,
        @Req() req: any,
    ) {
        return this.payrollTrackingService.confirmDispute(
            id,
            confirmDisputeDto,
            req.user._id,
        );
    }

    // Get disputes pending manager approval (Payroll Manager)
    @Roles('Payroll Manager')
    @Get('disputes/pending-approval')
    async getPendingManagerApprovalDisputes() {
        return this.payrollTrackingService.getPendingManagerApprovalDisputes();
    }

    // Change the status of the dispute (Payroll Specialist)
    @Roles('Payroll Specialist')
    @Patch('disputes/:id/status')
    async updateDisputeStatus(
        @Param('id') id: string,
        @Body() updateDisputeStatusDto: UpdateDisputeStatusDto,
        @Req() req: any,
    ) {
        return this.payrollTrackingService.updateDisputeStatus(
            id,
            updateDisputeStatusDto,
            req.user._id,
        );
    }

    ////////////////////////// Claims //////////////////////////

    // Create a new claim
    @Post('claims')
    async createClaim(@Body() createClaimDto: CreateClaimDto, @Req() req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.createClaim(createClaimDto, employeeId);
    }

    // Get all user's claims
    @Get('claims/me')
    async getMyClaims(@Req() req) {
        const employeeId = req.user._id;
        return this.payrollTrackingService.getClaims(employeeId);
    }

    // Get all claims (Payroll Specialist)
    @Roles('Payroll Specialist')
    @Get('claims')
    async getAllClaims() {
        return this.payrollTrackingService.getAllClaims();
    }

    // Get all approved claims (Finance Staff)
    @Roles('Finance Staff')
    @Get('claims/approved')
    async getApprovedClaims() {
        return this.payrollTrackingService.getApprovedClaims();
    }

    // Confirm claim (Payroll Manager)
    @Roles('Payroll Manager')
    @Patch('claims/:id/confirm')
    async confirmClaim(
        @Param('id') id: string,
        @Body() confirmClaimDto: ConfirmClaimDto,
        @Req() req: any,
    ) {
        return this.payrollTrackingService.confirmClaim(
            id,
            confirmClaimDto,
            req.user._id,
        );
    }

    // Get claims pending manager approval (Payroll Manager)
    @Roles('Payroll Manager')
    @Get('claims/pending-approval')
    async getPendingManagerApprovalClaims() {
        return this.payrollTrackingService.getPendingManagerApprovalClaims();
    }

    // Change the status of the claim (Payroll Specialist)
    @Roles('Payroll Specialist')
    @Patch('claims/:id/status')
    async updateClaimStatus(
        @Param('id') id: string,
        @Body() updateClaimStatusDto: UpdateClaimStatusDto,
        @Req() req: any,
    ) {
        return this.payrollTrackingService.updateClaimStatus(
            id,
            updateClaimStatusDto,
            req.user._id,
        );
    }

    ////////////////////////// Refunds //////////////////////////

    // Generate dispute refund on approval (Payroll Manager)
    @Roles('Finance Staff')
    @Post('refunds/dispute/:id')
    async createRefundForDispute(
        @Param('id') id: string,
        @Body() createRefundDto: CreateRefundDto,
        @Req() req,
    ) {
        const staffId = req.user._id;
        return this.payrollTrackingService.createRefundForDispute(
            id,
            createRefundDto.amount,
            createRefundDto.description,
            staffId,
        );
    }

    // Generate claim refund on approval (Finance Staff)
    @Roles('Finance Staff')
    @Post('refunds/claim/:id')
    async createRefundForClaim(@Param('id') id: string, @Req() req) {
        const staffId = req.user._id;
        return this.payrollTrackingService.createRefundForClaim(id, staffId);
    }

    // Get all refunds (Finance Staff)
    @Roles('Finance Staff')
    @Get('refunds')
    async getAllRefunds() {
        return this.payrollTrackingService.getAllRefunds();
    }

    ////////////////////////// Operational Reports //////////////////////////
    @Roles('Payroll Specialist')
    @Post('reports/department/:departmentId')
    async getDepartmentPayrollReport(
        @Param('departmentId') departmentId: string,
        @Body() query: ReportPeriodDto,
    ) {
        return this.payrollTrackingService.getDepartmentPayrollReport(departmentId, query);
    }

    @Roles('Finance Staff')
    @Post('reports/summary')
    async getPayrollSummary(@Body() query: SummaryReportDto) {
        return this.payrollTrackingService.getPayrollSummary(query);
    }

    @Roles('Finance Staff')
    @Post('reports/deductions-benefits')
    async getDeductionsBenefitsReport(@Body() query: ReportPeriodDto) {
        return this.payrollTrackingService.getDeductionsBenefitsReport(query);
    }
}
