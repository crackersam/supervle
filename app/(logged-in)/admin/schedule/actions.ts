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
export async function createEvent({
  title,
  start,
  end,
  // userId,
  freq,
  until,
}: {
  title: string;
  start: Date;
  end: Date;
  userId: string;
  freq?: string;
  interval?: number;
  until?: Date;
}) {
  let rruleString: string | null = null;

  const interval = 1;
  const untilRaw = until;

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
  {
    /*const lesson =*/
  }
  await prisma.lesson.create({
    data: { title, start, end, rrule: rruleString },
  });
  // await prisma.enrollment.create({
  //   data: {
  //     userId,
  //     lessonId: lesson.id,
  //   },
  // });

  // Revalidate the admin calendar page
  revalidatePath("/admin");
}
export const deleteLesson = async (formData: FormData) => {
  const lessonId = parseInt(formData.get("lessonId") as string, 10);
  const userId = formData.get("userId") as string;
  await prisma.enrollment.deleteMany({
    where: { lessonId, userId },
  });
  const enrollments = await prisma.enrollment.findMany({
    where: { lessonId },
  });
  if (enrollments.length === 0) {
    console.log("Deleting lesson with no enrollments:", lessonId);
    await prisma.lesson.delete({
      where: { id: lessonId },
    });
  }

  // Revalidate the admin calendar page
  revalidatePath("/admin");
};
