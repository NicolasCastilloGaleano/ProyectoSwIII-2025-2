import { Button } from "@/components/forms";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const plans = [
  {
    name: "Esencial",
    description: "Registro guiado y analítica básica para pacientes nuevos.",
    price: "Gratis",
    periodicity: "para siempre",
    highlight: false,
    badge: "Ideal para empezar",
    features: [
      "Hasta 3 emociones diarias",
      "Panel histórico de 3 meses",
      "Exportación en PDF",
    ],
  },
  {
    name: "Profesional",
    description:
      "Monitoreo avanzado, insights predictivos y reportes automáticos.",
    price: "$39",
    periodicity: "por paciente / mes",
    highlight: true,
    badge: "Más popular",
    features: [
      "Analytics en tiempo real",
      "Alertas de riesgo personalizadas",
      "Historias clínicas ilimitadas",
      "Soporte prioritario 24/7",
    ],
  },
  {
    name: "Institucional",
    description: "Implementación a medida para clínicas y universidades.",
    price: "A medida",
    periodicity: "según alcance",
    highlight: false,
    badge: "Incluye onboarding",
    features: [
      "Integraciones HL7/FHIR",
      "Capacitaciones personalizadas",
      "SLA dedicado",
    ],
  },
];

export default function ImprovementPlan() {
  return (
    <div className="space-y-8 px-4 py-10">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500">
          Programas de acompañamiento
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
          Elige el plan que mejor se adapte a tus pacientes
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Puedes cambiar de plan en cualquier momento. Todos incluyen acceso a
          la bitácora emocional y a los reportes mensuales.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const SecondaryButton = Button.Secondary;
          const CtaButton = plan.highlight ? Button : SecondaryButton;
          return (
            <article
              key={plan.name}
              className={`relative flex h-full flex-col rounded-3xl border p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl ${
                plan.highlight
                  ? "border-indigo-400 bg-gradient-to-b from-indigo-50 to-white"
                  : "border-gray-100 bg-white"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white">
                  Recomendado
                </span>
              )}
              <div className="flex items-center gap-3">
                {plan.highlight ? (
                  <WorkspacePremiumIcon className="text-amber-500" />
                ) : (
                  <TrendingUpIcon className="text-indigo-400" />
                )}
                <h2 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h2>
              </div>
              <p className="mt-2 text-sm font-semibold text-indigo-500">
                {plan.badge}
              </p>
              <p className="mt-3 flex-1 text-sm text-gray-600">
                {plan.description}
              </p>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-gray-900">
                  {plan.price}
                </p>
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  {plan.periodicity}
                </p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <CtaButton fullWidth onClick={() => undefined} className="mt-6">
                {plan.highlight ? "Comenzar evaluación" : "Solicitar demo"}
              </CtaButton>
            </article>
          );
        })}
      </div>
    </div>
  );
}
