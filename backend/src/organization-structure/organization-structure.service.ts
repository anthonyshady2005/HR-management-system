/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { payGrade } from '../payroll-configuration/models/payGrades.schema';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ReassignPositionDto } from './dto/reassign-position.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { StructureChangeLogService } from './structure-change-log.service';
import { ChangeLogAction } from './enums/organization-structure.enums';
import { OrganizationStructureValidationService } from './validation/organization-structure-validation.service';

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
    @InjectModel(payGrade.name)
    private payGradeModel: Model<payGrade>,
    private changeLogService: StructureChangeLogService,
    private validationService: OrganizationStructureValidationService,
  ) {}

  /**
   * Resolve the reportsToPositionId for a position based on department head.
   * Returns undefined if:
   * - Department has no head position
   * - The position IS the department head (to avoid self-reference)
   */
  private async resolveDepartmentHeadForPosition(
    departmentId: Types.ObjectId | string,
    positionId?: Types.ObjectId | string,
  ): Promise<Types.ObjectId | undefined> {
    if (!departmentId) {
      return undefined;
    }

    const department = await this.departmentModel
      .findById(departmentId)
      .select('headPositionId')
      .lean()
      .exec();

    if (!department?.headPositionId) {
      return undefined;
    }

    // If this position is the department head, don't set reportsToPositionId
    if (positionId) {
      const positionObjectId =
        typeof positionId === 'string'
          ? new Types.ObjectId(positionId)
          : positionId;
      const headObjectId =
        department.headPositionId instanceof Types.ObjectId
          ? department.headPositionId
          : new Types.ObjectId(department.headPositionId);

      if (headObjectId.equals(positionObjectId)) {
        return undefined;
      }
    }

    return department.headPositionId instanceof Types.ObjectId
      ? department.headPositionId
      : new Types.ObjectId(department.headPositionId);
  }

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

  async createDepartment(
    dto: CreateDepartmentDto,
  ): Promise<DepartmentDocument> {
    // Validate department code uniqueness
    await this.validationService.validateDuplicateDepartmentCode(dto.dep_code);

    // Map DTO to Department schema
    const departmentData: Partial<Department> = {
      name: dto.dep_name,
      code: dto.dep_code,
      isActive: dto.status === 'active',
    };

    // Add headPositionId if provided
    if (dto.headPositionId) {
      // Validate that the position exists
      const position = await this.positionModel.findById(dto.headPositionId);
      if (!position) {
        throw new NotFoundException(
          `Position with ID ${dto.headPositionId} not found`,
        );
      }
      // Note: When creating, we don't validate that position belongs to this department
      // because the department doesn't exist yet. The position can be reassigned later.
      departmentData.headPositionId = new Types.ObjectId(dto.headPositionId);
    }

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

    // Validate code uniqueness if being changed
    if (dto.dep_code && dto.dep_code !== department.code) {
      await this.validationService.validateDuplicateDepartmentCode(
        dto.dep_code,
        id,
      );
    }

    // Map DTO fields to update object
    const updateData: Partial<Department> = {};
    if (dto.dep_name !== undefined) updateData.name = dto.dep_name;
    if (dto.dep_code !== undefined) updateData.code = dto.dep_code;

    // Check if department is being deactivated (changing from active to inactive)
    const isBeingDeactivated =
      dto.status !== undefined &&
      dto.status === 'inactive' &&
      department.isActive === true;

    // Debug logging
    if (dto.status !== undefined) {
      console.log(
        `Department ${id} status update: current=${department.isActive}, new=${dto.status === 'active'}, isBeingDeactivated=${isBeingDeactivated}`,
      );
    }

    if (dto.status !== undefined) updateData.isActive = dto.status === 'active';

    // Handle headPositionId update
    if (dto.headPositionId !== undefined) {
      if (dto.headPositionId === null || dto.headPositionId === '') {
        // Clear head position
        updateData.headPositionId = undefined;
      } else {
        // Validate that the position exists and belongs to this department
        const position = await this.positionModel.findById(dto.headPositionId);
        if (!position) {
          throw new NotFoundException(
            `Position with ID ${dto.headPositionId} not found`,
          );
        }
        // Optionally validate that position belongs to this department
        if (position.departmentId.toString() !== id) {
          throw new BadRequestException(
            `Position ${dto.headPositionId} does not belong to department ${id}`,
          );
        }
        updateData.headPositionId = new Types.ObjectId(dto.headPositionId);
      }
    }

    // Apply update
    const updatedDepartment = await this.departmentModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!updatedDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // If department is being deactivated, automatically deactivate all positions in it
    if (isBeingDeactivated) {
      const departmentObjectId = new Types.ObjectId(id);

      // First, try the standard query with ObjectId - only update active positions
      let updateResult = await this.positionModel.updateMany(
        {
          departmentId: departmentObjectId,
          isActive: true, // Only deactivate positions that are currently active
        },
        { isActive: false },
      );

      // If no positions were found, try with string format and manual filtering
      if (updateResult.matchedCount === 0) {
        console.warn(
          `No positions found for department ${id} using ObjectId query. Trying fallback...`,
        );
        const allPositions = await this.positionModel
          .find({ isActive: true })
          .lean()
          .exec();
        const matchingPositionIds = allPositions
          .filter((p: any) => {
            if (!p.departmentId) return false;
            const deptId =
              p.departmentId?.toString?.() ||
              p.departmentId?._id?.toString?.() ||
              String(p.departmentId);
            return deptId === id || deptId === departmentObjectId.toString();
          })
          .map((p: any) => p._id);

        if (matchingPositionIds.length > 0) {
          updateResult = await this.positionModel.updateMany(
            { _id: { $in: matchingPositionIds }, isActive: true },
            { isActive: false },
          );
          console.warn(
            `Found ${matchingPositionIds.length} positions using fallback filter`,
          );
        }
      }

      // Log that positions were deactivated
      console.log(
        `Deactivated ${updateResult.modifiedCount} position(s) in department ${id} (matched: ${updateResult.matchedCount})`,
      );

      if (updateResult.matchedCount === 0) {
        console.warn(
          `Warning: No positions found to deactivate for department ${id}. This might indicate a data consistency issue.`,
        );
      }
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
    // Validate department assignment
    await this.validationService.validateDepartmentAssignment(
      dto.departmentId,
      dto.reportsTo,
    );

    // Get department for head position check
    const department = await this.departmentModel.findById(dto.departmentId);
    if (!department) {
      throw new NotFoundException(
        `Department with ID ${dto.departmentId} not found`,
      );
    }

    // Validate position code uniqueness
    await this.validationService.validateDuplicatePositionCode(dto.code);

    // Validate position title uniqueness in department
    await this.validationService.validateDuplicatePositionTitle(
      dto.title,
      dto.departmentId,
    );

    // Determine reportsToPositionId (if not provided, assign department head)
    let reportsToPositionId: Types.ObjectId | undefined = dto.reportsTo;
    if (!reportsToPositionId && department.headPositionId) {
      reportsToPositionId = department.headPositionId;
    }

    // Validate circular reporting if reportsTo is set
    // For new positions, we check if the target position reports to anything
    // that would eventually create a cycle. Since the position doesn't exist yet,
    // we just need to ensure the target position doesn't report back to this position.
    // This is handled by the validation service checking the chain upward.

    const positionData: Partial<Position> = {
      title: dto.title,
      code: dto.code,
      departmentId: dto.departmentId,
      reportsToPositionId,
      isActive: dto.status === 'active',
    };

    // Add payGradeId if provided
    if (dto.payGradeId) {
      // Validate that the paygrade exists
      const paygrade = await this.payGradeModel.findById(dto.payGradeId);
      if (!paygrade) {
        throw new NotFoundException(
          `Pay grade with ID ${dto.payGradeId} not found`,
        );
      }
      positionData.payGradeId = new Types.ObjectId(dto.payGradeId);
    }

    // Create and save position
    const position = new this.positionModel(positionData);
    const savedPosition = await position.save();

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.CREATED,
      'Position',
      savedPosition._id,
      null,
      savedPosition.toObject() as unknown as Record<string, unknown>,
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
    const beforeSnapshot = position.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Validate department assignment if being changed
    if (dto.departmentId) {
      await this.validationService.validateDepartmentAssignment(
        dto.departmentId,
        dto.reportsTo || position.reportsToPositionId,
      );
    }

    // Validate reportsTo and check for circular references
    const newReportsTo =
      dto.reportsTo !== undefined
        ? dto.reportsTo
        : position.reportsToPositionId;

    if (newReportsTo) {
      await this.validationService.validateCircularReporting(id, newReportsTo);
    }

    // Validate code uniqueness if being changed
    if (dto.code && dto.code !== position.code) {
      await this.validationService.validateDuplicatePositionCode(dto.code, id);
    }

    // Validate title uniqueness if being changed
    const newDepartmentId = dto.departmentId || position.departmentId;
    const newTitle = dto.title || position.title;
    if (dto.title && dto.title !== position.title) {
      await this.validationService.validateDuplicatePositionTitle(
        newTitle,
        newDepartmentId,
        id,
      );
    }

    // Map DTO fields to update object
    const updateData: Partial<Position> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.code !== undefined) updateData.code = dto.code;
    if (dto.departmentId !== undefined)
      updateData.departmentId = dto.departmentId;
    if (dto.reportsTo !== undefined) {
      updateData.reportsToPositionId = dto.reportsTo;
    } else if (dto.departmentId !== undefined) {
      // If department is being changed and reportsTo is not provided,
      // automatically set reportsToPositionId to new department's head
      const newDepartmentId =
        dto.departmentId instanceof Types.ObjectId
          ? dto.departmentId
          : new Types.ObjectId(dto.departmentId);
      updateData.reportsToPositionId =
        await this.resolveDepartmentHeadForPosition(
          newDepartmentId,
          position._id,
        );
    }
    if (dto.status !== undefined) updateData.isActive = dto.status === 'active';

    // Handle payGradeId update
    if (dto.payGradeId !== undefined) {
      if (dto.payGradeId === null || dto.payGradeId === '') {
        // Clear paygrade
        updateData.payGradeId = undefined;
      } else {
        // Validate that the paygrade exists
        const paygrade = await this.payGradeModel.findById(dto.payGradeId);
        if (!paygrade) {
          throw new NotFoundException(
            `Pay grade with ID ${dto.payGradeId} not found`,
          );
        }
        updateData.payGradeId = new Types.ObjectId(dto.payGradeId);
      }
    }

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
    const afterSnapshot = updatedPosition.toObject() as unknown as Record<
      string,
      unknown
    >;

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
    const beforeSnapshot = position.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Update department and automatically set reportsToPositionId to new department's head
    const newDepartmentId =
      dto.newDepartmentId instanceof Types.ObjectId
        ? dto.newDepartmentId
        : new Types.ObjectId(dto.newDepartmentId);
    const reportsToPositionId = await this.resolveDepartmentHeadForPosition(
      newDepartmentId,
      position._id,
    );

    const updatedPosition = await this.positionModel.findByIdAndUpdate(
      id,
      {
        departmentId: newDepartmentId,
        reportsToPositionId,
      },
      { new: true },
    );

    if (!updatedPosition) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Capture after snapshot
    const afterSnapshot = updatedPosition.toObject() as unknown as Record<
      string,
      unknown
    >;

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

    // Check if position has historical assignments (BR 12)
    const allAssignments = await this.positionAssignmentModel.find({
      positionId: id,
    });

    // If position has historical assignments, use delimiting approach (BR 37)
    // End active assignments if they exist (use current date for delimiting)
    const activeAssignments = allAssignments.filter((a) => !a.endDate);
    if (activeAssignments.length > 0) {
      const endDate = new Date();
      await this.positionAssignmentModel.updateMany(
        { positionId: id, endDate: null },
        { endDate },
      );
    }

    // Capture before snapshot
    const beforeSnapshot = position.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Deactivate position (delimiting - BR 12, BR 37)
    // Store delimiting date in change log afterSnapshot
    const updatedPosition = await this.positionModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!updatedPosition) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Capture after snapshot with delimiting date
    const afterSnapshot = {
      ...updatedPosition.toObject(),
      delimitedDate: new Date().toISOString(),
      hasHistoricalAssignments: allAssignments.length > 0,
    } as unknown as Record<string, unknown>;

    // Log change with delimiting information
    await this.changeLogService.logChange(
      ChangeLogAction.DEACTIVATED,
      'Position',
      updatedPosition._id,
      beforeSnapshot,
      afterSnapshot,
    );

    return updatedPosition;
  }

  /**
   * Freeze a position (prevent new assignments, keep existing active)
   */
  async freezePosition(id: string): Promise<PositionDocument> {
    const position = await this.positionModel.findById(id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    if (!position.isActive) {
      throw new BadRequestException('Cannot freeze an inactive position');
    }

    // Store "FROZEN" status in description field (workaround since we can't modify schema)
    const beforeSnapshot = position.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Update description to include frozen status metadata
    const frozenMetadata = position.description
      ? JSON.parse(position.description || '{}')
      : {};
    frozenMetadata.status = 'FROZEN';
    frozenMetadata.frozenAt = new Date().toISOString();

    const updatedPosition = await this.positionModel.findByIdAndUpdate(
      id,
      { description: JSON.stringify(frozenMetadata) },
      { new: true },
    );

    if (!updatedPosition) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    const afterSnapshot = updatedPosition.toObject() as unknown as Record<
      string,
      unknown
    >;

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

  /**
   * Unfreeze a position
   */
  async unfreezePosition(id: string): Promise<PositionDocument> {
    const position = await this.positionModel.findById(id);
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    // Check if position is frozen
    let frozenMetadata: any = {};
    if (position.description) {
      try {
        frozenMetadata = JSON.parse(position.description);
      } catch {
        // Not JSON, ignore
      }
    }

    if (frozenMetadata.status !== 'FROZEN') {
      throw new BadRequestException('Position is not frozen');
    }

    const beforeSnapshot = position.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Remove frozen status from metadata
    delete frozenMetadata.status;
    delete frozenMetadata.frozenAt;
    const newDescription =
      Object.keys(frozenMetadata).length > 0
        ? JSON.stringify(frozenMetadata)
        : undefined;

    const updatedPosition = await this.positionModel.findByIdAndUpdate(
      id,
      { description: newDescription },
      { new: true },
    );

    if (!updatedPosition) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    const afterSnapshot = updatedPosition.toObject() as unknown as Record<
      string,
      unknown
    >;

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

  /**
   * Check if position is frozen
   */
  async isPositionFrozen(positionId: string): Promise<boolean> {
    const position = await this.positionModel
      .findById(positionId)
      .lean()
      .exec();
    if (!position || !position.description) {
      return false;
    }

    try {
      const metadata = JSON.parse(position.description);
      return metadata.status === 'FROZEN';
    } catch {
      return false;
    }
  }

  /**
   * Deactivate a department
   */
  async deactivateDepartment(id: string): Promise<DepartmentDocument> {
    const department = await this.departmentModel.findById(id);
    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Check if department is already inactive
    if (!department.isActive) {
      throw new BadRequestException('Department is already inactive');
    }

    // Capture before snapshot
    const beforeSnapshot = department.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Deactivate department
    const updatedDepartment = await this.departmentModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!updatedDepartment) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    // Automatically deactivate all positions in the department
    const departmentObjectId = new Types.ObjectId(id);

    // First, try the standard query with ObjectId - only update active positions
    let updateResult = await this.positionModel.updateMany(
      {
        departmentId: departmentObjectId,
        isActive: true, // Only deactivate positions that are currently active
      },
      { isActive: false },
    );

    // If no positions were found, try with string format and manual filtering
    if (updateResult.matchedCount === 0) {
      console.warn(
        `No positions found for department ${id} using ObjectId query. Trying fallback...`,
      );
      const allPositions = await this.positionModel
        .find({ isActive: true })
        .lean()
        .exec();
      const matchingPositionIds = allPositions
        .filter((p: any) => {
          if (!p.departmentId) return false;
          const deptId =
            p.departmentId?.toString?.() ||
            p.departmentId?._id?.toString?.() ||
            String(p.departmentId);
          return deptId === id || deptId === departmentObjectId.toString();
        })
        .map((p: any) => p._id);

      if (matchingPositionIds.length > 0) {
        updateResult = await this.positionModel.updateMany(
          { _id: { $in: matchingPositionIds }, isActive: true },
          { isActive: false },
        );
        console.warn(
          `Found ${matchingPositionIds.length} positions using fallback filter`,
        );
      }
    }

    // Log that positions were deactivated
    console.log(
      `Deactivated ${updateResult.modifiedCount} position(s) in department ${id} (matched: ${updateResult.matchedCount})`,
    );

    if (updateResult.matchedCount === 0) {
      console.warn(
        `Warning: No positions found to deactivate for department ${id}. This might indicate a data consistency issue.`,
      );
    }

    // Capture after snapshot
    const afterSnapshot = updatedDepartment.toObject() as unknown as Record<
      string,
      unknown
    >;

    // Log change
    await this.changeLogService.logChange(
      ChangeLogAction.DEACTIVATED,
      'Department',
      updatedDepartment._id,
      beforeSnapshot,
      afterSnapshot,
    );

    return updatedDepartment;
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
        assignments.map((assignment) =>
          assignment.employeeProfileId.toString(),
        ),
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
        assignments.map((assignment) =>
          assignment.employeeProfileId.toString(),
        ),
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

  /**
   * Get all active departments (for dropdowns/selects)
   */
  async getDepartments() {
    return this.departmentModel
      .find({ isActive: true })
      .select('_id name code')
      .sort({ name: 1 });
  }

  /**
   * Get all active positions (for dropdowns/selects)
   */
  async getPositions() {
    // NOTE: This endpoint is used for UI dropdowns.
    // Some environments may contain malformed references; map to a safe DTO and fall back gracefully.
    const mapToSafeDto = (positions: any[]) =>
      positions.map((p) => {
        const dept = p?.departmentId;
        return {
          _id: p._id,
          title: p.title,
          code: p.code,
          departmentId:
            dept && typeof dept === 'object' && 'toString' in dept
              ? (dept._id ?? dept)
              : dept,
          departmentName:
            dept && typeof dept === 'object' && 'name' in dept
              ? dept.name
              : undefined,
        };
      });

    try {
      const populated = await this.positionModel
        .find({ isActive: true })
        .populate('departmentId', 'name')
        .select('_id title code departmentId')
        .sort({ title: 1 })
        .lean()
        .exec();

      return mapToSafeDto(populated);
    } catch (err) {
      // Keep the API usable even if some rows are malformed.

      console.error(
        '[OrganizationStructureService.getPositions] populate failed; falling back',
        err,
      );

      const fallback = await this.positionModel
        .find({ isActive: true })
        .select('_id title code departmentId')
        .sort({ title: 1 })
        .lean()
        .exec();

      return mapToSafeDto(fallback);
    }
  }

  /**
   * Get all positions (System Admin only)
   */
  async getAllPositions(): Promise<PositionDocument[]> {
    const positions = await this.positionModel
      .find()
      .populate('departmentId', 'name code')
      .populate('reportsToPositionId', 'title code')
      .sort({ code: 1 })
      .exec();

    return positions;
  }

  /**
   * Get a single position by ID with populated references
   */
  async getPositionById(id: string): Promise<PositionDocument> {
    const position = await this.positionModel
      .findById(id)
      .populate('departmentId', 'name code')
      .populate('reportsToPositionId', 'title code')
      .exec();

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  /**
   * Get all departments (System Admin only)
   */
  async getAllDepartments(): Promise<DepartmentDocument[]> {
    return await this.departmentModel.find().exec();
  }
}
