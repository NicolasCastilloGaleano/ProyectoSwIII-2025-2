import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app";

/**
 * Pruebas de integracion para el modulo de eventos:
 * - Alta y listado filtrado
 * - Union/salida de participantes
 * - Autorizacion en edicion/eliminacion
 */

type FirestoreDoc = Record<string, any>;

const mocks = vi.hoisted(() => {
  const events = new Map<string, FirestoreDoc>();

  const buildCollectionMock = () => {
    const buildQuery = (state: any) => ({
      doc: (id?: string) => buildDocRef(id),
      withConverter: () => buildQuery(state),
      where: (field: string, op: string, value: any) => {
        state.filters.push({ field, op, value });
        return buildQuery(state);
      },
      orderBy: (field: string, direction: string) => {
        state.order = { field, direction };
        return buildQuery(state);
      },
      limit: (n: number) => {
        state.limit = n;
        return buildQuery(state);
      },
      get: async () => {
        let docs = Array.from(events.values());
        state.filters.forEach((f: any) => {
          if (f.op === "==") docs = docs.filter((d) => d[f.field] === f.value);
          if (f.op === ">=") docs = docs.filter((d) => d[f.field] >= f.value);
          if (f.op === "<=") docs = docs.filter((d) => d[f.field] <= f.value);
        });
        if (state.order?.field) {
          const { field, direction } = state.order;
          docs = docs.sort((a, b) =>
            direction === "desc" ? b[field] - a[field] : a[field] - b[field],
          );
        }
        if (state.limit) docs = docs.slice(0, state.limit);
        return { docs: docs.map((d) => ({ id: d.id, data: () => d })) };
      },
    });

    const buildDocRef = (forcedId?: string) => {
      const id = forcedId || `evt-${events.size + 1}`;
      return {
        id,
        get: async () => {
          const data = events.get(id);
          return { exists: !!data, data: () => data };
        },
        set: async (data: FirestoreDoc) => {
          events.set(id, { ...data, id });
        },
        update: async (patch: FirestoreDoc) => {
          const current = events.get(id);
          if (!current) throw new Error("not found");
          events.set(id, { ...current, ...patch });
        },
        delete: async () => {
          events.delete(id);
        },
      };
    };

    return buildQuery({ filters: [], order: null, limit: null });
  };

  const verifyIdTokenMock = vi.fn(async (token: string) => {
    if (token === "valid-token") return { uid: "tester" };
    if (token === "other-token") return { uid: "other-user" };
    throw new Error("invalid token");
  });

  const dbMock = { collection: vi.fn(buildCollectionMock) };

  const firestoreStubs = {
    FieldValue: {
      serverTimestamp: () => new Date(),
      increment: (n: number) => n,
      delete: () => undefined,
    },
    Timestamp: {
      now: () => new Date(),
      fromDate: (d: Date) => d,
    },
  };

  return { events, buildCollectionMock, verifyIdTokenMock, dbMock, firestoreStubs };
});

vi.mock("firebase-admin", () => ({
  __esModule: true,
  apps: [],
  initializeApp: vi.fn(),
  credential: { cert: vi.fn() },
  auth: () => ({ verifyIdToken: mocks.verifyIdTokenMock }),
  firestore: mocks.firestoreStubs,
}));

vi.mock("@config/firebase", () => ({
  db: mocks.dbMock,
  auth: { verifyIdToken: mocks.verifyIdTokenMock },
  storage: {},
  default: {
    firestore: () => mocks.firestoreStubs,
    auth: () => ({ verifyIdToken: mocks.verifyIdTokenMock }),
  },
  ...mocks.firestoreStubs,
}));

describe("Integracion - Eventos", () => {
  const app = createApp();

  beforeAll(() => {
    process.env.FRONTEND_PORT = process.env.FRONTEND_PORT ?? "5173";
  });

  beforeEach(() => {
    mocks.events.clear();
    vi.clearAllMocks();
  });

  it("crea y lista eventos filtrados por tipo", async () => {
    const createRes = await request(app)
      .post("/api/events")
      .set("Authorization", "Bearer valid-token")
      .send({
        title: "Reunion virtual",
        description: "Sync semanal",
        kind: "virtual",
        startsAt: 1700000000000,
        endsAt: 1700003600000,
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.createdBy).toBe("tester");

    const listRes = await request(app)
      .get("/api/events")
      .set("Authorization", "Bearer valid-token")
      .query({ kind: "virtual" });

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data).toHaveLength(1);
    expect(listRes.body.data[0].title).toBe("Reunion virtual");
  });

  it("permite unirse y salir de un evento", async () => {
    const created = await request(app)
      .post("/api/events")
      .set("Authorization", "Bearer valid-token")
      .send({
        title: "Taller presencial",
        description: "Sesión de apoyo",
        kind: "inperson",
        startsAt: 1700000000000,
        endsAt: 1700003600000,
      });

    const id = created.body.data.id;

    const joinRes = await request(app)
      .post(`/api/events/${id}/join`)
      .set("Authorization", "Bearer valid-token");
    expect(joinRes.status).toBe(200);
    expect(joinRes.body.data.participants).toContain("tester");

    const leaveRes = await request(app)
      .post(`/api/events/${id}/leave`)
      .set("Authorization", "Bearer valid-token");
    expect(leaveRes.status).toBe(200);
    expect(leaveRes.body.data.participants).not.toContain("tester");
  });

  it("bloquea edicion/eliminacion cuando no es el creador", async () => {
    const created = await request(app)
      .post("/api/events")
      .set("Authorization", "Bearer valid-token")
      .send({
        title: "Foro de bienestar",
        description: "Conversatorio",
        kind: "virtual",
        startsAt: 1700000000000,
        endsAt: 1700003600000,
      });

    const id = created.body.data.id;

    const updateRes = await request(app)
      .put(`/api/events/${id}`)
      .set("Authorization", "Bearer other-token")
      .send({ title: "Foro editado" });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/api/events/${id}`)
      .set("Authorization", "Bearer other-token");
    expect(deleteRes.status).toBe(403);
  });
});
