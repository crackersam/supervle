"use server";

import { prisma } from "@/prisma-singleton";
import { revalidatePath } from "next/cache";
import { RRule, Options, Frequency } from "rrule";

export const deleteLesson = async (lessonId: number) => {
  await prisma.enrollment.deleteMany({
    where: { lessonId },
  });
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath("/admin/lessons");
  console.log("Deleted lesson with ID:", lessonId);
};
export const enrolUser = async (formData: FormData) => {
  const lessonId = parseInt(formData.get("lessonId") as string, 10);
  const userId = formData.get("userId") as string;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
  });
  // Check if the user is already enrolled in the lesson
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: { lessonId, userId },
  });

  if (existingEnrollment) {
    return {
      success: false,
      message: `This user is already enrolled in lesson ${lesson?.title} (ID: ${lessonId})`,
    };
  }

  // Enroll the user in the lesson
  await prisma.enrollment.create({
    data: { userId, lessonId },
  });

  revalidatePath("/admin/lessons");
  return {
    success: true,
    message: `User successfully enrolled in lesson ${lesson?.title} (ID: ${lessonId})`,
  };
};

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
  freq,
  until,
}: {
  title: string;
  start: Date;
  end: Date;
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

  await prisma.lesson.create({
    data: { title, start, end, rrule: rruleString },
  });

  // Revalidate the admin calendar page
  revalidatePath("/admin");
}
export const deleteEnrollment = async (lessonId: string, userId: string) => {
  await prisma.enrollment.deleteMany({
    where: { lessonId: Number(lessonId), userId },
  });

  // Revalidate the admin calendar page
  revalidatePath("/admin/lessons");
  return {
    success: true,
    message: `User with ID ${userId} unenrolled from lesson.`,
  };
};
