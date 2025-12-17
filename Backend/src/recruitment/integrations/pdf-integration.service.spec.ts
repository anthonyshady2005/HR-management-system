import { Test, TestingModule } from '@nestjs/testing';
import { PdfIntegrationService } from './pdf-integration.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('pdfkit');

describe('PdfIntegrationService', () => {
  let service: PdfIntegrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfIntegrationService],
    }).compile();

    service = module.get<PdfIntegrationService>(PdfIntegrationService);

    // Mock fs.existsSync and fs.mkdirSync
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.createWriteStream as jest.Mock).mockReturnValue({
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          setTimeout(() => callback(), 0);
        }
        return {
          on: jest.fn(),
        };
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOfferPDF', () => {
    it('should generate offer PDF successfully', async () => {
      const offer = {
        _id: '507f1f77bcf86cd799439011',
        role: 'Software Engineer',
        grossSalary: 100000,
        signingBonus: 5000,
        benefits: ['Health Insurance', '401k'],
        startDate: new Date(),
      };

      const candidate = {
        _id: '507f1f77bcf86cd799439012',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      };

      const pdfUrl = await service.generateOfferPDF(offer, candidate);

      expect(pdfUrl).toContain('/uploads/pdfs/');
      expect(pdfUrl).toContain('offer-');
    });

    it('should handle errors during PDF generation', async () => {
      const offer = {
        _id: '507f1f77bcf86cd799439011',
        role: 'Software Engineer',
      };

      const candidate = {
        _id: '507f1f77bcf86cd799439012',
        firstName: 'John',
        lastName: 'Doe',
      };

      (fs.createWriteStream as jest.Mock).mockReturnValue({
        on: jest.fn((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Write error')), 0);
          }
          return {
            on: jest.fn(),
          };
        }),
      });

      await expect(
        service.generateOfferPDF(offer, candidate),
      ).rejects.toThrow();
    });
  });

  describe('generateContractPDF', () => {
    it('should generate contract PDF successfully', async () => {
      const contract = {
        _id: '507f1f77bcf86cd799439011',
        role: 'Software Engineer',
        grossSalary: 100000,
        signingBonus: 5000,
        acceptanceDate: new Date(),
        employeeSignedAt: new Date(),
        employerSignedAt: new Date(),
      };

      const employee = {
        _id: '507f1f77bcf86cd799439012',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        employeeNumber: 'EMP-001',
      };

      const pdfUrl = await service.generateContractPDF(contract, employee);

      expect(pdfUrl).toContain('/uploads/pdfs/');
      expect(pdfUrl).toContain('contract-');
    });
  });
});

