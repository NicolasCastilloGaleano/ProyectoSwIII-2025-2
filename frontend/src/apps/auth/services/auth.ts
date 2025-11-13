import { auth } from "@/firebase/firebaseClient";
import useStore from "@/store/useStore";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { FirebaseError } from "firebase/app";
import { getUserByToken } from "./authService";

const mapFirebaseAuthError = (error: FirebaseError | Error) => {
  if ("code" in error) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Correo o contraseña incorrectos.";
      case "auth/user-disabled":
        return "Tu cuenta ha sido deshabilitada. Contacta al administrador.";
      case "auth/user-not-found":
        return "No existe una cuenta asociada a ese correo.";
      default:
        return error.message || "No fue posible iniciar sesión.";
    }
  }
  return error.message || "No fue posible iniciar sesión.";
};

// Login: retorna token y actualiza Zustand con token y usuario
export const login = async (
  email: string,
  password: string,
): Promise<string> => {
  try {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    const { user } = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      normalizedPassword,
    );
    if (!user) throw new Error("Usuario no encontrado");

    const token = await user.getIdToken();
    useStore.getState().authState.setToken(token);

    // Obtener y guardar datos del usuario
    const userResponse = await getUserByToken();

    if (!userResponse.success || !userResponse.data) {
      await logout();
      const errMsg =
        "error" in userResponse && userResponse.error
          ? userResponse.error
          : "No fue posible obtener los datos del usuario autenticado.";
      throw new Error(errMsg);
    }

    useStore.getState().authState.setCurrentUser(userResponse.data);
    return token;
  } catch (error: unknown) {
    const firebaseError = error as FirebaseError | Error;
    console.error("Firebase login error:", firebaseError);
    throw new Error(mapFirebaseAuthError(firebaseError));
  }
};

// Enviar email para restablecer contraseña
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    console.error("resetPassword error:", error);
    throw error;
  }
};

export const getSessionIdToken = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe(); // Evitar múltiples llamadas
      if (!user) return resolve(null);
      const token = await user.getIdToken();
      resolve(token);
    });
  });
};

// Logout: cierra sesión y limpia Zustand
export const logout = async () => {
  await signOut(auth);
  useStore.getState().authState.clearSession();
};
