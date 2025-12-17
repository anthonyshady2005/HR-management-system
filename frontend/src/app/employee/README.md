# Employee Profile Module - Frontend Implementation

## Overview
Complete frontend implementation of the Employee Profile management system with role-based access control, change request workflows, and comprehensive profile management.

## Directory Structure

```
frontend/src/app/employee/
├── api.ts                      # API client functions (15 endpoints)
├── types.ts                    # TypeScript types and enums
├── layout.tsx                  # Employee module layout with sub-navigation
├── page.tsx                    # Main router (redirects by role)
├── profile/
│   └── page.tsx               # Employee Self-Service Profile
├── team/
│   └── page.tsx               # Department Manager Team View
├── directory/
│   └── page.tsx               # HR Directory and Search
├── requests/
│   └── page.tsx               # HR Change Request Management
├── [id]/
│   └── page.tsx               # HR Admin Profile Management
└── components/
    ├── StatusBadge.tsx        # Status indicator component
    ├── ProfileCard.tsx        # Employee card display
    ├── ChangeRequestDialog.tsx # Change request submission
    └── index.ts               # Component exports
```

## Features Implemented

### 1. Employee Self-Service (`/employee/profile`)
**Accessible to:** All authenticated employees

**Features:**
- View complete profile with populated position, department, pay grade
- Display performance appraisal summary
- Edit self-service fields (immediate update):
  - Mobile phone (with regex validation)
  - Personal email (with email validation)
  - Address (city, street, country)
  - Biography
  - Profile picture URL
- Submit change requests for governed fields
- Auto-approval feedback for eligible requests
- Read-only view of employment details

**Validations:**
- Phone: `/^\+?[0-9\s\-()]{7,20}$/`
- Email: Standard email format
- All changes create audit logs

### 2. Department Manager Team View (`/employee/team`)
**Accessible to:** `department head` role only

**Features:**
- View direct reports (supervisorPositionId match)
- Team summary statistics:
  - Total count
  - Active members count
  - Unique positions count
  - Members on leave count
- Breakdown charts:
  - By position (with progress bars)
  - By status (with color-coded bars)
- Privacy-compliant display (BR 18b, BR 41b):
  - ✅ Shows: Name, ID, position, department, status, photo
  - ❌ Hides: National ID, salary, personal contact, DOB, marital status
- Click through to view individual team member profiles

### 3. HR Directory and Search (`/employee/directory`)
**Accessible to:** `HR Employee`, `HR Manager`, `HR Admin`, `System Admin`

**Features:**
- Advanced search with filters:
  - Name (partial match)
  - Email (partial match)
  - Status (exact match, dropdown)
  - Position ID (future enhancement)
  - Department ID (future enhancement)
- Pagination (20 results per page)
- URL query param sync for shareable links
- Responsive card grid layout
- Loading skeletons and empty states
- View details navigation

### 4. HR Admin Profile Management (`/employee/[id]`)
**Accessible to:** `HR Admin` only

**Features:**
- Complete profile view with tabs:
  - **Profile Tab:** Edit all fields
    - Personal info (name, gender, DOB, marital status, national ID)
    - Contact info (emails, phones, address)
    - Employment details (status, dates, contract type, work type)
  - **Roles Tab:** View assigned system roles
  - **Audit History Tab:** Timeline of all changes
- Sync trigger warnings for:
  - Status changes
  - Hierarchy changes (position, department, supervisor)
  - Pay grade changes
- Deactivation workflow:
  - Select reason (TERMINATED, RETIRED, RESIGNED)
  - Set effective date
  - Add notes (required)
- Audit log display with pagination (50/page)
- Back navigation to directory

**Business Rule Compliance:**
- BR 20a: Only HR Admin can modify governed fields
- BR 22: Complete audit trail displayed

### 5. Change Request Management (`/employee/requests`)
**Accessible to:** `HR Manager`, `HR Admin`

**Features:**
- View pending change requests with pagination
- Filter by status tabs:
  - Pending (highlighted)
  - Approved
  - Rejected
  - All
- Expandable request cards showing:
  - Request summary and ID
  - Employee name and ID
  - Submission date
  - Reason for change
  - Field-by-field comparison (old vs new values)
  - Review information (reviewer, date, comments)
- Auto-approval indicator for workflow rules
- Approve/Reject actions with:
  - Optional review comments
  - Confirmation dialogs
  - Impact warnings
- Real-time optimistic UI updates

## API Integration

All 15 backend endpoints are integrated:

**Employee Self-Service:**
- `GET /employee-profile/me`
- `PATCH /employee-profile/me`
- `POST /employee-profile/me/change-request`

**Manager:**
- `GET /employee-profile/manager/team`
- `GET /employee-profile/manager/team-summary`

**HR Admin:**
- `GET /employee-profile/search`
- `GET /employee-profile/:id`
- `PATCH /employee-profile/:id`
- `GET /employee-profile/change-requests/pending`
- `PATCH /employee-profile/change-requests/:id`
- `POST /employee-profile/:id/deactivate`
- `POST /employee-profile/:id/roles`
- `GET /employee-profile/:id/roles`
- `GET /employee-profile/:id/audit-history`

## Type Safety

Complete TypeScript coverage with:
- 9 enums (SystemRole, EmployeeStatus, Gender, etc.)
- 15+ interfaces matching backend schemas
- Discriminated unions for populated fields
- Helper functions for type guards and formatting

## UI/UX Features

**Design System:**
- Dark gradient theme (`from-slate-950 via-slate-900 to-black`)
- Glass morphism cards (`bg-white/5 border-white/10`)
- Consistent color coding for statuses
- shadcn/ui components (Card, Button, Dialog, Select, Input, etc.)
- Lucide React icons throughout
- Responsive grid layouts (mobile-first)

**User Feedback:**
- Toast notifications (sonner) for success/error
- Loading skeletons during data fetch
- Disabled states during save operations
- Optimistic UI updates
- Confirmation dialogs for destructive actions
- Warning banners for sync-triggering changes

**Accessibility:**
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in dialogs
- Color contrast compliance

## Role-Based Access Control

**Implementation:**
- `useRequireRole` hook on all protected pages
- Conditional rendering based on `currentRole`
- Server-side guards via JWT in API requests
- Sub-navigation tabs filtered by role
- Action buttons hidden for unauthorized roles

**Role Matrix:**
| Feature | All | Dept Head | HR Emp | HR Mgr | HR Admin | Sys Admin |
|---------|-----|-----------|--------|--------|----------|-----------|
| View own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit own profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit change requests | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View team | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Search directory | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Process requests | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Edit any profile | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Deactivate employees | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View audit logs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

## Business Requirements Compliance

✅ **BR 2g, 2n, 2o:** Address, phone, email fields implemented  
✅ **BR 3b, 3f, 3g:** Employment info (dates, contracts) displayed  
✅ **BR 3h:** Highest qualification tracking (populated from backend)  
✅ **BR 3j:** Employee status definitions for access control  
✅ **BR 16:** Appraisal history via populated lastAppraisalRecord  
✅ **BR 18b:** Privacy restrictions for managers (sensitive fields excluded)  
✅ **BR 20a:** Only authorized roles can modify governed data  
✅ **BR 22:** Comprehensive audit trail displayed to HR Admin  
✅ **BR 36:** Auto-approval workflow with visual indicators  
✅ **BR 41b:** Managers see only direct reports (supervisor match)

## Change Request Workflow

1. **Employee submits request:**
   - Select governed fields to change
   - Enter new values
   - Provide reason
   - Submit via dialog

2. **Backend processing:**
   - Validates governed fields only
   - Checks auto-approval rules
   - Creates audit log entry
   - Returns status (PENDING or APPROVED)

3. **Auto-approval feedback:**
   - Green toast: "Auto-approved! Changes applied."
   - Profile auto-refreshes to show updates

4. **HR review (if not auto-approved):**
   - HR Manager/Admin views in `/employee/requests`
   - Expands card to see field changes
   - Approves or rejects with optional comments
   - Changes applied immediately on approval

## Data Validation

**Client-side:**
- Phone regex: `/^\+?[0-9\s\-()]{7,20}$/`
- Email format validation
- Required field checks
- Enum value constraints
- Date format validation

**Server-side:**
- Backend validates all inputs
- Governed field enforcement
- Role permission checks
- Audit log creation
- Sync event triggers

## Future Enhancements

**Phase 2 (Optional):**
1. File upload for profile pictures (vs URL input)
2. Position/Department searchable selects in directory filters
3. Bulk operations for HR Admin (mass status update)
4. Export audit logs to CSV/PDF
5. Real-time notifications for change request updates
6. Advanced analytics dashboard for HR
7. Employee comparison view
8. Custom role permissions UI (beyond predefined roles)
9. Profile completeness indicator
10. Integration with performance module (clickable appraisal links)

## Testing Checklist

**Employee Self-Service:**
- [ ] Load profile successfully
- [ ] Edit and save contact info
- [ ] Validate phone number format
- [ ] Submit change request
- [ ] Receive auto-approval feedback
- [ ] View read-only employment fields

**Manager Team View:**
- [ ] View direct reports only
- [ ] See accurate team statistics
- [ ] Privacy-compliant data display
- [ ] Navigate to team member details

**HR Directory:**
- [ ] Search by name works
- [ ] Email filter works
- [ ] Status filter works
- [ ] Pagination functions
- [ ] URL params sync
- [ ] Navigate to employee detail

**HR Admin Management:**
- [ ] View full employee profile
- [ ] Edit all fields successfully
- [ ] Sync warnings appear for trigger fields
- [ ] Deactivate employee workflow
- [ ] View audit history
- [ ] View assigned roles

**Change Requests:**
- [ ] View pending requests
- [ ] Filter by status tabs
- [ ] Expand/collapse request details
- [ ] Approve request successfully
- [ ] Reject request successfully
- [ ] See auto-approval indicator

## Deployment Notes

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` must point to backend (default: `http://localhost:3000`)

**Dependencies:**
- All shadcn/ui components already installed
- `sonner` for toast notifications
- `lucide-react` for icons
- Existing auth provider (`@/providers/auth-provider`)

**Backend Requirements:**
- All 15 endpoints must be available
- JWT authentication with roles in payload
- CORS configured for frontend origin
- Populated fields in responses (position, department, payGrade)

## Support

For issues or questions, refer to:
- Backend API documentation
- `AUTH_ROLES.md` for authentication patterns
- Component source code (well-commented)
- TypeScript types in `types.ts`
