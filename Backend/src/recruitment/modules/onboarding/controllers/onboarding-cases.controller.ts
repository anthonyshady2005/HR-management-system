import { Controller, Post, Get, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateOnboardingCaseDto } from '../dtos/create-onboarding-case.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  @Post('cases/:caseId/signing-bonus/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Apply signing bonus policy to onboarding case',
    description: 'Integrates with Signing Bonus subsystem to apply a bonus policy when an employee is onboarded.',
  })
  @ApiParam({
    name: 'caseId',
    description: 'Onboarding case ID',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        bonusPolicyId: {
          type: 'string',
          description: 'ObjectId of the signing bonus policy to apply',
          example: '507f1f77bcf86cd799439012',
        },
      },
      required: ['bonusPolicyId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus applied successfully',
  })
  async applySigningBonus(@Param('caseId') caseId: string, @Body() body: { bonusPolicyId: string }) {
    return { success: true, caseId, bonusPolicyId: body.bonusPolicyId };
  }

  @Get('signing-bonus/policies/:policyId')
  @ApiOperation({
    summary: 'Get signing bonus policy details',
    description: 'Fetches signing bonus policy information from Signing Bonus subsystem.',
  })
  @ApiParam({
    name: 'policyId',
    description: 'Signing bonus policy ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Signing bonus policy details',
  })
  async getSigningBonusPolicy(@Param('policyId') policyId: string) {
    return { _id: policyId, name: 'Standard Signing Bonus', amount: 5000 };
  }

  @Post('cases/:caseId/create-employee')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create employee in Employee Profile subsystem',
    description: 'When a candidate accepts an offer, creates a new employee record in the Employee Profile subsystem. Requires employeeCode, firstName, lastName, email, and optionally phone, positionId, systemRoles, profilePictureUrl.',
  })
  @ApiParam({
    name: 'caseId',
    description: 'Onboarding case ID',
    type: String,
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        employeeCode: { type: 'string', description: 'Unique employee code', example: 'EMP001' },
        firstName: { type: 'string', description: 'Employee first name', example: 'John' },
        lastName: { type: 'string', description: 'Employee last name', example: 'Doe' },
        email: { type: 'string', description: 'Work email (unique)', example: 'john.doe@example.com' },
        phone: { type: 'string', description: 'Phone number', example: '+1234567890' },
        positionId: { type: 'string', description: 'Position ID reference', example: '507f1f77bcf86cd799439011' },
        systemRoles: { type: 'array', items: { type: 'string' }, description: 'System roles', example: ['EMPLOYEE'] },
        profilePictureUrl: { type: 'string', description: 'Profile picture URL', example: 'https://example.com/photo.jpg' },
      },
      required: ['employeeCode', 'firstName', 'lastName', 'email'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Employee created successfully',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439013',
        employeeCode: 'EMP001',
      },
    },
  })
  async createEmployee(@Param('caseId') caseId: string, @Body() body: {
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    positionId?: string;
    systemRoles?: string[];
    profilePictureUrl?: string;
  }) {
    // In a real implementation, you would call the EmployeeProfileIntegrationService
    return { _id: '507f1f77bcf86cd799439013', employeeCode: body.employeeCode };
  }

  @Get('employees/:employeeId')
  @ApiOperation({
    summary: 'Get employee details from Employee Profile',
    description: 'Fetches employee information from Employee Profile subsystem matching EmployeeProfile schema.',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee details',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        employeeCode: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        employmentStatus: 'Active',
        positionId: '507f1f77bcf86cd799439012',
        systemRoles: ['EMPLOYEE'],
        isActive: true,
      },
    },
  })
  async getEmployee(@Param('employeeId') employeeId: string) {
    // In a real implementation, you would call the EmployeeProfileIntegrationService
    return {
      _id: employeeId,
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      employmentStatus: 'Active',
      positionId: '507f1f77bcf86cd799439012',
      systemRoles: ['EMPLOYEE'],
      isActive: true,
    };
  }
}
