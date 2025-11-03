import SOFTWARE_THEME from "@/config/theme";
import { Container } from "@mui/material";
import ChipProfile from "./ChipProfile";

const Header = () => {
  return (
    <header
      role="banner"
      className="flex justify-center px-4"
      style={{ backgroundColor: SOFTWARE_THEME.primary }}
    >
      <Container className="p-0" maxWidth="lg" sx={{ gap: 4 }}>
        <div className="flex h-full items-center gap-4 sm:gap-6">
          {/* Espaciador */}
          <div className="grow" />

          <ChipProfile />
        </div>
      </Container>
    </header>
  );
};

export default Header;
