import React from "react";

export interface RouteConfig {
  path: string;
  element?: React.LazyExoticComponent<React.ComponentType>;
  index?: boolean;
  roles?: string[]; // para PrivateRoutes
  children?: RouteConfig[];
}
