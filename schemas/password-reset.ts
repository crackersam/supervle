import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z
      .string()
      .min(8, "Password must be at least 8 chars.")
      .max(100, "Password must be less than 100 chars."),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 chars.")
      .max(100, "Password must be less than 100 chars."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });
