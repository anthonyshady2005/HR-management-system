import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './models/department.schema';
import { Position, PositionDocument } from './models/position.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from './models/position-assignment.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ReassignPositionDto } from './dto/reassign-position.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { StructureChangeLogService } from './structure-change-log.service';
import { ChangeLogAction } from './enums/organization-structure.enums';

@Injectable()
export class OrganizationStructureService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(PositionAssignment.name)
    private positionAssignmentModel: Model<PositionAssignmentDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    private changeLogService: StructureChangeLogService,
  ) {}

  // commented out lel next phase, or for this one later idk

//   private notifyEmployeeProfileSubsystem(
//     positionId: Types.ObjectId,
//     action: string,
//   ): void {
//     // Placeholder for future implementation
//     // This will notify the Employee Profile subsystem of structural changes
//     console.log(
//       `[Placeholder] Notifying Employee Profile subsystem: Position ${positionId} - ${action}`,
//     );
//   }

  async createDepartment(dto: CreateDepartmentDto): Promise<DepartmentDocument> {
    // Check if department code already exists
    const existingDepartment = await this.departmentModel.findOne({
      code: dto.dep_code,
    });
    if (existingDepartment) {
      throw new ConflictException(
        `Department with code ${dto.dep_code} already exists`,
      );
    }

    // Map DTO to Department schema
    const departmentData: Partial<Department> = {
      name: dto.dep_name,
      code: dto.dep_code,
      isActive: dto.status === 'active',
    };

    // Create department
    const department = new this.departmentModel(departmentData);
    const savedDepartment = await department.save();

    // Capture after snapshot
    const afterSnapshot = savedDepartment.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.CREATED,
      'Department',
      savedDepartment._id,
      null,
      afterSnapshot,
    );

    return savedDepartment;
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentDocument> {
    // Find department
    const department = await this.departmentModel.findById(id);
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Capture before snapshot
    const beforeSnapshot = department.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Check code uniqueness if being changed
    if (dto.dep_code && dto.dep_code !== department.code) {
      const existingDepartment = await this.departmentModel.findOne({
        code: dto.dep_code,
      });
      if (existingDepartment) {
        throw new ConflictException(
          `Department with code ${dto.dep_code} already exists`,
        );
      }
    }

    // Map DTO fields to update object
    const updateData: Partial<Department> = {};
    if (dto.dep_name !== undefined) updateData.name = dto.dep_name;
    if (dto.dep_code !== undefined) updateData.code = dto.dep_code;
    if (dto.status !== undefined)
      updateData.isActive = dto.status === 'active';

    // Apply update
    const updatedDepartment = await this.departmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Capture after snapshot
    const afterSnapshot = updatedDepartment.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.UPDATED,
      'Department',
      updatedDepartment._id,
      beforeSnapshot,
      afterSnapshot,
    );

    return updatedDepartment;
  }

  async createPosition(dto: CreatePositionDto): Promise<PositionDocument> {
    // Validate department exists and is active
    const department = await this.departmentModel.findById(dto.departmentId);
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${dto.departmentId} not found`,
      );
    }
    if (!department.isActive) {
      throw new BadRequestException(
        `Department with ID ${dto.departmentId} is not active`,
      );
    }

    // Validate reportsTo position if provided
    if (dto.reportsTo) {
      const reportsToPosition = await this.positionModel.findById(
        dto.reportsTo,
      );
      if (!reportsToPosition) {
        throw new NotFoundException(
          `Position with ID ${dto.reportsTo} not found`,
        );
      }
      if (!reportsToPosition.isActive) {
        throw new BadRequestException(
          `Position with ID ${dto.reportsTo} is not active`,
        );
      }
    }

    // Check if position code already exists
    const existingPosition = await this.positionModel.findOne({
      code: dto.code,
    });
    if (existingPosition) {
      throw new ConflictException(`Position with code ${dto.code} already exists`);
    }

    // Map DTO to Position schema
    const positionData: Partial<Position> = {
      title: dto.title,
      code: dto.code,
      departmentId: dto.departmentId,
      reportsToPositionId: dto.reportsTo,
      isActive: dto.status === 'active',
    };

    // Create position (pre-save hook will auto-set reportsToPositionId if not provided)
    const position = new this.positionModel(positionData);
    const savedPosition = await position.save();

    // Capture after snapshot
    const afterSnapshot = savedPosition.toObject() as unknown as Record<string, unknown>;

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.CREATED,
      'Position',
      savedPosition._id,
      null,
      afterSnapshot,
    );

    return savedPosition;
  }

  async updatePosition(
    id: string,
    dto: UpdatePositionDto,
  ): Promise<PositionDocument> {
    // Find position
    const position = await this.positionModel.findById(id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Capture before snapshot
    const beforeSnapshot = position.toObject() as unknown as Record<string, unknown>;

    // Validate department if being changed
    if (dto.departmentId) {
      const department = await this.departmentModel.findById(dto.departmentId);
      if (!department) {
        throw new NotFoundException(
          `Department with ID ${dto.departmentId} not found`,
        );
      }
      if (!department.isActive) {
        throw new BadRequestException(
          `Department with ID ${dto.departmentId} is not active`,
        );
      }
    }

    // Validate reportsTo position if being changed
    if (dto.reportsTo) {
      const reportsToPosition = await this.positionModel.findById(
        dto.reportsTo,
      );
      if (!reportsToPosition) {
        throw new NotFoundException(
          `Position with ID ${dto.reportsTo} not found`,
        );
      }
      if (!reportsToPosition.isActive) {
        throw new BadRequestException(
          `Position with ID ${dto.reportsTo} is not active`,
        );
      }
    }

    // Check code uniqueness if being changed
    if (dto.code && dto.code !== position.code) {
      const existingPosition = await this.positionModel.findOne({
        code: dto.code,
      });
      if (existingPosition) {
        throw new ConflictException(`Position with code ${dto.code} already exists`);
      }
    }

    // Map DTO fields to update object
    const updateData: Partial<Position> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.departmentId !== undefined)
      updateData.departmentId = dto.departmentId;
    if (dto.reportsTo !== undefined)
      updateData.reportsToPositionId = dto.reportsTo;
    if (dto.status !== undefined)
      updateData.isActive = dto.status === 'active';

    // Apply update
    const updatedPosition = await this.positionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedPosition) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Capture after snapshot
    const afterSnapshot = updatedPosition.toObject() as unknown as Record<string, unknown>;

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.UPDATED,
      'Position',
      updatedPosition._id,
      beforeSnapshot,
      afterSnapshot,
    );

    return updatedPosition;
  }

  async reassignPosition(
    id: string,
    dto: ReassignPositionDto,
  ): Promise<PositionDocument> {
    // Find position
    const position = await this.positionModel.findById(id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Validate new department exists and is active
    const newDepartment = await this.departmentModel.findById(
      dto.newDepartmentId,
    );
    if (!newDepartment) {
      throw new NotFoundException(
        `Department with ID ${dto.newDepartmentId} not found`,
      );
    }
    if (!newDepartment.isActive) {
      throw new BadRequestException(
        `Department with ID ${dto.newDepartmentId} is not active`,
      );
    }

    // Capture before snapshot
    const beforeSnapshot = position.toObject() as unknown as Record<string, unknown>;

    // Update department (pre-save hook will auto-update reportsToPositionId)
    const updatedPosition = await this.positionModel.findByIdAndUpdate(
      id,
      { departmentId: dto.newDepartmentId },
      { new: true },
    );

    if (!updatedPosition) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Capture after snapshot
    const afterSnapshot = updatedPosition.toObject() as unknown as Record<string, unknown>;

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.REASSIGNED,
      'Position',
      updatedPosition._id,
      beforeSnapshot,
      afterSnapshot,
    );

    // Trigger synchronization placeholder
    // commented out lel next phase, or for this one later idk
    // this.notifyEmployeeProfileSubsystem(updatedPosition._id, 'reassigned');

    return updatedPosition;
  }

  async deactivatePosition(id: string): Promise<PositionDocument> {
    // Find position
    const position = await this.positionModel.findById(id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Check if position has active assignments
    const activeAssignments = await this.positionAssignmentModel.find({
      positionId: id,
      endDate: null,
    });

    // End active assignments if they exist (use current date immediately)
    if (activeAssignments.length > 0) {
      const endDate = new Date();
      await this.positionAssignmentModel.updateMany(
        { positionId: id, endDate: null },
        { endDate },
      );
    }

    // Capture before snapshot
    const beforeSnapshot = position.toObject() as unknown as Record<string, unknown>;

    // Deactivate position
    const updatedPosition = await this.positionModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!updatedPosition) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Capture after snapshot
    const afterSnapshot = updatedPosition.toObject() as unknown as Record<string, unknown>;

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.DEACTIVATED,
      'Position',
      updatedPosition._id,
      beforeSnapshot,
      afterSnapshot,
    );

    return updatedPosition;
  }

  async getEmployeesByDepartment(
    departmentId: string,
  ): Promise<EmployeeProfileDocument[]> {
    // Validate department exists
    const department = await this.departmentModel.findById(departmentId);
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${departmentId} not found`,
      );
    }

    // Find all active position assignments for this department
    const assignments = await this.positionAssignmentModel
      .find({
        departmentId: new Types.ObjectId(departmentId),
        endDate: null, // Only active assignments
      })
      .select('employeeProfileId')
      .lean()
      .exec();

    // Extract unique employee profile IDs
    const employeeIds = [
      ...new Set(
        assignments.map((assignment) => assignment.employeeProfileId.toString()),
      ),
    ].map((id) => new Types.ObjectId(id));

    // Get employee profiles
    const employees = await this.employeeProfileModel
      .find({
        _id: { $in: employeeIds },
      })
      .exec();

    return employees;
  }

  async getEmployeesByPosition(
    positionId: string,
  ): Promise<EmployeeProfileDocument[]> {
    // Validate position exists
    const position = await this.positionModel.findById(positionId);
    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    // Find all active position assignments for this position
    const assignments = await this.positionAssignmentModel
      .find({
        positionId: new Types.ObjectId(positionId),
        endDate: null, // Only active assignments
      })
      .select('employeeProfileId')
      .lean()
      .exec();

    // Extract unique employee profile IDs
    const employeeIds = [
      ...new Set(
        assignments.map((assignment) => assignment.employeeProfileId.toString()),
      ),
    ].map((id) => new Types.ObjectId(id));

    // Get employee profiles
    const employees = await this.employeeProfileModel
      .find({
        _id: { $in: employeeIds },
      })
      .exec();

    return employees;
  }
}
