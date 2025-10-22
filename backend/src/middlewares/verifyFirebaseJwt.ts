import { Request, Response, NextFunction } from "express";
import { auth } from "@config/firebase";

export async function verifyFirebaseJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer (.+)$/);
    if (!match)
      return res.status(401).json({ message: "Missing Bearer token" });
    (req as any).user = await auth.verifyIdToken(match[1]);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
