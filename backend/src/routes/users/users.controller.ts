import { NextFunction, Request, Response } from "express";
import * as service from "./users.service";
import {
  ListUsersFilters,
  UserStatus,
} from "./users.interface";
import { createUserSchema, updateUserSchema } from "./users.validators";

function getQueryString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseLimitParam(value: unknown): number | undefined {
  if (value == null) return undefined;
  const numeric =
    typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isNaN(numeric) ? undefined : numeric;
}

function parseStatusParam(value: unknown): UserStatus | undefined {
  if (typeof value !== "string") return undefined;
  const upper = value.trim().toUpperCase();
  return Object.values(UserStatus).includes(upper as UserStatus)
    ? (upper as UserStatus)
    : undefined;
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filters: ListUsersFilters = {};
    const id = getQueryString(req.query.id);
    if (id) filters.id = id;

    const search =
      getQueryString(req.query.q) ?? getQueryString(req.query.search);
    if (search) filters.search = search;

    const name = getQueryString(req.query.name);
    if (name) filters.name = name;

    const limit = parseLimitParam(req.query.limit);
    if (limit !== undefined) filters.limit = limit;

    const status = parseStatusParam(req.query.status);
    if (status) filters.status = status;

    res.json(await service.list(filters));
  } catch (e) {
    next(e);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createUserSchema.parse(req.body);
    const out = await service.create(parsed);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.getById(req.params.id));
  } catch (e) {
    next(e);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateUserSchema.parse(req.body);
    const out = await service.update(req.params.id, parsed);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.remove(req.params.id));
  } catch (e) {
    next(e);
  }
}
