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
  department?: string;
  location?: string;
  openings?: number;
  publishStatus?: string;
  postingDate?: string;
  expiryDate?: string;
  hiringManagerId?: any;
  templateId?: any;
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

  // Create Job Requisition
  createJobRequisition: async (data: {
    requisitionId: string;
    templateId?: string;
    openings: number;
    location?: string;
    hiringManagerId: string;
    publishStatus?: "draft" | "published" | "closed";
    postingDate?: string;
    expiryDate?: string;
  }): Promise<JobRequisition> => {
    const response = await api.post("/recruitment/job-requisitions", data);
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

  // Application methods
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
    insurances?: string[];
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
};

// Onboarding Types
export interface OnboardingTask {
  _id?: string;
  name: string;
  department: string;
  status: "pending" | "in_progress" | "completed";
  deadline?: string;
  completedAt?: string;
  documentId?: any;
  notes?: string;
}

export interface Onboarding {
  _id: string;
  employeeId: any;
  contractId?: any;
  tasks: OnboardingTask[];
  completed: boolean;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OnboardingMetrics {
  activeOnboarding: {
    total: number;
    inProgress: number;
    completedThisMonth: number;
    overdue: number;
  };
  taskCompletion: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  averageCompletionTime: {
    average: number;
    fastest: number;
    slowest: number;
    onTrack: number;
  };
  departmentBreakdown: {
    topDepartment: string;
    activeOnboarding: number;
    completionRate: number;
  };
}

// Onboarding API Functions
export const onboardingApi = {
  // Get onboarding by employee ID
  getOnboardingByEmployeeId: async (employeeId: string): Promise<Onboarding> => {
    const response = await api.get(`/recruitment/onboarding/${employeeId}`);
    return response.data;
  },

  // Get onboarding tasks
  getOnboardingTasks: async (id: string): Promise<OnboardingTask[]> => {
    const response = await api.get(`/recruitment/onboarding/${id}/tasks`);
    return response.data;
  },

  // Update onboarding task
  updateOnboardingTask: async (
    id: string,
    taskId: string,
    data: {
      status?: "pending" | "in_progress" | "completed";
      completedAt?: string;
      documentId?: string;
      notes?: string;
    }
  ): Promise<Onboarding> => {
    const response = await api.patch(
      `/recruitment/onboarding/${id}/tasks/${taskId}`,
      data
    );
    return response.data;
  },

  // Mark onboarding as complete
  completeOnboarding: async (id: string): Promise<Onboarding> => {
    const response = await api.patch(`/recruitment/onboarding/${id}/complete`);
    return response.data;
  },

  // Create onboarding
  createOnboarding: async (data: {
    employeeId: string;
    tasks?: Array<{
      name: string;
      department: string;
      status?: "pending" | "in_progress" | "completed";
      deadline?: string;
      completedAt?: string;
      documentId?: string;
      notes?: string;
    }>;
    completed?: boolean;
    completedAt?: string;
  }): Promise<Onboarding> => {
    const response = await api.post("/recruitment/onboarding", data);
    return response.data;
  },
};

// Offboarding/Termination Types
export type TerminationStatus = "pending" | "approved" | "rejected" | "completed";
export type TerminationType = "resignation" | "termination";
export type TerminationInitiator = "employee" | "hr";
export type ClearanceStatus = "pending" | "in_progress" | "completed" | "blocked";
export type EquipmentReturnStatus = "returned" | "pending" | "lost";
export type EquipmentCondition = "good" | "damaged" | "lost";

export interface ClearanceItem {
  _id?: string;
  department: string;
  itemType: string;
  status: ClearanceStatus;
  requestedDate?: string;
  completedDate?: string;
  assignedTo?: string;
  comments?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface EquipmentItem {
  _id?: string;
  name: string;
  type: string;
  serialNumber?: string;
  returnStatus: EquipmentReturnStatus;
  condition?: EquipmentCondition;
  returnDate?: string;
  notes?: string;
}

export interface ClearanceChecklist {
  _id?: string;
  terminationId: string;
  items: ClearanceItem[];
  equipmentList: EquipmentItem[];
  cardReturned: boolean;
  cardReturnDate?: string;
  accessRevoked: boolean;
  accessRevokedDate?: string;
  overallStatus: ClearanceStatus;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TerminationRequest {
  _id: string;
  employeeId: any;
  type: TerminationType;
  initiatedBy: TerminationInitiator;
  reason?: string;
  requestDate: string;
  terminationDate: string;
  status: TerminationStatus;
  employeeComments?: string;
  hrComments?: string;
  clearanceId?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface DepartmentTurnover {
  department: string;
  totalTerminations: number;
  resignations: number;
  terminations: number;
  turnoverRate: number;
  trend: "up" | "down" | "stable";
}

export interface TerminationReason {
  reason: string;
  count: number;
  type: TerminationType;
}

// Offboarding API Functions
export const offboardingApi = {
  // Get all termination requests
  getTerminations: async (filters?: {
    status?: TerminationStatus;
    type?: TerminationType;
    employeeId?: string;
    initiator?: TerminationInitiator;
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<TerminationRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.employeeId) params.append("employeeId", filters.employeeId);
    if (filters?.initiator) params.append("initiator", filters.initiator);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.department) params.append("department", filters.department);

    const response = await api.get(
      `/recruitment/terminations?${params.toString()}`
    );
    return response.data;
  },

  // Get termination by ID
  getTerminationById: async (id: string): Promise<TerminationRequest> => {
    const response = await api.get(`/recruitment/terminations/${id}`);
    return response.data;
  },

  // Get clearance checklist
  getClearanceChecklist: async (id: string): Promise<ClearanceChecklist> => {
    const response = await api.get(
      `/recruitment/terminations/${id}/clearance`
    );
    return response.data;
  },

  // Update termination status
  updateTerminationStatus: async (
    id: string,
    status: TerminationStatus,
    comments?: string
  ): Promise<TerminationRequest> => {
    const response = await api.patch(`/recruitment/terminations/${id}/status`, {
      status,
      hrComments: comments,
    });
    return response.data;
  },

  // Update clearance checklist
  updateClearanceChecklist: async (
    id: string,
    data: {
      items?: ClearanceItem[];
      equipmentList?: EquipmentItem[];
      cardReturned?: boolean;
      cardReturnDate?: string;
      accessRevoked?: boolean;
      accessRevokedDate?: string;
    }
  ): Promise<ClearanceChecklist> => {
    const response = await api.patch(
      `/recruitment/terminations/${id}/clearance`,
      data
    );
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
      `/recruitment/terminations/stats?${params.toString()}`
    );
    return response.data;
  },

  // Get department turnover
  getDepartmentTurnover: async (filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DepartmentTurnover[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(
      `/recruitment/terminations/turnover?${params.toString()}`
    );
    return response.data;
  },

  // Get termination reasons
  getTerminationReasons: async (filters?: {
    type?: TerminationType;
    startDate?: string;
    endDate?: string;
  }): Promise<TerminationReason[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(
      `/recruitment/terminations/reasons?${params.toString()}`
    );
    return response.data;
  },
};

