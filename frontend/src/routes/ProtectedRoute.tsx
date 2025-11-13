import useStore from "@/store/useStore";
import React from "react";
import { Navigate } from "react-router-dom";
import LoadingRoute from "./LoadingRoute";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
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
  requireAuth = true,
}) => {
  const { token, isLoading } = useStore((s) => s.authState.auth);

  if (isLoading) return <LoadingRoute />;

  // Si requiere auth y no hay token, fuera
  if (requireAuth && !token) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
};
