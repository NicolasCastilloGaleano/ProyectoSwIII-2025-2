import { Button, Input } from "@/components/forms";
import DialogLayout from "@/components/layouts/DialogLayout";
import { registerAuthUser } from "@/apps/auth/services/authService";
import { getPatientById, updatePatient } from "@/apps/users/services/users";
import {
  UserRole,
  UserStatus,
  type User,
} from "@/apps/users/services/users.interfaces";
import { PRIVATEROUTES } from "@/routes/private.routes";
import useStore from "@/store/useStore";
import { MenuItem, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type ManageFormState = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
};

const DEFAULT_FORM: ManageFormState = {
  name: "",
  email: "",
  phone: "",
  role: UserRole.USER,
  status: UserStatus.ACTIVE,
};

const DEFAULT_PASSWORDS = {
  password: "",
  confirm: "",
};

const ManageUserPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState<ManageFormState>(DEFAULT_FORM);
  const [passwords, setPasswords] = useState(DEFAULT_PASSWORDS);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const showSnackbar = useStore((state) => state.showSnackbar);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEditMode || !id) {
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      setLoading(true);
      const response = await getPatientById(id);
      if (!response.success) {
        showSnackbar(
          response.error ?? "No fue posible cargar el paciente.",
          "error",
        );
        navigate(PRIVATEROUTES.USERS_LIST, { replace: true });
        return;
      }
      if (response.data) {
        hydrateForm(response.data);
      }
      setLoading(false);
    };
    void fetchUser();
  }, [id, isEditMode, navigate, showSnackbar]);

  const hydrateForm = (user: User) => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role,
      status: user.status,
    });
  };

  const handleChange =
    (field: keyof ManageFormState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handlePasswordChange =
    (field: keyof typeof passwords) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setPasswords((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const requiresPassword = !isEditMode;
  const passwordTooShort =
    requiresPassword && passwords.password.trim().length < 6;
  const passwordMismatch =
    requiresPassword &&
    passwords.password.trim().length > 0 &&
    passwords.password !== passwords.confirm;
  const passwordError = passwordTooShort || passwordMismatch;

  const canSubmit = useMemo(() => {
    const nameValid = form.name.trim().length > 2;
    const emailValid = isEditMode || form.email.trim().length > 5;
    return nameValid && emailValid && !passwordError;
  }, [form.name, form.email, isEditMode, passwordError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);

    if (isEditMode && id) {
      const response = await updatePatient(id, {
        name: form.name.trim(),
        role: form.role,
        status: form.status,
        phone: form.phone.trim() || null,
      });
      if (!response.success) {
        showSnackbar(response.error, "error");
        setSaving(false);
        return;
      }
      showSnackbar(response.message ?? "Paciente actualizado.", "success");
    } else {
      const register = await registerAuthUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: passwords.password.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        status: form.status,
      });
      if (!register.success) {
        showSnackbar(
          register.error ?? "No se pudo registrar el usuario en Auth.",
          "error",
        );
        setSaving(false);
        return;
      }
      const newId = register.data?.id;
      if (!newId) {
        showSnackbar(
          "No se recibió el identificador del usuario creado.",
          "error",
        );
        setSaving(false);
        return;
      }
      const response = await updatePatient(newId, {
        name: form.name.trim(),
        role: form.role,
        status: form.status,
        phone: form.phone.trim() || null,
      });
      if (!response.success) {
        showSnackbar(response.error, "error");
        setSaving(false);
        return;
      }
      showSnackbar(response.message ?? "Paciente creado.", "success");
    }
    setSaving(false);
    navigate(PRIVATEROUTES.USERS_LIST, { replace: true });
  };

  const handleCancel = () => {
    navigate(PRIVATEROUTES.USERS_LIST);
  };

  const roleOptions = Object.values(UserRole);
  const statusOptions = Object.values(UserStatus);

  return (
    <DialogLayout
      open
      onClose={handleCancel}
      maxWidth="sm"
      hideActions
      title={isEditMode ? "Editar paciente" : "Nuevo paciente"}
    >
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
            {isEditMode ? (
              <>
                <p className="font-semibold text-gray-800">
                  Actualiza la información disponible del paciente.
                </p>
                <p className="mt-1 text-xs">
                  El correo registrado no puede modificarse para mantener la
                  integridad de la cuenta.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-800">
                  Registra un nuevo paciente con credenciales iniciales.
                </p>
                <p className="mt-1 text-xs">
                  La contraseña se utilizará como acceso temporal y debe tener
                  al menos 6 caracteres.
                </p>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nombre completo"
              required
              value={form.name}
              onChange={handleChange("name")}
              disabled={saving}
            />
            <Input
              label="Correo electrónico"
              required={!isEditMode}
              value={form.email}
              onChange={handleChange("email")}
              type="email"
              disabled={saving || isEditMode}
            />
            <Input
              label="Teléfono"
              value={form.phone}
              onChange={handleChange("phone")}
              placeholder="3011234567"
              disabled={saving}
            />
            <Input.Select
              label="Rol"
              value={form.role}
              onChange={handleChange("role")}
              disabled={saving}
            >
              {roleOptions.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))}
            </Input.Select>
            <Input.Select
              label="Estado"
              value={form.status}
              onChange={handleChange("status")}
              disabled={saving}
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Input.Select>
          </div>

          {!isEditMode && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Input.Password
                label="Contraseña temporal"
                required
                value={passwords.password}
                onChange={handlePasswordChange("password")}
                disabled={saving}
                error={passwordTooShort}
                helperText={
                  passwordTooShort
                    ? "Debe tener al menos 6 caracteres."
                    : undefined
                }
              />
              <Input.Password
                label="Confirmar contraseña"
                required
                value={passwords.confirm}
                onChange={handlePasswordChange("confirm")}
                disabled={saving}
                error={passwordMismatch}
                helperText={
                  passwordMismatch ? "Las contraseñas no coinciden." : undefined
                }
              />
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button.Secondary onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button.Secondary>
            <Button type="submit" disabled={!canSubmit || saving}>
              {saving
                ? isEditMode
                  ? "Actualizando..."
                  : "Creando..."
                : isEditMode
                  ? "Guardar cambios"
                  : "Crear paciente"}
            </Button>
          </div>
        </form>
      )}
    </DialogLayout>
  );
};

export default ManageUserPage;
