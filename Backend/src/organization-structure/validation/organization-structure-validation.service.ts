import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position, PositionDocument } from '../models/position.schema';
import { Department, DepartmentDocument } from '../models/department.schema';

@Injectable()
export class OrganizationStructureValidationService {
  constructor(
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Validates that setting a reporting relationship doesn't create a circular reference
   * @param positionId - The position being updated
   * @param reportsToPositionId - The position it will report to
   * @throws BadRequestException if circular reference detected
   */
  async validateCircularReporting(
    positionId: string,
    reportsToPositionId: Types.ObjectId | string,
  ): Promise<void> {
    if (!reportsToPositionId) {
      return; // No reporting relationship, no circular reference possible
    }

    const targetPositionId = new Types.ObjectId(reportsToPositionId);
    const currentPositionId = new Types.ObjectId(positionId);

    // If trying to report to itself
    if (targetPositionId.equals(currentPositionId)) {
      throw new BadRequestException(
        'A position cannot report to itself (circular reference)',
      );
    }

    // Traverse the reporting chain from the target position upward
    // to see if we eventually reach the current position
    const visited = new Set<string>();
    let currentCheckId: Types.ObjectId | null = targetPositionId;

    while (currentCheckId) {
      // Check if we've seen this position before (cycle detection)
      const idString = currentCheckId.toString();
      if (visited.has(idString)) {
        throw new BadRequestException(
          'Circular reference detected in reporting chain',
        );
      }
      visited.add(idString);

      // If we reach the position being updated, it's a circular reference
      if (currentCheckId.equals(currentPositionId)) {
        throw new BadRequestException(
          'Circular reference detected: This would create a reporting loop',
        );
      }

      // Get the next position in the chain
      const position = await this.positionModel
        .findById(currentCheckId)
        .select('reportsToPositionId')
        .lean()
        .exec();

      if (!position || !position.reportsToPositionId) {
        break; // Reached the top of the chain
      }

      currentCheckId = new Types.ObjectId(position.reportsToPositionId);
    }
  }

  /**
   * Validates that a position code doesn't already exist
   * @param code - The position code to check
   * @param excludePositionId - Optional position ID to exclude from check (for updates)
   * @throws ConflictException if duplicate found
   */
  async validateDuplicatePositionCode(
    code: string,
    excludePositionId?: string,
  ): Promise<void> {
    const query: any = { code };
    if (excludePositionId) {
      query._id = { $ne: new Types.ObjectId(excludePositionId) };
    }

    const existing = await this.positionModel.findOne(query).lean().exec();
    if (existing) {
      throw new ConflictException(
        `Position with code "${code}" already exists`,
      );
    }
  }

  /**
   * Validates that a position title doesn't already exist in the same department
   * @param title - The position title to check
   * @param departmentId - The department ID
   * @param excludePositionId - Optional position ID to exclude from check (for updates)
   * @throws ConflictException if duplicate found
   */
  async validateDuplicatePositionTitle(
    title: string,
    departmentId: Types.ObjectId | string,
    excludePositionId?: string,
  ): Promise<void> {
    const query: any = {
      title: { $regex: new RegExp(`^${title}$`, 'i') }, // Case-insensitive
      departmentId: new Types.ObjectId(departmentId),
    };
    if (excludePositionId) {
      query._id = { $ne: new Types.ObjectId(excludePositionId) };
    }

    const existing = await this.positionModel.findOne(query).lean().exec();
    if (existing) {
      throw new ConflictException(
        `Position with title "${title}" already exists in this department`,
      );
    }
  }

  /**
   * Validates that a department assignment is valid
   * - Department exists and is active
   * - If reporting to another position, that position's department matches (if applicable)
   * @param departmentId - The department ID to validate
   * @param reportsToPositionId - Optional reporting position ID
   * @throws BadRequestException if validation fails
   */
  async validateDepartmentAssignment(
    departmentId: Types.ObjectId | string,
    reportsToPositionId?: Types.ObjectId | string,
  ): Promise<void> {
    const deptId = new Types.ObjectId(departmentId);
    const department = await this.departmentModel.findById(deptId).lean().exec();

    if (!department) {
      throw new BadRequestException(
        `Department with ID ${departmentId} not found`,
      );
    }

    if (!department.isActive) {
      throw new BadRequestException(
        `Department with ID ${departmentId} is not active`,
      );
    }

    // If reporting to another position, validate that position exists and is active
    if (reportsToPositionId) {
      const reportsToId = new Types.ObjectId(reportsToPositionId);
      const reportsToPosition = await this.positionModel
        .findById(reportsToId)
        .lean()
        .exec();

      if (!reportsToPosition) {
        throw new BadRequestException(
          `Reporting position with ID ${reportsToPositionId} not found`,
        );
      }

      if (!reportsToPosition.isActive) {
        throw new BadRequestException(
          `Reporting position with ID ${reportsToPositionId} is not active`,
        );
      }

      // Note: We don't enforce that reporting position must be in same department
      // as this is a business rule that may vary. Cross-department reporting is allowed.
    }
  }

  /**
   * Validates that a department code doesn't already exist
   * @param code - The department code to check
   * @param excludeDepartmentId - Optional department ID to exclude from check (for updates)
   * @throws ConflictException if duplicate found
   */
  async validateDuplicateDepartmentCode(
    code: string,
    excludeDepartmentId?: string,
  ): Promise<void> {
    const query: any = { code };
    if (excludeDepartmentId) {
      query._id = { $ne: new Types.ObjectId(excludeDepartmentId) };
    }

    const existing = await this.departmentModel.findOne(query).lean().exec();
    if (existing) {
      throw new ConflictException(
        `Department with code "${code}" already exists`,
      );
    }
  }
}

