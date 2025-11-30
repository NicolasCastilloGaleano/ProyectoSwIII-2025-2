import { describe, expect, it, vi } from "vitest";

const verifyIdTokenMock = vi.hoisted(() =>
  vi.fn(async (token: string) => {
    if (token === "ok") return { uid: "tester", role: "ADMIN" };
    throw new Error("invalid");
  }),
);

vi.mock("firebase-admin", () => ({
  __esModule: true,
  auth: () => ({ verifyIdToken: verifyIdTokenMock }),
}));

import verifyFirebaseJwt from "../middlewares/verifyFirebaseJwt";

const buildReqRes = (authHeader?: string) => {
  const req: any = {
    headers: authHeader ? { authorization: authHeader } : {},
  };
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    locals: {},
  };
  const next = vi.fn();
  return { req, res, next };
};

describe("Middleware verifyFirebaseJwt", () => {
  it("rechaza cuando no hay token Bearer", async () => {
    const { req, res, next } = buildReqRes();
    await verifyFirebaseJwt(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rechaza tokens inválidos", async () => {
    const { req, res, next } = buildReqRes("Bearer bad");
    await verifyFirebaseJwt(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("inyecta req.user cuando el token es válido", async () => {
    const { req, res, next } = buildReqRes("Bearer ok");
    await verifyFirebaseJwt(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user?.uid).toBe("tester");
    expect(req.user?.role).toBe("ADMIN");
  });
});
