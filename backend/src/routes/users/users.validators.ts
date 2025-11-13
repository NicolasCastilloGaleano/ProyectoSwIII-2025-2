import { Buffer } from "node:buffer";
import { z } from "zod";
import { UserRole, UserStatus } from "./users.interface";

const MAX_AVATAR_BYTES = Number(
  process.env.MAX_AVATAR_BYTES ?? 800 * 1024,
);

const isDataUri = (value: string) => value.startsWith("data:");

const validateUrlOrDataUri = (value: string) => {
  if (isDataUri(value)) return true;
  try {
    // new URL lanza error si no es un string parseable como URL
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const photoUrlSchema = z
  .string()
  .trim()
  .min(1, "photoURL no puede estar vacío")
  .refine(validateUrlOrDataUri, {
    message: "photoURL debe ser una URL válida o data URI",
  })
  .refine(
    (value) => {
      if (!isDataUri(value)) return true;
      return Buffer.byteLength(value, "utf8") <= MAX_AVATAR_BYTES;
    },
    {
      message: `photoURL excede el límite permitido (${Math.round(MAX_AVATAR_BYTES / 1024)}KB)`,
    },
  );

const hexColorRegex = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i;

const optionalFields = {
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  phone: z.string().min(5).max(30).optional().nullable(),
  photoURL: photoUrlSchema.optional().nullable(),
  accentColor: z
    .string()
    .trim()
    .regex(hexColorRegex, "accentColor debe ser un color HEX válido")
    .optional()
    .nullable(),
};

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  ...optionalFields,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
