import { Request, Response } from "express";
import { ApiResponse, UserData } from "./auth.interface";
import { getUserFromToken } from "./auth.service";

export const getLoggedInUserController = async (
  req: Request,
  res: Response<ApiResponse<UserData>>,
): Promise<Response<ApiResponse<UserData>>> => {
  try {
    const uid = res.locals.user?.uid;

    if (!uid) {
      return res.status(401).json({
        success: false,
        error: "Token inválido o no autorizado",
      });
    }

    const user = await getUserFromToken(uid);
    return res.status(200).json({
      success: true,
      message: "Usuario encontrado exitosamente",
      data: user,
    });
  } catch (err: any) {
    console.error("Error en getLoggedInUserController:", err);

    if (err.message.includes("Usuario no encontrado")) {
      return res.status(404).json({
        success: false,
        error: "Usuario no encontrado en el sistema",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Error al obtener el usuario",
    });
  }
};
