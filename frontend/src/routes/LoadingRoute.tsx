import { CircularProgress } from "@mui/material";

interface LoadingRouteProps {
  fullScreen?: boolean;
}

const LoadingRoute = ({ fullScreen }: LoadingRouteProps) => {
  return (
    <div
      className={`${fullScreen ? "h-screen" : "h-[calc(100vh-160px)]"} flex w-full items-center justify-center`}
    >
      <CircularProgress sx={{ color: "#02afb4" }} />
    </div>
  );
};

export default LoadingRoute;
