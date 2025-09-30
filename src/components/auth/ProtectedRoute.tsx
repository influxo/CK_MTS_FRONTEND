import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Always send unauthenticated users to login without preserving previous path.
  // This ensures post-login goes to /dashboard (see Login.tsx default).
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Restrict Field Operator routes
  const normalizedRoles = (user?.roles || []).map(
    (r: any) => r.name?.toLowerCase?.() || ""
  );
  const isFieldOperator =
    normalizedRoles.includes("field operator") ||
    normalizedRoles.includes("field-operator") ||
    normalizedRoles.includes("fieldoperator") ||
    normalizedRoles.includes("field_op") ||
    normalizedRoles.some(
      (r: string) => r.includes("field") && r.includes("operator")
    );

  if (isFieldOperator) {
    const allowedPaths = new Set([
      "/dashboard",
      "/dashboard/profile",
      "/data-entry",
      "/data-entry/templates",
    ]);

    const current = location.pathname;
    if (!allowedPaths.has(current)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
