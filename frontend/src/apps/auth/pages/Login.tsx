import Button from "@/components/forms/Button";
import RenderInputs from "@/components/forms/RenderInputs";
import { PRIVATEROUTES } from "@/routes";
import { PUBLICROUTES } from "@/routes/public.routes";
import useStore from "@/store/useStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { login, resetPassword } from "../services/auth";

const loginSchema = yup.object({
  email: yup.string().email("Correo inválido").required("Correo requerido"),
  password: yup
    .string()
    .min(6, "Mínimo 6 caracteres")
    .required("Contraseña requerida"),
});

export interface LoginFormInputs {
  email: string;
  password: string;
}

const Login = () => {
  const [isRequestLoading, setIsRequestLoading] = useState(false);

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
    setFocus,
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
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

  const handleResetPassword = async () => {
    const email = (getValues("email") || "").trim();
    if (!email) {
      showSnackbar("Ingresa tu correo para recuperar tu contraseña", "warning");
      setFocus("email");
      return;
    }
    try {
      await resetPassword(email);
      showSnackbar(
        "Te enviamos un correo para restablecer la contraseña",
        "success",
      );
    } catch (e) {
      showSnackbar("No fue posible enviar el correo de recuperación", "error");
      console.error("resetPassword error:", e);
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
              label: "Correo electrónico",
              type: "text",
            }}
          />

          <RenderInputs
            control={control}
            errors={errors}
            fieldConfig={{
              name: "password",
              label: "Contraseña",
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

        <div className="mt-4 text-center space-y-2">
          <button
            type="button"
            onClick={handleResetPassword}
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
    </section>
  );
};

export default Login;
