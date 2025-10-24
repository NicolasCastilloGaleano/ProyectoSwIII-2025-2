/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "@/apps/users/services/users.interfaces";
import { axiosAPI } from "@/services/axiosAPI";
import type { APIResponse, SafeResponse } from "@/services/common.interface";

const AUTH_ENDPOINT = "/authService";

export const getUserByToken = async (): Promise<SafeResponse<User>> => {
  try {
    const res = await axiosAPI.get<APIResponse<User>>(`${AUTH_ENDPOINT}/me`);

    return {
      success: true,
      data: res.data.data,
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
