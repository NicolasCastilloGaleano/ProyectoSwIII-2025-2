import { getSessionIdToken } from "@/apps/auth/services/auth";
import useStore from "@/store/useStore";
import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import LoadingRoute from "./LoadingRoute";
import { PRIVATEROUTES } from "./private.routes";
import { PUBLICROUTES } from "./public.routes";

const PrivateRouteGuard: React.FC = () => {
  const [token, setToken] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getToken = async () => {
      const token = await getSessionIdToken();
      // const token = "123";

      useStore.getState().authState.setToken(token || null);
      setToken(token || undefined);
      setIsLoading(false);
    };

    getToken();
  }, []);

  if (isLoading) {
    return <LoadingRoute />;
  }

  return token ? <Outlet /> : <Navigate to={PUBLICROUTES.LOGIN} replace />;
};

const PublicRouteGuard: React.FC = () => {
  const token = useStore((store) => store.authState.auth.token);

  return token ? (
    <Navigate to={PRIVATEROUTES.USERS_LIST} replace />
  ) : (
    <Outlet />
  );
};

export { PrivateRouteGuard, PublicRouteGuard };
