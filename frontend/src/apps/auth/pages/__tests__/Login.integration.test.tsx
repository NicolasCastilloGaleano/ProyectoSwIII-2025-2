import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import Login from "../Login";
import { PRIVATEROUTES } from "@/routes/private.routes";
import { login, resetPassword } from "@/apps/auth/services/auth";

/**
 * @fileoverview Pruebas de integración para el componente de Login
 * @description Verifica la funcionalidad completa del formulario de inicio de sesión.
 * 
 * Casos de prueba principales:
 * - Validación de campos del formulario
 * - Manejo de estados de carga
 * - Navegación post-autenticación
 * - Manejo de errores de autenticación
 * 
 * Componentes probados:
 * - Formulario de login (React Hook Form)
 * - Gestión de estado (Zustand)
 * - Navegación (React Router)
 * - Notificaciones (Snackbar)
 * 
 * @note Se utilizan mocks para:
 * - Servicios de autenticación
 * - Navegación
 * - Estado global
 * 
 * Técnica de prueba:
 * - Partición equivalente para validaciones
 * - Simulación de interacción de usuario
 * - Pruebas de integración end-to-end
 * 
 * @dependencias
 * - @testing-library/react
 * - @testing-library/user-event
 * - vitest
 */

const navigateMock = vi.fn();
const showSnackbarMock = vi.fn();
const loginMock = login as Mock;
const resetPasswordMock = resetPassword as Mock;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/store/useStore", () => ({
  __esModule: true,
  default: (selector: (state: any) => any) =>
    selector({
      showSnackbar: showSnackbarMock,
      authState: {
        auth: { currentUser: null, isLoading: false, token: null },
        setToken: vi.fn(),
        setCurrentUser: vi.fn(),
        setIsAuthLoading: vi.fn(),
        clearSession: vi.fn(),
      },
    }),
}));

vi.mock("@/apps/auth/services/auth", () => ({
  login: vi.fn(),
  resetPassword: vi.fn(),
}));

describe("Integración - Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginMock.mockReset();
    resetPasswordMock.mockReset();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

  it("permite enviar credenciales válidas y navega al dashboard", async () => {
    loginMock.mockResolvedValue("token");

    renderComponent();
    const user = userEvent.setup();

    await user.type(
      screen.getByRole("textbox", { name: /correo/i }),
      "user@example.com",
    );
    await user.type(
      screen.getByLabelText(/contrase/i, { selector: "input" }),
      "unaClave123",
    );

    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith("user@example.com", "unaClave123");
    });

    expect(navigateMock).toHaveBeenCalledWith(PRIVATEROUTES.HOMEPAGE);
  });

  it("muestra un snackbar cuando el login falla", async () => {
    loginMock.mockRejectedValue(
      new Error("invalid"),
    );

    renderComponent();
    const user = userEvent.setup();

    await user.type(
      screen.getByRole("textbox", { name: /correo/i }),
      "user@example.com",
    );
    await user.type(
      screen.getByLabelText(/contrase/i, { selector: "input" }),
      "unaClave123",
    );
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(showSnackbarMock).toHaveBeenCalledWith(
        expect.stringContaining("Error al iniciar"),
        "error",
      );
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("muestra errores de validación cuando se envía el formulario vacío", async () => {
    renderComponent();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText(/correo requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/contrasena requerida/i)).toBeInTheDocument();
    });

    expect(loginMock).not.toHaveBeenCalled();
  });

  it("valida el formato del correo electrónico", async () => {
    renderComponent();
    const user = userEvent.setup();

    await user.type(screen.getByRole("textbox", { name: /correo/i }), "invalid-email");
    await user.type(screen.getByLabelText(/contrase/i, { selector: "input" }), "unaClave123");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByText(/correo invalido/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("permite solicitar la recuperación de contraseña desde el diálogo", async () => {
    resetPasswordMock.mockResolvedValue(undefined);

    renderComponent();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: /\?olvidaste tu contrasena\?/i }),
    );

    const dialog = await screen.findByRole("dialog");
    const emailInput = within(dialog).getByRole("textbox", {
      name: /correo/i,
    });

    await user.clear(emailInput);
    await user.type(emailInput, "user@example.com");
    await user.click(
      within(dialog).getByRole("button", { name: /enviar instrucciones/i }),
    );

    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith("user@example.com");
    });
  });
});
