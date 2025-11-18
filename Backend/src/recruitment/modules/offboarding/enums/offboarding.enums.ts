export enum ExitType {
  RESIGNATION = 'RESIGNATION',
  TERMINATION = 'TERMINATION',
}

export enum OffboardingStatus {
  INITIATED = 'INITIATED',
  CLEARANCE_IN_PROGRESS = 'CLEARANCE_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum OffboardingDepartment {
  HR = 'HR',
  IT = 'IT',
  FINANCE = 'FINANCE',
  FACILITIES = 'FACILITIES',
  OTHER = 'OTHER',
}

export enum ChecklistStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum ClearanceItemStatus {
  PENDING = 'PENDING',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
}

export enum SystemRevocationStatus {
  PENDING = 'PENDING',
  REVOKED = 'REVOKED',
  FAILED = 'FAILED',
}
