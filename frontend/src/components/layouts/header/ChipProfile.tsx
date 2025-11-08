import { SOFTWARE_THEME } from "@/config";
import { PRIVATEROUTES } from "@/routes";
import useStore from "@/store/useStore";
import { Avatar, Chip, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const ChipProfile = () => {
  const { currentUser } = useStore((state) => state.authState.auth);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();

  const getInitials = (fullName?: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase()).join("");
  };

  const getUserLabel = () => {
    if (!currentUser) return "";

    return isMobile && currentUser.name.length > 12
      ? currentUser.name.slice(0, 12) + "..."
      : currentUser.name;
  };

  return (
    currentUser && (
      <Tooltip title={currentUser.name}>
        <Chip
          clickable
          onClick={() => navigate(PRIVATEROUTES.PROFILEPAGE)}
          avatar={
            <Avatar
              src={currentUser.photoURL || undefined}
              alt={`${currentUser.name}-logo`}
            >
              {getInitials(currentUser.name)}
            </Avatar>
          }
          label={getUserLabel()}
          aria-label="Perfil de usuario"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.18)",
            color: "white",
            fontWeight: 500,
            backdropFilter: "blur(6px)",
            "& .MuiChip-avatar": {
              color: SOFTWARE_THEME.primary,
              backgroundColor: "#fff",
              fontWeight: 700,
            },
            ...(isMobile && {
              maxWidth: "160px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }),
          }}
        />
      </Tooltip>
    )
  );
};

export default ChipProfile;
