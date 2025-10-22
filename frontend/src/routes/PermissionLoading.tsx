import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

interface PermissionLoadingProps {
  message?: string;
}

/**
 * Componente de loading para mostrar mientras se cargan los permisos
 */
export const PermissionLoading: React.FC<PermissionLoadingProps> = ({
  message = "Verificando permisos...",
}) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="200px"
      gap={2}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};
