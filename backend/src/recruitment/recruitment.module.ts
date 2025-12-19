import { Module, forwardRef } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JobTemplate, JobTemplateSchema } from './models/job-template.schema';
import { JobRequisition,JobRequisitionSchema } from './models/job-requisition.schema';
import { Application,ApplicationSchema } from './models/application.schema';
import { ApplicationStatusHistory,ApplicationStatusHistorySchema } from './models/application-history.schema';
import { Interview,InterviewSchema } from './models/interview.schema';
import { AssessmentResult,AssessmentResultSchema } from './models/assessment-result.schema';
import { Referral,ReferralSchema } from './models/referral.schema';
import { Offer,OfferSchema } from './models/offer.schema';
import { Contract,ContractSchema } from './models/contract.schema';
import { Document,DocumentSchema } from './models/document.schema';
import { TerminationRequest,TerminationRequestSchema } from './models/termination-request.schema';
import { ClearanceChecklist,ClearanceChecklistSchema } from './models/clearance-checklist.schema';
import { Onboarding, OnboardingSchema } from './models/onboarding.schema';
import { Consent, ConsentSchema } from './models/consent.schema';
import { EmployeeProfileModule } from '../employee-profile/employee-profile.module';
import { Candidate, CandidateSchema } from '../employee-profile/models/candidate.schema';
import { EmployeeProfile, EmployeeProfileSchema } from '../employee-profile/models/employee-profile.schema';
import { NotificationLog, NotificationLogSchema } from '../time-management/models/notification-log.schema';
import { Department, DepartmentSchema } from '../organization-structure/models/department.schema';
import { employeeSigningBonus, employeeSigningBonusSchema } from '../payroll-execution/models/EmployeeSigningBonus.schema';
import { signingBonus, signingBonusSchema } from '../payroll-configuration/models/signingBonus.schema';
import { EmployeeTerminationResignation, EmployeeTerminationResignationSchema } from '../payroll-execution/models/EmployeeTerminationResignation.schema';
import { terminationAndResignationBenefits, terminationAndResignationBenefitsSchema } from '../payroll-configuration/models/terminationAndResignationBenefits';
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';
import { LeavesModule } from '../leaves/leaves.module';
import { NotificationIntegrationService } from './integrations/notification-integration.service';
import { PayrollIntegrationService } from './integrations/payroll-integration.service';
import { LeavesIntegrationService } from './integrations/leaves-integration.service';
import { TimeManagementIntegrationService } from './integrations/time-management-integration.service';
import { EmailIntegrationService } from './integrations/email-integration.service';
import { PdfIntegrationService } from './integrations/pdf-integration.service';
import { CalendarIntegrationService } from './integrations/calendar-integration.service';

@Module({
  imports:[
    MongooseModule.forFeature([
      { name: JobTemplate.name, schema: JobTemplateSchema },
      { name: JobRequisition.name, schema: JobRequisitionSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: ApplicationStatusHistory.name, schema: ApplicationStatusHistorySchema },
      { name: Interview.name, schema: InterviewSchema },
      { name: AssessmentResult.name, schema: AssessmentResultSchema },
      { name: Referral.name, schema: ReferralSchema },
      { name: Offer.name, schema: OfferSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Onboarding.name, schema: OnboardingSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: TerminationRequest.name, schema: TerminationRequestSchema },
      { name: ClearanceChecklist.name, schema: ClearanceChecklistSchema },
      { name: Consent.name, schema: ConsentSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: employeeSigningBonus.name, schema: employeeSigningBonusSchema },
      { name: signingBonus.name, schema: signingBonusSchema },
      { name: EmployeeTerminationResignation.name, schema: EmployeeTerminationResignationSchema },
      { name: terminationAndResignationBenefits.name, schema: terminationAndResignationBenefitsSchema },
    ]),
    EmployeeProfileModule,
    forwardRef(() => PayrollExecutionModule),
    forwardRef(() => LeavesModule),
  ],
  controllers: [RecruitmentController],
  providers: [
    RecruitmentService,
    NotificationIntegrationService,
    PayrollIntegrationService,
    LeavesIntegrationService,
    TimeManagementIntegrationService,
    EmailIntegrationService,
    PdfIntegrationService,
    CalendarIntegrationService,
  ],
  exports:[RecruitmentService]

})
export class RecruitmentModule {}
