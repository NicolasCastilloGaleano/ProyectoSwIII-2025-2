import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";

/**
 * Pruebas de integración para el listado de pacientes (usuarios).
 * Se simula Firestore y la verificación de Firebase para validar distintos escenarios
 * del endpoint GET /api/users sin modificar la lógica existente.
 */
const mocks = vi.hoisted(() => {
  const verifyIdTokenMock = vi.fn(async (token: string) => {
    if (token === "admin-token") {
      return { uid: "tester", role: "ADMIN" };
    }
    throw new Error("invalid token");
  });

  const dataset = [
    {
      id: "user-01",
      name: "Laura Gómez",
      email: "laura@example.com",
      role: "USER",
      status: "ACTIVE",
      phone: "3011234567",
      photoURL: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "user-02",
      name: "Carlos Pérez",
      email: "carlos@example.com",
      role: "USER",
      status: "ACTIVE",
      phone: "3027654321",
      photoURL: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  const collectionRef = {
    get: vi.fn(async () => ({
      docs: dataset.map((entry) => ({
        id: entry.id,
        data: () => ({
          name: entry.name,
          email: entry.email,
          role: entry.role,
          status: entry.status,
          phone: entry.phone,
          photoURL: entry.photoURL,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        }),
      })),
    })),
    doc: vi.fn(),
  };
  (collectionRef as any).withConverter = vi.fn(() => collectionRef);

  const firestoreMock = {
    collection: vi.fn(() => collectionRef),
  };

  return { verifyIdTokenMock, firestoreMock, dataset };
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
    default: {
      firestore: () => firestoreMock,
      auth: () => ({ verifyIdToken: verifyIdTokenMock }),
      storage: () => ({}),
    },
  };
});

describe("Integración - GET /api/users", () => {
  beforeAll(() => {
    process.env.FRONTEND_PORT = process.env.FRONTEND_PORT ?? "5173";
  });

  beforeEach(() => {
    const { firestoreMock, dataset } = mocks;
    firestoreMock.collection.mockReturnValue({
      get: vi.fn(async () => ({
        docs: dataset.map((entry) => ({
          id: entry.id,
          data: () => ({
            name: entry.name,
            email: entry.email,
            role: entry.role,
            status: entry.status,
            phone: entry.phone,
            photoURL: entry.photoURL,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
          }),
        })),
      })),
      doc: vi.fn(),
      withConverter: vi.fn(function (this: any) {
        return this;
      }),
    } as any);
  });

  const app = createApp();

  it("devuelve el listado completo para un administrador autenticado", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(mocks.dataset.length);
    expect(res.body[0]).toMatchObject({
      id: "user-01",
      email: "laura@example.com",
    });
  });

  it("permite localizar pacientes conocidos dentro del resultado", async () => {
    const res = await request(app)
      .get("/api/users")
      .query({ q: "Laura" })
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    const match = res.body.find(
      (user: any) => typeof user.name === "string" && user.name.includes("Laura"),
    );
    expect(match).toBeTruthy();
  });

  it("responde 401 cuando falta el token", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("responde 401 cuando el token es inválido", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: expect.any(String) });
  });
});
