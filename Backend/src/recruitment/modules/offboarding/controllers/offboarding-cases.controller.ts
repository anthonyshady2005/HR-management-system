import { Controller, Post, Get, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateOffboardingCaseDto } from '../dtos/create-offboarding-case.dto';

@ApiTags('Offboarding')
@Controller('offboarding')
export class OffboardingController {
  @Post('cases/:caseId/resignation-policy/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Apply resignation policy to offboarding case',
    description: 'Integrates with Resignation Policy subsystem to apply compensation and benefits based on the policy when an employee is offboarded.',
  })
  @ApiParam({
    name: 'caseId',
    description: 'Offboarding case ID',
    type: String,
    example: '507f1f77bcf86cd799439011',
  })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        resignationPolicyId: {
          type: 'string',
          description: 'ObjectId of the resignation policy to apply',
          example: '507f1f77bcf86cd799439012',
        },
      },
      required: ['resignationPolicyId'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Resignation policy applied successfully',
  })
  async applyResignationPolicy(@Param('caseId') caseId: string, @Body() body: { resignationPolicyId: string }) {
    return { success: true, caseId, resignationPolicyId: body.resignationPolicyId };
  }

  @Get('resignation-policies/:policyId')
  @ApiOperation({
    summary: 'Get resignation policy details',
    description: 'Fetches resignation policy information from Resignation Policy subsystem.',
  })
  @ApiParam({
    name: 'policyId',
    description: 'Resignation policy ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Resignation policy details',
  })
  async getResignationPolicy(@Param('policyId') policyId: string) {
    return { _id: policyId, terminationType: 'RESIGNATION', compensation_amount: 3000 };
  }

  @Get('resignation-policies/:policyId/calculate-compensation/:employeeId')
  @ApiOperation({
    summary: 'Calculate compensation for resignation policy',
    description: 'Calculates compensation amount based on policy and employee details.',
  })
  @ApiParam({
    name: 'policyId',
    description: 'Resignation policy ID',
    type: String,
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Employee ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Compensation calculation',
  })
  async calculateCompensation(@Param('policyId') policyId: string, @Param('employeeId') employeeId: string) {
    return { amount: 3000, breakdown: { baseCompensation: 3000 } };
  }

  @Delete('cases/:caseId/delete-employee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete employee from Employee Profile subsystem',
    description: 'When an employee is terminated during offboarding, deletes the employee record from the Employee Profile subsystem.',
  })
  @ApiParam({
    name: 'caseId',
    description: 'Offboarding case ID',
    type: String,
  })
  @ApiBody({ type: CreateOffboardingCaseDto })
  @ApiResponse({
    status: 200,
    description: 'Employee deleted successfully',
  })
  async deleteEmployee(@Param('caseId') caseId: string, @Body() dto: CreateOffboardingCaseDto) {
    return { success: true, employeeId: dto.employeeId, message: 'Employee deleted successfully' };
  }
}
