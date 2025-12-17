import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RecruitmentService } from './recruitment.service';
import { Consent } from './models/consent.schema';
import { Application } from './models/application.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RecruitmentService - Consent', () => {
  let service: RecruitmentService;
  let consentModel: any;
  let applicationModel: any;

  const mockConsentModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockApplicationModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecruitmentService,
        {
          provide: getModelToken(Consent.name),
          useValue: mockConsentModel,
        },
        {
          provide: getModelToken(Application.name),
          useValue: mockApplicationModel,
        },
        // Add other required model tokens...
      ],
    }).compile();

    service = module.get<RecruitmentService>(RecruitmentService);
    consentModel = module.get(getModelToken(Consent.name));
    applicationModel = module.get(getModelToken(Application.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordConsent', () => {
    it('should create new consent record', async () => {
      const applicationId = '507f1f77bcf86cd799439011';
      const consentDto = {
        applicationId,
        consentGiven: true,
        consentType: 'DATA_PROCESSING',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      mockApplicationModel.findById.mockResolvedValue({
        _id: applicationId,
      });
      mockConsentModel.findOne.mockResolvedValue(null);
      mockConsentModel.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439012',
        ...consentDto,
        consentDate: new Date(),
      });

      const result = await service.recordConsent(applicationId, consentDto);

      expect(result.consentGiven).toBe(true);
      expect(mockConsentModel.create).toHaveBeenCalled();
    });

    it('should update existing consent record', async () => {
      const applicationId = '507f1f77bcf86cd799439011';
      const existingConsent = {
        _id: '507f1f77bcf86cd799439012',
        applicationId,
        consentGiven: false,
        save: jest.fn().mockResolvedValue({
          _id: '507f1f77bcf86cd799439012',
          consentGiven: true,
        }),
      };

      mockApplicationModel.findById.mockResolvedValue({
        _id: applicationId,
      });
      mockConsentModel.findOne.mockResolvedValue(existingConsent);

      const consentDto = {
        applicationId,
        consentGiven: true,
        consentType: 'DATA_PROCESSING',
      };

      const result = await service.recordConsent(applicationId, consentDto);

      expect(existingConsent.consentGiven).toBe(true);
      expect(existingConsent.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid application ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        service.recordConsent(invalidId, {
          applicationId: invalidId,
          consentGiven: true,
          consentType: 'DATA_PROCESSING',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if application does not exist', async () => {
      const applicationId = '507f1f77bcf86cd799439011';

      mockApplicationModel.findById.mockResolvedValue(null);

      await expect(
        service.recordConsent(applicationId, {
          applicationId,
          consentGiven: true,
          consentType: 'DATA_PROCESSING',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getConsentStatus', () => {
    it('should return consent status', async () => {
      const applicationId = '507f1f77bcf86cd799439011';
      const consent = {
        _id: '507f1f77bcf86cd799439012',
        applicationId,
        consentGiven: true,
        consentType: 'DATA_PROCESSING',
        consentDate: new Date(),
      };

      mockConsentModel.findOne.mockResolvedValue(consent);

      const result = await service.getConsentStatus(applicationId);

      expect(result).toEqual(consent);
      expect(mockConsentModel.findOne).toHaveBeenCalledWith({
        applicationId: expect.any(Object),
      });
    });

    it('should return null if no consent found', async () => {
      const applicationId = '507f1f77bcf86cd799439011';

      mockConsentModel.findOne.mockResolvedValue(null);

      const result = await service.getConsentStatus(applicationId);

      expect(result).toBeNull();
    });

    it('should throw BadRequestException for invalid application ID', async () => {
      const invalidId = 'invalid-id';

      await expect(service.getConsentStatus(invalidId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

