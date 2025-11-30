import Button from "@/components/forms/Button";
import RenderInputs from "@/components/forms/RenderInputs";
import { PRIVATEROUTES } from "@/routes";
import { PUBLICROUTES } from "@/routes/public.routes";
import useStore from "@/store/useStore";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { login, resetPassword } from "../services/auth";

const loginSchema = yup.object({
  email: yup.string().email("Correo invalido").required("Correo requerido"),
  password: yup
    .string()
    .required("Contraseña requerida")
    .min(6, "Minimo 6 caracteres"),
});

const forgotPasswordSchema = yup.object({
  email: yup.string().email("Correo invalido").required("Correo requerido"),
});

export interface LoginFormInputs {
  email: string;
  password: string;
}

interface ForgotPasswordInputs {
  email: string;
}

const Login = () => {
  const [isRequestLoading, setIsRequestLoading] = useState(false);
  const [isForgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  const showSnackbar = useStore((state) => state.showSnackbar);
  const currentUser = useStore((s) => s.authState.auth.currentUser);
  const accent = currentUser?.accentColor ?? "#6366F1";
  const accentOverlay =
    accent.startsWith("#") && accent.length === 7 ? `${accent}1A` : accent;

  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetForgotForm,
  } = useForm<ForgotPasswordInputs>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsRequestLoading(true);
    try {
      await login(data.email, data.password);
      navigate(PRIVATEROUTES.HOMEPAGE);
    } catch (error) {
      const baseMessage = "Error al iniciar sesión";
      const detail =
        error instanceof Error ? error.message : "Verifica tus credenciales.";
      showSnackbar(`${baseMessage}. ${detail}`, "error");
      console.error("loginPage error: ", error);
    } finally {
      setIsRequestLoading(false);
    }
  };

  const onInvalid = () => {
    showSnackbar("Por favor corrige los campos marcados", "error");
  };

  const openForgotDialog = () => {
    const email = (getValues("email") || "").trim();
    resetForgotForm({ email });
    setForgotDialogOpen(true);
  };

  const closeForgotDialog = () => {
    if (isResetSubmitting) return;
    setForgotDialogOpen(false);
  };

  const onForgotSubmit = async ({ email }: ForgotPasswordInputs) => {
    setIsResetSubmitting(true);
    try {
      await resetPassword(email);
      showSnackbar(
        "Revisa tu bandeja de entrada para restablecer la contraseña.",
        "success",
      );
      resetForgotForm({ email: "" });
      setForgotDialogOpen(false);
    } catch (error) {
      const detail =
        error instanceof Error
          ? error.message
          : "No fue posible enviar el correo de recuperación.";
      showSnackbar(detail, "error");
      console.error("resetPassword dialog error:", error);
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <section
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: `linear-gradient(180deg, ${accentOverlay}, #FFFFFF)`,
      }}
    >
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="shadow-soft mx-auto w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 sm:p-8"
      >
        <header>
          <p className="text-sm font-semibold text-gray-500">Bienvenido</p>
          <h1 className="mt-1 text-xl font-bold text-gray-900">
            Inicia sesión
          </h1>
        </header>

        <div className="mt-6 flex flex-col gap-4">
          <RenderInputs
            control={control}
            errors={errors}
            fieldConfig={{
              name: "email",
              label: "Correo electronico",
              type: "text",
            }}
          />

          <RenderInputs
            control={control}
            errors={errors}
            fieldConfig={{
              name: "password",
              label: "Contrasena",
              type: "password",
            }}
          />
        </div>

        <div className="mt-6">
          <Button.Secondary
            loading={isRequestLoading}
            disabled={isRequestLoading}
            type="submit"
            fullWidth
          >
            Ingresar
          </Button.Secondary>
        </div>

        <div className="mt-4 space-y-2 text-center">
          <button
            type="button"
            onClick={openForgotDialog}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ¿Olvidaste tu contraseña?
          </button>
          <div>
            <Link
              to={PUBLICROUTES.REGISTER}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ¿No tienes cuenta? Crear cuenta
            </Link>
          </div>
        </div>
      </form>

      <Dialog
        open={isForgotDialogOpen}
        onClose={closeForgotDialog}
        fullWidth
        maxWidth="xs"
      >
        <form onSubmit={handleResetSubmit(onForgotSubmit)} noValidate>
          <DialogTitle className="text-lg font-semibold">
            Recuperar contraseña
          </DialogTitle>
          <DialogContent className="space-y-4">
            <Typography component="p" className="text-sm text-gray-600">
              Ingresa el correo con el que te registraste y te enviaremos las
              instrucciones para restablecer tu acceso.
            </Typography>
            <RenderInputs
              control={resetControl}
              errors={resetErrors}
              fieldConfig={{
                name: "email",
                label: "Correo electronico",
                type: "text",
              }}
            />
          </DialogContent>
          <DialogActions className="px-6 pb-4">
            <Button
              type="button"
              onClick={closeForgotDialog}
              disabled={isResetSubmitting}
            >
              Cancelar
            </Button>
            <Button.Secondary
              type="submit"
              disabled={isResetSubmitting}
              loading={isResetSubmitting}
            >
              Enviar instrucciones
            </Button.Secondary>
          </DialogActions>
        </form>
      </Dialog>
    </section>
  );
};

export default Login;
