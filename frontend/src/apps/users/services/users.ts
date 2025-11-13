import { axiosAPI } from "@/services/axiosAPI";
import type { SafeResponse } from "@/services/common.interface";
import type { AxiosError } from "axios";
import type { UpdateUserDTO, User, UserStatus } from "./users.interfaces";

export interface ListPatientsParams {
  search?: string;
  id?: string;
  status?: UserStatus | "ALL";
  limit?: number;
}

const DEFAULT_ERROR = "No se pudo obtener la información de los pacientes.";

const sanitizeParams = (params: ListPatientsParams = {}) => {
  const query: Record<string, string | number> = {};
  if (params.search) query.q = params.search.trim();
  if (params.id) query.id = params.id.trim();
  if (params.limit) query.limit = params.limit;
  if (params.status && params.status !== "ALL") {
    query.status = params.status;
  }
  return query;
};

const extractError = (error: unknown, fallback = DEFAULT_ERROR) => {
  const err = error as AxiosError<{ error?: string }>;
  return err?.response?.data?.error || err?.message || fallback;
};

export const listPatients = async (
  params: ListPatientsParams = {},
): Promise<SafeResponse<User[]>> => {
  try {
    const response = await axiosAPI.get<User[]>("/users", {
      params: sanitizeParams(params),
    });

    return {
      success: true,
      data: response.data,
      message: "Pacientes cargados correctamente.",
    };
  } catch (error) {
    return { success: false, error: extractError(error) };
  }
};

export const getPatientById = async (
  id: string,
): Promise<SafeResponse<User>> => {
  if (!id.trim()) {
    return { success: false, error: "Debes proporcionar un identificador." };
  }
  try {
    const response = await axiosAPI.get<User>(`/users/${id.trim()}`);
    return {
      success: true,
      data: response.data,
      message: "Paciente encontrado.",
    };
  } catch (error) {
    return {
      success: false,
      error: extractError(
        error,
        "No se encontró ningún paciente con ese identificador.",
      ),
    };
  }
};

export const updatePatient = async (
  id: string,
  payload: UpdateUserDTO,
): Promise<SafeResponse<{ ok: true }>> => {
  try {
    const response = await axiosAPI.put<{ ok: true }>(`/users/${id}`, payload);
    return {
      success: true,
      data: response.data,
      message: "Paciente actualizado correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      error: extractError(error, "No fue posible actualizar el paciente."),
    };
  }
};
