import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

/**
 * Resignation Policy Integration Service
 * 
 * Dummy/mock service for integrating with the Resignation Policy subsystem.
 * In production, this would make HTTP calls to the actual Resignation Policy API.
 */
@Injectable()
export class ResignationPolicyIntegrationService {
  /**
   * Get a resignation policy by ID
   * @param policyId - ObjectId of the resignation policy
   * @returns Mock resignation policy data
   */
  async getResignationPolicy(policyId: Types.ObjectId): Promise<any> {
    // Dummy implementation - in production, this would call the actual API
    return {
      _id: policyId,
      terminationType: 'RESIGNATION',
      compensation_amount: 3000,
      benefits: 'Health insurance continuation for 3 months',
      conditions: 'Must provide 2 weeks notice',
      status: 'ACTIVE',
    };
  }

  /**
   * Apply resignation policy to an offboarding case
   * @param employeeId - ObjectId of the employee
   * @param policyId - ObjectId of the resignation policy
   * @param exitType - Type of exit (RESIGNATION or TERMINATION)
   * @returns Mock response with compensation details
   */
  async applyResignationPolicy(
    employeeId: Types.ObjectId,
    policyId: Types.ObjectId,
    exitType: string,
  ): Promise<any> {
    // Dummy implementation - in production, this would call the actual API
    return {
      success: true,
      employeeId,
      policyId,
      exitType,
      compensation_amount: 3000,
      benefits: 'Health insurance continuation for 3 months',
      message: 'Resignation policy applied successfully',
    };
  }

  /**
   * Calculate compensation based on policy and employee details
   * @param employeeId - ObjectId of the employee
   * @param policyId - ObjectId of the resignation policy
   * @returns Mock compensation calculation
   */
  async calculateCompensation(
    employeeId: Types.ObjectId,
    policyId: Types.ObjectId,
  ): Promise<{ amount: number; breakdown: any }> {
    // Dummy implementation
    return {
      amount: 3000,
      breakdown: {
        baseCompensation: 3000,
        benefits: 'Health insurance continuation for 3 months',
      },
    };
  }
}

