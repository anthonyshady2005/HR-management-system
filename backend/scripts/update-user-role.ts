/**
 * Script to update a user's role to System Admin
 * Usage: npx ts-node scripts/update-user-role.ts <email>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { EmployeeProfileSchema } from '../src/employee-profile/models/employee-profile.schema';
import { EmployeeSystemRoleSchema } from '../src/employee-profile/models/employee-system-role.schema';
import { SystemRole } from '../src/employee-profile/enums/employee-profile.enums';

dotenv.config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hr_system';

async function updateUserRole(email: string) {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get models
    const EmployeeProfileModel = mongoose.model('EmployeeProfile', EmployeeProfileSchema);
    const EmployeeSystemRoleModel = mongoose.model('EmployeeSystemRole', EmployeeSystemRoleSchema);

    // Find employee by email (check both personalEmail and workEmail, case-insensitive)
    const employee = await EmployeeProfileModel.findOne({
      $or: [
        { personalEmail: { $regex: new RegExp(`^${email}$`, 'i') } },
        { workEmail: { $regex: new RegExp(`^${email}$`, 'i') } }
      ]
    }).exec();

    if (!employee) {
      console.error(`No employee found with email: ${email}`);
      console.log('Searched in both personalEmail and workEmail fields (case-insensitive)');
      console.log('\nListing first 10 employees to help find the correct email:');
      const sampleEmployees = await EmployeeProfileModel.find({})
        .select('firstName lastName personalEmail workEmail employeeNumber')
        .limit(10)
        .lean()
        .exec();
      sampleEmployees.forEach((emp: any) => {
        console.log(`- ${emp.firstName} ${emp.lastName}: personalEmail="${emp.personalEmail}", workEmail="${emp.workEmail}"`);
      });
      process.exit(1);
    }

    console.log(`Found employee: ${employee.firstName} ${employee.lastName}`);
    console.log(`Employee ID: ${employee._id}`);
    console.log(`Employee Number: ${employee.employeeNumber}`);

    // Update or create the system role
    const result = await EmployeeSystemRoleModel.findOneAndUpdate(
      { employeeProfileId: employee._id },
      {
        $set: {
          roles: [SystemRole.SYSTEM_ADMIN],
          isActive: true,
        },
      },
      { upsert: true, new: true }
    ).exec();

    console.log('\n✅ Successfully updated user role to System Admin!');
    console.log('Updated roles:', result.roles);
    console.log('Is Active:', result.isActive);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error updating user role:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: npx ts-node scripts/update-user-role.ts <email>');
  process.exit(1);
}

updateUserRole(email);

