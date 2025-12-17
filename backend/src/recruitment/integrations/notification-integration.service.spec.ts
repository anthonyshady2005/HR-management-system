import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationIntegrationService } from './notification-integration.service';
import { NotificationLog } from '../../time-management/models/notification-log.schema';

describe('NotificationIntegrationService', () => {
  let service: NotificationIntegrationService;
  let notificationModel: any;

  const mockNotificationModel = {
    create: jest.fn(),
    insertMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationIntegrationService,
        {
          provide: getModelToken(NotificationLog.name),
          useValue: mockNotificationModel,
        },
      ],
    }).compile();

    service = module.get<NotificationIntegrationService>(
      NotificationIntegrationService,
    );
    notificationModel = module.get(getModelToken(NotificationLog.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyApplicationStatusUpdate', () => {
    it('should send notification for application status update', async () => {
      const candidateId = '507f1f77bcf86cd799439011';
      const applicationId = '507f1f77bcf86cd799439012';
      const status = 'IN_PROCESS';
      const stage = 'DEPARTMENT_INTERVIEW';

      mockNotificationModel.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439013',
        to: candidateId,
        type: 'APPLICATION_STATUS_UPDATE',
        message: expect.stringContaining(status),
      });

      await service.notifyApplicationStatusUpdate(
        candidateId,
        applicationId,
        status,
        stage,
      );

      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        to: expect.any(Object),
        type: 'APPLICATION_STATUS_UPDATE',
        message: expect.stringContaining(status),
      });
    });

    it('should handle errors gracefully', async () => {
      const candidateId = '507f1f77bcf86cd799439011';
      const applicationId = '507f1f77bcf86cd799439012';

      mockNotificationModel.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.notifyApplicationStatusUpdate(
          candidateId,
          applicationId,
          'REJECTED',
          'SCREENING',
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('notifyRejection', () => {
    it('should send rejection notification', async () => {
      const candidateId = '507f1f77bcf86cd799439011';
      const applicationId = '507f1f77bcf86cd799439012';
      const reason = 'Does not meet requirements';

      mockNotificationModel.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439013',
        to: candidateId,
        type: 'APPLICATION_REJECTED',
        message: expect.stringContaining(reason),
      });

      await service.notifyRejection(candidateId, applicationId, reason);

      expect(mockNotificationModel.create).toHaveBeenCalledWith({
        to: expect.any(Object),
        type: 'APPLICATION_REJECTED',
        message: expect.stringContaining(reason),
      });
    });
  });

  describe('notifyPanelMembers', () => {
    it('should send notifications to all panel members', async () => {
      const panelMemberIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      const interviewId = '507f1f77bcf86cd799439013';
      const scheduledDate = new Date();
      const candidateName = 'John Doe';

      mockNotificationModel.insertMany.mockResolvedValue([
        { _id: '507f1f77bcf86cd799439014' },
        { _id: '507f1f77bcf86cd799439015' },
      ]);

      await service.notifyPanelMembers(
        panelMemberIds,
        interviewId,
        scheduledDate,
        candidateName,
      );

      expect(mockNotificationModel.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INTERVIEW_PANEL_INVITE',
            message: expect.stringContaining(candidateName),
          }),
        ]),
      );
      expect(mockNotificationModel.insertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'INTERVIEW_PANEL_INVITE',
          }),
        ]),
      );
    });
  });
});

