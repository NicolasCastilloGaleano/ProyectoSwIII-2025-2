import { Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoadingRoute, PublicLayout, renderRoutes } from "./routes";
import { PublicRoutes } from "./routes/public.routes";
import { PublicRouteGuard } from "./routes/RouteGuard";

import { ThemeProvider } from "@mui/material";
import theme from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Suspense fallback={<LoadingRoute fullScreen />}>
          <Routes>
            {/* Rutas públicas */}
            <Route element={<PublicRouteGuard />}>
              <Route element={<PublicLayout />}>
                {renderRoutes(PublicRoutes)}
              </Route>
            </Route>

            {/* Rutas privadas */}
            {/* <Route element={<PrivateRouteGuard />}>
              <Route element={<PrivateLayout />}>
                {renderRoutes(PrivateRoutes)}
              </Route>
            </Route> */}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
