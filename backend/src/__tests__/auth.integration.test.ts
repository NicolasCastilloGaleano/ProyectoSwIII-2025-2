import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";

/**
 * @fileoverview Pruebas de integración para el endpoint de autenticación
 * @description Verifica la funcionalidad completa del endpoint /api/auth/me.
 * 
 * Casos de prueba principales:
 * - Validación de tokens (ausente, inválido, mal formado)
 * - Obtención de información del usuario
 * - Manejo de errores de Firestore
 * 
 * Componentes probados:
 * - Middleware de CORS
 * - Middleware de verificación JWT
 * - Controlador de autenticación
 * - Integración con Firestore
 * 
 * @note Se utilizan mocks para simular Firebase Admin SDK y evitar dependencias externas
 * 
 * Técnica de prueba:
 * - Partición equivalente para casos válidos e inválidos
 * - Mock de servicios externos (Firebase)
 * - Pruebas de integración end-to-end
 */

const mocks = vi.hoisted(() => {
  const verifyIdTokenMock = vi.fn(async (token: string) => {
    if (token === "valid-token") {
      return { uid: "test-uid" };
    }
    throw new Error("invalid token");
  });

  const firestoreUser = {
    correo: "test@example.com",
    nombre: "Test User",
    roles: ["ADMIN"],
    fechaDeCreacion: new Date("2024-01-01T12:00:00Z"),
  };

  const createDocRef = () => ({
    get: vi.fn(async () => ({
      exists: true,
      id: "test-uid",
      data: () => firestoreUser,
    })),
  });

  const createCollectionRef = () => {
    const docRef = createDocRef();
    const collectionRef: any = {
      doc: vi.fn(() => docRef),
      get: vi.fn(async () => ({ docs: [] })),
      withConverter: vi.fn(() => collectionRef),
    };
    return collectionRef;
  };

  const firestoreMock = {
    collection: vi.fn(() => createCollectionRef()),
  };

  return { verifyIdTokenMock, firestoreMock, firestoreUser };
});

vi.mock("firebase-admin", () => {
  const { verifyIdTokenMock, firestoreMock } = mocks;
  return {
    __esModule: true,
    apps: [],
    initializeApp: vi.fn(),
    credential: { cert: vi.fn() },
    auth: () => ({
      verifyIdToken: verifyIdTokenMock,
    }),
    firestore: () => firestoreMock,
    storage: vi.fn(),
  };
});

vi.mock("@config/firebase", () => {
  const { verifyIdTokenMock, firestoreMock } = mocks;
  return {
    db: firestoreMock,
    auth: {
      verifyIdToken: verifyIdTokenMock,
    },
    storage: {},
  };
});

describe("Integración - GET /api/auth/me", () => {
  beforeAll(() => {
    process.env.FRONTEND_PORT = process.env.FRONTEND_PORT ?? "5173";
  });

  const app = createApp();

  it("debe retornar 401 cuando no se envía token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: "Token no proporcionado" });
  });

  it("debe retornar 403 cuando el token es inválido", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(403);
    expect(typeof res.body.error).toBe("string");
  });

  it("debe retornar la información del usuario cuando el token es válido", async () => {
    const { firestoreUser } = mocks;
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: "Usuario encontrado exitosamente",
      data: {
        id: "test-uid",
        uid: "test-uid",
        correo: firestoreUser.correo,
        nombre: firestoreUser.nombre,
        roles: firestoreUser.roles,
      },
    });
    expect(res.body.data.fechaDeCreacion).toMatch(/^2024-01-01/);
  });

  it("debe manejar el caso cuando el usuario no existe en Firestore", async () => {
    const { verifyIdTokenMock, firestoreMock } = mocks;
    verifyIdTokenMock.mockResolvedValueOnce({ uid: "non-existent-uid" });
    
    const docRef = {
      get: vi.fn().mockResolvedValueOnce({ exists: false })
    };
    
    firestoreMock.collection.mockReturnValueOnce({
      doc: () => docRef,
      withConverter: vi.fn().mockReturnThis(),
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ 
      success: false,
      error: expect.stringContaining("no encontrado") 
    });
  });

  it("debe manejar errores de Firestore apropiadamente", async () => {
    const { firestoreMock } = mocks;
    
    const docRef = {
      get: vi.fn().mockRejectedValueOnce(new Error("Error de Firestore"))
    };
    
    firestoreMock.collection.mockReturnValueOnce({
      doc: () => docRef,
      withConverter: vi.fn().mockReturnThis(),
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer valid-token");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ 
      success: false,
      error: "Error al obtener el usuario"
    });
  });

  it("debe retornar 401 cuando el formato del token es inválido", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "invalid-format-token");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ 
      error: "Token no proporcionado"
    });
  });
});
