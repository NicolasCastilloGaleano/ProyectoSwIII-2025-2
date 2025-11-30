import FilterAltOff from "@mui/icons-material/FilterAltOff";
import { Chip, Container as Div, Typography } from "@mui/material";
import PageBreadcrumbs, {
  type BreadcrumbItem,
} from "../layouts/PageBreadcrumbs";

interface ContainerProps {
  children: React.ReactNode;
  label: string;
}

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

      <hr className="my-2" />

      {children}
    </Div>
  );
};

const Container = Object.assign(BaseContainer, {
  Header: ({ children, breadcrumbItems }: ContainerHeaderProps) => (
    <Div className="p-0 md:p-4" maxWidth="xl" sx={{ gap: 4 }}>
      <PageBreadcrumbs items={breadcrumbItems} maxItems={3} />

      <hr className="my-2" />

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
