import CalendarToday from "@mui/icons-material/CalendarToday";
import Group from "@mui/icons-material/Group";
import Insights from "@mui/icons-material/Insights";

interface QuickActionsProps {
  onPatients: () => void;
  onInsights: () => void;
  onCalendar: () => void;
}

const QuickActionsRow = ({
  onPatients,
  onInsights,
  onCalendar,
}: QuickActionsProps) => {
  const actions = [
    {
      label: "Directorio",
      description: "Explora y filtra tu lista de pacientes.",
      icon: <Group fontSize="large" />,
      onClick: onPatients,
    },
    {
      label: "Analítica",
      description: "Profundiza en gráficos y tendencias.",
      icon: <Insights fontSize="large" />,
      onClick: onInsights,
    },
    {
      label: "Calendario",
      description: "Visualiza tu mes emocional completo.",
      icon: <CalendarToday fontSize="large" />,
      onClick: onCalendar,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className="shadow-soft flex items-center gap-4 rounded-3xl border border-gray-100 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200"
        >
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
            {action.icon}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {action.label}
            </p>
            <p className="text-sm text-gray-500">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickActionsRow;
