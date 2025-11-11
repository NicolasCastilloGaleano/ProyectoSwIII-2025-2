import { logout } from "@/apps/auth/services/auth";
import UploadAvatars from "@/apps/home/components/uploadAvatars";
import { updatePatient } from "@/apps/users/services/users";
import { Button } from "@/components/forms";
import { PRIVATEROUTES } from "@/routes/private.routes";
import { PUBLICROUTES } from "@/routes/public.routes";
import useStore from "@/store/useStore";
import BadgeIcon from "@mui/icons-material/Badge";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import EmailIcon from "@mui/icons-material/Email";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ShieldMoonIcon from "@mui/icons-material/ShieldMoon";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Chip } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const accentOptions = ["#6366F1", "#0EA5E9", "#EC4899", "#22C55E", "#F97316"];

const AVATAR_MAX_BYTES = Number(
  import.meta.env.VITE_AVATAR_MAX_BYTES ?? 800 * 1024,
);

const relativeTimeFormatter = new Intl.RelativeTimeFormat("es-ES", {
  numeric: "auto",
});

const toRelativeTime = (input?: number | Date | string | null) => {
  if (input == null) return "Sin datos";
  const value =
    typeof input === "number"
      ? input
      : input instanceof Date
        ? input.getTime()
        : new Date(input).getTime();
  if (Number.isNaN(value)) return "Sin datos";
  const diffMs = value - Date.now();
  const divisions = [
    { amount: 1000, unit: "second" as const },
    { amount: 60, unit: "minute" as const },
    { amount: 60, unit: "hour" as const },
    { amount: 24, unit: "day" as const },
    { amount: 7, unit: "week" as const },
    { amount: 4.34524, unit: "month" as const },
    { amount: 12, unit: "year" as const },
  ];
  let duration = diffMs / 1000;
  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return relativeTimeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return relativeTimeFormatter.format(Math.round(duration), "year");
};

const ProfilePage = () => {
  const { currentUser } = useStore((state) => state.authState.auth);
  const setCurrentUser = useStore((state) => state.authState.setCurrentUser);
  const showSnackbar = useStore((state) => state.showSnackbar);
  const navigate = useNavigate();

  const [accent, setAccent] = useState(
    currentUser?.accentColor ?? accentOptions[0],
  );
  const [avatar, setAvatar] = useState<string | null>(
    currentUser?.photoURL ?? null,
  );
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    setAccent(currentUser?.accentColor ?? accentOptions[0]);
    setAvatar(currentUser?.photoURL ?? null);
  }, [currentUser?.accentColor, currentUser?.photoURL]);

  const displayName =
    currentUser?.name || currentUser?.email || "Tu perfil emocional";

  const roleLabel = useMemo(
    () => currentUser?.role?.toString() ?? "USER",
    [currentUser?.role],
  );

  const statusLabel = useMemo(
    () => currentUser?.status?.toString() ?? "ACTIVE",
    [currentUser?.status],
  );

  const joinedAt = useMemo(() => {
    if (!currentUser?.createdAt) return "Sin datos";
    return new Date(currentUser.createdAt).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [currentUser?.createdAt]);

  const recentActivity = useMemo(() => {
    const events: { title: string; date: string }[] = [];
    if (currentUser?.updatedAt) {
      events.push({
        title: "Actualizaste tu perfil",
        date: toRelativeTime(currentUser.updatedAt),
      });
    }
    if (currentUser?.createdAt) {
      events.push({
        title: "Creaste tu cuenta",
        date: toRelativeTime(currentUser.createdAt),
      });
    }
    return events.length
      ? events
      : [
          {
            title: "Aún no hay actividad registrada",
            date: "Guarda tu perfil para comenzar a generar historial.",
          },
        ];
  }, [currentUser?.createdAt, currentUser?.updatedAt]);

  const handleLogout = async () => {
    await logout();
    showSnackbar("Sesión cerrada correctamente.", "info");
    navigate(PUBLICROUTES.LOGIN, { replace: true });
  };

  const handleEdit = () => {
    if (!currentUser?.id) {
      showSnackbar("No se encontró el identificador del usuario.", "warning");
      return;
    }
    navigate(`${PRIVATEROUTES.USERS_EDIT}${currentUser.id}`);
  };

  const handleSavePreferences = async () => {
    if (!currentUser?.id) return;
    setSavingPrefs(true);
    const response = await updatePatient(currentUser.id, {
      accentColor: accent,
      photoURL: avatar,
    });
    setSavingPrefs(false);
    if (!response.success) {
      showSnackbar(response.error, "error");
      return;
    }
    const updatedAt = Date.now();
    setCurrentUser({
      ...currentUser,
      accentColor: accent,
      photoURL: avatar ?? null,
      updatedAt,
    });
    showSnackbar("Personalización guardada.", "success");
  };

  const personalizationSwatches = (
    <div className="flex flex-wrap gap-2">
      {accentOptions.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => setAccent(color)}
          aria-label={`Cambiar color destacado a ${color}`}
          className={`h-10 w-10 rounded-2xl border-2 transition ${
            accent === color
              ? "scale-105 border-gray-900"
              : "border-transparent opacity-70"
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 px-4 py-6">
      <section
        className="shadow-soft relative overflow-hidden rounded-3xl text-white"
        style={{
          background: `linear-gradient(120deg, ${accent}, #1E1B4B)`,
        }}
      >
        <div className="absolute inset-0 opacity-25">
          <div className="hero-glow" />
        </div>
        <div className="relative z-10 flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <UploadAvatars
              value={avatar ?? undefined}
              onChange={setAvatar}
              maxBytes={AVATAR_MAX_BYTES}
              onFileRejected={(reason) => showSnackbar(reason, "warning")}
            />
            <div>
              <p className="text-sm tracking-widest text-white/70 uppercase">
                Perfil emocional
              </p>
              <h1 className="text-3xl leading-tight font-bold">
                {displayName}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Chip
                  icon={<VerifiedUserIcon fontSize="small" />}
                  label={roleLabel}
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "white",
                  }}
                />
                <Chip
                  icon={<ShieldMoonIcon fontSize="small" />}
                  label={statusLabel}
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(255,255,255,0.4)",
                    color: "white",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button.Secondary onClick={handleEdit}>
              Configurar perfil
            </Button.Secondary>
            <Button onClick={handleLogout} startIcon={<LogoutRounded />}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Información personal
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Detalles y puntos de contacto
              </h2>
            </div>
            <BadgeIcon className="text-indigo-500" />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <InfoBlock
              icon={<EmailIcon />}
              label="Correo electrónico"
              value={currentUser?.email ?? "No definido"}
            />
            <InfoBlock
              icon={<PhoneIphoneIcon />}
              label="Número de contacto"
              value={currentUser?.phone ?? "Pendiente"}
            />
            <InfoBlock
              icon={<BadgeIcon />}
              label="Rol asignado"
              value={roleLabel}
            />
            <InfoBlock
              icon={<ShieldMoonIcon />}
              label="Estado"
              value={statusLabel}
            />
          </div>
          <div className="mt-6 rounded-2xl bg-indigo-50 p-4 text-sm text-indigo-700">
            <p className="font-semibold">Creado el</p>
            <p>{joinedAt}</p>
          </div>
        </article>

        <article className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Personalización
              </p>
              <h2 className="text-xl font-bold text-gray-900">
                Colores destacados
              </h2>
            </div>
            <ColorLensIcon className="text-rose-500" />
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Ajusta el color y el avatar que prefieras ver en tus tableros. Estos
            cambios no afectan a otros usuarios.
          </p>
          <div className="mt-4">{personalizationSwatches}</div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSavePreferences}
              disabled={savingPrefs || !currentUser}
            >
              {savingPrefs ? "Guardando..." : "Guardar personalización"}
            </Button>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5">
          <p className="text-sm font-semibold text-gray-500">
            Preferencias de bienestar
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            Rutina recomendada
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>• Registrar emociones antes de las 10:00 a.m.</li>
            <li>• Revisar la analítica cada viernes</li>
            <li>• Compartir el resumen mensual con tu terapeuta</li>
          </ul>
        </article>
        <article className="shadow-soft rounded-3xl border border-gray-100 bg-white p-5 lg:col-span-2">
          <p className="text-sm font-semibold text-gray-500">
            Actividad reciente
          </p>
          <h2 className="text-xl font-bold text-gray-900">Últimos hitos</h2>
          <div className="mt-4 space-y-4">
            {recentActivity.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <p className="font-semibold text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">{item.date}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

type InfoBlockProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const InfoBlock = ({ icon, label, value }: InfoBlockProps) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <div className="flex items-center gap-3 text-gray-500">
      <div className="rounded-2xl bg-white p-2 text-indigo-500">{icon}</div>
      <div>
        <p className="text-xs tracking-wider uppercase">{label}</p>
        <p className="text-base font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default ProfilePage;
