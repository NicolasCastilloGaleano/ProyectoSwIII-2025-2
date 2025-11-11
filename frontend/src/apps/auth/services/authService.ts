/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "@/apps/users/services/users.interfaces";
import { UserRole, UserStatus } from "@/apps/users/services/users.interfaces";
import { axiosAPI } from "@/services/axiosAPI";
import type { APIResponse, SafeResponse } from "@/services/common.interface";

const AUTH_ENDPOINT = "/auth";

type RemoteUserPayload = {
  id?: string;
  uid?: string;
  correo?: string;
  email?: string;
  nombre?: string;
  name?: string;
  role?: string;
  roles?: string[];
  status?: string;
  celular?: string | null;
  phone?: string | null;
  photoURL?: string | null;
  logoURL?: string | null;
  fechaDeCreacion?: string | number | Date;
  createdAt?: number;
  updatedAt?: number;
  searchableName?: string;
  searchTokens?: string[];
  accentColor?: string | null;
};

const normalizeRemoteUser = (payload: RemoteUserPayload): User => {
  const resolveRole = (): UserRole => {
    const roleCandidate =
      payload.role ||
      (Array.isArray(payload.roles) ? payload.roles[0] : undefined);
    if (!roleCandidate) return UserRole.USER;
    const upper = roleCandidate.toUpperCase();
    return Object.values(UserRole).includes(upper as UserRole)
      ? (upper as UserRole)
      : UserRole.USER;
  };

  const resolveStatus = (): UserStatus => {
    if (!payload.status) return UserStatus.ACTIVE;
    const upper = payload.status.toUpperCase();
    return Object.values(UserStatus).includes(upper as UserStatus)
      ? (upper as UserStatus)
      : UserStatus.ACTIVE;
  };

  const timestamp = (() => {
    if (typeof payload.createdAt === "number") return payload.createdAt;
    if (typeof payload.fechaDeCreacion === "number")
      return payload.fechaDeCreacion;
    if (payload.fechaDeCreacion) {
      const parsed = new Date(payload.fechaDeCreacion).getTime();
      return Number.isNaN(parsed) ? Date.now() : parsed;
    }
    return Date.now();
  })();

  return {
    id: payload.id ?? payload.uid ?? "",
    name:
      payload.nombre ??
      payload.name ??
      payload.correo ??
      payload.email ??
      "Usuario",
    email: payload.correo ?? payload.email ?? "",
    role: resolveRole(),
    status: resolveStatus(),
    phone: payload.celular ?? payload.phone ?? null,
    photoURL: payload.logoURL ?? payload.photoURL ?? null,
    accentColor: payload.accentColor ?? null,
    searchableName: payload.searchableName,
    searchTokens: payload.searchTokens,
    createdAt: timestamp,
    updatedAt: payload.updatedAt ?? timestamp,
  };
};

export const getUserByToken = async (): Promise<SafeResponse<User>> => {
  try {
    const res = await axiosAPI.get<APIResponse<RemoteUserPayload>>(
      `${AUTH_ENDPOINT}/me`,
    );
    const normalized = normalizeRemoteUser(res.data.data ?? {});
    return {
      success: true,
      data: normalized,
      message: res.data.message,
    };
  } catch (e: any) {
    console.error(e);

    return {
      success: false,
      error:
        e?.response?.data?.error ||
        "Ocurrió un error inesperado con la sesión.",
    };
  }
};

export const registerAuthUser = async (
  payload: { email: string; password: string },
): Promise<SafeResponse<{ id: string }>> => {
  try {
    const res = await axiosAPI.post<APIResponse<RemoteUserPayload>>(
      `${AUTH_ENDPOINT}/register`,
      payload,
    );
    const id = res.data.data?.id ?? res.data.data?.uid;
    if (!id) throw new Error("Respuesta sin identificador");
    return {
      success: true,
      data: { id },
      message: res.data.message ?? "Usuario registrado correctamente",
    };
  } catch (e: any) {
    return {
      success: false,
      error:
        e?.response?.data?.error ||
        "No fue posible registrar el usuario en Auth.",
    };
  }
};
