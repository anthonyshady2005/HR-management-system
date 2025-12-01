import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeavesService } from './leaves.service';
import { LeaveType } from './models/leave-type.schema';
import { LeaveCategory } from './models/leave-category.schema';
import { LeaveRequest } from './models/leave-request.schema';
import { LeavePolicy } from './models/leave-policy.schema';
import { LeaveEntitlement } from './models/leave-entitlement.schema';
import { LeaveAdjustment } from './models/leave-adjustment.schema';
import { Calendar } from './models/calendar.schema';
import { Attachment } from './models/attachment.schema';
import { PositionAssignment } from '../organization-structure/models/position-assignment.schema';

describe('LeavesService', () => {
  let service: LeavesService;

  const mockModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeavesService,
        { provide: getModelToken(LeaveType.name), useValue: mockModel },
        { provide: getModelToken(LeaveCategory.name), useValue: mockModel },
        { provide: getModelToken(LeaveRequest.name), useValue: mockModel },
        { provide: getModelToken(LeavePolicy.name), useValue: mockModel },
        { provide: getModelToken(LeaveEntitlement.name), useValue: mockModel },
        { provide: getModelToken(LeaveAdjustment.name), useValue: mockModel },
        { provide: getModelToken(Calendar.name), useValue: mockModel },
        { provide: getModelToken(Attachment.name), useValue: mockModel },
        {
          provide: getModelToken(PositionAssignment.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<LeavesService>(LeavesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
