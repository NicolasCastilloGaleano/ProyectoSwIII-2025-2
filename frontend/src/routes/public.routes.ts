import { lazy } from "react";
import type { RouteConfig } from "./route.interface";

export enum PUBLICROUTES {
  LOGIN = "/",
  DASHBOARD = "/dashboard",
  PROFILE = "/profile",
  IMPROVEMENTPLAN = "/improvementplan",
}

export const PublicRoutes: RouteConfig[] = [
  {
    element: lazy(() => import("@/apps/auth/pages/Login")),
    index: true,
    path: PUBLICROUTES.LOGIN,
  },
  {
    element: lazy(() => import("@/apps/dashboard/pages/dashboardPage")),
    index: true,
    path: PUBLICROUTES.DASHBOARD,
  },
  {
    element: lazy(() => import("@/apps/dashboard/pages/profilePage")),
    index: true,
    path: PUBLICROUTES.PROFILE,
  },
  {
    element: lazy(() => import("@/apps/dashboard/pages/improvementPlan")),
    index: true,
    path: PUBLICROUTES.IMPROVEMENTPLAN,
  },
];
