import { logout } from "@/apps/auth/services/auth";
import SOFTWARE_THEME from "@/config/theme";
import { PUBLICROUTES } from "@/routes/public.routes";
import useStore from "@/store/useStore";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import { Container, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ChipProfile from "./ChipProfile";

const Header = () => {
  const navigate = useNavigate();
  const showSnackbar = useStore((state) => state.showSnackbar);

  const handleLogout = async () => {
    await logout();
    showSnackbar("Sesión cerrada correctamente.", "info");
    navigate(PUBLICROUTES.LOGIN, { replace: true });
  };

  return (
    <header
      role="banner"
      className="flex justify-center px-4"
      style={{ backgroundColor: SOFTWARE_THEME.primary }}
    >
      <Container className="p-0" maxWidth="lg" sx={{ gap: 4 }}>
        <div className="flex h-12 items-center gap-4 sm:gap-6">
          <div className="grow" />

          <Tooltip title="Cerrar sesión">
            <IconButton
              aria-label="Cerrar sesión"
              onClick={handleLogout}
              sx={{
                color: "white",
                border: "1px solid rgba(255,255,255,0.3)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
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
