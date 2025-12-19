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

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/login");
        } else if (status === "authenticated" && allowedRoles) {
            // Only check currentRole, not all roles the user has
            if (!currentRole || !allowedRoles.includes(currentRole)) {
                router.replace("/"); // Redirect unauthorized users to root
            }
        }
    }, [user, status, currentRole, allowedRoles, router]);

    if (status === "loading" || status === "idle") {
        // You can replace this with a proper loading spinner from your design system
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return null; // Will redirect in useEffect
    }

    if (allowedRoles) {
        // Only check currentRole, not all roles the user has
        const hasAccess = currentRole && allowedRoles.includes(currentRole);
        if (!hasAccess) {
            return null; // Will redirect in useEffect
        }
    }

    return <>{children}</>;
}
