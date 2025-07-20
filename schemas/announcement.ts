// lib/schemas/announcementSchema.ts
import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.date({ message: "Invalid date" }),
  description: z.string().min(1, "Description is required"),
});
