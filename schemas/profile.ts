// lib/schemas/avatarSchema.ts

import { z } from "zod";

export const avatarSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, { message: "File is required" })
  .refine((file) => file.size < 5 * 1024 * 1024, {
    message: "File size must be less than 5MB",
  })
  .refine(
    (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
    { message: "Only JPEG, PNG, or GIF formats are allowed" }
  );

export const avatarInputSchema = z.object({
  avatar: avatarSchema,
});
