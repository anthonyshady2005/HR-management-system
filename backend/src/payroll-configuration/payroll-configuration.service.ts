import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { payrollPolicies } from './models/payrollPolicies.schema';
import { payGrade } from './models/payGrades.schema';
import { payType } from './models/payType.schema';
import { allowance } from './models/allowance.schema';
import { signingBonus } from './models/signingBonus.schema';
import { terminationAndResignationBenefits } from './models/terminationAndResignationBenefits';
import { taxRules } from './models/taxRules.schema';
import { insuranceBrackets } from './models/insuranceBrackets.schema';
import { CompanyWideSettings } from './models/CompanyWideSettings.schema';
import { ConfigStatus } from './enums/payroll-configuration-enums';
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

@Injectable()
export class PayrollConfigurationService {
    constructor(
        @InjectModel(payrollPolicies.name) private payrollPolicyModel: Model<payrollPolicies>,
        @InjectModel(payGrade.name) private payGradeModel: Model<payGrade>,
        @InjectModel(payType.name) private payTypeModel: Model<payType>,
        @InjectModel(allowance.name) private allowanceModel: Model<allowance>,
        @InjectModel(signingBonus.name) private signingBonusModel: Model<signingBonus>,
        @InjectModel(terminationAndResignationBenefits.name)
        private terminationBenefitModel: Model<terminationAndResignationBenefits>,
        @InjectModel(taxRules.name) private taxRuleModel: Model<taxRules>,
        @InjectModel(insuranceBrackets.name)
        private insuranceBracketModel: Model<insuranceBrackets>,
        @InjectModel(CompanyWideSettings.name)
        private companySettingsModel: Model<CompanyWideSettings>,
    ) {}

    // ==================== PAYROLL POLICIES ====================
    async createPayrollPolicy(dto: CreatePayrollPolicyDto, createdBy?: string) {
        const policy = new this.payrollPolicyModel({
            ...dto,
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await policy.save();
    }

    async updatePayrollPolicy(id: string, dto: UpdatePayrollPolicyDto, userId?: string) {
        // Find existing document to check current status
        const existing = await this.payrollPolicyModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Payroll policy not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        // If status is being changed to APPROVED, automatically set approvedBy and approvedAt
        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                dto.approvedBy = userId;
                dto.approvedAt = new Date();
            }
        }

        // Convert approvedBy to ObjectId if provided
        if (dto.approvedBy) {
            dto.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.payrollPolicyModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllPayrollPolicies() {
        return await this.payrollPolicyModel.find().populate('createdBy approvedBy').lean();
    }

    async findOnePayrollPolicy(id: string) {
        return await this.payrollPolicyModel.findById(id).populate('createdBy approvedBy');
    }

    async deletePayrollPolicy(id: string) {
        return await this.payrollPolicyModel.findByIdAndDelete(id);
    }

    // ==================== PAY GRADES ====================
    async createPayGrade(dto: CreatePayGradeDto, createdBy?: string) {
        // Fetch all approved allowances
        const allowances = await this.allowanceModel.find({ status: ConfigStatus.APPROVED }).lean();
        const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);

        const grossSalary = dto.baseSalary + totalAllowances;

        const grade = new this.payGradeModel({
            ...dto,
            grossSalary, // Set calculated gross salary
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await grade.save();
    }

    async updatePayGrade(id: string, dto: UpdatePayGradeDto, userId?: string) {
        const existing = await this.payGradeModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Pay grade not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        // Recalculate gross salary if baseSalary is updated or just to ensure consistency
        // (Ideally we should also recalculate if Allowances change, but that requires a trigger on Allowance update.
        // For now, we update it when PayGrade is updated).
        
        const allowances = await this.allowanceModel.find({ status: ConfigStatus.APPROVED }).lean();
        const totalAllowances = allowances.reduce((sum, a) => sum + a.amount, 0);

        const baseSalary = dto.baseSalary !== undefined ? dto.baseSalary : existing.baseSalary;
        const grossSalary = baseSalary + totalAllowances;

        const updateData = {
            ...dto,
            grossSalary
        };

        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                updateData.approvedBy = userId as any;
                updateData.approvedAt = new Date();
            }
        }

        if (dto.approvedBy) {
            updateData.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.payGradeModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async findAllPayGrades() {
        return await this.payGradeModel.find().populate('createdBy approvedBy').lean();
    }

    async findOnePayGrade(id: string) {
        return await this.payGradeModel.findById(id).populate('createdBy approvedBy');
    }

    async deletePayGrade(id: string) {
        return await this.payGradeModel.findByIdAndDelete(id);
    }

    // ==================== PAY TYPES ====================
    async createPayType(dto: CreatePayTypeDto, createdBy?: string) {
        const type = new this.payTypeModel({
            ...dto,
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await type.save();
    }

    async updatePayType(id: string, dto: UpdatePayTypeDto, userId?: string) {
        const existing = await this.payTypeModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Pay type not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                dto.approvedBy = userId;
                dto.approvedAt = new Date();
            }
        }

        if (dto.approvedBy) {
            dto.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.payTypeModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllPayTypes() {
        return await this.payTypeModel.find().populate('createdBy approvedBy').lean();
    }

    async findOnePayType(id: string) {
        return await this.payTypeModel.findById(id).populate('createdBy approvedBy');
    }

    async deletePayType(id: string) {
        return await this.payTypeModel.findByIdAndDelete(id);
    }

    // ==================== ALLOWANCES ====================
    async createAllowance(dto: CreateAllowanceDto, createdBy?: string) {
        const allowanceItem = new this.allowanceModel({
            ...dto,
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await allowanceItem.save();
    }

    async updateAllowance(id: string, dto: UpdateAllowanceDto, userId?: string) {
        const existing = await this.allowanceModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Allowance not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                dto.approvedBy = userId;
                dto.approvedAt = new Date();
            }
        }

        if (dto.approvedBy) {
            dto.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.allowanceModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllAllowances() {
        return await this.allowanceModel.find().populate('createdBy approvedBy').lean();
    }

    async findOneAllowance(id: string) {
        return await this.allowanceModel.findById(id).populate('createdBy approvedBy');
    }

    async deleteAllowance(id: string) {
        return await this.allowanceModel.findByIdAndDelete(id);
    }

    // ==================== SIGNING BONUSES ====================
    async createSigningBonus(dto: CreateSigningBonusDto, createdBy?: string) {
        const bonus = new this.signingBonusModel({
            ...dto,
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await bonus.save();
    }

    async updateSigningBonus(id: string, dto: UpdateSigningBonusDto, userId?: string) {
        const existing = await this.signingBonusModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Signing bonus not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                dto.approvedBy = userId;
                dto.approvedAt = new Date();
            }
        }

        if (dto.approvedBy) {
            dto.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.signingBonusModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllSigningBonuses() {
        return await this.signingBonusModel.find().populate('createdBy approvedBy').lean();
    }

    async findOneSigningBonus(id: string) {
        return await this.signingBonusModel.findById(id).populate('createdBy approvedBy');
    }

    async deleteSigningBonus(id: string) {
        return await this.signingBonusModel.findByIdAndDelete(id);
    }

    // ==================== TERMINATION/RESIGNATION BENEFITS ====================
    async createTerminationBenefit(dto: CreateTerminationBenefitDto, createdBy?: string) {
        const benefit = new this.terminationBenefitModel({
            ...dto,
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await benefit.save();
    }

    async updateTerminationBenefit(id: string, dto: UpdateTerminationBenefitDto, userId?: string) {
        const existing = await this.terminationBenefitModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Termination benefit not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                dto.approvedBy = userId;
                dto.approvedAt = new Date();
            }
        }

        if (dto.approvedBy) {
            dto.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.terminationBenefitModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllTerminationBenefits() {
        return await this.terminationBenefitModel.find().populate('createdBy approvedBy').lean();
    }

    async findOneTerminationBenefit(id: string) {
        return await this.terminationBenefitModel.findById(id).populate('createdBy approvedBy');
    }

    async deleteTerminationBenefit(id: string) {
        return await this.terminationBenefitModel.findByIdAndDelete(id);
    }

    // ==================== TAX RULES ====================
    async createTaxRule(dto: CreateTaxRuleDto, createdBy?: string) {
        const rule = new this.taxRuleModel({
            ...dto,
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await rule.save();
    }

    async updateTaxRule(id: string, dto: UpdateTaxRuleDto, userId?: string) {
        const existing = await this.taxRuleModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Tax rule not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                dto.approvedBy = userId;
                dto.approvedAt = new Date();
            }
        }

        if (dto.approvedBy) {
            dto.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.taxRuleModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllTaxRules() {
        return await this.taxRuleModel.find().populate('createdBy approvedBy').lean();
    }

    async findOneTaxRule(id: string) {
        return await this.taxRuleModel.findById(id).populate('createdBy approvedBy');
    }

    async deleteTaxRule(id: string) {
        return await this.taxRuleModel.findByIdAndDelete(id);
    }

    // ==================== INSURANCE BRACKETS ====================
    async createInsuranceBracket(dto: CreateInsuranceBracketDto, createdBy?: string) {
        const bracket = new this.insuranceBracketModel({
            ...dto,
            status: ConfigStatus.DRAFT,
            createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
        });
        return await bracket.save();
    }

    async updateInsuranceBracket(id: string, dto: UpdateInsuranceBracketDto, userId?: string) {
        const existing = await this.insuranceBracketModel.findById(id);
        if (!existing) {
            throw new NotFoundException('Insurance bracket not found');
        }

        if (existing.status !== ConfigStatus.DRAFT) {
            throw new BadRequestException('Cannot update configuration that is not in DRAFT status');
        }

        if (dto.status === ConfigStatus.APPROVED) {
            if (userId) {
                dto.approvedBy = userId;
                dto.approvedAt = new Date();
            }
        }

        if (dto.approvedBy) {
            dto.approvedBy = new Types.ObjectId(dto.approvedBy) as any;
        }

        return await this.insuranceBracketModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllInsuranceBrackets() {
        return await this.insuranceBracketModel.find().populate('createdBy approvedBy').lean();
    }

    async findOneInsuranceBracket(id: string) {
        return await this.insuranceBracketModel.findById(id).populate('createdBy approvedBy');
    }

    async deleteInsuranceBracket(id: string) {
        return await this.insuranceBracketModel.findByIdAndDelete(id);
    }

    // ==================== COMPANY-WIDE SETTINGS ====================
    async createCompanySettings(dto: CreateCompanySettingsDto) {
        const settings = new this.companySettingsModel(dto);
        return await settings.save();
    }

    async updateCompanySettings(id: string, dto: UpdateCompanySettingsDto) {
        return await this.companySettingsModel.findByIdAndUpdate(id, dto, { new: true });
    }

    async findAllCompanySettings() {
        return await this.companySettingsModel.find().lean();
    }

    async findOneCompanySettings(id: string) {
        return await this.companySettingsModel.findById(id);
    }

    async deleteCompanySettings(id: string) {
        return await this.companySettingsModel.findByIdAndDelete(id);
    }

    // ==================== UTILITY METHODS ====================

    // Get all pending approvals
    async getPendingApprovals() {
        const [policies, grades, types, allowances, bonuses, benefits, taxes, insurance] =
            await Promise.all([
                this.payrollPolicyModel
                    .find({ status: ConfigStatus.DRAFT })
                    .populate('createdBy')
                    .lean(),
                this.payGradeModel
                    .find({ status: ConfigStatus.DRAFT })
                    .populate('createdBy')
                    .lean(),
                this.payTypeModel.find({ status: ConfigStatus.DRAFT }).populate('createdBy').lean(),
                this.allowanceModel
                    .find({ status: ConfigStatus.DRAFT })
                    .populate('createdBy')
                    .lean(),
                this.signingBonusModel
                    .find({ status: ConfigStatus.DRAFT })
                    .populate('createdBy')
                    .lean(),
                this.terminationBenefitModel
                    .find({ status: ConfigStatus.DRAFT })
                    .populate('createdBy')
                    .lean(),
                this.taxRuleModel.find({ status: ConfigStatus.DRAFT }).populate('createdBy').lean(),
                this.insuranceBracketModel
                    .find({ status: ConfigStatus.DRAFT })
                    .populate('createdBy')
                    .lean(),
            ]);

        return {
            payrollPolicies: policies,
            payGrades: grades,
            payTypes: types,
            allowances,
            signingBonuses: bonuses,
            terminationBenefits: benefits,
            taxRules: taxes,
            insuranceBrackets: insurance,
        };
    }
}
