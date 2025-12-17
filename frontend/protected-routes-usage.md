---
description: How to use the ProtectedRoute component to secure pages and restricting access based on user roles.
---

# Protected Routes Implementation

This workflow describes the implementation of the `ProtectedRoute` component and provides instructions on how to use it to secure pages in the frontend application.

## Overview

The `ProtectedRoute` component is a wrapper that ensures a user is authenticated and authorized before granting access to a specific page or component. It leverages the global `AuthProvider` to check the current user's status and roles.

### Features
- **Authentication Check**: Redirects unauthenticated users to the login page (`/auth/login`).
- **Role-Based Access Control (RBAC)**: Restricts access to specific user roles (e.g., 'HR Manager', 'System Admin'). Redirects unauthorized users to the dashboard.
- **Loading State**: Displays a loading spinner while the authentication status is being determined.

## Implementation Details

The component is located at: `src/components/protected-route.tsx`

```tsx
"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, status, currentRole, roles } = useAuth();
  const router = useRouter();

  // Redirect logic based on auth status and roles
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && allowedRoles) {
      if (!currentRole || !allowedRoles.includes(currentRole)) {
        // Fallback: check if the user has any of the allowed roles in their list
        const hasAccess = roles.some((r) => allowedRoles.includes(r));
         if (!hasAccess) {
             router.push("/dashboard"); 
         }
      }
    }
  }, [user, status, currentRole, roles, allowedRoles, router]);

  // Loading UI
  if (status === "loading" || status === "idle") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Prevent flash of content
  if (status === "unauthenticated") return null;

  if (allowedRoles) {
      const hasAccess = currentRole && allowedRoles.includes(currentRole) || roles.some(r => allowedRoles.includes(r));
      if (!hasAccess) return null;
  }

  return <>{children}</>;
}
```

## How to Use

To protect a page, wrap the page's return JSX with the `<ProtectedRoute>` component.

### 1. Basic Authentication Protection
If you only want to ensure the user is logged in (any role):

```tsx
import ProtectedRoute from "@/components/protected-route";

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div className="p-6">
        <h1>Only logged-in users can see this</h1>
      </div>
    </ProtectedRoute>
  );
}
```

### 2. Role-Specific Protection
If you want to restrict access to specific roles (e.g., only HR Managers):

```tsx
import ProtectedRoute from "@/components/protected-route";

export default function AdminPage() {
  return (
    // Only 'HR Manager' or 'System Admin' can access this page
    <ProtectedRoute allowedRoles={["HR Manager", "System Admin"]}>
      <div className="p-6">
        <h1>Restricted Admin Area</h1>
      </div>
    </ProtectedRoute>
  );
}
```

## Best Practices
- **Wrap at the Page Level**: It is best to wrap the entire page content returned by the default export of your `page.tsx`.
- **Match Backend Roles**: Ensure the strings passed to `allowedRoles` exactly match the role names defined in your backend enums (`SystemRole`).
- **Handle Unauthorized Redirects**: Currently, unauthorized access redirects to `/dashboard`. Ensure this route exists and is accessible to all logged-in users.
