import { SOFTWARE_THEME } from "@/config";
import FilterAltOff from "@mui/icons-material/FilterAltOff";
import NavigateNext from "@mui/icons-material/NavigateNext";
import {
  Breadcrumbs,
  Chip,
  Container as Div,
  Link,
  Typography,
} from "@mui/material";
import SkeletonList from "./SkeletonList";

interface ContainerProps {
  children: React.ReactNode;
  label: string;
}

export type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
  isLoading?: boolean;
};

interface ContainerHeaderProps {
  children: React.ReactNode;
  breadcrumbItems: BreadcrumbItem[];
}

type ActiveFilter = {
  label: string;
  onDelete?: () => void;
};

interface ContainerToolbarProps {
  left: React.ReactNode;
  right?: React.ReactNode;
  activeFilters?: ActiveFilter[];
  onClearAll?: () => void;
}

const BaseContainer = ({ children, label }: ContainerProps) => {
  return (
    <Div className="p-0 md:p-4" maxWidth="xl" sx={{ gap: 4 }}>
      <Typography
        className="capitalize"
        variant="h5"
        component="h2"
        sx={{ fontWeight: "bold", color: "#1D1D1B" }}
      >
        {label}
      </Typography>

      {children}
    </Div>
  );
};

const Container = Object.assign(BaseContainer, {
  Header: ({ children, breadcrumbItems }: ContainerHeaderProps) => (
    <Div className="p-0 md:p-4" maxWidth="xl" sx={{ gap: 4 }}>
      <Breadcrumbs separator={<NavigateNext />} maxItems={3}>
        {breadcrumbItems.map((item, index) => {
          if (item.isLoading) {
            return <SkeletonList count={1} height={32} width={180} />;
          }

          const isLast = index === breadcrumbItems.length - 1;
          return isLast ? (
            <Typography
              key={index}
              className="capitalize"
              color="text.primary"
              component="h2"
              sx={{ cursor: "default", fontWeight: "bold", color: "#1D1D1B" }}
              variant="h5"
            >
              {item.label}
            </Typography>
          ) : (
            <Link
              key={index}
              className="capitalize"
              color="inherit"
              component="h2"
              onClick={item.onClick}
              sx={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "#1D1D1B",
                "&:hover": {
                  color: SOFTWARE_THEME.primary,
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

      {children}
    </Div>
  ),
  Toolbar: ({
    left,
    right,
    activeFilters = [],
    onClearAll,
  }: ContainerToolbarProps) => (
    <div className="mt-7 mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">{left}</div>
        {right && (
          <div className="flex w-full flex-wrap items-center justify-end gap-2 lg:w-auto">
            {right}
          </div>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-700">Filtros activos:</span>
          {activeFilters.map((f, idx) => (
            <Chip
              key={idx}
              label={f.label}
              onDelete={f.onDelete}
              size="small"
              variant="outlined"
            />
          ))}
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-[#02AFB4] transition-colors hover:bg-[#02afb40f]"
            >
              <FilterAltOff fontSize="small" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  ),
});

export default Container;
