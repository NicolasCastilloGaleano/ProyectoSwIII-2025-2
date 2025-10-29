import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Interface para el token decodificado
interface DecodedToken extends admin.auth.DecodedIdToken {
  uid: string;
}

// Extender Request para incluir la propiedad user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/**
 * Middleware para validar el token JWT de Firebase en solicitudes protegidas.
 * Verifica el token enviado en el header Authorization y decodifica el usuario.
 */
const verifyFirebaseJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split(" ")[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken) as DecodedToken;

      // Compatibilidad: exponer usuario tanto en req.user como en res.locals.user
      req.user = decodedToken;
      res.locals.user = decodedToken;

      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[verifyFirebaseJwt] UID:",
          decodedToken.uid,
          "Auth emulator:",
          !!process.env.FIREBASE_AUTH_EMULATOR_HOST
        );
      }

      return next();
    } catch (error) {
      console.error("Error al verificar token:", error);
      return res.status(403).json({ error: "Token inválido o expirado" });
    }
  }

  return res.status(401).json({ error: "Token no proporcionado" });
};

export default verifyFirebaseJwt;
