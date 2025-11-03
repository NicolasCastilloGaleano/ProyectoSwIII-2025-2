import { lazy } from "react";
import type { RouteConfig } from "./route.interface";

export enum PRIVATEROUTES {
  USERS_BASE = "/users",
  USERS_CREATE = "/users/create",
  USERS_EDIT = "/users/edit/",
  USERS_LIST = "/users/list",
  USERS_PROFILE = "/users/profile",
  HOMEPAGE = "/home",
  PROFILEPAGE = "/profile",
  IMPROVEMENTPLAN = "/improvementplan",
}

export const PrivateRoutes: RouteConfig[] = [
  {
    path: PRIVATEROUTES.USERS_BASE,
    roles: ["admin", "user"],
    children: [
      {
        path: "list",
        element: lazy(() => import("@/apps/users/pages/ListUsers")),
      },
    ],
  },
  {
    element: lazy(() => import("@/apps/home/pages/homePage")),
    index: true,
    path: PRIVATEROUTES.HOMEPAGE,
  },
  {
    element: lazy(() => import("@/apps/home/pages/profilePage")),
    index: true,
    path: PRIVATEROUTES.PROFILEPAGE,
  },
  {
    element: lazy(() => import("@/apps/home/pages/improvementPlan")),
    index: true,
    path: PRIVATEROUTES.IMPROVEMENTPLAN,
  },
];
