/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/**
 * Employee Profile Module - Requirements Verification Tests
 *
 * This test suite verifies all 3 requirements are correctly implemented:
 * 1. Employee Self-Service (View, Photo Update, Request Correction)
 * 2. Department Manager View (Insight & Brief of Team)
 * 3. HR Manager/System Admin (Master Data Management & Approval)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeProfile } from './models/employee-profile.schema';
import { EmployeeProfileChangeRequest } from './models/ep-change-request.schema';
import { ProfileAuditLog } from './models/profile-audit-log.schema';
import { EmployeeSystemRole } from './models/employee-system-role.schema';
import { Position } from '../organization-structure/models/position.schema';
import { Department } from '../organization-structure/models/department.schema';
import { PositionAssignment } from '../organization-structure/models/position-assignment.schema';
import { AppraisalRecord } from '../performance/models/appraisal-record.schema';
import { EmployeeQualification } from './models/qualification.schema';
import { ChangeWorkflowRule } from './workflow-rule.schema';
import { Notification } from './models/notification.schema';
import { ProfileSyncService } from './profile-sync.service';
import {
  EmployeeStatus,
  ProfileChangeStatus,
  SystemRole,
} from './enums/employee-profile.enums';

// Mock data
const mockEmployeeId = new Types.ObjectId().toString();
const mockHrAdminId = new Types.ObjectId().toString();
const mockManagerId = new Types.ObjectId().toString();
const mockPositionId = new Types.ObjectId();
const mockDepartmentId = new Types.ObjectId();

const mockEmployee = {
  _id: new Types.ObjectId(mockEmployeeId),
  employeeNumber: 'EMP001',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  workEmail: 'john.doe@company.com',
  personalEmail: 'john@personal.com',
  mobilePhone: '+1234567890',
  biography: 'Software Engineer',
  profilePictureUrl: 'https://example.com/photo.jpg',
  status: EmployeeStatus.ACTIVE,
  primaryPositionId: mockPositionId,
  primaryDepartmentId: mockDepartmentId,
  supervisorPositionId: new Types.ObjectId(),
  dateOfHire: new Date('2023-01-15'),
  address: {
    city: 'New York',
    streetAddress: '123 Main St',
    country: 'USA',
  },
};

const mockManager = {
  _id: new Types.ObjectId(mockManagerId),
  employeeNumber: 'MGR001',
  firstName: 'Jane',
  lastName: 'Manager',
  fullName: 'Jane Manager',
  primaryPositionId: mockPositionId,
  primaryDepartmentId: mockDepartmentId,
};

const mockTeamMember = {
  _id: new Types.ObjectId(),
  employeeNumber: 'EMP002',
  firstName: 'Team',
  lastName: 'Member',
  fullName: 'Team Member',
  workEmail: 'team@company.com',
  status: EmployeeStatus.ACTIVE,
  primaryPositionId: new Types.ObjectId(),
  primaryDepartmentId: mockDepartmentId,
  supervisorPositionId: mockPositionId,
  dateOfHire: new Date('2023-06-01'),
};

const mockChangeRequest = {
  _id: new Types.ObjectId(),
  requestId: 'REQ-123456',
  employeeProfileId: new Types.ObjectId(mockEmployeeId),
  requestDescription: 'primaryDepartmentId: old -> new',
  fieldChanges: [
    {
      fieldName: 'primaryDepartmentId',
      oldValue: 'oldDeptId',
      newValue: 'newDeptId',
    },
  ],
  reason: 'Department transfer',
  status: ProfileChangeStatus.PENDING,
  submittedAt: new Date(),
  save: jest.fn().mockResolvedValue(true),
};

// Mock model factory
const createMockModel = (mockData: any = null) => {
  const chainable = {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockData),
  };

  return {
    findById: jest.fn().mockReturnValue(chainable),
    findOne: jest.fn().mockReturnValue({
      ...chainable,
      exec: jest.fn().mockResolvedValue(mockData),
    }),
    find: jest.fn().mockReturnValue(chainable),
    findByIdAndUpdate: jest.fn().mockReturnValue(chainable),
    findOneAndUpdate: jest.fn().mockReturnValue({
      ...chainable,
      exec: jest.fn().mockResolvedValue(mockData),
    }),
    countDocuments: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    }),
    aggregate: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue(mockData),
  };
};

describe('Employee Profile Module - Requirements Verification', () => {
  let service: EmployeeProfileService;
  let profileModel: any;
  let changeRequestModel: any;
  let auditLogModel: any;
  let systemRoleModel: any;
  let positionAssignmentModel: any;
  let positionModel: any;

  beforeEach(async () => {
    profileModel = createMockModel(mockEmployee);
    changeRequestModel = createMockModel(mockChangeRequest);
    auditLogModel = createMockModel({});
    systemRoleModel = createMockModel({
      roles: [SystemRole.HR_ADMIN],
      permissions: [],
    });

    positionAssignmentModel = createMockModel({ positionId: mockPositionId });
    positionModel = createMockModel([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeProfileService,
        {
          provide: getModelToken(EmployeeProfile.name),
          useValue: profileModel,
        },
        {
          provide: getModelToken(EmployeeProfileChangeRequest.name),
          useValue: changeRequestModel,
        },
        {
          provide: getModelToken(ProfileAuditLog.name),
          useValue: auditLogModel,
        },
        {
          provide: getModelToken(EmployeeSystemRole.name),
          useValue: systemRoleModel,
        },
        {
          provide: getModelToken(EmployeeQualification.name),
          useValue: createMockModel([]),
        },
        {
          provide: getModelToken(Position.name),
          useValue: positionModel,
        },
        {
          provide: getModelToken(Department.name),
          useValue: createMockModel({}),
        },
        {
          provide: getModelToken(PositionAssignment.name),
          useValue: positionAssignmentModel,
        },
        {
          provide: getModelToken(AppraisalRecord.name),
          useValue: createMockModel(null),
        },
        {
          provide: getModelToken(ChangeWorkflowRule.name),
          useValue: createMockModel([]),
        },
        {
          provide: getModelToken(Notification.name),
          useValue: createMockModel([]),
        },
        {
          provide: ProfileSyncService,
          useValue: {
            emitHierarchyChanged: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmployeeProfileService>(EmployeeProfileService);
  });

  // ================================================================
  // REQUIREMENT 1: Employee Self-Service
  // ================================================================
  describe('Requirement 1: Employee Self-Service', () => {
    describe('US-E2-04: View full employee profile', () => {
      it('should return employee profile with all required fields', async () => {
        const result = await service.getMyProfile(mockEmployeeId);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.employeeNumber).toBe('EMP001');
        expect(result.name).toBe('John Doe');
        expect(result.contact).toBeDefined();
        expect(result.contact.email).toBeDefined();
        expect(result.contact.mobilePhone).toBeDefined();
        expect(result.contact.address).toBeDefined();
        expect(result.biography).toBeDefined();
        expect(result.profilePictureUrl).toBeDefined();
        expect(result.position).toBeDefined();
        expect(result.department).toBeDefined();
        expect(result.status).toBeDefined();
      });

      it('should include appraisal history (BR 16)', async () => {
        const result = await service.getMyProfile(mockEmployeeId);
        // lastAppraisal field should be present (null if no appraisals)
        expect('lastAppraisal' in result).toBe(true);
      });

      it('should throw NotFoundException for invalid employee', async () => {
        profileModel.findById = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        });

        await expect(service.getMyProfile(mockEmployeeId)).rejects.toThrow(
          'Profile not found',
        );
      });
    });

    describe('US-E2-05: Update contact information', () => {
      it('should allow updating phone number', async () => {
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockEmployee, mobilePhone: '+9876543210' }),
        });

        const result = await service.updateSelfProfile(mockEmployeeId, {
          mobilePhone: '+9876543210',
        });

        expect(result.message).toBe('Profile updated');
        expect(profileModel.findByIdAndUpdate).toHaveBeenCalledWith(
          mockEmployeeId,
          expect.objectContaining({ $set: { mobilePhone: '+9876543210' } }),
          { new: true },
        );
      });

      it('should allow updating address (BR 2g)', async () => {
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });

        const result = await service.updateSelfProfile(mockEmployeeId, {
          address: {
            city: 'Boston',
            streetAddress: '456 Oak Ave',
            country: 'USA',
          },
        });

        expect(result.message).toBe('Profile updated');
      });

      it('should reject updates to non-self-editable fields (BR 20a)', async () => {
        await expect(
          service.updateSelfProfile(mockEmployeeId, {
            firstName: 'Hacker', // Not allowed
          } as any),
        ).rejects.toThrow("Field 'firstName' is not self-editable");
      });
    });

    describe('US-E2-12: Add biography and profile picture', () => {
      it('should allow updating biography', async () => {
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });

        const result = await service.updateSelfProfile(mockEmployeeId, {
          biography: 'Senior Software Engineer with 10 years experience',
        });

        expect(result.message).toBe('Profile updated');
      });

      it('should allow updating profile picture URL', async () => {
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });

        const result = await service.updateSelfProfile(mockEmployeeId, {
          profilePictureUrl: 'https://newphoto.com/me.jpg',
        });

        expect(result.message).toBe('Profile updated');
      });
    });

    describe('US-E6-02: Request corrections (job title, department)', () => {
      it('should create change request for governed fields', async () => {
        changeRequestModel.create = jest.fn().mockResolvedValue({
          requestId: 'REQ-123',
          status: ProfileChangeStatus.PENDING,
        });

        const result = await service.submitChangeRequest(mockEmployeeId, {
          fields: [
            {
              fieldName: 'primaryDepartmentId',
              oldValue: 'dept1',
              newValue: 'dept2',
            },
          ],
          reason: 'Transfer to new department',
        });

        expect(result.message).toBe('Change request submitted');
        expect(result.requestId).toBeDefined();
      });

      it('should reject change requests for non-governed fields', async () => {
        await expect(
          service.submitChangeRequest(mockEmployeeId, {
            fields: [
              { fieldName: 'firstName', oldValue: 'John', newValue: 'Jane' },
            ],
            reason: 'Name change',
          }),
        ).rejects.toThrow('cannot be changed via request');
      });

      it('should allow change requests for position updates', async () => {
        changeRequestModel.create = jest.fn().mockResolvedValue({
          requestId: 'REQ-456',
          status: ProfileChangeStatus.PENDING,
        });

        const result = await service.submitChangeRequest(mockEmployeeId, {
          fields: [
            {
              fieldName: 'primaryPositionId',
              oldValue: 'pos1',
              newValue: 'pos2',
            },
          ],
          reason: 'Promotion',
        });

        expect(result.message).toBe('Change request submitted');
      });
    });
  });

  // ================================================================
  // REQUIREMENT 2: Department Manager View
  // ================================================================
  describe('Requirement 2: Department Manager View', () => {
    beforeEach(() => {
      profileModel.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockManager),
      });

      // Manager current position assignment (org-structure)
      positionAssignmentModel.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ positionId: mockPositionId }),
      });

      // No direct-report positions via reporting lines in this unit test (fallback to supervisorPositionId)
      positionModel.find = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
    });

    describe('US-E4-01: View team members profiles (excluding sensitive info)', () => {
      it('should return team members for manager', async () => {
        profileModel.find = jest.fn().mockImplementation((filter: any) => {
          // First query: get direct-report IDs by supervisorPositionId
          if (filter?.supervisorPositionId) {
            return {
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([{ _id: mockTeamMember._id }]),
            };
          }

          // Second query: load profiles by _id list
          if (filter?._id?.$in) {
            return {
              populate: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([mockTeamMember]),
            };
          }

          return createMockModel([]).find(filter);
        });

        const result = await service.getTeamMembers(mockManagerId);

        expect(result.teamMembers).toBeDefined();
        expect(result.count).toBe(1);
      });

      it('should exclude sensitive fields (BR 18b)', async () => {
        profileModel.find = jest.fn().mockImplementation((filter: any) => {
          if (filter?.supervisorPositionId) {
            return {
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([{ _id: mockTeamMember._id }]),
            };
          }

          if (filter?._id?.$in) {
            return {
              populate: jest.fn().mockReturnThis(),
              select: jest.fn((fields: string) => {
                // Verify sensitive fields are NOT selected
                expect(fields).not.toContain('nationalId');
                expect(fields).not.toContain('personalEmail');
                expect(fields).not.toContain('dateOfBirth');
                expect(fields).not.toContain('maritalStatus');
                expect(fields).not.toContain('homePhone');
                expect(fields).not.toContain('address');
                return {
                  lean: jest.fn().mockReturnThis(),
                  exec: jest.fn().mockResolvedValue([mockTeamMember]),
                };
              }),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([mockTeamMember]),
            };
          }

          return createMockModel([]).find(filter);
        });

        await service.getTeamMembers(mockManagerId);
      });

      it('should only show direct reports (BR 41b)', async () => {
        profileModel.find = jest.fn().mockImplementation((filter: any) => {
          // Verify filter uses supervisorPositionId
          if (filter?.supervisorPositionId) {
            expect(filter.supervisorPositionId).toBeDefined();
            return {
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([{ _id: mockTeamMember._id }]),
            };
          }
          if (filter?._id?.$in) {
            return {
              populate: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([mockTeamMember]),
            };
          }
          return createMockModel([]).find(filter);
        });

        await service.getTeamMembers(mockManagerId);
      });
    });

    describe('US-E4-02: Team summary (job titles, departments)', () => {
      it('should return aggregated team summary', async () => {
        // direct reports ids query
        profileModel.find = jest.fn().mockImplementation((filter: any) => {
          if (filter?.supervisorPositionId) {
            return {
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([{ _id: mockTeamMember._id }]),
            };
          }
          if (filter?._id?.$in) {
            return {
              select: jest.fn().mockReturnThis(),
              lean: jest.fn().mockReturnThis(),
              exec: jest.fn().mockResolvedValue([
                { dateOfHire: mockTeamMember.dateOfHire, contractType: 'FULL_TIME_CONTRACT', workType: 'FULL_TIME', status: EmployeeStatus.ACTIVE },
              ]),
            };
          }
          return createMockModel([]).find(filter);
        });

        // 3 aggregates in order: byPosition, byDepartment, byStatus
        profileModel.aggregate = jest
          .fn()
          .mockResolvedValueOnce([{ _id: mockPositionId, title: 'Developer', code: 'DEV', count: 1 }])
          .mockResolvedValueOnce([{ _id: mockDepartmentId, name: 'Engineering', code: 'ENG', count: 1 }])
          .mockResolvedValueOnce([{ _id: EmployeeStatus.ACTIVE, count: 1 }]);

        const result = await service.getTeamSummary(mockManagerId);

        expect(result.totalTeamMembers).toBeDefined();
        expect(result.byPosition).toBeDefined();
        expect(result.byDepartment).toBeDefined();
        expect(result.byStatus).toBeDefined();
      });
    });

    describe('US-E6-03: HR Admin search employees', () => {
      it('should search employees by name', async () => {
        profileModel.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([mockEmployee]),
        });

        const result = await service.searchEmployees({ name: 'John' });

        expect(result.data).toBeDefined();
        expect(result.total).toBeDefined();
        expect(result.page).toBeDefined();
        expect(result.limit).toBeDefined();
      });

      it('should search by department', async () => {
        profileModel.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([mockEmployee]),
        });

        const result = await service.searchEmployees({
          departmentId: mockDepartmentId.toString(),
        });

        expect(result.data).toBeDefined();
      });

      it('should support pagination', async () => {
        profileModel.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([mockEmployee]),
        });

        const result = await service.searchEmployees({ page: 2, limit: 10 });

        expect(result.page).toBe(2);
        expect(result.limit).toBe(10);
      });
    });
  });

  // ================================================================
  // REQUIREMENT 3: HR Manager/System Admin
  // ================================================================
  describe('Requirement 3: HR Manager/System Admin', () => {
    describe('US-EP-04: Edit any part of employee profile', () => {
      it('should allow HR admin to update any field', async () => {
        profileModel.findById = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockEmployee, firstName: 'Updated' }),
        });

        const result = await service.hrUpdateEmployeeProfile(
          mockEmployeeId,
          mockHrAdminId,
          { firstName: 'Updated', changeReason: 'Legal name change' },
        );

        expect(result.message).toBe('Employee profile updated successfully');
        expect(result.changedFields).toContain('firstName');
      });

      it('should create audit log for changes (BR 22)', async () => {
        profileModel.findById = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        auditLogModel.create = jest.fn().mockResolvedValue({});

        await service.hrUpdateEmployeeProfile(mockEmployeeId, mockHrAdminId, {
          mobilePhone: '+1111111111',
        });

        expect(auditLogModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            employeeProfileId: expect.any(Types.ObjectId),
            performedByEmployeeId: expect.any(Types.ObjectId),
            action: 'HR_UPDATE',
            changedFields: expect.arrayContaining(['mobilePhone']),
          }),
        );
      });
    });

    describe('US-E2-03: Review and approve profile changes', () => {
      it('should list pending change requests', async () => {
        changeRequestModel.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([mockChangeRequest]),
        });

        const result = await service.getPendingChangeRequests();

        expect(result.requests).toBeDefined();
        expect(result.pagination).toBeDefined();
      });

      it('should approve change request and apply changes', async () => {
        const oldDeptId = new Types.ObjectId();
        const newDeptId = new Types.ObjectId();
        const saveMock = jest.fn().mockResolvedValue(true);
        changeRequestModel.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockChangeRequest,
            fieldChanges: [
              {
                fieldName: 'primaryDepartmentId',
                oldValue: oldDeptId.toString(),
                newValue: newDeptId.toString(),
              },
            ],
            save: saveMock,
          }),
        });
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });

        const result = await service.processChangeRequest(
          'REQ-123456',
          mockHrAdminId,
          { status: ProfileChangeStatus.APPROVED, comments: 'Approved' },
        );

        expect(result.status).toBe(ProfileChangeStatus.APPROVED);
        expect(saveMock).toHaveBeenCalled();
      });

      it('should reject change request without applying changes', async () => {
        const saveMock = jest.fn().mockResolvedValue(true);
        changeRequestModel.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockChangeRequest,
            fieldChanges: [],
            save: saveMock,
          }),
        });

        const result = await service.processChangeRequest(
          'REQ-123456',
          mockHrAdminId,
          { status: ProfileChangeStatus.REJECTED, comments: 'Not justified' },
        );

        expect(result.status).toBe(ProfileChangeStatus.REJECTED);
      });
    });

    describe('US-EP-05: Deactivate employee profile', () => {
      it('should deactivate employee on termination', async () => {
        profileModel.findById = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockEmployee,
            status: EmployeeStatus.TERMINATED,
          }),
        });

        const result = await service.deactivateEmployee(
          mockEmployeeId,
          mockHrAdminId,
          {
            status: EmployeeStatus.TERMINATED,
            reason: 'Voluntary resignation',
          },
        );

        expect(result.newStatus).toBe(EmployeeStatus.TERMINATED);
        expect(result.previousStatus).toBe(EmployeeStatus.ACTIVE);
      });

      it('should support retirement status (BR 3j)', async () => {
        profileModel.findById = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockEmployee,
            status: EmployeeStatus.RETIRED,
          }),
        });

        const result = await service.deactivateEmployee(
          mockEmployeeId,
          mockHrAdminId,
          { status: EmployeeStatus.RETIRED, reason: 'Retirement' },
        );

        expect(result.newStatus).toBe(EmployeeStatus.RETIRED);
      });

      it('should set effective date for status change', async () => {
        const effectiveDate = new Date('2025-12-31');
        profileModel.findById = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });

        const result = await service.deactivateEmployee(
          mockEmployeeId,
          mockHrAdminId,
          {
            status: EmployeeStatus.INACTIVE,
            reason: 'Leave of absence',
            effectiveDate,
          },
        );

        expect(result.effectiveDate).toEqual(effectiveDate);
      });
    });

    describe('US-E7-05: Assign roles and permissions', () => {
      it('should assign roles to employee (BR 20a)', async () => {
        profileModel.findById = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        systemRoleModel.findOne = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(null),
        });
        systemRoleModel.findOneAndUpdate = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            roles: [SystemRole.HR_EMPLOYEE],
            permissions: ['view_reports'],
          }),
        });

        const result = await service.assignRoles(
          mockEmployeeId,
          mockHrAdminId,
          {
            roles: [SystemRole.HR_EMPLOYEE],
            permissions: ['view_reports'],
          },
        );

        expect(result.roles).toContain(SystemRole.HR_EMPLOYEE);
        expect(result.permissions).toContain('view_reports');
      });

      it('should create audit log for role changes', async () => {
        profileModel.findById = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });
        systemRoleModel.findOne = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest
            .fn()
            .mockResolvedValue({ roles: [SystemRole.DEPARTMENT_EMPLOYEE] }),
        });
        systemRoleModel.findOneAndUpdate = jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ roles: [SystemRole.DEPARTMENT_HEAD] }),
        });
        auditLogModel.create = jest.fn().mockResolvedValue({});

        await service.assignRoles(mockEmployeeId, mockHrAdminId, {
          roles: [SystemRole.DEPARTMENT_HEAD],
          reason: 'Promotion to manager',
        });

        expect(auditLogModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            action: 'ROLE_ASSIGNMENT',
          }),
        );
      });
    });

    describe('BR 22: Audit Trail', () => {
      it('should retrieve audit history for employee', async () => {
        auditLogModel.find = jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockReturnThis(),
          skip: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue([
            {
              action: 'HR_UPDATE',
              changedFields: ['firstName'],
              performedAt: new Date(),
            },
          ]),
        });
        auditLogModel.countDocuments = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(1),
        });

        const result = await service.getAuditHistory(mockEmployeeId);

        expect(result.logs).toBeDefined();
        expect(result.logs.length).toBeGreaterThan(0);
        expect(result.pagination).toBeDefined();
      });
    });
  });

  // ================================================================
  // BUSINESS RULES VERIFICATION
  // ================================================================
  describe('Business Rules Verification', () => {
    describe('BR 2g, 2n, 2o: Address, Phone, Email requirements', () => {
      it('should store address with city, street, country', async () => {
        profileModel.findByIdAndUpdate = jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue(mockEmployee),
        });

        await service.updateSelfProfile(mockEmployeeId, {
          address: {
            city: 'Los Angeles',
            streetAddress: '789 Palm Dr',
            country: 'USA',
          },
        });

        expect(profileModel.findByIdAndUpdate).toHaveBeenCalledWith(
          mockEmployeeId,
          expect.objectContaining({
            $set: expect.objectContaining({
              address: expect.objectContaining({
                city: 'Los Angeles',
                streetAddress: '789 Palm Dr',
                country: 'USA',
              }),
            }),
          }),
          expect.any(Object),
        );
      });
    });

    describe('BR 3j: Employee status for access control', () => {
      it('should support all required statuses', () => {
        const requiredStatuses = [
          EmployeeStatus.ACTIVE,
          EmployeeStatus.INACTIVE,
          EmployeeStatus.SUSPENDED,
          EmployeeStatus.TERMINATED,
          EmployeeStatus.RETIRED,
        ];

        requiredStatuses.forEach((status) => {
          expect(Object.values(EmployeeStatus)).toContain(status);
        });
      });
    });

    describe('BR 20a: Authorization checks', () => {
      it('should validate employee ID before operations', async () => {
        await expect(service.getMyProfile('invalid-id')).rejects.toThrow(
          'Invalid employee id',
        );
      });

      it('should validate HR admin ID before sensitive operations', async () => {
        await expect(
          service.hrUpdateEmployeeProfile(mockEmployeeId, 'invalid-id', {
            firstName: 'Test',
          }),
        ).rejects.toThrow('Invalid HR admin id');
      });
    });
  });
});
