import useStore from "@/store/useStore";
import { Alert, Snackbar } from "@mui/material";

const GlobalSnackbar = () => {
  const { open, message, severity } = useStore((state) => state.snackbar);
  const closeSnackbar = useStore((state) => state.closeSnackbar);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={closeSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={closeSnackbar} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
