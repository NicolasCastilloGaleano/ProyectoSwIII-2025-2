import { z } from "zod";
import { UserRole, UserStatus } from "./users.interface";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  phone: z.string().min(5).max(30).optional().nullable(),
  photoURL: z.string().url().optional().nullable(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
