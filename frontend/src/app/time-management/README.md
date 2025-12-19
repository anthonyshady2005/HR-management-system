# Time Management Frontend Module

This module provides a complete frontend implementation for the Time Management system, including attendance tracking, shift management, exception handling, and payroll synchronization.

## 📁 File Structure

```
time-management/
├── models/                    # TypeScript interfaces and types
│   ├── attendance.model.ts
│   ├── exception-request.model.ts
│   ├── shift.model.ts
│   ├── holiday.model.ts
│   ├── overtime.model.ts
│   └── index.ts
├── services/                   # API service classes
│   ├── attendance.service.ts
│   ├── exception-request.service.ts
│   ├── shift.service.ts
│   ├── time-management.service.ts
│   └── index.ts
├── components/                 # Reusable UI components
│   ├── attendance-table.tsx
│   ├── shift-card.tsx
│   ├── exception-form.tsx
│   ├── approval-timeline.tsx
│   ├── report-filters.tsx
│   └── index.ts
├── pages/                      # Page components
│   ├── attendance-overview/
│   ├── attendance-details/
│   ├── shift-calendar/
│   ├── exception-requests/
│   ├── exception-approval/
│   ├── overtime-summary/
│   └── payroll-sync-status/
└── page.tsx                    # Main navigation page
```

## 🎯 Features

### 1. Attendance Management
- **Attendance Overview**: View daily, weekly, and monthly attendance records
- **Attendance Details**: Detailed view of individual attendance records
- **Clock In/Out**: Employee time tracking functionality
- **Manual Corrections**: HR can manually correct attendance records

### 2. Shift Management
- **Shift Calendar**: View and manage shifts
- **Shift Assignments**: Assign shifts to employees, departments, or positions
- **Shift Types**: Configure different shift types
- **Schedule Rules**: Create custom scheduling rules

### 3. Exception Handling
- **Exception Requests**: Employees can submit exception requests
- **Exception Approval**: Managers can review and approve/reject requests
- **Approval Timeline**: Track approval history
- **Correction Requests**: Request attendance corrections

### 4. Overtime & Penalties
- **Overtime Summary**: View overtime hours by employee
- **Penalty Summary**: Track lateness and penalties
- **Overtime Rules**: Configure overtime calculation rules
- **Lateness Rules**: Configure lateness penalty rules

### 5. Payroll Integration
- **Sync Status**: Monitor synchronization with payroll module
- **Sync Logs**: View synchronization history
- **Manual Sync**: Trigger manual synchronization

## 🔌 API Integration

All services use the centralized `api` instance from `@/lib/api`, which:
- Sends requests to the backend API
- Includes credentials (cookies) for authentication
- Handles errors consistently

### Service Classes

- **AttendanceService**: Handles attendance-related API calls
- **ExceptionRequestService**: Manages exception and correction requests
- **ShiftService**: Manages shifts and shift assignments
- **TimeManagementService**: Handles holidays, overtime rules, and reports

## 🎨 UI Components

All components follow the existing design system:
- Uses shadcn/ui components (Card, Table, Button, Badge, etc.)
- Follows Tailwind CSS styling patterns
- Matches the existing color palette and typography
- Responsive design for mobile and desktop

### Key Components

1. **AttendanceTable**: Displays attendance records in a table format
2. **ShiftCard**: Card component for displaying shift information
3. **ExceptionForm**: Form for submitting exception requests
4. **ApprovalTimeline**: Visual timeline of approval history
5. **ReportFilters**: Filter component for date ranges and filters

## 📄 Pages

### Main Navigation (`/time-management`)
Dashboard-style page with navigation cards to all sub-modules.

### Sub-Pages

1. **Attendance Overview** (`/time-management/attendance-overview`)
   - Statistics dashboard
   - Attendance records table
   - Date range filtering

2. **Attendance Details** (`/time-management/attendance-details/[id]`)
   - Detailed view of a single attendance record
   - Punch history
   - Related exceptions

3. **Shift Calendar** (`/time-management/shift-calendar`)
   - Grid view of all shifts
   - Shift assignments
   - Create/edit shifts

4. **Exception Requests** (`/time-management/exception-requests`)
   - Submit new exception requests
   - View own requests
   - Track request status

5. **Exception Approval** (`/time-management/exception-approval`)
   - Pending exceptions for review
   - Approve/reject functionality
   - Approval timeline

6. **Overtime Summary** (`/time-management/overtime-summary`)
   - Overtime hours by employee
   - Penalty breakdowns
   - Export functionality

7. **Payroll Sync Status** (`/time-management/payroll-sync-status`)
   - Sync history
   - Manual sync trigger
   - Error tracking

## 🔄 Data Flow

1. **User Action** → Component triggers service method
2. **Service** → Makes API call using `api` instance
3. **Backend** → Processes request and returns data
4. **Service** → Returns data to component
5. **Component** → Updates state and re-renders UI

## 🛠️ Configuration

### Environment Variables

The API base URL is configured in `frontend/src/lib/api.ts`:
```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
```

### Authentication

All API calls include credentials (cookies) automatically via the `api` instance configuration.

## 📝 TODO / Future Enhancements

1. **Authentication Integration**: Replace placeholder user IDs with actual auth context
2. **Real-time Updates**: Add WebSocket support for live attendance updates
3. **Advanced Filtering**: Add more filter options (department, position, etc.)
4. **Bulk Operations**: Add bulk approval/rejection functionality
5. **Export Formats**: Add PDF export in addition to CSV
6. **Calendar View**: Add calendar visualization for attendance and shifts
7. **Notifications**: Add toast notifications for successful/failed operations
8. **Loading States**: Enhance loading indicators with skeletons
9. **Error Handling**: Add comprehensive error boundaries and user-friendly error messages
10. **Unit Tests**: Add comprehensive test coverage

## 🎯 Backend Integration

This frontend module integrates with the following backend endpoints:

- `/time-management/attendance/*` - Attendance operations
- `/time-management/shift-*` - Shift management
- `/time-management/time-exceptions/*` - Exception handling
- `/time-management/attendance-corrections/*` - Correction requests
- `/time-management/overtime-rules/*` - Overtime configuration
- `/time-management/lateness-rules/*` - Lateness configuration
- `/time-management/holidays/*` - Holiday management
- `/time-management/reports/*` - Report generation
- `/time-management/sync/*` - Payroll synchronization

## 📚 Usage Examples

### Using Services

```typescript
import { attendanceService } from "@/app/time-management/services";

// Get attendance records
const records = await attendanceService.getAttendanceRecords({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
});

// Clock in
await attendanceService.clockIn("employee-123");
```

### Using Components

```typescript
import { AttendanceTable } from "@/app/time-management/components";

<AttendanceTable
  records={attendanceRecords}
  onRecordClick={(record) => console.log(record)}
/>
```

## 🎨 Design System

The module follows the existing design system:
- **Colors**: Uses CSS variables from `globals.css`
- **Typography**: Follows existing font sizes and weights
- **Spacing**: Uses Tailwind spacing scale
- **Components**: Uses shadcn/ui component library
- **Icons**: Uses lucide-react icons

## ✅ Completion Status

- ✅ Models and TypeScript interfaces
- ✅ API services
- ✅ Reusable components
- ✅ Page components
- ✅ Main navigation page
- ✅ Routing structure
- ⚠️ Authentication integration (needs actual auth context)
- ⚠️ Some API endpoints may need adjustment based on actual backend response format

