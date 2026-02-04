# HR Management Platform

A unified, modular HR platform that covers the full employee lifecycle and everyday HR operations in one place. The platform features a shared employee and organizational model where every module reads from and updates the same source of truth, eliminating the need to reconcile multiple systems.

## Overview

This HR platform provides a consistent, simple user interface across all modules (dashboards, lists, detail pages, and action-driven modals) so HR staff and managers learn one pattern and can complete tasks quickly and confidently.

## Architecture

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication

### Frontend
- **Framework**: Next.js 
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Core Modules

1. **Employee Profile** - Central employee data management
2. **Organizational Structure** - Company hierarchy and department management
3. **Recruitment** - Job requisitions, applications, interviews, offers, onboarding, and offboarding
4. **Time Management** - Attendance tracking, shifts, overtime, and exceptions
5. **Leaves** - Leave requests, approvals, and management
6. **Payroll**
   - **Configuration** - Pay grades, allowances, tax rules, insurance brackets
   - **Execution** - Payroll runs and processing
   - **Tracking** - Payslips, disputes, refunds, and reports
7. **Performance Management** - Performance cycles, evaluations, and appraisals
8. **Authentication & Authorization** - User authentication and role-based access control

## Key Features

- **Role-Based Access Control**: Granular permissions for different user roles
- **Consistent UI/UX**: Standardized interface patterns across all modules
- **Modular Architecture**: Each module is independently maintainable
- **RESTful API**: Well-structured backend API with proper validation

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Configure the following environment variables:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NEXT_PUBLIC_API_URL` - Backend API URL (for frontend)

## Project Structure

```
hr-main-repo/
├── backend/          # NestJS backend application
│   ├── src/
│   │   ├── Auth/     # Authentication module
│   │   ├── employee-profile/
│   │   ├── organization-structure/
│   │   ├── recruitment/
│   │   ├── time-management/
│   │   ├── leaves/
│   │   ├── payroll-configuration/
│   │   ├── payroll-execution/
│   │   ├── payroll-tracking/
│   │   └── performance/
│   └── package.json
├── frontend/         # Next.js frontend application
│   ├── src/
│   │   ├── app/      # Next.js app router pages
│   │   ├── components/
│   │   ├── lib/      # API client and utilities
│   │   └── providers/
│   └── package.json
└── README.md
```

**Deployment link:** https://edara-z7gp.onrender.com/
