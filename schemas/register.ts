import { z } from "zod";

export const registerSchema = z
  .object({
    forename: z
      .string()
      .min(3, { message: "Forename must be at least 3 characters long" }),
    surname: z
      .string()
      .min(3, { message: "Surname must be at least 3 characters long" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    role: z.enum(["STUDENT", "TEACHER", "ADMIN", "GUARDIAN"], {
      required_error: "Role is required",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
  });
