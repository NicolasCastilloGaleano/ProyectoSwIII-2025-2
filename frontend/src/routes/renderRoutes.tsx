import React, { useMemo } from "react";
import { Outlet, Route } from "react-router-dom";
import useStore from "@/store/useStore";
import { LoadingRoute } from ".";
import type { RouteConfig } from "./route.interface";

type GuardProps = {
  allowedRoles?: import("@/apps/users/services/users.interfaces").UserRole[];
  element?: React.LazyExoticComponent<React.ComponentType> | undefined;
};

const Forbidden = () => (
  <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 px-6 text-center">
    <p className="text-3xl font-semibold text-gray-800">403</p>
    <p className="text-gray-600">
      No tienes permisos para acceder a esta sección.
    </p>
  </div>
);

const GuardedWrapper = ({ allowedRoles, element }: GuardProps) => {
  const { currentUser, isLoading, token } = useStore(
    (state) => state.authState.auth,
  );

  // Rutas sin restricción de roles (públicas) no requieren sesión.
  if (!allowedRoles || allowedRoles.length === 0) {
    if (element) {
      const Comp = element;
      return <Comp />;
    }
    return <Outlet />;
  }

  const hasAccess = useMemo(() => {
    if (!currentUser) return false;
    const userRoles = new Set<string>([
      currentUser.role,
      ...(currentUser.roles ?? []),
    ]);
    return allowedRoles.some((role) => userRoles.has(role));
  }, [allowedRoles, currentUser]);

  if (!currentUser && !token) return <Forbidden />;
  if ((isLoading || token) && !currentUser) return <LoadingRoute />;
  if (!hasAccess) return <Forbidden />;

  if (element) {
    const Comp = element;
    return <Comp />;
  }

  return <Outlet />;
};

export const renderRoutes = (routes: RouteConfig[]): React.ReactNode => {
  return routes.map((r) => {
    const Element = r.element;
    const Wrapper = () => (
      <GuardedWrapper allowedRoles={r.roles} element={Element} />
    );

    if (r.index) {
      return <Route key={r.path} path={r.path} index element={<Wrapper />} />;
    }

    return (
      <Route key={r.path} path={r.path} element={<Wrapper />}>
        {r.children && renderRoutes(r.children)}
      </Route>
    );
  });
};
