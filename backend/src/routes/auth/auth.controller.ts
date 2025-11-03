import { Request, Response } from "express";
import { ApiResponse, CreateUserDto, UserData } from "./auth.interface";
import { createUser, getUserFromToken } from "./auth.service";

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

export const registerUserController = async (
  req: Request,
  res: Response<ApiResponse<UserData>>
): Promise<Response<ApiResponse<UserData>>> => {
  try {
    const payload = req.body as CreateUserDto;

    if (!payload?.email || !payload?.password) {
      return res.status(400).json({
        success: false,
        error: "email y password son requeridos",
      });
    }

    const createdUser = await createUser(payload);

    return res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: createdUser,
    });
  } catch (err: any) {
    console.error("Error en registerUserController:", err);

    // Manejo básico de errores de Firebase Auth
    const message =
      err?.code === "auth/email-already-exists"
        ? "El correo ya está registrado"
        : err?.message || "Error al crear el usuario";

    const status = err?.code === "auth/email-already-exists" ? 409 : 500;

    return res.status(status).json({
      success: false,
      error: message,
    });
  }
};
