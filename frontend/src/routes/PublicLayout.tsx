import React from "react";
import { Outlet } from "react-router-dom";

import GlobalSnackbar from "@/components/system/GlobalSnackbar";

const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalSnackbar />

      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
