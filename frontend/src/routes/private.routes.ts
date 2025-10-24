import { lazy } from "react";
import type { RouteConfig } from "./route.interface";

export enum PRIVATEROUTES {
  USERS_BASE = "/users",
  USERS_CREATE = "/users/create",
  USERS_EDIT = "/users/edit/",
  USERS_LIST = "/users/list",
  USERS_PROFILE = "/users/profile",
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
];
