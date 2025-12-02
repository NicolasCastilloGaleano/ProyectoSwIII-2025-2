import React from "react";
import type { UserRole } from "@/apps/users/services/users.interfaces";

export interface RouteConfig {
  path: string;
  element?: React.LazyExoticComponent<React.ComponentType>;
  index?: boolean;
  roles?: UserRole[]; // para PrivateRoutes
  children?: RouteConfig[];
}
