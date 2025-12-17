import { RecruitmentService } from './recruitment.service';
import { CreateJobTemplateDto, UpdateJobTemplateDto, CreateJobRequisitionDto, UpdateJobRequisitionDto, CreateApplicationDto, UpdateApplicationStageDto, UpdateApplicationStatusDto, AssignHrDto, CreateInterviewDto, UpdateInterviewDto, CreateAssessmentResultDto, CreateOfferDto, UpdateOfferStatusDto, CreateContractDto, CreateOnboardingDto, UpdateOnboardingTaskDto, CreateTerminationRequestDto, UpdateTerminationStatusDto, UpdateClearanceChecklistDto, CreateReferralDto, CreateDocumentDto, UpdateDocumentDto } from './dto';
export declare class RecruitmentController {
    private readonly recruitmentService;
    constructor(recruitmentService: RecruitmentService);
    createJobTemplate(createDto: CreateJobTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./models/job-template.schema").JobTemplate, {}, {}> & import("./models/job-template.schema").JobTemplate & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getJobTemplates(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/job-template.schema").JobTemplate, {}, {}> & import("./models/job-template.schema").JobTemplate & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getJobTemplateById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/job-template.schema").JobTemplate, {}, {}> & import("./models/job-template.schema").JobTemplate & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateJobTemplate(id: string, updateDto: UpdateJobTemplateDto): Promise<import("mongoose").Document<unknown, {}, import("./models/job-template.schema").JobTemplate, {}, {}> & import("./models/job-template.schema").JobTemplate & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    deleteJobTemplate(id: string): Promise<void>;
    createJobRequisition(createDto: CreateJobRequisitionDto): Promise<import("mongoose").Document<unknown, {}, import("./models/job-requisition.schema").JobRequisition, {}, {}> & import("./models/job-requisition.schema").JobRequisition & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getJobRequisitions(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/job-requisition.schema").JobRequisition, {}, {}> & import("./models/job-requisition.schema").JobRequisition & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getJobRequisitionById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/job-requisition.schema").JobRequisition, {}, {}> & import("./models/job-requisition.schema").JobRequisition & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateJobRequisition(id: string, updateDto: UpdateJobRequisitionDto): Promise<import("mongoose").Document<unknown, {}, import("./models/job-requisition.schema").JobRequisition, {}, {}> & import("./models/job-requisition.schema").JobRequisition & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    publishJobRequisition(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/job-requisition.schema").JobRequisition, {}, {}> & import("./models/job-requisition.schema").JobRequisition & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    closeJobRequisition(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/job-requisition.schema").JobRequisition, {}, {}> & import("./models/job-requisition.schema").JobRequisition & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    previewJobRequisition(id: string): Promise<any>;
    deleteJobRequisition(id: string): Promise<void>;
    createApplication(createDto: CreateApplicationDto): Promise<import("mongoose").Document<unknown, {}, import("./models/application.schema").Application, {}, {}> & import("./models/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getApplications(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/application.schema").Application, {}, {}> & import("./models/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getApplicationById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/application.schema").Application, {}, {}> & import("./models/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateApplicationStage(id: string, updateDto: UpdateApplicationStageDto): Promise<import("mongoose").Document<unknown, {}, import("./models/application.schema").Application, {}, {}> & import("./models/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateApplicationStatus(id: string, updateDto: UpdateApplicationStatusDto): Promise<import("mongoose").Document<unknown, {}, import("./models/application.schema").Application, {}, {}> & import("./models/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    assignHrToApplication(id: string, assignDto: AssignHrDto): Promise<import("mongoose").Document<unknown, {}, import("./models/application.schema").Application, {}, {}> & import("./models/application.schema").Application & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getApplicationHistory(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./models/application-history.schema").ApplicationStatusHistory, {}, {}> & import("./models/application-history.schema").ApplicationStatusHistory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getApplicationCommunicationLogs(id: string): Promise<any[]>;
    recordConsent(id: string, consentDto: any): Promise<any>;
    getConsentStatus(id: string): Promise<any>;
    createInterview(createDto: CreateInterviewDto): Promise<import("mongoose").Document<unknown, {}, import("./models/interview.schema").Interview, {}, {}> & import("./models/interview.schema").Interview & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getInterviews(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/interview.schema").Interview, {}, {}> & import("./models/interview.schema").Interview & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getInterviewById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/interview.schema").Interview, {}, {}> & import("./models/interview.schema").Interview & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateInterview(id: string, updateDto: UpdateInterviewDto): Promise<import("mongoose").Document<unknown, {}, import("./models/interview.schema").Interview, {}, {}> & import("./models/interview.schema").Interview & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateInterviewStatus(id: string, statusDto: UpdateInterviewDto): Promise<import("mongoose").Document<unknown, {}, import("./models/interview.schema").Interview, {}, {}> & import("./models/interview.schema").Interview & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    submitAssessment(id: string, assessmentDto: CreateAssessmentResultDto): Promise<import("mongoose").Document<unknown, {}, import("./models/assessment-result.schema").AssessmentResult, {}, {}> & import("./models/assessment-result.schema").AssessmentResult & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getInterviewAssessment(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./models/assessment-result.schema").AssessmentResult, {}, {}> & import("./models/assessment-result.schema").AssessmentResult & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    sendCalendarInvite(id: string): Promise<any>;
    createOffer(createDto: CreateOfferDto): Promise<import("mongoose").Document<unknown, {}, import("./models/offer.schema").Offer, {}, {}> & import("./models/offer.schema").Offer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getOffers(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/offer.schema").Offer, {}, {}> & import("./models/offer.schema").Offer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getOfferById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/offer.schema").Offer, {}, {}> & import("./models/offer.schema").Offer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateOffer(id: string, updateDto: any): Promise<import("mongoose").Document<unknown, {}, import("./models/offer.schema").Offer, {}, {}> & import("./models/offer.schema").Offer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateOfferResponse(id: string, responseDto: UpdateOfferStatusDto): Promise<import("mongoose").Document<unknown, {}, import("./models/offer.schema").Offer, {}, {}> & import("./models/offer.schema").Offer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateOfferApproval(id: string, approvalDto: any): Promise<import("mongoose").Document<unknown, {}, import("./models/offer.schema").Offer, {}, {}> & import("./models/offer.schema").Offer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    signOffer(id: string, signDto: any): Promise<import("mongoose").Document<unknown, {}, import("./models/offer.schema").Offer, {}, {}> & import("./models/offer.schema").Offer & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    generateOfferPDF(id: string): Promise<any>;
    sendOfferToCandidate(id: string): Promise<any>;
    createContract(createDto: CreateContractDto): Promise<import("mongoose").Document<unknown, {}, import("./models/contract.schema").Contract, {}, {}> & import("./models/contract.schema").Contract & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getContracts(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/contract.schema").Contract, {}, {}> & import("./models/contract.schema").Contract & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getContractById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/contract.schema").Contract, {}, {}> & import("./models/contract.schema").Contract & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    signContract(id: string, signDto: any): Promise<import("mongoose").Document<unknown, {}, import("./models/contract.schema").Contract, {}, {}> & import("./models/contract.schema").Contract & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getContractPDF(id: string): Promise<any>;
    getContractByOfferId(offerId: string): Promise<(import("mongoose").Document<unknown, {}, import("./models/contract.schema").Contract, {}, {}> & import("./models/contract.schema").Contract & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    createOnboarding(createDto: CreateOnboardingDto): Promise<import("mongoose").Document<unknown, {}, import("./models/onboarding.schema").Onboarding, {}, {}> & import("./models/onboarding.schema").Onboarding & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getOnboardingByEmployeeId(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, import("./models/onboarding.schema").Onboarding, {}, {}> & import("./models/onboarding.schema").Onboarding & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    updateOnboardingTask(id: string, taskId: string, updateDto: UpdateOnboardingTaskDto): Promise<import("mongoose").Document<unknown, {}, import("./models/onboarding.schema").Onboarding, {}, {}> & import("./models/onboarding.schema").Onboarding & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    completeOnboarding(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/onboarding.schema").Onboarding, {}, {}> & import("./models/onboarding.schema").Onboarding & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getOnboardingTasks(id: string): Promise<any[]>;
    createTerminationRequest(createDto: CreateTerminationRequestDto): Promise<import("mongoose").Document<unknown, {}, import("./models/termination-request.schema").TerminationRequest, {}, {}> & import("./models/termination-request.schema").TerminationRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getTerminationRequests(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/termination-request.schema").TerminationRequest, {}, {}> & import("./models/termination-request.schema").TerminationRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getTerminationRequestById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/termination-request.schema").TerminationRequest, {}, {}> & import("./models/termination-request.schema").TerminationRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateTerminationStatus(id: string, statusDto: UpdateTerminationStatusDto): Promise<import("mongoose").Document<unknown, {}, import("./models/termination-request.schema").TerminationRequest, {}, {}> & import("./models/termination-request.schema").TerminationRequest & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getClearanceChecklist(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./models/clearance-checklist.schema").ClearanceChecklist, {}, {}> & import("./models/clearance-checklist.schema").ClearanceChecklist & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    updateClearanceChecklist(id: string, updateDto: UpdateClearanceChecklistDto): Promise<import("mongoose").Document<unknown, {}, import("./models/clearance-checklist.schema").ClearanceChecklist, {}, {}> & import("./models/clearance-checklist.schema").ClearanceChecklist & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    createReferral(createDto: CreateReferralDto): Promise<import("mongoose").Document<unknown, {}, import("./models/referral.schema").Referral, {}, {}> & import("./models/referral.schema").Referral & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getReferrals(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/referral.schema").Referral, {}, {}> & import("./models/referral.schema").Referral & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getReferralById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/referral.schema").Referral, {}, {}> & import("./models/referral.schema").Referral & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateReferral(id: string, updateDto: any): Promise<import("mongoose").Document<unknown, {}, import("./models/referral.schema").Referral, {}, {}> & import("./models/referral.schema").Referral & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    deleteReferral(id: string): Promise<void>;
    uploadDocument(file: any, documentDto: CreateDocumentDto): Promise<import("mongoose").Document<unknown, {}, import("./models/document.schema").Document, {}, {}> & import("./models/document.schema").Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    getDocuments(filters: any): Promise<(import("mongoose").Document<unknown, {}, import("./models/document.schema").Document, {}, {}> & import("./models/document.schema").Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getDocumentById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./models/document.schema").Document, {}, {}> & import("./models/document.schema").Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateDocument(id: string, updateDto: UpdateDocumentDto): Promise<import("mongoose").Document<unknown, {}, import("./models/document.schema").Document, {}, {}> & import("./models/document.schema").Document & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    deleteDocument(id: string): Promise<void>;
    downloadDocument(id: string): Promise<any>;
    getRecruitmentOverview(filters: any): Promise<any>;
    getRecruitmentMetrics(filters: any): Promise<any>;
    getPipelineView(filters: any): Promise<any>;
    getRequisitionMetrics(id: string): Promise<any>;
    getApplicationsByStage(filters: any): Promise<any>;
    getApplicationsByStatus(filters: any): Promise<any>;
    getTimeToHireMetrics(filters: any): Promise<any>;
}
