import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import React, { useEffect, useMemo } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import AssessmentIcon from "@mui/icons-material/Assessment";
import ChecklistIcon from "@mui/icons-material/Checklist";
import HomeIcon from "@mui/icons-material/Home";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonIcon from "@mui/icons-material/Person";

import Tab, { type TabProps } from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

// Tab tipado para RouterLink (soporta `to`)
type LinkTabProps = TabProps<typeof RouterLink> & { to: string };

function LinkTab(props: LinkTabProps) {
  return <Tab component={RouterLink} {...props} />;
}

const TabBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { screen, setCurrentTab } = useStore((s) => s.screenState);

  // Define aquí el orden y rutas de las tabs
  const tabs = useMemo(
    () => [
      { label: "Inicio", icon: <HomeIcon />, to: PRIVATEROUTES.HOMEPAGE },
      {
        label: "Pacientes",
        icon: <PeopleAltIcon />,
        to: PRIVATEROUTES.USERS_LIST,
      },
      {
        label: "Analítica",
        icon: <AssessmentIcon />,
        to: PRIVATEROUTES.ANALYTICS,
      },
      {
        label: "Plan",
        icon: <ChecklistIcon />,
        to: PRIVATEROUTES.IMPROVEMENTPLAN,
      },
      {
        label: "Perfil",
        icon: <PersonIcon />,
        to: PRIVATEROUTES.PROFILEPAGE,
      },
    ],
    [],
  );

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

  // Navega cuando el usuario cambia de tab (teclado/gestos)
  const handleChange = (_e: React.SyntheticEvent, newValue: number) => {
    const next = tabs[newValue];
    if (next) navigate(next.to);
  };

  return (
    <Tabs
      value={activeIndex}
      onChange={handleChange}
      aria-label="tab-bar"
      variant="fullWidth"
    >
      {tabs.map((t) => (
        <LinkTab key={t.to} icon={t.icon} label={t.label} to={t.to} />
      ))}
    </Tabs>
  );
};

export default TabBar;
