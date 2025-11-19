import { SOFTWARE_THEME } from "@/config";
import NavigateNext from "@mui/icons-material/NavigateNext";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import SkeletonList from "../forms/SkeletonList";

export type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
  isLoading?: boolean;
};

interface PageBreadcrumbsProps {
  items: BreadcrumbItem[];
  maxItems?: number;
  className?: string;
}

const PageBreadcrumbs = ({
  items,
  maxItems = 4,
  className,
}: PageBreadcrumbsProps) => {
  if (!items || items.length === 0) return null;

  return (
    <Breadcrumbs
      className={className}
      separator={<NavigateNext fontSize="small" />}
      maxItems={maxItems}
      sx={{marginBottom: 1}}
    >
      {items.map((item, index) => {
        if (item.isLoading) {
          return (
            <SkeletonList
              key={`breadcrumb-skeleton-${index}`}
              count={1}
              height={32}
              width={180}
            />
          );
        }

        const isLast = index === items.length - 1;

        if (isLast) {
          return (
            <Typography
              key={`${item.label}-${index}`}
              className="capitalize"
              color="text.primary"
              component="h2"
              sx={{ cursor: "default", fontWeight: "bold", color: "#1D1D1B" }}
              variant="h5"
            >
              {item.label}
            </Typography>
          );
        }

        return (
          <Link
            key={`${item.label}-${index}`}
            className="capitalize"
            color="inherit"
            component="h2"
            onClick={item.onClick}
            sx={{
              cursor: item.onClick ? "pointer" : "default",
              fontWeight: "bold",
              color: "#1D1D1B",
              "&:hover": {
                color: item.onClick ? SOFTWARE_THEME.primary : "#1D1D1B",
              },
            }}
            underline="hover"
            variant="h5"
          >
            {item.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default PageBreadcrumbs;
