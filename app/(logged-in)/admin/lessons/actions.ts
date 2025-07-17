"use server";

import { prisma } from "@/prisma-singleton";
import { revalidatePath } from "next/cache";
import { RRule, Options, Frequency } from "rrule";

export const deleteLesson = async (lessonId: number) => {
  // Delete related Files (through LessonOccurrences)
  await prisma.file.deleteMany({
    where: {
      occurrence: {
        lessonId,
      },
    },
  });

  // Delete related Homework (through LessonOccurrences)
  await prisma.homework.deleteMany({
    where: {
      lessonOccurrence: {
        lessonId,
      },
    },
  });

  // Delete related LessonOccurrences (one-to-many relation)
  await prisma.lessonOccurrence.deleteMany({
    where: { lessonId },
  });

  // Delete related Attendance (one-to-many relation)
  await prisma.attendance.deleteMany({
    where: { lessonId },
  });

  // Delete related Enrollments (many-to-many relation)
  await prisma.enrollment.deleteMany({
    where: { lessonId },
  });

  // Now delete the Lesson
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
  interval,
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

  const eventInterval = interval ?? 1;

  // Only build RRULE if a valid frequency is provided
  if (freq && FREQUENCIES[freq]) {
    const options: Partial<Options> = {
      freq: FREQUENCIES[freq],
      interval: eventInterval,
      dtstart: start,
    };
    if (until) options.until = until;
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
