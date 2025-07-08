"use server";

import { RRule, Options, Frequency } from "rrule";
import { revalidatePath } from "next/cache";
import { prisma } from "@/prisma-singleton";

// Map string keys to RRule frequency constants
const FREQUENCIES: Record<string, Frequency> = {
  DAILY: RRule.DAILY,
  WEEKLY: RRule.WEEKLY,
  MONTHLY: RRule.MONTHLY,
  YEARLY: RRule.YEARLY,
};

/**
 * Server Action: Creates a new calendar event (single or recurring)
 */
export async function createEvent(formData: FormData) {
  const title = formData.get("title") as string;
  const start = new Date(formData.get("start") as string);
  const end = new Date(formData.get("end") as string);
  const userId = formData.get("userId") as string;

  let rruleString: string | null = null;
  const freq = (formData.get("freq") as string) || "";
  const intervalRaw = formData.get("interval") as string;
  const interval = intervalRaw ? parseInt(intervalRaw, 10) : 1;
  const untilRaw = formData.get("until") as string;

  // Only build RRULE if a valid frequency is provided
  if (freq && FREQUENCIES[freq]) {
    const options: Partial<Options> = {
      freq: FREQUENCIES[freq],
      interval,
      dtstart: start,
    };
    if (untilRaw) options.until = new Date(untilRaw);
    rruleString = new RRule(options as Options).toString();
  }

  // Persist to database
  const lesson = await prisma.lesson.create({
    data: { title, start, end, rrule: rruleString },
  });
  await prisma.enrollment.create({
    data: {
      userId,
      lessonId: lesson.id,
    },
  });

  // Revalidate the admin calendar page
  revalidatePath("/admin");
}
