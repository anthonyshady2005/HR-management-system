import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Position, PositionDocument } from './models/position.schema';
import { Department, DepartmentDocument } from './models/department.schema';
import {
  PositionAssignment,
  PositionAssignmentDocument,
} from './models/position-assignment.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import {
  HierarchyResponseDto,
  EmployeeHierarchyResponseDto,
  TeamStructureResponseDto,
  PositionNodeDto,
  EmployeeNodeDto,
} from './dto/hierarchy-response.dto';

@Injectable()
export class HierarchyViewService {
  constructor(
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(PositionAssignment.name)
    private positionAssignmentModel: Model<PositionAssignmentDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  /**
   * Get full organizational hierarchy
   */
  async getFullOrganizationalHierarchy(): Promise<HierarchyResponseDto> {
    // Get all departments (active and inactive) for management purposes
    const departments = await this.departmentModel
      .find()
      .lean()
      .exec();

    // Get all positions (active and inactive) for management purposes
    const positions = await this.positionModel
      .find()
      .populate('departmentId', 'name code')
      .lean()
      .exec();

    // Get all active position assignments
    const assignments = await this.positionAssignmentModel
      .find({ endDate: null })
      .populate('employeeProfileId', 'employeeNumber firstName lastName workEmail')
      .lean()
      .exec();

    // Build employee map by position
    const employeesByPosition = new Map<string, EmployeeNodeDto[]>();
    for (const assignment of assignments) {
      const positionId = assignment.positionId.toString();
      if (!employeesByPosition.has(positionId)) {
        employeesByPosition.set(positionId, []);
      }
      const employee = assignment.employeeProfileId as any;
      employeesByPosition.get(positionId)!.push({
        id: employee._id.toString(),
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        workEmail: employee.workEmail,
      });
    }

    // Build position map
    const positionMap = new Map<string, PositionNodeDto>();
    for (const position of positions) {
      // Skip positions with null departmentId (orphaned positions)
      if (!position.departmentId) {
        console.warn(`Position ${position._id} has null departmentId, skipping`);
        continue;
      }

      // Safely extract department ID
      const deptIdValue = position.departmentId as any;
      let departmentId: string;
      if (typeof deptIdValue === 'object' && deptIdValue !== null) {
        departmentId = deptIdValue._id?.toString() || deptIdValue.toString();
      } else {
        departmentId = String(deptIdValue);
      }

      positionMap.set(position._id.toString(), {
        id: position._id.toString(),
        title: position.title,
        code: position.code,
        description: position.description,
        departmentId: departmentId,
        reportsToPositionId: position.reportsToPositionId?.toString(),
        isActive: position.isActive,
        employees: employeesByPosition.get(position._id.toString()) || [],
        directReports: [],
      });
    }

    // Build reporting relationships
    for (const position of positions) {
      // Skip positions with null departmentId (orphaned positions)
      if (!position.departmentId) {
        continue;
      }

      const positionId = position._id.toString();
      const positionNode = positionMap.get(positionId);
      if (!positionNode) {
        continue;
      }

      if (position.reportsToPositionId) {
        const parentId = position.reportsToPositionId.toString();
        const parentNode = positionMap.get(parentId);
        if (parentNode) {
          parentNode.directReports!.push(positionNode);
        }
      }
    }

    // Build department nodes
    const departmentNodes = departments.map((dept) => {
      const deptPositions = (positions as any[])
        .filter((p) => {
          // Filter out positions with null departmentId and match department
          if (!p.departmentId) return false;
          
          // Safely extract department ID
          const deptIdValue = p.departmentId;
          let deptId: string;
          if (typeof deptIdValue === 'object' && deptIdValue !== null) {
            deptId = deptIdValue._id?.toString() || deptIdValue.toString();
          } else {
            deptId = String(deptIdValue);
          }
          
          return deptId === dept._id.toString();
        })
        .map((p) => positionMap.get(p._id.toString()))
        .filter((p): p is PositionNodeDto => !!p && !p.reportsToPositionId); // Only root positions (no parent)

      return {
        id: dept._id.toString(),
        name: dept.name,
        code: dept.code,
        description: dept.description,
        isActive: dept.isActive,
        headPositionId: dept.headPositionId?.toString(),
        positions: deptPositions,
      };
    });

    return {
      departments: departmentNodes,
      positions: Array.from(positionMap.values()),
      totalDepartments: departments.length,
      totalPositions: positions.length,
    };
  }

  /**
   * Get employee's hierarchy (their position, reporting chain, and direct reports)
   */
  async getEmployeeHierarchy(
    employeeId: string,
  ): Promise<EmployeeHierarchyResponseDto> {
    // Get employee profile
    const employee = await this.employeeProfileModel.findById(employeeId);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Get employee's current position assignment
    const assignment = await this.positionAssignmentModel
      .findOne({
        employeeProfileId: new Types.ObjectId(employeeId),
        endDate: null,
      })
      .populate('positionId')
      .lean()
      .exec();

    // If no assignment, return response with null currentPosition
    if (!assignment) {
      return {
        currentPosition: null,
        reportingChain: [],
        directReports: [],
      };
    }

    const position = assignment.positionId as any;
    
    // Check if position exists (might be null if position was deleted)
    if (!position || !position._id) {
      return {
        currentPosition: null,
        reportingChain: [],
        directReports: [],
      };
    }
    
    const positionId = position._id.toString();

    // Get current position with employees
    const currentPosition = await this.getPositionNode(positionId);

    // Build reporting chain upward
    const reportingChain: PositionNodeDto[] = [];
    let currentPosId: string | undefined = position.reportsToPositionId?.toString();
    const visited = new Set<string>();

    while (currentPosId && !visited.has(currentPosId)) {
      visited.add(currentPosId);
      const parentPosition = await this.getPositionNode(currentPosId);
      reportingChain.push(parentPosition);
      currentPosId = parentPosition.reportsToPositionId;
    }

    // Get direct reports
    const directReportsPositions = await this.positionModel
      .find({
        reportsToPositionId: new Types.ObjectId(positionId),
        isActive: true,
      })
      .lean()
      .exec();

    const directReports = await Promise.all(
      directReportsPositions.map((p) => this.getPositionNode(p._id.toString())),
    );

    return {
      currentPosition,
      reportingChain,
      directReports,
    };
  }

  /**
   * Get manager's team structure
   */
  async getManagerTeamStructure(
    managerEmployeeId: string,
  ): Promise<TeamStructureResponseDto> {
    // Get manager's employee profile
    const manager = await this.employeeProfileModel.findById(managerEmployeeId);
    if (!manager) {
      throw new NotFoundException(
        `Manager with ID ${managerEmployeeId} not found`,
      );
    }

    // Get manager's current position assignment
    const assignment = await this.positionAssignmentModel
      .findOne({
        employeeProfileId: new Types.ObjectId(managerEmployeeId),
        endDate: null,
      })
      .populate('positionId')
      .lean()
      .exec();

    if (!assignment) {
      throw new NotFoundException(
        `No active position assignment found for manager ${managerEmployeeId}`,
      );
    }

    const managerPosition = assignment.positionId as any;
    const managerPositionId = managerPosition._id.toString();

    // Get manager position node
    const managerPositionNode = await this.getPositionNode(managerPositionId);

    // Get all positions reporting to manager
    const teamPositions = await this.positionModel
      .find({
        reportsToPositionId: new Types.ObjectId(managerPositionId),
        isActive: true,
      })
      .lean()
      .exec();

    const teamPositionNodes = await Promise.all(
      teamPositions.map((p) => this.getPositionNode(p._id.toString())),
    );

    // Count total team members (employees in all team positions)
    let totalTeamMembers = 0;
    for (const teamPos of teamPositionNodes) {
      totalTeamMembers += teamPos.employees?.length || 0;
    }

    return {
      managerPosition: managerPositionNode,
      teamPositions: teamPositionNodes,
      totalTeamMembers,
    };
  }

  /**
   * Get department hierarchy
   */
  async getDepartmentHierarchy(
    departmentId: string,
  ): Promise<{ department: any; positions: PositionNodeDto[] }> {
    const department = await this.departmentModel.findById(departmentId);
    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    // Get all positions in department (include both active and inactive for management)
    // Mongoose automatically handles ObjectId conversion, so we can pass the string directly
    // But we'll also try ObjectId format to be safe
    const departmentObjectId = new Types.ObjectId(departmentId);
    
    // Query using $or to match both string and ObjectId formats
    let positions = await this.positionModel
      .find({
        $or: [
          { departmentId: departmentObjectId },
          { departmentId: departmentId },
        ],
      })
      .lean()
      .exec();
    
    // If no positions found, try fallback: get all positions and filter manually (handles edge cases)
    if (positions.length === 0) {
      console.warn(`No positions found for department ${departmentId} using standard query. Trying fallback...`);
      const allPositions = await this.positionModel.find().lean().exec();
      const matchingPositions = allPositions.filter((p: any) => {
        if (!p.departmentId) return false;
        // Handle both ObjectId and string formats
        const deptId = p.departmentId?.toString?.() || p.departmentId?._id?.toString?.() || String(p.departmentId);
        const deptIdStr = departmentId.toString();
        const deptIdObjId = departmentObjectId.toString();
        return deptId === deptIdStr || deptId === deptIdObjId;
      });
      
      if (matchingPositions.length > 0) {
        console.warn(`Found ${matchingPositions.length} positions using fallback filter`);
        positions = matchingPositions;
      }
    }

    // Build position nodes for all positions in the department
    // Use Promise.allSettled to handle individual position errors gracefully
    const positionNodeResults = await Promise.allSettled(
      positions.map((p) => this.getPositionNode(p._id.toString())),
    );
    
    const positionNodes: PositionNodeDto[] = [];
    for (const result of positionNodeResults) {
      if (result.status === 'fulfilled') {
        positionNodes.push(result.value);
      } else {
        console.error('Failed to get position node:', result.reason);
        // Continue with other positions even if one fails
      }
    }

    // Return all positions - frontend will build the tree structure
    // Each position has reportsToPositionId which the frontend uses to build hierarchy
    return {
      department: {
        id: department._id.toString(),
        name: department.name,
        code: department.code,
        description: department.description,
        isActive: department.isActive,
        headPositionId: department.headPositionId?.toString(),
      },
      positions: positionNodes, // Return all positions, not just root
    };
  }

  /**
   * Get position node with employees
   */
  private async getPositionNode(positionId: string): Promise<PositionNodeDto> {
    const position = await this.positionModel
      .findById(positionId)
      .lean()
      .exec();

    if (!position) {
      throw new NotFoundException(`Position with ID ${positionId} not found`);
    }

    // Get employees in this position
    const assignments = await this.positionAssignmentModel
      .find({
        positionId: new Types.ObjectId(positionId),
        endDate: null,
      })
      .populate('employeeProfileId', 'employeeNumber firstName lastName workEmail')
      .lean()
      .exec();

    const employees: EmployeeNodeDto[] = assignments.map((assignment) => {
      const employee = assignment.employeeProfileId as any;
      return {
        id: employee._id.toString(),
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        workEmail: employee.workEmail,
      };
    });

    // Safely handle departmentId (may be null for orphaned positions)
    let departmentId: string;
    if (!position.departmentId) {
      console.warn(`Position ${position._id} has null departmentId`);
      departmentId = ''; // Use empty string for orphaned positions
    } else {
      departmentId = position.departmentId.toString();
    }

    return {
      id: position._id.toString(),
      title: position.title,
      code: position.code,
      description: position.description,
      departmentId: departmentId,
      reportsToPositionId: position.reportsToPositionId?.toString(),
      isActive: position.isActive,
      employees,
      directReports: [],
    };
  }
}

