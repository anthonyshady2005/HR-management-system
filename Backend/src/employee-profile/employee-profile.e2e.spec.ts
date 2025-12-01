/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/**
 * EMPLOYEE PROFILE MODULE - E2E TEST SUITE
 *
 * This test suite validates all 3 requirements:
 * 1. Employee Self-Service (View, Photo Update, Request Correction)
 * 2. Department Manager View (Insight & Brief of Team)
 * 3. HR Manager/System Admin (Master Data Management & Approval)
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangeWorkflowRule } from './workflow-rule.schema';
import { EmployeeProfileModule } from './employee-profile.module';
import { AuthModule } from '../Auth/auth.module';
import {
  SystemRole,
  EmployeeStatus,
  ProfileChangeStatus,
} from './enums/employee-profile.enums';

describe('Employee Profile Module - E2E Tests', () => {
  let app: INestApplication;
  let employeeToken: string;
  let managerToken: string;
  let hrAdminToken: string;
  let employeeId: string;
  let managerId: string;
  let hrAdminId: string;
  let changeRequestId: string;
  let workflowRuleModel: Model<ChangeWorkflowRule>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(
          process.env.MONGO_URI ||
            'mongodb://localhost:27017/employee-profile-test',
        ),
        EmployeeProfileModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Access model to seed workflow rules for auto-approval tests
    workflowRuleModel = app.get<Model<ChangeWorkflowRule>>(
      getModelToken(ChangeWorkflowRule.name),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper function to setup test users
  const setupTestUsers = async () => {
    // Create and authenticate employee
    await request(app.getHttpServer()).post('/auth/register').send({
      firstName: 'John',
      lastName: 'Doe',
      personalEmail: 'john.doe@test.com',
      password: 'Test123!',
    });

    const employeeLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        personalEmail: 'john.doe@test.com',
        password: 'Test123!',
      });

    employeeToken = employeeLogin.body.token;
    employeeId = employeeLogin.body.user.id;

    // Create and authenticate manager
    await request(app.getHttpServer()).post('/auth/register').send({
      firstName: 'Manager',
      lastName: 'Smith',
      personalEmail: 'manager.smith@test.com',
      password: 'Test123!',
    });

    const managerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        personalEmail: 'manager.smith@test.com',
        password: 'Test123!',
      });

    managerToken = managerLogin.body.token;
    managerId = managerLogin.body.user.id;

    // Create and authenticate HR Admin
    await request(app.getHttpServer()).post('/auth/register').send({
      firstName: 'HR',
      lastName: 'Admin',
      personalEmail: 'hr.admin@test.com',
      password: 'Test123!',
    });

    const hrAdminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        personalEmail: 'hr.admin@test.com',
        password: 'Test123!',
      });

    hrAdminToken = hrAdminLogin.body.token;
    hrAdminId = hrAdminLogin.body.user.id;

    // Assign roles
    await request(app.getHttpServer())
      .post(`/employee-profile/${managerId}/roles`)
      .set('Authorization', `Bearer ${hrAdminToken}`)
      .send({
        roles: [SystemRole.DEPARTMENT_HEAD],
        isActive: true,
        reason: 'Test setup',
      });

    await request(app.getHttpServer())
      .post(`/employee-profile/${hrAdminId}/roles`)
      .set('Authorization', `Bearer ${hrAdminToken}`)
      .send({
        roles: [SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN],
        isActive: true,
        reason: 'Test setup',
      });
  };

  describe('REQUIREMENT 1: Employee Self-Service', () => {
    beforeAll(async () => {
      await setupTestUsers();
    });

    describe('US-E2-04: View full employee profile', () => {
      it('should allow employee to view their own profile', async () => {
        const response = await request(app.getHttpServer())
          .get('/employee-profile/me')
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('employeeNumber');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('contact');
        expect(response.body.contact).toHaveProperty('email');
        expect(response.body.contact).toHaveProperty('mobilePhone');
        expect(response.body.contact).toHaveProperty('address');
        expect(response.body).toHaveProperty('position');
        expect(response.body).toHaveProperty('department');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('lastAppraisal');
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/employee-profile/me')
          .expect(401);
      });
    });

    describe('US-E2-05 & US-E2-12: Update contact info, biography, profile picture', () => {
      it('should allow employee to update contact information', async () => {
        const response = await request(app.getHttpServer())
          .patch('/employee-profile/me')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            mobilePhone: '+1234567890',
            address: {
              city: 'New York',
              streetAddress: '123 Main St',
              country: 'USA',
            },
          })
          .expect(200);

        expect(response.body.message).toBe('Profile updated');
      });

      it('should allow employee to add biography', async () => {
        const response = await request(app.getHttpServer())
          .patch('/employee-profile/me')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            biography: 'I am a software engineer with 5 years of experience.',
          })
          .expect(200);

        expect(response.body.message).toBe('Profile updated');
      });

      it('should allow employee to upload profile picture URL', async () => {
        const response = await request(app.getHttpServer())
          .patch('/employee-profile/me')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            profilePictureUrl: 'https://example.com/profile.jpg',
          })
          .expect(200);

        expect(response.body.message).toBe('Profile updated');
      });

      it('should reject updates to non-editable fields', async () => {
        await request(app.getHttpServer())
          .patch('/employee-profile/me')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            firstName: 'Hacker',
          })
          .expect(400);
      });
    });

    describe('US-E6-02: Request corrections of data', () => {
      it('should allow employee to request governed field changes', async () => {
        const response = await request(app.getHttpServer())
          .post('/employee-profile/me/change-requests')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            fields: [
              {
                fieldName: 'primaryPositionId',
                oldValue: 'old-position-id',
                newValue: 'new-position-id',
              },
            ],
            reason: 'Transferred to new position',
          })
          .expect(201);

        expect(response.body.message).toBe('Change request submitted');
        expect(response.body.requestId).toBeDefined();
        changeRequestId = response.body.requestId;
      });

      it('should reject change requests for non-governed fields', async () => {
        await request(app.getHttpServer())
          .post('/employee-profile/me/change-requests')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            fields: [
              {
                fieldName: 'biography',
                oldValue: 'Old bio',
                newValue: 'New bio',
              },
            ],
            reason: 'Want to update bio',
          })
          .expect(400);
      });

      it('should reject empty change requests', async () => {
        await request(app.getHttpServer())
          .post('/employee-profile/me/change-requests')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            fields: [],
            reason: 'No changes',
          })
          .expect(400);
      });
    });
  });

  describe('REQUIREMENT 2: Department Manager View', () => {
    describe("US-E4-01: View team members' profiles (BR 18b, BR 41b)", () => {
      it('should allow manager to view team members', async () => {
        const response = await request(app.getHttpServer())
          .get('/employee-profile/manager/team')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('teamMembers');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.teamMembers)).toBe(true);
      });

      it('should exclude sensitive information from team member profiles', async () => {
        const response = await request(app.getHttpServer())
          .get('/employee-profile/manager/team')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(200);

        if (response.body.teamMembers.length > 0) {
          const member = response.body.teamMembers[0];
          expect(member).not.toHaveProperty('nationalId');
          expect(member).not.toHaveProperty('salary');
          expect(member).not.toHaveProperty('personalEmail');
          expect(member).not.toHaveProperty('dateOfBirth');
        }
      });

      it('should fail for non-manager roles', async () => {
        await request(app.getHttpServer())
          .get('/employee-profile/manager/team')
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(403);
      });
    });

    describe('US-E4-02: View team summary', () => {
      it('should allow manager to view team summary', async () => {
        const response = await request(app.getHttpServer())
          .get('/employee-profile/manager/team/summary')
          .set('Authorization', `Bearer ${managerToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('totalTeamMembers');
        expect(response.body).toHaveProperty('byPosition');
        expect(response.body).toHaveProperty('byDepartment');
        expect(response.body).toHaveProperty('byStatus');
        expect(Array.isArray(response.body.byPosition)).toBe(true);
        expect(Array.isArray(response.body.byDepartment)).toBe(true);
        expect(Array.isArray(response.body.byStatus)).toBe(true);
      });
    });

    describe('US-E6-03: Search employees data (HR Admin)', () => {
      it('should allow HR Admin to search employees by name', async () => {
        const response = await request(app.getHttpServer())
          .get('/employee-profile/search?name=John&page=1&limit=10')
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('employees');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.employees)).toBe(true);
      });

      it('should allow HR Admin to search by status', async () => {
        const response = await request(app.getHttpServer())
          .get(`/employee-profile/search?status=${EmployeeStatus.ACTIVE}`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        expect(response.body.employees).toBeDefined();
      });

      it('should reject search from non-HR roles', async () => {
        await request(app.getHttpServer())
          .get('/employee-profile/search?name=John')
          .set('Authorization', `Bearer ${employeeToken}`)
          .expect(403);
      });
    });
  });

  describe('REQUIREMENT 3: HR Manager/System Admin', () => {
    describe('Workflow Auto-Approval (US-E7-04, BR 36)', () => {
      it('should auto-approve change requests matching a rule', async () => {
        // Seed auto-approval rule for primaryDepartmentId-only requests
        await workflowRuleModel.create({
          fieldNames: ['primaryDepartmentId'],
          autoApprove: true,
        });

        const res = await request(app.getHttpServer())
          .post('/employee-profile/me/change-requests')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            fields: [
              {
                fieldName: 'primaryDepartmentId',
                oldValue: 'dept-old',
                newValue: 'dept-new',
              },
            ],
            reason: 'Auto-approval test',
          })
          .expect(201);

        expect(res.body.status).toBe(ProfileChangeStatus.APPROVED);
      });
    });
    describe('US-EP-04: Edit any part of employee profile (BR 20a, BR 22)', () => {
      it('should allow HR Admin to update any field', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/employee-profile/${employeeId}`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .send({
            firstName: 'UpdatedJohn',
            mobilePhone: '+9876543210',
            changeReason: 'Data correction',
          })
          .expect(200);

        expect(response.body.message).toBe(
          'Employee profile updated successfully',
        );
        expect(response.body.changedFields).toContain('firstName');
        expect(response.body.changedFields).toContain('mobilePhone');
      });

      it('should create audit log for HR updates', async () => {
        // Update profile
        await request(app.getHttpServer())
          .patch(`/employee-profile/${employeeId}`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .send({
            lastName: 'UpdatedDoe',
            changeReason: 'Name correction',
          })
          .expect(200);

        // Check audit log
        const auditResponse = await request(app.getHttpServer())
          .get(`/employee-profile/${employeeId}/audit-history`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        expect(auditResponse.body.logs).toBeDefined();
        expect(Array.isArray(auditResponse.body.logs)).toBe(true);
        const hrUpdateLog = (auditResponse.body.logs as any[]).find(
          (log: any) => log.action === 'HR_UPDATE',
        );
        expect(hrUpdateLog).toBeDefined();
      });

      it('should reject HR updates from non-HR roles', async () => {
        await request(app.getHttpServer())
          .patch(`/employee-profile/${employeeId}`)
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            firstName: 'Hacker',
          })
          .expect(403);
      });
    });

    describe('US-E2-03: Review and approve employee-submitted changes (BR 22)', () => {
      it('should allow HR Admin to get pending change requests', async () => {
        const response = await request(app.getHttpServer())
          .get('/employee-profile/change-requests/pending?page=1&limit=20')
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('requests');
        expect(response.body).toHaveProperty('pagination');
        expect(Array.isArray(response.body.requests)).toBe(true);
      });

      it('should allow HR Admin to approve a change request', async () => {
        if (!changeRequestId) {
          // Create a change request first
          const createResponse = await request(app.getHttpServer())
            .post('/employee-profile/me/change-requests')
            .set('Authorization', `Bearer ${employeeToken}`)
            .send({
              fields: [
                {
                  fieldName: 'primaryDepartmentId',
                  oldValue: 'old-dept-id',
                  newValue: 'new-dept-id',
                },
              ],
              reason: 'Department transfer',
            });
          changeRequestId = createResponse.body.requestId;
        }

        const response = await request(app.getHttpServer())
          .put(`/employee-profile/change-requests/${changeRequestId}`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .send({
            status: ProfileChangeStatus.APPROVED,
            comments: 'Approved after verification',
          })
          .expect(200);

        expect(response.body.status).toBe(ProfileChangeStatus.APPROVED);
      });

      it('should allow HR Admin to reject a change request', async () => {
        // Create another change request
        const createResponse = await request(app.getHttpServer())
          .post('/employee-profile/me/change-requests')
          .set('Authorization', `Bearer ${employeeToken}`)
          .send({
            fields: [
              {
                fieldName: 'primaryPositionId',
                oldValue: 'old-pos-id',
                newValue: 'new-pos-id',
              },
            ],
            reason: 'Position change',
          });

        const response = await request(app.getHttpServer())
          .put(
            `/employee-profile/change-requests/${createResponse.body.requestId}`,
          )
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .send({
            status: ProfileChangeStatus.REJECTED,
            comments: 'Not authorized',
          })
          .expect(200);

        expect(response.body.status).toBe(ProfileChangeStatus.REJECTED);
      });
    });

    describe('US-EP-05: Deactivate employee profile (BR 3j)', () => {
      it('should allow HR Admin to deactivate employee', async () => {
        const response = await request(app.getHttpServer())
          .post(`/employee-profile/${employeeId}/deactivate`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .send({
            status: EmployeeStatus.TERMINATED,
            reason: 'Employee resigned',
            effectiveDate: new Date().toISOString(),
          })
          .expect(201);

        expect(response.body.newStatus).toBe(EmployeeStatus.TERMINATED);
      });

      it('should create audit log for deactivation', async () => {
        const auditResponse = await request(app.getHttpServer())
          .get(`/employee-profile/${employeeId}/audit-history`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        const deactivateLog = (auditResponse.body.logs as any[]).find(
          (log: any) => log.action === 'DEACTIVATE',
        );
        expect(deactivateLog).toBeDefined();
      });
    });

    describe('US-E7-05: Assign roles and access permissions (BR 20a)', () => {
      it('should allow HR Admin to assign roles', async () => {
        const response = await request(app.getHttpServer())
          .post(`/employee-profile/${employeeId}/roles`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .send({
            roles: [SystemRole.DEPARTMENT_EMPLOYEE],
            permissions: ['view_reports'],
            isActive: true,
            reason: 'Initial role assignment',
          })
          .expect(201);

        expect(response.body.message).toBe('Roles assigned successfully');
        expect(response.body.roles).toContain(SystemRole.DEPARTMENT_EMPLOYEE);
      });

      it('should allow HR Admin to view employee roles', async () => {
        const response = await request(app.getHttpServer())
          .get(`/employee-profile/${employeeId}/roles`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('roles');
        expect(response.body).toHaveProperty('permissions');
        expect(response.body).toHaveProperty('isActive');
      });

      it('should create audit log for role assignments', async () => {
        const auditResponse = await request(app.getHttpServer())
          .get(`/employee-profile/${employeeId}/audit-history`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        const roleLog = (auditResponse.body.logs as any[]).find(
          (log: any) => log.action === 'ROLE_ASSIGNMENT',
        );
        expect(roleLog).toBeDefined();
      });
    });

    describe('BR 22: Audit Trail', () => {
      it('should maintain complete audit history', async () => {
        const response = await request(app.getHttpServer())
          .get(`/employee-profile/${employeeId}/audit-history?page=1&limit=50`)
          .set('Authorization', `Bearer ${hrAdminToken}`)
          .expect(200);

        describe('Status Access Guard: block self-service for inactive statuses', () => {
          it('should block self-view for TERMINATED employee', async () => {
            // Deactivate employee first
            await request(app.getHttpServer())
              .post(`/employee-profile/${employeeId}/deactivate`)
              .set('Authorization', `Bearer ${hrAdminToken}`)
              .send({
                status: EmployeeStatus.TERMINATED,
                reason: 'Guard test',
                effectiveDate: new Date().toISOString(),
              })
              .expect(201);

            // Attempt self-view
            await request(app.getHttpServer())
              .get('/employee-profile/me')
              .set('Authorization', `Bearer ${employeeToken}`)
              .expect(403);
          });

          it('should block self-update for SUSPENDED employee', async () => {
            // Reactivate to ACTIVE first for control
            await request(app.getHttpServer())
              .patch(`/employee-profile/${employeeId}`)
              .set('Authorization', `Bearer ${hrAdminToken}`)
              .send({
                status: EmployeeStatus.SUSPENDED,
                changeReason: 'Guard test',
              })
              .expect(200);

            // Attempt self-update
            await request(app.getHttpServer())
              .patch('/employee-profile/me')
              .set('Authorization', `Bearer ${employeeToken}`)
              .send({ biography: 'Trying to update while suspended' })
              .expect(403);
          });

          it('should allow self-service when reactivated to ACTIVE', async () => {
            await request(app.getHttpServer())
              .patch(`/employee-profile/${employeeId}`)
              .set('Authorization', `Bearer ${hrAdminToken}`)
              .send({
                status: EmployeeStatus.ACTIVE,
                changeReason: 'Reactivate',
              })
              .expect(200);

            const response = await request(app.getHttpServer())
              .patch('/employee-profile/me')
              .set('Authorization', `Bearer ${employeeToken}`)
              .send({ biography: 'Now allowed' })
              .expect(200);

            expect(response.body.message).toBe('Profile updated');
          });
        });

        expect(response.body.logs).toBeDefined();
        expect(Array.isArray(response.body.logs)).toBe(true);

        // Verify audit logs have required fields
        if (response.body.logs.length > 0) {
          const log = response.body.logs[0];
          expect(log).toHaveProperty('action');
          expect(log).toHaveProperty('performedAt');
          expect(log).toHaveProperty('performedByEmployeeId');
          expect(log).toHaveProperty('changedFields');
        }
      });
    });
  });
});
