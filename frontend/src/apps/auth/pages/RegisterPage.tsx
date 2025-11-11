import { registerAuthUser } from "@/apps/auth/services/authService";
import Button from "@/components/forms/Button";
import RenderInputs from "@/components/forms/RenderInputs";
import { PUBLICROUTES } from "@/routes/public.routes";
import useStore from "@/store/useStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";

const registerSchema = yup.object({
  email: yup.string().email("Correo inválido").required("Correo requerido"),
  password: yup
    .string()
    .min(6, "Mínimo 6 caracteres")
    .required("Contraseña requerida"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirmación requerida"),
});

type RegisterInputs = {
  email: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const showSnackbar = useStore((s) => s.showSnackbar);
  const currentUser = useStore((s) => s.authState.auth.currentUser);
  const accent = currentUser?.accentColor ?? "#6366F1";
  const accentOverlay =
    accent.startsWith("#") && accent.length === 7 ? `${accent}1A` : accent;

  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({ resolver: yupResolver(registerSchema) });

  const onSubmit = async ({ email, password }: RegisterInputs) => {
    setLoading(true);
    try {
      const res = await registerAuthUser({ email, password });
      if (!res.success) {
        showSnackbar(res.error ?? "Error al registrar", "error");
        return;
      }
      showSnackbar("Cuenta creada. Ahora inicia sesión.", "success");
      navigate(PUBLICROUTES.LOGIN);
    } catch (e) {
      showSnackbar("No fue posible crear la cuenta", "error");
      console.error("register error:", e);
    } finally {
      setLoading(false);
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
        onSubmit={handleSubmit(onSubmit)}
        className="shadow-soft mx-auto w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 sm:p-8"
      >
        <header>
          <p className="text-sm font-semibold text-gray-500">Crea tu cuenta</p>
          <h1 className="mt-1 text-xl font-bold text-gray-900">Registrarse</h1>
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

          <RenderInputs
            control={control}
            errors={errors}
            fieldConfig={{
              name: "confirmPassword",
              label: "Confirmar contraseña",
              type: "password",
            }}
          />
        </div>

        <div className="mt-6">
          <Button.Secondary
            loading={loading}
            disabled={loading}
            type="submit"
            fullWidth
          >
            Crear cuenta
          </Button.Secondary>
        </div>

        <div className="mt-4 text-center">
          <Link
            to={PUBLICROUTES.LOGIN}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </form>
    </section>
  );
};

export default RegisterPage;
