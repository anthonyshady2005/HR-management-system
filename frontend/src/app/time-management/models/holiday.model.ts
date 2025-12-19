export enum HolidayType {
  NATIONAL = 'NATIONAL',
  ORGANIZATIONAL = 'ORGANIZATIONAL',
  WEEKLY_REST = 'WEEKLY_REST',
}

export interface Holiday {
  _id: string;
  type: HolidayType;
  startDate: string;
  endDate?: string;
  name?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

