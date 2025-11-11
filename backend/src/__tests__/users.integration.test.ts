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
      searchableName: "laura gomez",
      searchTokens: ["l", "la", "lau", "laur", "laura", "g", "go", "gom", "gome", "gomez"],
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
      searchableName: "carlos perez",
      searchTokens: ["c", "ca", "car", "carl", "carlo", "carlos", "p", "pe", "per", "pere", "perez"],
    },
  ];

  const createDoc = (entry: (typeof dataset)[number]) => ({
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
      searchableName: entry.searchableName,
      searchTokens: entry.searchTokens,
    }),
  });

  const collectionRef: any = {
    _filters: [] as Array<(entry: (typeof dataset)[number]) => boolean>,
    where(field: string, op: string, value: unknown) {
      this._filters.push((entry: (typeof dataset)[number]) => {
        if (op === "array-contains") {
          return Array.isArray((entry as any)[field]) &&
            (entry as any)[field].includes(value);
        }
        if (op === "==") {
          return (entry as any)[field] === value;
        }
        return true;
      });
      return this;
    },
    limit() {
      return this;
    },
    orderBy() {
      return this;
    },
    get: vi.fn(async () => {
      interface UserData {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        phone: string;
        photoURL: string | null;
        createdAt: number;
        updatedAt: number;
        searchableName: string;
        searchTokens: string[];
      }

      interface Doc {
        id: string;
        data: () => Omit<UserData, 'id'>;
      }

      const docs: Doc[] = dataset
        .filter((entry: UserData) => collectionRef._filters.every((fn: (entry: UserData) => boolean) => fn(entry)))
        .map(createDoc);
      collectionRef._filters = [];
      return { docs };
    }),
    doc: vi.fn((id: string) => ({
      id,
      get: vi.fn(async () => {
        const match = dataset.find((entry) => entry.id === id);
        if (!match) return { exists: false };
        return { exists: true, id, data: () => createDoc(match).data() };
      }),
    })),
    withConverter: vi.fn(function (this: any) {
      return this;
    }),
  };

  const firestoreMock = {
    collection: vi.fn(() => collectionRef),
  };

  return { verifyIdTokenMock, firestoreMock, dataset, collectionRef };
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
    const { firestoreMock, collectionRef } = mocks;
    firestoreMock.collection.mockClear();
    collectionRef._filters = [];
    collectionRef.get.mockClear();
    collectionRef.doc.mockClear();
    collectionRef.withConverter.mockClear();
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

  it("filtra por prefijos de nombre usando searchTokens normalizados", async () => {
    const res = await request(app)
      .get("/api/users")
      .query({ q: "lau" })
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: "user-01" });
  });

  it("prioriza la coincidencia directa por id cuando q es un identificador", async () => {
    const res = await request(app)
      .get("/api/users")
      .query({ q: "user-02" })
      .set("Authorization", "Bearer admin-token");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({ id: "user-02" });
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
