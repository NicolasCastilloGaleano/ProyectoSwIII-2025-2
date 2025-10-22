import { Outlet, Route } from "react-router-dom";
import type { RouteConfig } from "./route.interface";

export const renderRoutes = (routes: RouteConfig[]): React.ReactNode => {
  return routes.map((r) => {
    const Element = r.element;
    const Wrapper = Element ? () => <Element /> : () => <Outlet />;

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
