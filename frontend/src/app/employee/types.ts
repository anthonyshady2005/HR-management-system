/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TypeScript types for Employee Profile Module
 * Matches backend DTOs and schemas
 */

// ==================== ENUMS ====================

export enum SystemRole {
  DEPARTMENT_EMPLOYEE = 'department employee',
  DEPARTMENT_HEAD = 'department head',
  HR_MANAGER = 'HR Manager',
  HR_EMPLOYEE = 'HR Employee',
  PAYROLL_SPECIALIST = 'Payroll Specialist',
  PAYROLL_MANAGER = 'Payroll Manager',
  SYSTEM_ADMIN = 'System Admin',
  LEGAL_POLICY_ADMIN = 'Legal & Policy Admin',
  RECRUITER = 'Recruiter',
  FINANCE_STAFF = 'Finance Staff',
  JOB_CANDIDATE = 'Job Candidate',
  HR_ADMIN = 'HR Admin',
}

export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  RETIRED = 'RETIRED',
  PROBATION = 'PROBATION',
  TERMINATED = 'TERMINATED',
}

export enum ProfileChangeStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
}

export enum ContractType {
  FULL_TIME_CONTRACT = 'FULL_TIME_CONTRACT',
  PART_TIME_CONTRACT = 'PART_TIME_CONTRACT',
}

export enum WorkType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}

export enum GraduationType {
  HIGH_SCHOOL = 'High School',
  BACHELOR = 'Bachelor',
  MASTER = 'Master',
  DOCTORATE = 'Doctorate',
  DIPLOMA = 'Diploma',
}

export enum DeactivationReason {
  TERMINATED = 'TERMINATED',
  RETIRED = 'RETIRED',
  RESIGNED = 'RESIGNED',
}

export enum PayGradeEnum {
  PG1 = 'PG1',
  PG2 = 'PG2',
  PG3 = 'PG3',
  PG4 = 'PG4',
  PG5 = 'PG5',
  EXECUTIVE = 'EXECUTIVE',
}

// ==================== INTERFACES ====================

export interface Address {
  city?: string;
  streetAddress?: string;
  country?: string;
}

export interface Position {
  _id: string;
  title: string;
  code?: string;
  description?: string;
}

export interface Department {
  _id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface AppraisalRecord {
  _id: string;
  totalScore?: number;
  overallRatingLabel?: string;
  cycleId?: string;
  templateId?: string;
  createdAt: string;
}

export interface Qualification {
  _id: string;
  employeeProfileId: string;
  establishmentName: string;
  graduationType: GraduationType;
}

export interface EmployeeProfile {
  _id: string;
  
  // Core Identity
  employeeId?: string; // Legacy field name
  employeeNumber?: string; // Actual backend field name
  firstName: string;
  lastName: string;
  fullName: string;
  personalEmail: string;
  password?: string;
  nationalId?: string;
  
  // Personal Info
  gender?: Gender;
  dateOfBirth?: Date | string;
  maritalStatus?: MaritalStatus;
  biography?: string;
  profilePictureUrl?: string;
  
  // Contact Info
  mobilePhone?: string;
  workEmail?: string;
  workPhone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: Address;
  
  // Employment Details
  dateOfHire: Date | string;
  probationEndDate?: Date | string;
  contractStartDate?: Date | string;
  contractEndDate?: Date | string;
  contractType?: ContractType;
  workType?: WorkType;
  status: EmployeeStatus;
  terminationDate?: Date | string;
  
  // Organizational Structure (can be ObjectId or populated)
  positionId?: string | Position;
  primaryPositionId?: string | Position; // Backend field name
  departmentId?: string | Department;
  primaryDepartmentId?: string | Department; // Backend field name
  payGradeId?: string | PayGradeEnum; // Changed to use Enum string
  supervisorPositionId?: string | Position;
  
  // Performance Data (populated)
  lastAppraisalRecord?: AppraisalRecord;
  lastAppraisalId?: string;
  latestPerformanceReviewId?: string;
  lastAppraisalDate?: Date | string;
  lastAppraisalScore?: number;
  lastAppraisalRating?: string;
  nextReviewDue?: Date | string;
  performanceTrend?: string;
  
  // Qualifications (populated)
  highestQualification?: Qualification;
  
  // Access Profile
  accessProfileId?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldChange {
  fieldName: string;
  oldValue: any;
  newValue: any;
}

export interface EmployeeProfileChangeRequest {
  _id: string;
  requestId: string;
  employeeProfileId: string | EmployeeProfile;
  requestDescription: string;
  fieldChanges: FieldChange[];
  reason: string;
  status: ProfileChangeStatus;
  submittedAt: string;
  processedByEmployeeId?: string | EmployeeProfile;
  processedAt?: string;
  processingComments?: string;
}

export interface ProfileAuditLog {
  _id: string;
  employeeProfileId: string | EmployeeProfile;
  performedBy: string | EmployeeProfile;
  action: string;
  description?: string;
  changes?: object;
  previousState?: object;
  fieldsModified?: string[];
  reason?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface EmployeeSystemRole {
  _id: string;
  employeeProfileId: string | EmployeeProfile;
  roles: SystemRole[];
  customPermissions?: string[];
  isActive: boolean;
}

// ==================== DTOs ====================

export interface UpdateSelfProfileDto {
  mobilePhone?: string;
  personalEmail?: string;
  address?: Address;
  biography?: string;
  profilePictureUrl?: string;
}

export interface SubmitChangeRequestDto {
  fields: FieldChange[];
  reason: string;
}

export interface UpdateEmployeeProfileDto {
  // Personal
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  gender?: Gender;
  dateOfBirth?: Date | string;
  maritalStatus?: MaritalStatus;
  biography?: string;
  profilePictureUrl?: string;
  
  // Contact
  personalEmail?: string;
  mobilePhone?: string;
  workEmail?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: Address;
  
  // Employment
  employeeId?: string;
  dateOfHire?: Date | string;
  probationEndDate?: Date | string;
  contractStartDate?: Date | string;
  contractEndDate?: Date | string;
  contractType?: ContractType;
  workType?: WorkType;
  status?: EmployeeStatus;
  terminationDate?: Date | string;
  
  // Organizational
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  payGradeId?: string;
  supervisorPositionId?: string;
  
  // Optional reason for audit
  updateReason?: string;
}

/**
 * DTO for HR Admin to update employee profile - matches backend HrUpdateEmployeeProfileDto
 */
export interface HrUpdateEmployeeProfileDto {
  // Personal Information
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nationalId?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string; // send as ISO string

  // Contact Information
  personalEmail?: string;
  workEmail?: string;
  mobilePhone?: string;
  homePhone?: string;

  biography?: string;
  profilePictureUrl?: string;

  // Employment Information
  employeeNumber?: string;
  dateOfHire?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractType?: ContractType;
  workType?: WorkType;

  status?: EmployeeStatus;
  statusEffectiveFrom?: string;

  // Organizational Links
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  supervisorPositionId?: string;
  payGradeId?: string;

  // Address
  address?: Address;

  // Reason for change (for audit trail)
  changeReason?: string;
}

export interface ProcessChangeRequestDto {
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
}

/**
 * DTO for creating a new employee profile
 */
export interface CreateEmployeeProfileDto {
  // Required fields
  firstName: string;
  lastName: string;
  dateOfHire: string; // ISO date string
  workEmail: string;

  // Optional personal information
  middleName?: string;
  nationalId?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  dateOfBirth?: string; // ISO date string

  // Optional contact information
  personalEmail?: string;
  mobilePhone?: string;
  homePhone?: string;
  address?: Address;
  profilePictureUrl?: string;
  biography?: string;

  // Optional employment information
  employeeNumber?: string;
  status?: EmployeeStatus;
  jobTitle?: string;

  // Optional organization structure
  primaryPositionId?: string;
  primaryDepartmentId?: string;
  supervisorPositionId?: string; // Assign to manager's team
  payGradeId?: string;

  // Optional contract information
  contractStartDate?: string; // ISO date string
  contractEndDate?: string; // ISO date string
  contractType?: ContractType;
  workType?: WorkType;
}

export interface DeactivateEmployeeDto {
  deactivationReason: DeactivationReason;
  effectiveDate?: Date | string;
  notes: string;
}

export interface AssignRolesDto {
  roles: SystemRole[];
  customPermissions?: string[];
  isActive?: boolean;
  reason?: string;
}

export interface SearchEmployeesParams {
  name?: string;
  status?: EmployeeStatus;
  positionId?: string;
  departmentId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== TEAM INTERFACES ====================

export interface TeamMember {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: EmployeeStatus;
  profilePictureUrl?: string;
  positionId?: Position;
  departmentId?: Department;
}

export interface TeamSummary {
  managerDepartment?: any;
  department?: string;
  totalCount: number;
  totalTeamMembers?: number;
  byPosition: Array<{ position: string; positionCode?: string; count: number }>;
  byDepartment: Array<{ department: string; departmentCode?: string; count: number }>;
  byStatus: Array<{ status: EmployeeStatus | string; count: number }>;
  analytics?: {
    newHires: number;
    recentHires: number;
    avgTenureMonths: number;
    byContractType: Array<{ type: string; count: number }>;
    byWorkType: Array<{ type: string; count: number }>;
    byHireYear: Array<{ year: number; count: number }>;
  };
}

// ==================== CONSTANTS ====================

export const SELF_EDITABLE_FIELDS = [
  'mobilePhone',
  'personalEmail',
  'address',
  'biography',
  'profilePictureUrl',
] as const;

export const GOVERNED_FIELDS = [
  'firstName',
  'lastName',
  'nationalId',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'positionId',
  'departmentId',
  'payGradeId',
] as const;

export const STATUS_COLORS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.ACTIVE]: 'bg-green-500/20 text-green-400 border-green-500/50',
  [EmployeeStatus.INACTIVE]: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  [EmployeeStatus.ON_LEAVE]: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  [EmployeeStatus.SUSPENDED]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  [EmployeeStatus.RETIRED]: 'bg-slate-500/20 text-slate-400 border-slate-500/50',
  [EmployeeStatus.PROBATION]: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  [EmployeeStatus.TERMINATED]: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export const CHANGE_STATUS_COLORS: Record<ProfileChangeStatus, string> = {
  [ProfileChangeStatus.PENDING]: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  [ProfileChangeStatus.APPROVED]: 'bg-green-500/20 text-green-400 border-green-500/50',
  [ProfileChangeStatus.REJECTED]: 'bg-red-500/20 text-red-400 border-red-500/50',
  [ProfileChangeStatus.CANCELED]: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
};
