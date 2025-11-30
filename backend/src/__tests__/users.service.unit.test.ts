import { describe, expect, it, vi } from "vitest";
import * as usersService from "../routes/users/users.service";
import { UserRole, UserStatus } from "../routes/users/users.interface";

type FirestoreDoc = Record<string, any>;

const mocks = vi.hoisted(() => {
  const users = new Map<string, FirestoreDoc>();

  class CollectionRef {
    filters: Array<{ field: string; op: string; value: any }> = [];
    doc(id?: string) {
      const refId = id || `user-${users.size + 1}`;
      const ref: any = {
        id: refId,
        get: async () => {
          const data = users.get(refId);
          return { exists: !!data, data: () => data };
        },
        set: async (data: FirestoreDoc) => users.set(refId, { ...data, id: refId }),
        delete: async () => users.delete(refId),
        withConverter: () => ref,
      };
      return ref;
    }
    where(field: string, op: string, value: any) {
      const next = new CollectionRef();
      next.filters = [...this.filters, { field, op, value }];
      return next;
    }
    limit() {
      return this;
    }
    orderBy() {
      return this;
    }
    withConverter() {
      return this;
    }
    async get() {
      let docs = Array.from(users.values());
      this.filters.forEach((f) => {
        if (f.op === "array-contains") {
          docs = docs.filter((u) => Array.isArray(u[f.field]) && u[f.field].includes(f.value));
        } else {
          docs = docs.filter((u) => u[f.field] === f.value);
        }
      });
      return {
        docs: docs.map((u) => ({ id: u.id, data: () => u })),
      };
    }
  }

  const collection = () => new CollectionRef();

  const seed = () => {
    users.clear();
    users.set("a1", {
      id: "a1",
      name: "Ana Alvarez",
      searchableName: "ana alvarez",
      searchTokens: ["a", "an", "ana", "al", "alv", "alva"],
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      createdAt: Date.now(),
    });
    users.set("b1", {
      id: "b1",
      name: "Bruno Diaz",
      searchableName: "bruno diaz",
      searchTokens: ["b", "br", "bru", "brun", "bruno", "diaz"],
      role: UserRole.USER,
      status: UserStatus.SUSPENDED,
      createdAt: Date.now(),
    });
  };

  const dbMock = { collection };

  return { users, dbMock, seed };
});

vi.mock("@config/firebase", () => ({
  db: mocks.dbMock,
}));

describe("Servicio de usuarios - list()", () => {
  it("filtra por id directo cuando se pasa el identificador", async () => {
    mocks.seed();

    const result = await usersService.list({ id: "a1" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ana Alvarez");
  });

  it("aplica searchTokens para prefijos y respeta el estado", async () => {
    mocks.seed();

    const result = await usersService.list({
      search: "bru",
      status: UserStatus.SUSPENDED,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("b1");
  });

  it("devuelve vacio cuando el estado no coincide", async () => {
    mocks.seed();
    const result = await usersService.list({
      search: "ana",
      status: UserStatus.SUSPENDED,
    });
    expect(result).toHaveLength(0);
  });
});
