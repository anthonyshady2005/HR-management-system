/**
 * 📄 **Onboarding System Schemas – Documentation**
 *
 * This module defines a modular, scalable onboarding data model using Mongoose
 * and NestJS decorators. Instead of storing all onboarding-related information
 * in a single document, responsibilities are separated into four collections:
 * - `OnboardingCase`
 * - `OnboardingChecklist`
 * - `DocumentEntity`
 * - `Provisioning`
 *
 * This design supports enterprise-grade onboarding workflows where tasks,
 * document verification, and provisioning processes evolve independently.
 *
 * ---------------------------------------------------------------------------
 * 🟦 **OnboardingCase**
 * Represents the lifecycle of onboarding for a specific employee.
 * Created when an employee accepts an offer or is ready to begin onboarding.
 *
 * **Fields**
 * - `employeeId`: Reference to the employee being onboarded
 * - `startDate`: Official employment start date
 * - `status`: Case status (Pending → In Progress → Completed)
 * - `checklistTemplateId`: Optional reference to a predefined checklist template
 *
 * **Purpose**
 * - Higher-level case entity for tracking onboarding progress
 * - Other collections (tasks, documents, provisioning) link to this case
 *
 * ---------------------------------------------------------------------------
 * 🟩 **OnboardingChecklist**
 * Concrete tasks generated for a given onboarding case.
 * Each item represents a single actionable unit owned by a department.
 *
 * **Fields**
 * - `caseId`: Links the task to a specific onboarding case
 * - `taskName`: Name of the onboarding task
 * - `responsibleDepartment`: Department that owns the task (HR, IT, Finance…)
 * - `taskStatus`: Task lifecycle (Pending → In Progress → Completed)
 * - `dueDate`: Optional deadline for completion
 *
 * **Use Cases**
 * - Department-specific workflows
 * - Tracking overdue or pending tasks across all employees
 * - Generating step-by-step checklists dynamically
 *
 * ---------------------------------------------------------------------------
 * 🟨 **DocumentEntity**
 * Tracks any documents employees upload or HR generates during onboarding.
 * Supports verification flows and HR compliance workflows.
 *
 * **Fields**
 * - `employeeId`: Owner of the document
 * - `docType`: Type (ID card, contract, certificate, etc.)
 * - `fileURL`: File storage location
 * - `verificationStatus`: Pending → Verified → Rejected
 *
 * **Capabilities**
 * - HR verification and rejection
 * - Document auditing
 * - Handling versioned documents (e.g., updated contract)
 *
 * ---------------------------------------------------------------------------
 * 🟥 **Provisioning**
 * Represents digital and physical provisioning tasks usually handled by IT.
 *
 * **Fields**
 * - `employeeId`: Employee receiving provisioning
 * - `equipment`: Physical items (laptop, badge, SIM card…)
 * - `accessSetup`: Digital accounts (email, internal systems…)
 * - `provisioningStatus`: Lifecycle (Pending → In Progress → Completed)
 *
 * **Use Cases**
 * - Coordinating with IT for equipment prep
 * - Tracking access setup and onboarding readiness
 * - Ensuring all tools are delivered before first working day
 *
 * ---------------------------------------------------------------------------
 * 🧩 **Architecture Overview**
 * This schema design follows a **normalized data model** that:
 * - Avoids oversized documents
 * - Enables efficient queries on tasks/documents
 * - Supports workflow automation in each domain (HR, IT, Finance)
 * - Scales well for large organizations with many onboarding cases
 *
 * Each module is stored in a separate collection with its own Mongoose schema,
 * but all are linked logically through `employeeId` or `caseId`.
 *
 * ---------------------------------------------------------------------------
 * 🛠 **Schema Factory**
 * All schemas (`OnboardingCaseSchema`, `OnboardingChecklistSchema`,
 * `DocumentSchema`, `ProvisioningSchema`) are generated using NestJS
 * `SchemaFactory` for use as independent Mongoose models.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * OnboardingCase
 * --------------
 * Created when a candidate accepts an offer.
 */

export enum OnboardingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type OnboardingCaseDocument = OnboardingCase & Document;

@Schema({ timestamps: true })
export class OnboardingCase {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startDate: Date;

  @Prop({
    type: String,
    enum: OnboardingStatus,
    default: OnboardingStatus.PENDING,
  })
  status: OnboardingStatus;

  @Prop({
    type: Types.ObjectId,
    ref: 'OnboardingChecklistTemplate',
    required: false,
  })
  checklistTemplateId?: Types.ObjectId;
}

export const OnboardingCaseSchema =
  SchemaFactory.createForClass(OnboardingCase);

/**
 * OnboardingChecklist
 * -------------------
 * Concrete tasks for a specific onboarding case.
 */

export enum ChecklistTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type OnboardingChecklistDocument = OnboardingChecklist & Document;

@Schema({ timestamps: true })
export class OnboardingChecklist {
  @Prop({ type: Types.ObjectId, ref: 'OnboardingCase', required: true })
  caseId: Types.ObjectId;

  @Prop({ required: true })
  taskName: string;

  @Prop({ required: true })
  responsibleDepartment: string; // e.g. "HR", "IT", "Finance"

  @Prop({
    type: String,
    enum: ChecklistTaskStatus,
    default: ChecklistTaskStatus.PENDING,
  })
  taskStatus: ChecklistTaskStatus;

  @Prop({ type: Date, required: false })
  dueDate?: Date;
}

export const OnboardingChecklistSchema =
  SchemaFactory.createForClass(OnboardingChecklist);

/**
 * Document
 * --------
 * Uploaded or tracked documents for an employee in onboarding.
 */

export enum DocumentVerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export type DocumentDocument = DocumentEntity & Document;

@Schema({ timestamps: true })
export class DocumentEntity {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({ required: true })
  docType: string; // e.g. "ID_CARD", "CONTRACT", "CERTIFICATE"

  @Prop({ required: true })
  fileURL: string;

  @Prop({
    type: String,
    enum: DocumentVerificationStatus,
    default: DocumentVerificationStatus.PENDING,
  })
  verificationStatus: DocumentVerificationStatus;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);

/**
 * Provisioning
 * ------------
 * Tracks physical and digital provisioning for a new hire.
 */

export enum ProvisioningStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export type ProvisioningDocument = Provisioning & Document;

@Schema({ timestamps: true })
export class Provisioning {
  @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
  employeeId: Types.ObjectId;

  @Prop({
    type: Object,
    default: {
      laptop: false,
      badge: false,
      simCard: false,
    },
  })
  equipment: Record<string, boolean>;

  @Prop({
    type: Object,
    default: {
      email: false,
      internalTools: false,
    },
  })
  accessSetup: Record<string, boolean>;

  @Prop({
    type: String,
    enum: ProvisioningStatus,
    default: ProvisioningStatus.PENDING,
  })
  provisioningStatus: ProvisioningStatus;
}

export const ProvisioningSchema = SchemaFactory.createForClass(Provisioning);
