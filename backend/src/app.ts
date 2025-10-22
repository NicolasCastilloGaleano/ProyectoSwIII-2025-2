import { errorHandler } from "@middlewares/errorHandler";
import { notFound } from "@middlewares/notFound";
import routes from "@routes/index";
import bodyParser from "body-parser";
import express from "express";

export function createApp() {
  const app = express();

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
