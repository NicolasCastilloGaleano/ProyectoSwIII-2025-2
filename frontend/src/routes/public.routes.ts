import { lazy } from "react";
import type { RouteConfig } from "./route.interface";

export enum PUBLICROUTES {
  LOGIN = "/",
  REGISTER = "/register",
}

export const PublicRoutes: RouteConfig[] = [
  {
    element: lazy(() => import("@/apps/auth/pages/Login")),
    index: true,
    path: PUBLICROUTES.LOGIN,
  },
  {
    element: lazy(() => import("@/apps/auth/pages/RegisterPage")),
    path: PUBLICROUTES.REGISTER,
  },
];
