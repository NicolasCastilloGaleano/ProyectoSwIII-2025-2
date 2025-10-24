/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/firebase/firebaseClient";
import useStore from "@/store/useStore";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

// Login: retorna token y actualiza Zustand
export const login = async (
  email: string,
  password: string,
): Promise<string | undefined> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    if (!user) throw new Error("Usuario no encontrado");

    const token = await user.getIdToken();
    useStore.getState().authState.setToken(token);
    return token;
  } catch (error: any) {
    console.log(error);
    return;
  }
};

// Enviar email para restablecer contraseña
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.log(error);
    return;
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
