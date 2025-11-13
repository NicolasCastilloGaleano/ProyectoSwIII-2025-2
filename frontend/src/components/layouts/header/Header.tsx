import { logout } from "@/apps/auth/services/auth";
import SOFTWARE_THEME from "@/config/theme";
import { PUBLICROUTES } from "@/routes/public.routes";
import useStore from "@/store/useStore";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import { Container, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ChipProfile from "./ChipProfile";

const Header = () => {
  const showSnackbar = useStore((state) => state.showSnackbar);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showSnackbar("Sesión cerrada correctamente.", "info");
    navigate(PUBLICROUTES.LOGIN, { replace: true });
  };

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 flex justify-center border-b border-gray-100 bg-white/80 px-4 backdrop-blur supports-backdrop-filter:bg-white/60"
    >
      <Container className="p-0" maxWidth="lg" sx={{ gap: 4 }}>
        <div className="flex h-14 items-center gap-3 sm:gap-6">
          <div className="grow" />

          <Tooltip title="Cerrar sesión">
            <IconButton
              aria-label="Cerrar sesión"
              onClick={handleLogout}
              sx={{
                color: SOFTWARE_THEME.primary,
                border: "1px solid rgba(99,102,241,0.2)",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "rgba(99,102,241,0.08)" },
              }}
            >
              <LogoutRounded />
            </IconButton>
          </Tooltip>
          <ChipProfile />
        </div>
      </Container>
    </header>
  );
};

export default Header;
