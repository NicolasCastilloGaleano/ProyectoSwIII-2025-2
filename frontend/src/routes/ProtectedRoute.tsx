import useStore from "@/store/useStore";
import React from "react";
import { Navigate } from "react-router-dom";
import { PermissionLoading } from "./PermissionLoading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
  requireAuth?: boolean; // si exige estar logueado aunque no pida permisos
}

/**
 * Guard unificado de rutas:
 * - Lee token y currentUser desde Zustand (auth slice)
 * - Lee permisos y helpers desde Permissions slice
 * - Muestra loading mientras se cargan permisos
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/",
  loadingComponent = <PermissionLoading />,
  requireAuth = true,
}) => {
  const { token, isLoading } = useStore((s) => s.authState.auth);

  if (isLoading) return <>{loadingComponent}</>;

  // Si requiere auth y no hay token, fuera
  if (requireAuth && !token) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
};
