import { Request, Response } from "express";
import { z } from "zod";
import { createUserSchema } from "../users/users.validators";
import { ApiResponse, CreateUserDto, UserData } from "./auth.interface";
import { createUser, getUserFromToken } from "./auth.service";
import { UserRole, UserStatus } from "../users/users.interface";

const registerUserSchema = createUserSchema
  .omit({ photoURL: true })
  .extend({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres."),
  });

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
  res: Response<ApiResponse<UserData>>,
): Promise<Response<ApiResponse<UserData>>> => {
  try {
    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      const [firstIssue] = parsed.error.issues;
      return res.status(400).json({
        success: false,
        error: firstIssue?.message ?? "Datos de registro inválidos",
      });
    }

    const payload = parsed.data;

    const sanitized: CreateUserDto = {
      email: payload.email.trim().toLowerCase(),
      password: payload.password.trim(),
      name: payload.name.trim(),
      phone: payload.phone ? payload.phone.trim() : null,
      role: UserRole.USER,
      status: payload.status ?? UserStatus.ACTIVE,
      accentColor: payload.accentColor ?? null,
    };

    const createdUser = await createUser(sanitized);

    return res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: createdUser,
    });
  } catch (err: any) {
    console.error("Error en registerUserController:", err);

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
