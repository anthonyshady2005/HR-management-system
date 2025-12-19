/**
 * # Recruitment Module – DTO Exports
 *
 * This file serves as a central export point (barrel file) for all
 * Data Transfer Objects used throughout the Recruitment module.
 *
 * ## Purpose
 * - Provide clean and unified imports across controllers and services
 * - Improve maintainability by avoiding deep relative paths
 * - Ensure all DTOs are discoverable in one place
 *
 * ## Notes
 * - DTOs handle request validation using class-validator
 * - DTOs map directly to Mongoose schema structures (recruitment/models)
 * - Auto-generated fields (e.g., _id, createdAt, updatedAt) are excluded
 * - Optional fields use @IsOptional() for PATCH-style updates
 *
 * Importing example:
 * ```ts
 * import { CreateJobRequisitionDto, UpdateOfferStatusDto } from './dto';
 * ```
 */

export * from './create-job-template.dto';
export * from './update-job-template.dto';
export * from './create-job-requisition.dto';
export * from './update-job-requisition.dto';

export * from './create-application.dto';
export * from './update-application-stage.dto';
export * from './update-application-status.dto';
export * from './assign-hr.dto';
export * from './create-consent.dto';

export * from './create-interview.dto';
export * from './update-interview.dto';
export * from './create-assessment-result.dto';

export * from './create-offer.dto';
export * from './update-offer-status.dto';
export * from './update-offer-approval.dto';
export * from './create-contract.dto';

export * from './create-onboarding.dto';
export * from './update-onboarding-task.dto';
export * from './create-termination-request.dto';
export * from './update-termination-status.dto';
export * from './update-clearance-checklist.dto';
export * from './update-clearance-item.dto';
export * from './revoke-access.dto';
export * from './trigger-final-settlement.dto';

export * from './create-referral.dto';
export * from './create-document.dto';
export * from './update-document.dto';
