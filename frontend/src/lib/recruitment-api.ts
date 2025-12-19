import { api } from "./api";

export interface RecruitmentOverview {
  requisitions: {
    total: number;
    open: number;
    closed: number;
  };
  applications: {
    total: number;
    active: number;
    hired: number;
    rejected: number;
  };
  offers: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
}

export interface RecruitmentMetrics extends RecruitmentOverview {
  interviews: {
    total: number;
    completed: number;
    scheduled: number;
    cancelled: number;
  };
  timeToHire: {
    average: number;
    min: number;
    max: number;
    count: number;
  };
}

export interface PipelineView {
  screening: number;
  departmentInterview: number;
  hrInterview: number;
  offer: number;
}

export interface ApplicationsByStatus {
  submitted: number;
  inProcess: number;
  offer: number;
  hired: number;
  rejected: number;
}

export interface JobRequisition {
  _id: string;
  requisitionId: string;
  title?: string;
  department?: string | { _id: string; name: string; code?: string };
  departmentId?: any;
  location?: string;
  openings?: number;
  publishStatus?: string;
  postingDate?: string;
  expiryDate?: string;
  hiringManagerId?: any;
  templateId?: any;
  tags?: string[];
}

export interface Application {
  _id: string;
  candidateId: any;
  requisitionId: any;
  currentStage: string;
  status: string;
  assignedHr?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Interview {
  _id: string;
  applicationId: any;
  stage: string;
  scheduledDate?: string;
  method?: string;
  status: string;
  panel?: any[];
  videoLink?: string;
  calendarEventId?: string;
}

export interface Offer {
  _id: string;
  applicationId: any;
  candidateId: any;
  applicantResponse: string;
  finalStatus?: string;
  grossSalary?: number;
  signingBonus?: number;
  benefits?: string[];
  insurances?: string[];
  role?: string;
  deadline?: string;
  createdAt?: string;
}

export interface Consent {
  applicationId: string;
  consentGiven: boolean;
  consentType?: string;
  consentDate?: string;
  withdrawnAt?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface EmployeeForDropdown {
  _id: string;
  displayText: string;
  email: string;
}

// Onboarding Types
export type OnboardingTaskStatus = "pending" | "in_progress" | "completed";

export interface OnboardingTask {
  _id?: string;
  title?: string;
  description?: string;
  status: OnboardingTaskStatus;
  deadline?: string;
  completedAt?: string;
  assignedTo?: any;
}

export interface Onboarding {
  _id: string;
  employeeId: any;
  tasks: OnboardingTask[];
  completed: boolean;
  createdAt?: string;
  completedAt?: string;
  startDate?: string;
  dueDate?: string;
  notes?: string;
}

// Offboarding Types
export type TerminationStatus = "pending" | "approved" | "rejected" | "completed";
export type TerminationType = "resignation" | "termination" | "retirement" | "end_of_contract";

export interface TerminationRequest {
  _id: string;
  employeeId: any;
  type: TerminationType;
  status: TerminationStatus;
  reason?: string;
  requestDate?: string;
  terminationDate?: string;
  lastWorkingDay?: string;
  noticePeriod?: number;
  createdAt?: string;
  updatedAt?: string;
  requestedBy?: any;
  initiatedBy?: "employee" | "hr";
  approvedBy?: any;
  comments?: string;
}

export interface TerminationStats {
  terminationRequests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    completed: number;
  };
  clearanceStatus: {
    total: number;
    inProgress: number;
    completed: number;
    pendingItems: number;
    completionRate: number;
  };
  terminationTypes: {
    resignations: number;
    terminations: number;
    ratio: number;
  };
  averageProcessingTime: {
    average: number;
    fastest: number;
    slowest: number;
    onTrack: number;
  };
}

export interface ClearanceItem {
  item: string;
  status: "pending" | "completed" | "not_applicable";
  completedBy?: string;
  completedAt?: string;
  notes?: string;
}

export interface EquipmentItem {
  item: string;
  serialNumber?: string;
  status: "returned" | "pending" | "lost" | "not_applicable";
  returnedAt?: string;
  notes?: string;
}

export interface ClearanceChecklist {
  _id: string;
  terminationRequestId: string;
  items: ClearanceItem[];
  equipment: EquipmentItem[];
  status: "pending" | "in_progress" | "completed";
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentTurnover {
  department: string;
  totalTerminations: number;
  resignations: number;
  terminations: number;
  turnoverRate: number;
  averageTenure: number;
  trend?: "up" | "down" | "flat";
}

export interface TerminationReason {
  reason: string;
  count: number;
  percentage: number;
}

// API Functions
export const recruitmentApi = {
  // Dashboard Overview
  getOverview: async (filters?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<RecruitmentOverview> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/dashboard/overview?${params.toString()}`
    );
    return response.data;
  },

  // Dashboard Metrics
  getMetrics: async (filters?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<RecruitmentMetrics> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/dashboard/metrics?${params.toString()}`
    );
    return response.data;
  },

  // Pipeline View
  getPipelineView: async (filters?: {
    requisitionId?: string;
    department?: string;
  }): Promise<PipelineView> => {
    const params = new URLSearchParams();
    if (filters?.requisitionId)
      params.append("requisitionId", filters.requisitionId);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/dashboard/pipeline?${params.toString()}`
    );
    return response.data;
  },

  // Applications by Stage
  getApplicationsByStage: async (
    requisitionId?: string
  ): Promise<PipelineView> => {
    const params = new URLSearchParams();
    if (requisitionId) params.append("requisitionId", requisitionId);

    const response = await api.get(
      `/recruitment/dashboard/applications-by-stage?${params.toString()}`
    );
    return response.data;
  },

  // Applications by Status
  getApplicationsByStatus: async (
    requisitionId?: string
  ): Promise<ApplicationsByStatus> => {
    const params = new URLSearchParams();
    if (requisitionId) params.append("requisitionId", requisitionId);

    const response = await api.get(
      `/recruitment/dashboard/applications-by-status?${params.toString()}`
    );
    return response.data;
  },

  // Time to Hire
  getTimeToHire: async (filters?: {
    requisitionId?: string;
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<{
    average: number;
    min: number;
    max: number;
    count: number;
  }> => {
    const params = new URLSearchParams();
    if (filters?.requisitionId)
      params.append("requisitionId", filters.requisitionId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/dashboard/time-to-hire?${params.toString()}`
    );
    return response.data;
  },

  // Job Requisitions
  getJobRequisitions: async (filters?: {
    status?: string;
    department?: string;
  }): Promise<JobRequisition[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/job-requisitions?${params.toString()}`
    );
    return response.data;
  },

  // Applications
  getApplications: async (filters?: {
    status?: string;
    stage?: string;
    requisitionId?: string;
    candidateId?: string;
  }): Promise<Application[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.stage) params.append("stage", filters.stage);
    if (filters?.requisitionId)
      params.append("requisitionId", filters.requisitionId);
    if (filters?.candidateId)
      params.append("candidateId", filters.candidateId);

    const response = await api.get(
      `/recruitment/applications?${params.toString()}`
    );
    return response.data;
  },

  // Interviews
  getInterviews: async (filters?: {
    applicationId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Interview[]> => {
    const params = new URLSearchParams();
    if (filters?.applicationId)
      params.append("applicationId", filters.applicationId);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(
      `/recruitment/interviews?${params.toString()}`
    );
    return response.data;
  },

  sendCalendarInvite: async (interviewId: string): Promise<any> => {
    const response = await api.post(`/recruitment/interviews/${interviewId}/send-calendar-invite`);
    return response.data;
  },

  createInterview: async (data: {
    applicationId: string;
    stage: string;
    scheduledDate: string;
    method: string;
    location?: string;
    videoLink?: string;
    panel?: string[];
    notes?: string;
  }): Promise<any> => {
    const response = await api.post(`/recruitment/interviews`, data);
    return response.data;
  },

  // Offers
  getOffers: async (filters?: {
    applicationId?: string;
    candidateId?: string;
    status?: string;
  }): Promise<Offer[]> => {
    const params = new URLSearchParams();
    if (filters?.applicationId)
      params.append("applicationId", filters.applicationId);
    if (filters?.candidateId) params.append("candidateId", filters.candidateId);
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get(
      `/recruitment/offers?${params.toString()}`
    );
    return response.data;
  },

  // Job Templates
  getJobTemplates: async (filters?: {
    department?: string;
  }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/job-templates?${params.toString()}`
    );
    return response.data;
  },

  getJobTemplateById: async (id: string): Promise<any> => {
    const response = await api.get(`/recruitment/job-templates/${id}`);
    return response.data;
  },

  // Get HR Managers for dropdown selection
  getHrManagers: async (): Promise<Array<{
    _id: string;
    id: string;
    employeeNumber: string;
    name: string;
    firstName: string;
    lastName: string;
    fullName: string;
    workEmail?: string;
  }>> => {
    try {
      const response = await api.get(`/employee-profile/hr-managers/list`);
      return response.data || [];
    } catch (error) {
      console.error('Error loading HR Managers:', error);
      return [];
    }
  },

  // Create Job Requisition
  createJobRequisition: async (data: {
    requisitionId: string;
    title?: string;
    departmentId?: string;
    templateId?: string;
    openings: number;
    location?: string;
    hiringManagerId: string;
    publishStatus?: "draft" | "published" | "closed";
    postingDate?: string;
    expiryDate?: string;
    tags?: string;
  }): Promise<JobRequisition> => {
    const response = await api.post("/recruitment/job-requisitions", data);
    return response.data;
  },

  getPublicJobRequisitions: async (): Promise<JobRequisition[]> => {
    const response = await api.get(`/recruitment/job-requisitions/public`);
    return response.data;
  },

  getJobRequisitionById: async (id: string): Promise<JobRequisition> => {
    const response = await api.get(`/recruitment/job-requisitions/${id}`);
    return response.data;
  },

  updateJobRequisition: async (
    id: string,
    data: Partial<JobRequisition>
  ): Promise<JobRequisition> => {
    const response = await api.patch(`/recruitment/job-requisitions/${id}`, data);
    return response.data;
  },

  publishJobRequisition: async (id: string): Promise<JobRequisition> => {
    const response = await api.patch(`/recruitment/job-requisitions/${id}/publish`);
    return response.data;
  },

  closeJobRequisition: async (id: string): Promise<JobRequisition> => {
    const response = await api.patch(`/recruitment/job-requisitions/${id}/close`);
    return response.data;
  },

  deleteJobRequisition: async (id: string): Promise<void> => {
    await api.delete(`/recruitment/job-requisitions/${id}`);
  },

  // Application methods
  createApplication: async (data: {
    candidateId: string;
    requisitionId: string;
    assignedHr?: string;
  }): Promise<Application> => {
    const response = await api.post(`/recruitment/applications`, data);
    return response.data;
  },

  getApplicationById: async (id: string): Promise<Application> => {
    const response = await api.get(`/recruitment/applications/${id}`);
    return response.data;
  },

  updateApplicationStage: async (
    id: string,
    stage: string
  ): Promise<Application> => {
    const response = await api.patch(`/recruitment/applications/${id}/stage`, {
      currentStage: stage,
    });
    return response.data;
  },

  updateApplicationStatus: async (
    id: string,
    status: string
  ): Promise<Application> => {
    const response = await api.patch(`/recruitment/applications/${id}/status`, {
      status,
    });
    return response.data;
  },

  assignHrToApplication: async (
    id: string,
    hrId: string
  ): Promise<Application> => {
    const response = await api.patch(`/recruitment/applications/${id}/assign-hr`, {
      assignedHr: hrId,
    });
    return response.data;
  },

  getApplicationHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/recruitment/applications/${id}/history`);
    return response.data;
  },

  // Consent methods
  getConsentStatus: async (id: string): Promise<Consent | null> => {
    const response = await api.get(`/recruitment/applications/${id}/consent`);
    return response.data;
  },

  recordConsent: async (
    id: string,
    data: {
      consentGiven: boolean;
      consentType?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<Consent> => {
    const response = await api.post(`/recruitment/applications/${id}/consent`, data);
    return response.data;
  },

  // Interview methods
  getInterviewById: async (id: string): Promise<Interview> => {
    const response = await api.get(`/recruitment/interviews/${id}`);
    return response.data;
  },

  createInterview: async (data: {
    applicationId: string;
    stage: string;
    scheduledDate?: string;
    method?: string;
    panel?: string[];
    videoLink?: string;
    calendarEventId?: string;
  }): Promise<Interview> => {
    const response = await api.post("/recruitment/interviews", data);
    return response.data;
  },

  updateInterview: async (
    id: string,
    data: Partial<Interview>
  ): Promise<Interview> => {
    const response = await api.patch(`/recruitment/interviews/${id}`, data);
    return response.data;
  },

  updateInterviewStatus: async (
    id: string,
    status: string
  ): Promise<Interview> => {
    const response = await api.patch(`/recruitment/interviews/${id}/status`, {
      status,
    });
    return response.data;
  },

  sendCalendarInvite: async (interviewId: string): Promise<any> => {
    const response = await api.post(
      `/recruitment/interviews/${interviewId}/send-calendar-invite`
    );
    return response.data;

  },

  submitAssessment: async (
    interviewId: string,
    data: {
      interviewerId: string;
      score?: number;
      comments?: string;
    }
  ): Promise<any> => {
    const response = await api.post(
      `/recruitment/interviews/${interviewId}/assessment`,
      data
    );
    return response.data;
  },

  // Offer methods
  getOfferById: async (id: string): Promise<Offer> => {
    const response = await api.get(`/recruitment/offers/${id}`);
    return response.data;
  },

  createOffer: async (data: {
    applicationId: string;
    candidateId: string;
    hrEmployeeId?: string;
    grossSalary: number;
    signingBonus?: number;
    benefits?: string[];
    insurances?: string;
    conditions?: string;
    content?: string;
    role?: string;
    deadline: string;
    approvers?: Array<{
      employeeId: string;
      role: string;
      status?: string;
    }>;
  }): Promise<Offer> => {
    const response = await api.post("/recruitment/offers", data);
    // Ensure _id is a string
    if (response.data && response.data._id && typeof response.data._id !== 'string') {
      response.data._id = response.data._id.toString();
    }
    return response.data;
  },

  updateOfferResponse: async (
    id: string,
    response: string
  ): Promise<Offer> => {
    const response_data = await api.patch(`/recruitment/offers/${id}/response`, {
      applicantResponse: response,
    });
    return response_data.data;
  },

  updateOfferApproval: async (
    id: string,
    approverId: string,
    status: string
  ): Promise<Offer> => {
    const response = await api.patch(`/recruitment/offers/${id}/approval`, {
      approverId,
      status,
    });
    return response.data;
  },

  generateOfferPDF: async (id: string): Promise<{ pdfUrl: string }> => {
    const response = await api.post(`/recruitment/offers/${id}/generate-pdf`);
    return response.data;
  },

  sendOfferToCandidate: async (id: string): Promise<any> => {
    const response = await api.post(`/recruitment/offers/${id}/send`);
    return response.data;
  },

  generateOfferSigningLink: async (
    id: string,
    signerType: string,
    expiresInDays?: number
  ): Promise<{ token: string; signingUrl: string; expiresInDays: number }> => {
    const response = await api.post(`/recruitment/offers/${id}/generate-signing-link`, {
      signerType,
      expiresInDays: expiresInDays || 7,
    });
    return response.data;
  },

  generateContractSigningLink: async (
    id: string,
    signerType: string,
    expiresInDays?: number
  ): Promise<{ token: string; signingUrl: string; expiresInDays: number }> => {
    const response = await api.post(`/recruitment/contracts/${id}/generate-signing-link`, {
      signerType,
      expiresInDays: expiresInDays || 7,
    });
    return response.data;
  },
};

export const onboardingApi = {
  getOnboardings: async (filters?: {
    status?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Onboarding[]> => {
    const response = await api.get("/recruitment/onboarding", {
      params: filters,
    });
    return response.data;
  },

  getOnboardingById: async (id: string): Promise<Onboarding> => {
    const response = await api.get(`/recruitment/onboarding/${id}`);
    return response.data;
  },

  createOnboarding: async (data: Partial<Onboarding>): Promise<Onboarding> => {
    const response = await api.post("/recruitment/onboarding", data);
    return response.data;
  },

  updateOnboarding: async (
    id: string,
    data: Partial<Onboarding>
  ): Promise<Onboarding> => {
    const response = await api.patch(`/recruitment/onboarding/${id}`, data);
    return response.data;
  },
};

export const employeeApi = {
  getEmployeesForDropdown: async (
    status?: string
  ): Promise<EmployeeForDropdown[]> => {
    const normalizedStatus = status ? status.toUpperCase() : undefined;
    const params = new URLSearchParams();
    if (normalizedStatus) params.append("status", normalizedStatus);
    params.append("limit", "1000");

    const response = await api.get(
      `/employee-profile/search?${params.toString()}`
    );

    const data = response.data?.data ?? response.data ?? [];
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((employee: any) => ({
      _id: employee._id ?? employee.id ?? "",
      displayText:
        employee.fullName ||
        [employee.firstName, employee.lastName].filter(Boolean).join(" ") ||
        employee.workEmail ||
        employee.personalEmail ||
        employee.employeeNumber ||
        "",
      email: employee.workEmail || employee.personalEmail || "",
    }));
  },
};

// Offboarding API Functions
export const offboardingApi = {
  // Get termination requests
  getTerminations: async (filters?: {
    startDate?: string;
    endDate?: string;
    status?: TerminationStatus;
    type?: TerminationType;
    employeeId?: string;
    department?: string;
  }): Promise<TerminationRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.employeeId) params.append("employeeId", filters.employeeId);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/termination-requests?${params.toString()}`
    );
    return response.data;
  },

  // Get termination request by ID
  getTerminationById: async (id: string): Promise<TerminationRequest> => {
    const response = await api.get(`/recruitment/termination-requests/${id}`);
    return response.data;
  },

  // Create termination request
  createTerminationRequest: async (data: {
    employeeId: string;
    type: TerminationType;
    reason?: string;
    terminationDate?: string;
    lastWorkingDay?: string;
    noticePeriod?: number;
    comments?: string;
  }): Promise<TerminationRequest> => {
    const response = await api.post("/recruitment/termination-requests", data);
    return response.data;
  },

  // Update termination status
  updateTerminationStatus: async (
    id: string,
    status: TerminationStatus
  ): Promise<TerminationRequest> => {
    const response = await api.patch(`/recruitment/termination-requests/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Get termination statistics
  getTerminationStats: async (filters?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<TerminationStats> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/termination-requests/stats?${params.toString()}`
    );
    return response.data;
  },

  // Get department turnover
  getDepartmentTurnover: async (filters?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<DepartmentTurnover[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/termination-requests/turnover?${params.toString()}`
    );
    return response.data;
  },

  // Get termination reasons
  getTerminationReasons: async (filters?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<TerminationReason[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/termination-requests/reasons?${params.toString()}`
    );
    return response.data;
  },

  // Get clearance checklist
  getClearanceChecklist: async (id: string): Promise<ClearanceChecklist | null> => {
    const response = await api.get(`/recruitment/termination-requests/${id}/clearance`);
    return response.data;
  },

  // Update clearance checklist
  updateClearanceChecklist: async (
    id: string,
    data: {
      items?: ClearanceItem[];
      equipment?: EquipmentItem[];
      status?: "pending" | "in_progress" | "completed";
    }
  ): Promise<ClearanceChecklist> => {
    const response = await api.patch(
      `/recruitment/termination-requests/${id}/clearance`,
      data
    );
    return response.data;
  },
};
