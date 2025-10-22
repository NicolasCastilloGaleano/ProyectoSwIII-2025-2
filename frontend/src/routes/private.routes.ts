import type { RouteConfig } from "./route.interface";

export enum PRIVATEROUTES {
  USERS_BASE = "/users",
  USERS_CREATE = "/users/create",
  USERS_EDIT = "/users/edit/",
  USERS_LIST = "/users/list",
}

export const PrivateRoutes: RouteConfig[] = [];
