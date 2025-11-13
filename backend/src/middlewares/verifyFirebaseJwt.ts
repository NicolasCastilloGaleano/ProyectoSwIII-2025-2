import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";

interface DecodedToken extends admin.auth.DecodedIdToken {
  uid: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/**
 * Middleware de autenticación Firebase.
 * Verifica el token Bearer, expone el usuario decodificado
 * y retorna 401 ante cualquier ausencia o error de validación.
 */
const verifyFirebaseJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = (await admin.auth().verifyIdToken(
      idToken,
    )) as DecodedToken;

    req.user = decodedToken;
    res.locals.user = decodedToken;

    if (process.env.NODE_ENV !== "production") {
      console.log(
        "[verifyFirebaseJwt] UID:",
        decodedToken.uid,
        "Role:",
        decodedToken.role,
        "Auth emulator:",
        !!process.env.FIREBASE_AUTH_EMULATOR_HOST,
      );
    }

    return next();
  } catch (error) {
    console.error("Error al verificar token:", error);
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default verifyFirebaseJwt;
