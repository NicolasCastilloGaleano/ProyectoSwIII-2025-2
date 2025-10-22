import { NextFunction, Request, Response } from "express";
import * as service from "./users.service";
import { createUserSchema, updateUserSchema } from "./users.validators";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.list());
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
