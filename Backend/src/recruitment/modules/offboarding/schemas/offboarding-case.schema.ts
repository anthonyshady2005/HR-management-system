/**
 *  **Offboarding Module – Documentation**
 *
 *  This module defines Mongoose schemas for managing employee offboarding workflows
 *  within an HR or employee lifecycle management system. It models offboarding cases,
 *  departmental tasks, clearance items, system access revocations, statuses,
 *  and all related metadata.
 *
 *  ------------------------------------------------------------
 *
 *  **OffboardingCase**
 *  - `offboardingId`: Optional external unique tracking ID
 *  - `employeeId`: Linked Employee reference
 *  - `initiationReason`: Free-text justification for initiating offboarding
 *  - `exitType`: RESIGNATION or TERMINATION
 *  - `status`: Offboarding lifecycle:
 *      → INITIATED → CLEARANCE_IN_PROGRESS → COMPLETED → CANCELLED
 *  - `lastWorkingDay`: Employee’s final working date
 *  - `initiatedBy`: Actor who initiated the process (HR, Manager, Employee, etc.)
 *
 *  ------------------------------------------------------------
 *
 *  **OffboardingChecklist**
 *  - `caseId`: Linked OffboardingCase reference
 *  - `department`: HR, IT, FINANCE, FACILITIES, or OTHER
 *  - `task`: Description of the offboarding task
 *  - `status`: Task lifecycle:
 *      → PENDING → IN_PROGRESS → COMPLETED
 *
 *  ------------------------------------------------------------
 *
 *  **ClearanceItem**
 *  - `employeeId`: Linked Employee reference
 *  - `itemName`: Physical or logical asset (Laptop, Badge, Phone, etc.)
 *  - `description`: Optional additional item info
 *  - `returnStatus`: Item clearance state:
 *      → PENDING → RETURNED → LOST
 *
 *  ------------------------------------------------------------
 *
 *  **SystemRevocation**
 *  - `employeeId`: Linked Employee reference
 *  - `systemName`: System or application requiring access revocation
 *  - `revokedAt`: Timestamp when access was revoked
 *  - `status`: Revocation state:
 *      → PENDING → REVOKED → FAILED
 *
 *  ------------------------------------------------------------
 *
 *  **Schema Factory**
 *  - Each schema is generated via NestJS `SchemaFactory`
 *  - Ensures Mongoose integration, timestamps, and strong typing
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * OffboardingCase
 * ----------------
 * Represents a single offboarding process for an employee.
 */

export enum OffboardingStatus {
  INITIATED = 'INITIATED',
  CLEARANCE_IN_PROGRESS = 'CLEARANCE_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export type OffboardingCaseDocument = OffboardingCase & Document;

@Schema({ timestamps: true })
export class OffboardingCase {
  // Optional external tracking id (in addition to Mongo _id)
  @Prop({ required: false, unique: true })
  offboardingId?: string;

  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  // Free-text explanation for why offboarding was initiated
  @Prop({ required: false })
  initiationReason?: string;

  // RESIGNATION vs TERMINATION (exit type)
  @Prop({ type: String, enum: ['RESIGNATION', 'TERMINATION'], required: true })
  exitType: 'RESIGNATION' | 'TERMINATION';

  @Prop({
    type: String,
    enum: OffboardingStatus,
    default: OffboardingStatus.INITIATED,
  })
  status: OffboardingStatus;

  // Last working day for the employee
  @Prop({ type: Date, required: true })
  lastWorkingDay: Date;

  // Who initiated the process (HR, EMPLOYEE, MANAGER, etc.)
  @Prop({ required: false })
  initiatedBy?: string;
}

export const OffboardingCaseSchema =
  SchemaFactory.createForClass(OffboardingCase);

/**
 * OffboardingChecklist
 * --------------------
 * Per-case tasks that must be completed by each department.
 */

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

export type OffboardingChecklistDocument = OffboardingChecklist & Document;

@Schema({ timestamps: true })
export class OffboardingChecklist {
  @Prop({ type: Types.ObjectId, ref: 'OffboardingCase', required: true })
  caseId: Types.ObjectId;

  @Prop({
    type: String,
    enum: OffboardingDepartment,
    required: true,
  })
  department: OffboardingDepartment;

  @Prop({ required: true })
  task: string;

  @Prop({
    type: String,
    enum: ChecklistStatus,
    default: ChecklistStatus.PENDING,
  })
  status: ChecklistStatus;
}

export const OffboardingChecklistSchema =
  SchemaFactory.createForClass(OffboardingChecklist);

/**
 * ClearanceItem
 * -------------
 * Physical or logical items that must be returned/cleared
 * (e.g., laptop, access card, company phone).
 */

export enum ClearanceItemStatus {
  PENDING = 'PENDING',
  RETURNED = 'RETURNED',
  LOST = 'LOST',
}

export type ClearanceItemDocument = ClearanceItem & Document;

@Schema({ timestamps: true })
export class ClearanceItem {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  itemName: string;

  @Prop({ required: false })
  description?: string;

  @Prop({
    type: String,
    enum: ClearanceItemStatus,
    default: ClearanceItemStatus.PENDING,
  })
  returnStatus: ClearanceItemStatus;
}

export const ClearanceItemSchema = SchemaFactory.createForClass(ClearanceItem);

/**
 * SystemRevocation
 * ----------------
 * Tracks revocation of access to internal/external systems
 * for security and compliance (email, VPN, HR system, etc.).
 */

export enum SystemRevocationStatus {
  PENDING = 'PENDING',
  REVOKED = 'REVOKED',
  FAILED = 'FAILED',
}

export type SystemRevocationDocument = SystemRevocation & Document;

@Schema({ timestamps: true })
export class SystemRevocation {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  // e.g., "Google Workspace", "Jira", "VPN", "HR Portal"
  @Prop({ required: true })
  systemName: string;

  @Prop({ type: Date, required: false })
  revokedAt?: Date;

  @Prop({
    type: String,
    enum: SystemRevocationStatus,
    default: SystemRevocationStatus.PENDING,
  })
  status: SystemRevocationStatus;
}

export const SystemRevocationSchema =
  SchemaFactory.createForClass(SystemRevocation);
