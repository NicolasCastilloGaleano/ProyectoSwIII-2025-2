import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import { useEffect, useMemo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";

const TabBar = () => {
  const { pathname } = useLocation();

  const { screen, setCurrentTab } = useStore((s) => s.screenState);
  const currentUser = useStore((s) => s.authState.auth.currentUser);
  const canSeePatients =
    currentUser?.permissions?.includes("users:read:any") ?? false;

  // Define aquí el orden y rutas de las tabs
  const tabs = useMemo(() => {
    const base = [
      { label: "Inicio", icon: <HomeIcon />, to: PRIVATEROUTES.HOMEPAGE },
      {
        label: "Analítica",
        icon: <AssessmentIcon />,
        to: PRIVATEROUTES.ANALYTICS,
      },
      {
        label: "Eventos",
        icon: <EventIcon />,
        to: PRIVATEROUTES.EVENTS,
      },
      {
        label: "Perfil",
        icon: <PersonIcon />,
        to: PRIVATEROUTES.PROFILEPAGE,
      },
    ];

    if (canSeePatients) {
      base.splice(1, 0, {
        label: "Pacientes",
        icon: <PeopleAltIcon />,
        to: PRIVATEROUTES.USERS_LIST,
      });
    }
    return base;
  }, [canSeePatients]);

  // Calcula el índice activo según la URL
  const activeIndex = useMemo(() => {
    // match “startsWith” por si tienes subrutas (p.ej. /home/stats)
    const idx = tabs.findIndex(
      (t) => pathname === t.to || pathname.startsWith(t.to + "/"),
    );
    return idx >= 0 ? idx : 0; // fallback a Home (o el que prefieras)
  }, [pathname, tabs]);

  // Sincroniza Zustand para que otros componentes puedan leer el índice actual
  useEffect(() => {
    if (screen.currentTab !== activeIndex) {
      setCurrentTab(activeIndex);
    }
  }, [activeIndex, screen.currentTab, setCurrentTab]);

  return (
    <nav
      aria-label="tab-bar"
      className="sticky bottom-0 z-40 border-t border-gray-200 bg-white/80 backdrop-blur supports-backdrop-filter:bg-white/60"
    >
      <div className="mx-auto max-w-5xl">
        <ul className="grid grid-cols-5">
          {tabs.map((t, idx) => (
            <li key={t.to} className="contents">
              <RouterLink
                to={t.to}
                onClick={() => setCurrentTab(idx)}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                  activeIndex === idx ? "text-indigo-600" : "text-gray-500"
                }`}
              >
                <span
                  className={`rounded-full p-2 transition-colors ${
                    activeIndex === idx ? "bg-indigo-50" : "bg-transparent"
                  }`}
                >
                  {t.icon}
                </span>
                <span>{t.label}</span>
              </RouterLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TabBar;
