import { errorHandler } from "@middlewares/errorHandler";
import { notFound } from "@middlewares/notFound";
import routes from "@routes/index";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

export function createApp() {
  const app = express();

  // Origen por defecto construido a partir de PORT en .env (ej: PORT=5173)
  const frontendPort = process.env.FRONTEND_PORT;
  const defaultFrontendOrigin = `http://localhost:${frontendPort}`;

  // Permite lista en CORS_ORIGINS separada por comas o usa el origen por defecto
  const rawOrigins = process.env.CORS_ORIGINS || defaultFrontendOrigin;
  const allowedOrigins = rawOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // permitir peticiones sin origin (ej. curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );

  // Middlewares base
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Health
  app.get("/", (_req, res) => res.send("Backend is running"));

  // Rutas (todas bajo /api)
  app.use("/api", routes);

  // 404 y manejador de errores
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
