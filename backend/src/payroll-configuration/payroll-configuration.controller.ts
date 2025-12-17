import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PayrollConfigurationService } from './payroll-configuration.service';
import { CreatePayrollPolicyDto } from './dto/create-payroll-policy.dto';
import { UpdatePayrollPolicyDto } from './dto/update-payroll-policy.dto';
import { CreatePayGradeDto } from './dto/create-pay-grade.dto';
import { UpdatePayGradeDto } from './dto/update-pay-grade.dto';
import { CreatePayTypeDto } from './dto/create-pay-type.dto';
import { UpdatePayTypeDto } from './dto/update-pay-type.dto';
import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';
import { CreateSigningBonusDto } from './dto/create-signing-bonus.dto';
import { UpdateSigningBonusDto } from './dto/update-signing-bonus.dto';
import { CreateTerminationBenefitDto } from './dto/create-termination-benefit.dto';
import { UpdateTerminationBenefitDto } from './dto/update-termination-benefit.dto';
import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { UpdateTaxRuleDto } from './dto/update-tax-rule.dto';
import { CreateInsuranceBracketDto } from './dto/create-insurance-bracket.dto';
import { UpdateInsuranceBracketDto } from './dto/update-insurance-bracket.dto';
import { CreateCompanySettingsDto } from './dto/create-company-settings.dto';
import { UpdateCompanySettingsDto } from './dto/update-company-settings.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll-configuration')
export class PayrollConfigurationController {
  constructor(
    private readonly payrollConfigService: PayrollConfigurationService,
  ) {}

  // ==================== PAYROLL POLICIES ====================
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @Post('policies')
  async createPayrollPolicy(
    @Body() dto: CreatePayrollPolicyDto,
    @Req() req: any,
  ) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createPayrollPolicy(dto, createdBy);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Patch('policies/:id')
  async updatePayrollPolicy(
    @Param('id') id: string,
    @Body() dto: UpdatePayrollPolicyDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updatePayrollPolicy(id, dto, userId);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('policies')
  async findAllPayrollPolicies() {
    return await this.payrollConfigService.findAllPayrollPolicies();
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('policies/:id')
  async findOnePayrollPolicy(@Param('id') id: string) {
    return await this.payrollConfigService.findOnePayrollPolicy(id);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Delete('policies/:id')
  @HttpCode(HttpStatus.OK)
  async deletePayrollPolicy(@Param('id') id: string) {
    return await this.payrollConfigService.deletePayrollPolicy(id);
  }

  // ==================== PAY GRADES ====================
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @Post('pay-grades')
  async createPayGrade(@Body() dto: CreatePayGradeDto, @Req() req: any) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createPayGrade(dto, createdBy);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Patch('pay-grades/:id')
  async updatePayGrade(
    @Param('id') id: string,
    @Body() dto: UpdatePayGradeDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updatePayGrade(id, dto, userId);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('pay-grades')
  async findAllPayGrades() {
    return await this.payrollConfigService.findAllPayGrades();
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('pay-grades/:id')
  async findOnePayGrade(@Param('id') id: string) {
    return await this.payrollConfigService.findOnePayGrade(id);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Delete('pay-grades/:id')
  @HttpCode(HttpStatus.OK)
  async deletePayGrade(@Param('id') id: string) {
    return await this.payrollConfigService.deletePayGrade(id);
  }

  // ==================== PAY TYPES ====================
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @Post('pay-types')
  async createPayType(@Body() dto: CreatePayTypeDto, @Req() req: any) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createPayType(dto, createdBy);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Patch('pay-types/:id')
  async updatePayType(
    @Param('id') id: string,
    @Body() dto: UpdatePayTypeDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updatePayType(id, dto, userId);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('pay-types')
  async findAllPayTypes() {
    return await this.payrollConfigService.findAllPayTypes();
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('pay-types/:id')
  async findOnePayType(@Param('id') id: string) {
    return await this.payrollConfigService.findOnePayType(id);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Delete('pay-types/:id')
  @HttpCode(HttpStatus.OK)
  async deletePayType(@Param('id') id: string) {
    return await this.payrollConfigService.deletePayType(id);
  }

  // ==================== ALLOWANCES ====================
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @Post('allowances')
  async createAllowance(@Body() dto: CreateAllowanceDto, @Req() req: any) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createAllowance(dto, createdBy);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Patch('allowances/:id')
  async updateAllowance(
    @Param('id') id: string,
    @Body() dto: UpdateAllowanceDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updateAllowance(id, dto, userId);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('allowances')
  async findAllAllowances() {
    return await this.payrollConfigService.findAllAllowances();
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('allowances/:id')
  async findOneAllowance(@Param('id') id: string) {
    return await this.payrollConfigService.findOneAllowance(id);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Delete('allowances/:id')
  @HttpCode(HttpStatus.OK)
  async deleteAllowance(@Param('id') id: string) {
    return await this.payrollConfigService.deleteAllowance(id);
  }

  // ==================== SIGNING BONUSES ====================
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @Post('signing-bonuses')
  async createSigningBonus(
    @Body() dto: CreateSigningBonusDto,
    @Req() req: any,
  ) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createSigningBonus(dto, createdBy);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Patch('signing-bonuses/:id')
  async updateSigningBonus(
    @Param('id') id: string,
    @Body() dto: UpdateSigningBonusDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updateSigningBonus(id, dto, userId);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('signing-bonuses')
  async findAllSigningBonuses() {
    return await this.payrollConfigService.findAllSigningBonuses();
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('signing-bonuses/:id')
  async findOneSigningBonus(@Param('id') id: string) {
    return await this.payrollConfigService.findOneSigningBonus(id);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Delete('signing-bonuses/:id')
  @HttpCode(HttpStatus.OK)
  async deleteSigningBonus(@Param('id') id: string) {
    return await this.payrollConfigService.deleteSigningBonus(id);
  }

  // ==================== TERMINATION/RESIGNATION BENEFITS ====================
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @Post('termination-benefits')
  async createTerminationBenefit(
    @Body() dto: CreateTerminationBenefitDto,
    @Req() req: any,
  ) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createTerminationBenefit(
      dto,
      createdBy,
    );
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Patch('termination-benefits/:id')
  async updateTerminationBenefit(
    @Param('id') id: string,
    @Body() dto: UpdateTerminationBenefitDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updateTerminationBenefit(
      id,
      dto,
      userId,
    );
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('termination-benefits')
  async findAllTerminationBenefits() {
    return await this.payrollConfigService.findAllTerminationBenefits();
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Get('termination-benefits/:id')
  async findOneTerminationBenefit(@Param('id') id: string) {
    return await this.payrollConfigService.findOneTerminationBenefit(id);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.PAYROLL_MANAGER)
  @Delete('termination-benefits/:id')
  @HttpCode(HttpStatus.OK)
  async deleteTerminationBenefit(@Param('id') id: string) {
    return await this.payrollConfigService.deleteTerminationBenefit(id);
  }

  // ==================== TAX RULES ====================
  @Roles(SystemRole.LEGAL_POLICY_ADMIN)
  @Post('tax-rules')
  async createTaxRule(@Body() dto: CreateTaxRuleDto, @Req() req: any) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createTaxRule(dto, createdBy);
  }

  @Roles(SystemRole.LEGAL_POLICY_ADMIN, SystemRole.PAYROLL_MANAGER)
  @Patch('tax-rules/:id')
  async updateTaxRule(
    @Param('id') id: string,
    @Body() dto: UpdateTaxRuleDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updateTaxRule(id, dto, userId);
  }

  @Roles(SystemRole.LEGAL_POLICY_ADMIN, SystemRole.PAYROLL_MANAGER)
  @Get('tax-rules')
  async findAllTaxRules() {
    return await this.payrollConfigService.findAllTaxRules();
  }

  @Roles(SystemRole.LEGAL_POLICY_ADMIN, SystemRole.PAYROLL_MANAGER)
  @Get('tax-rules/:id')
  async findOneTaxRule(@Param('id') id: string) {
    return await this.payrollConfigService.findOneTaxRule(id);
  }

  @Roles(SystemRole.LEGAL_POLICY_ADMIN, SystemRole.PAYROLL_MANAGER)
  @Delete('tax-rules/:id')
  @HttpCode(HttpStatus.OK)
  async deleteTaxRule(@Param('id') id: string) {
    return await this.payrollConfigService.deleteTaxRule(id);
  }

  // ==================== INSURANCE BRACKETS ====================
  @Roles(SystemRole.PAYROLL_SPECIALIST)
  @Post('insurance-brackets')
  async createInsuranceBracket(
    @Body() dto: CreateInsuranceBracketDto,
    @Req() req: any,
  ) {
    const createdBy = req.user._id.toString();
    return await this.payrollConfigService.createInsuranceBracket(
      dto,
      createdBy,
    );
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
  @Patch('insurance-brackets/:id')
  async updateInsuranceBracket(
    @Param('id') id: string,
    @Body() dto: UpdateInsuranceBracketDto,
    @Req() req: any,
  ) {
    const userId = req.user._id.toString();
    return await this.payrollConfigService.updateInsuranceBracket(
      id,
      dto,
      userId,
    );
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
  @Get('insurance-brackets')
  async findAllInsuranceBrackets() {
    return await this.payrollConfigService.findAllInsuranceBrackets();
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
  @Get('insurance-brackets/:id')
  async findOneInsuranceBracket(@Param('id') id: string) {
    return await this.payrollConfigService.findOneInsuranceBracket(id);
  }

  @Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
  @Delete('insurance-brackets/:id')
  @HttpCode(HttpStatus.OK)
  async deleteInsuranceBracket(@Param('id') id: string) {
    return await this.payrollConfigService.deleteInsuranceBracket(id);
  }

  // ==================== COMPANY-WIDE SETTINGS ====================
  @Roles(SystemRole.SYSTEM_ADMIN)
  @Post('company-settings')
  async createCompanySettings(@Body() dto: CreateCompanySettingsDto) {
    return await this.payrollConfigService.createCompanySettings(dto);
  }

  @Roles(SystemRole.SYSTEM_ADMIN)
  @Patch('company-settings/:id')
  async updateCompanySettings(
    @Param('id') id: string,
    @Body() dto: UpdateCompanySettingsDto,
  ) {
    return await this.payrollConfigService.updateCompanySettings(id, dto);
  }

  @Roles(SystemRole.SYSTEM_ADMIN)
  @Get('company-settings')
  async findAllCompanySettings() {
    return await this.payrollConfigService.findAllCompanySettings();
  }

  @Roles(SystemRole.SYSTEM_ADMIN)
  @Get('company-settings/:id')
  async findOneCompanySettings(@Param('id') id: string) {
    return await this.payrollConfigService.findOneCompanySettings(id);
  }

  @Roles(SystemRole.SYSTEM_ADMIN)
  @Delete('company-settings/:id')
  @HttpCode(HttpStatus.OK)
  async deleteCompanySettings(@Param('id') id: string) {
    return await this.payrollConfigService.deleteCompanySettings(id);
  }

  // ==================== UTILITY ENDPOINTS ====================
  @Roles(SystemRole.PAYROLL_MANAGER)
  @Get('pending-approvals')
  async getPendingApprovals() {
    return await this.payrollConfigService.getPendingApprovals();
  }
}
