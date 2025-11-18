import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Schemas
import { LeaveType } from './schemas';
import { VacationPackage } from './schemas';
import { EmployeeLeaveBalance } from './schemas';
import { LeaveRequest } from './schemas';
import { ApprovalWorkflow } from './schemas';
import { HolidayCalendar } from './schemas';

// DTOs
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-type.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveRequestDto } from './dto/update-leave-request.dto';
import { CreateVacationPackageDto } from './dto/create-vacation-package.dto';
import { UpdateVacationPackageDto } from './dto/update-vacation-package.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { CreateHolidayCalendarDto } from './dto/create-holiday-calendar.dto';

@Injectable()
export class LeavesService {
  constructor(
    @InjectModel(LeaveType.name) private leaveTypeModel: Model<LeaveType>,
    @InjectModel(VacationPackage.name)
    private vacationPackageModel: Model<VacationPackage>,
    @InjectModel(EmployeeLeaveBalance.name)
    private leaveBalanceModel: Model<EmployeeLeaveBalance>,
    @InjectModel(LeaveRequest.name)
    private leaveRequestModel: Model<LeaveRequest>,
    @InjectModel(ApprovalWorkflow.name)
    private approvalWorkflowModel: Model<ApprovalWorkflow>,
    @InjectModel(HolidayCalendar.name)
    private holidayCalendarModel: Model<HolidayCalendar>,
  ) {}

  // ==================== LEAVE TYPES ====================

  async createLeaveType(dto: CreateLeaveTypeDto) {
    return this.leaveTypeModel.create(dto);
  }

  async findAllLeaveTypes(filter: any = {}) {
    return this.leaveTypeModel.find(filter).exec();
  }

  async findLeaveTypeById(id: string) {
    return this.leaveTypeModel.findById(id).exec();
  }

  async findLeaveTypeByCode(leaveTypeId: string) {
    return this.leaveTypeModel.findOne({ leaveTypeId }).exec();
  }

  async updateLeaveType(id: string, dto: UpdateLeaveTypeDto) {
    return this.leaveTypeModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async deactivateLeaveType(id: string) {
    return this.leaveTypeModel
      .findByIdAndUpdate(id, { isActive: false })
      .exec();
  }

  // ==================== LEAVE REQUESTS ====================
  private _comments: string | undefined;

  async createLeaveRequest(dto: CreateLeaveRequestDto) {
    const requestId = `LR-2025-${Date.now()}`;
    return this.leaveRequestModel.create({
      requestId,
      ...dto,
      totalDays: 5,
      status: 'pendingManagerApproval',
      submittedAt: new Date(),
    });
  }

  async findAllLeaveRequests(filter: any = {}) {
    return this.leaveRequestModel.find(filter).exec();
  }

  async findLeaveRequestById(id: string) {
    return this.leaveRequestModel.findById(id).exec();
  }

  async findLeaveRequestsByEmployee(employeeId: string) {
    return this.leaveRequestModel.find({ employeeId }).exec();
  }

  async findPendingApprovals(approverId: string) {
    return this.leaveRequestModel
      .find({ 'approvalChain.approverId': approverId })
      .exec();
  }

  async updateLeaveRequest(id: string, dto: UpdateLeaveRequestDto) {
    return this.leaveRequestModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async cancelLeaveRequest(id: string, employeeId: string, reason: string) {
    return this.leaveRequestModel
      .findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  async approveLeaveRequest(id: string, approverId: string, comments?: string) {
    this._comments = comments;
    const request = await this.leaveRequestModel.findById(id);
    const step = request?.approvalChain.find(
      (s) => s.approverId === approverId,
    );
    if (step) {
      step.action = 'approved';
      step.actionDate = new Date();
    }
    if (request) request.status = 'hrApproved';
    return request?.save();
  }

  async rejectLeaveRequest(id: string, approverId: string, comments: string) {
    this._comments = comments;
    const request = await this.leaveRequestModel.findById(id);
    const step = request?.approvalChain.find(
      (s) => s.approverId === approverId,
    );
    if (step) {
      step.action = 'rejected';
      step.actionDate = new Date();
    }
    if (request) request.status = 'rejected';
    return request?.save();
  }

  // ==================== LEAVE BALANCES ====================

  async getBalance(employeeId: string, leaveTypeId: string) {
    return this.leaveBalanceModel.findOne({ employeeId, leaveTypeId }).exec();
  }

  async getEmployeeBalances(employeeId: string) {
    return this.leaveBalanceModel.find({ employeeId }).exec();
  }

  async getBalanceHistory(employeeId: string) {
    return this.leaveBalanceModel.find({ employeeId }).exec();
  }

  async initializeBalances(employeeId: string) {
    return this.leaveBalanceModel.create({
      employeeId,
      year: 2025,
      accrued: 21,
      remaining: 21,
    });
  }

  async manualAdjustment(dto: AdjustBalanceDto) {
    return this.leaveBalanceModel
      .findOneAndUpdate(
        { employeeId: dto.employeeId, leaveTypeId: dto.leaveTypeId },
        { $inc: { manualAdjustments: dto.adjustmentDays } },
        { new: true },
      )
      .exec();
  }

  // ==================== VACATION PACKAGES ====================

  async createVacationPackage(dto: CreateVacationPackageDto) {
    return this.vacationPackageModel.create(dto);
  }

  async findAllVacationPackages() {
    return this.vacationPackageModel.find().exec();
  }

  async findVacationPackageById(id: string) {
    return this.vacationPackageModel.findById(id).exec();
  }

  async updateVacationPackage(id: string, dto: UpdateVacationPackageDto) {
    return this.vacationPackageModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async deactivateVacationPackage(id: string) {
    return this.vacationPackageModel
      .findByIdAndUpdate(id, { isActive: false })
      .exec();
  }

  // ==================== HOLIDAYS ====================

  async createHolidayCalendar(dto: CreateHolidayCalendarDto) {
    return this.holidayCalendarModel.create(dto);
  }

  async findAllHolidayCalendars(filter: any = {}) {
    return this.holidayCalendarModel.find(filter).exec();
  }

  async getCalendarByYear(year: number) {
    return this.holidayCalendarModel.findOne({ year }).exec();
  }

  async updateHolidayCalendar(id: string, dto: any) {
    return this.holidayCalendarModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  // ==================== APPROVAL WORKFLOWS ====================

  async findAllWorkflows() {
    return this.approvalWorkflowModel.find().exec();
  }

  async createWorkflow(dto: any) {
    return this.approvalWorkflowModel.create(dto);
  }
}
