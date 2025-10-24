import Button from "@/components/forms/Button";
import RenderInputs from "@/components/forms/RenderInputs";
import { PRIVATEROUTES } from "@/routes";
import useStore from "@/store/useStore";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { login } from "../services/auth";

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

  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsRequestLoading(true);
    try {
      await login(data.email, data.password);

      navigate(PRIVATEROUTES.USERS_LIST);
    } catch (error) {
      showSnackbar(
        "Error al iniciar sesión. Verifica tus credenciales.",
        "error",
      );
      console.error("loginPage error: ", error);
    } finally {
      setIsRequestLoading(false);
    }
  };

  const onInvalid = () => {
    showSnackbar("Por favor corrige los campos marcados", "error");
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-6 shadow-md"
      >
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

        <Button.Secondary
          loading={isRequestLoading}
          disabled={isRequestLoading}
          type="submit"
          fullWidth
        >
          Ingresar
        </Button.Secondary>
      </form>
    </section>
  );
};

export default Login;
