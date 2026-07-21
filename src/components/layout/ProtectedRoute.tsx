import * as React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/types";
import { AppLayout } from "./AppLayout";

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Role hierarchy: admin can access reviewer + author views, reviewer can access author views
  const roleRank: Record<Role, number> = { author: 0, reviewer: 1, admin: 2 };
  const minRequiredRank = Math.min(...allowedRoles.map((r) => roleRank[r]));
  const hasAccess = roleRank[user.role] >= minRequiredRank;

  if (!hasAccess) return <Navigate to={`/${user.role}`} replace />;

  return <AppLayout>{children}</AppLayout>;
}
