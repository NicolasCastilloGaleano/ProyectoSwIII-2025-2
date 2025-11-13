import { lazy } from "react";
import type { RouteConfig } from "./route.interface";

export enum PRIVATEROUTES {
  HOMEPAGE = "/home",
  ANALYTICS = "/insights",
  IMPROVEMENTPLAN = "/improvementplan",
  PROFILEPAGE = "/profile",
  USERS_BASE = "/users",
  USERS_CREATE = "/users/create",
  USERS_EDIT = "/users/edit/",
  USERS_LIST = "/users/list",
  USERS_PROFILE = "/users/profile",
}

export const PrivateRoutes: RouteConfig[] = [
  {
    element: lazy(() => import("@/apps/home/pages/homePage")),
    index: true,
    path: PRIVATEROUTES.HOMEPAGE,
  },
  {
    element: lazy(() => import("@/apps/home/pages/insightsPage")),
    path: PRIVATEROUTES.ANALYTICS,
  },
  {
    element: lazy(() => import("@/apps/home/pages/improvementPlan")),
    path: PRIVATEROUTES.IMPROVEMENTPLAN,
  },
  {
    element: lazy(() => import("@/apps/home/pages/profilePage")),
    path: PRIVATEROUTES.PROFILEPAGE,
  },
  {
    path: PRIVATEROUTES.USERS_BASE,
    roles: ["admin", "user"],
    children: [
      {
        path: "list",
        element: lazy(() => import("@/apps/users/pages/ListUsers")),
      },
      {
        path: "create",
        element: lazy(() => import("@/apps/users/pages/ManageUser")),
      },
      {
        path: "edit/:id",
        element: lazy(() => import("@/apps/users/pages/ManageUser")),
      },
    ],
  },
];
