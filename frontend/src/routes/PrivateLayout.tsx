import { logout } from "@/apps/auth/services/auth";
import { getUserByToken } from "@/apps/auth/services/authService";
import { Header, TabBar } from "@/components/layouts";
import useStore from "@/store/useStore";
import { useCallback, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import GlobalSnackbar from "../components/system/GlobalSnackbar";
import { PUBLICROUTES } from "./public.routes";

const PrivateLayout = () => {
  const { token } = useStore((store) => store.authState.auth);
  const setCurrentUser = useStore((store) => store.authState.setCurrentUser);

  const navigate = useNavigate();

  const getUser = useCallback(async () => {
    const res = await getUserByToken();

    if (!res.success) {
      if (
        typeof res.error === "string" &&
        res.error
          .trim()
          .toLowerCase()
          .includes("error inesperado con la sesión")
      ) {
        try {
          await logout();
        } finally {
          navigate(PUBLICROUTES.LOGIN, { replace: true });
        }
      }
      return;
    }

    setCurrentUser(res.data);
  }, [navigate, setCurrentUser]);

  useEffect(() => {
    getUser();
  }, [token, getUser]);

  return (
    <div className="relative flex">
      <GlobalSnackbar />

      <div className={`min-h-screen w-full transition-all duration-300`}>
        <Header />

        <div className={`flex min-h-[calc(100vh-120px)] w-full justify-center`}>
          <section className="h-[calc(100vh-120px)] w-full overflow-auto">
            <Outlet />
          </section>
        </div>

        <TabBar />
      </div>
    </div>
  );
};

export default PrivateLayout;
