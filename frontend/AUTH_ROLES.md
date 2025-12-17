# Frontend Auth & Current-Role Layer (Docs)

This app keeps backend auth unchanged (Nest JWT + RolesGuard) and adds a client-side current-role selector plus guards. Roles always come from backend responses; the frontend only checks the selected `currentRole`.

## Core pieces
- `src/lib/api.ts`: Axios instance with `withCredentials: true`, `baseURL` via `NEXT_PUBLIC_API_URL` (backend at `http://localhost:3000`). Sets `X-Current-Role` when a role is active.
- `src/providers/auth-provider.tsx`: Holds `{ user, roles, currentRole, status }`, safe setters, optional persistence, and throttled `refreshRoles()` (60s cooldown) to avoid hammering `/employee-profile/:id/roles`.
- `src/components/Navbar.tsx`: Shows current role badge, role switcher, manual “Refresh roles,” and logout. (Navbar is mounted only on pages that include it.)
- `src/hooks/use-require-role.ts`: Frontend guard hook. Checks only `currentRole` against an allowed list, refreshes once if missing, and redirects to a fallback.
- Login flow: `src/app/auth/login/page.tsx` hydrates auth state after `/auth/login` and redirects to `/home`.

## Using the guard
```ts
"use client";
import { useRequireRole } from "@/hooks/use-require-role";
import { useAuth } from "@/providers/auth-provider";

const ALLOWED = ["department head", "HR Manager"];

export default function ProtectedPage() {
  useRequireRole(ALLOWED, "/home"); // redirect if currentRole not allowed
  const { currentRole } = useAuth();
  return <div>Only for: {currentRole}</div>;
}
```
- The hook is client-side; ensure `"use client"`.
- Allowed role strings must match backend values exactly.
- Backend guards still enforce real auth; this is an additional UI layer.

## Switching roles
- Use Navbar’s dropdown. It lists `roles` from backend and sets `currentRole` only if valid.
- “Refresh roles” triggers `refreshRoles()` but is throttled (60s) to prevent repeated backend hits.
- All outgoing requests include `X-Current-Role` when set (for logging/auditing on the server).

## Adding role-aware dashboards
- Example: `src/app/leaves/page.tsx` uses `useRequireRole` and renders different views by `currentRole`.
- Pattern:
```ts
const ALLOWED = [...];
const { currentRole } = useAuth();
useRequireRole(ALLOWED, "/home");

function renderByRole(role: string) {
  switch (role) {
    case "HR Admin":
    case "System Admin":
      return <HrAdminView />;
    case "department head":
      return <DeptHeadView />;
    case "HR Manager":
      return <HrManagerView />;
    case "department employee":
      return <EmployeeView />;
    default:
      return null;
  }
}
```

## Common gotchas
- Don’t duplicate backend enums; rely on strings returned in `user.roles`.
- If you persist `currentRole` and it goes stale, the store will fall back to a valid role after `refreshRoles()`.
- Keep `NEXT_PUBLIC_API_URL` pointing at the backend (port 3000); frontend runs on 5000 by default.***
