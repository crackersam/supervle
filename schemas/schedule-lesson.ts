import { z } from "zod";

export const scheduleLessonSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  start: z.date({ required_error: "Date is required" }),
  end: z.date({ required_error: "Date is required" }),
  freq: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY"], {
    required_error: "Frequency is required",
  }),
  until: z.date({ required_error: "Date is required" }),
  title: z.string().min(1, "Title is required"),
});
