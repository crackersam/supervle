import React from "react";
import { prisma } from "@/prisma-singleton";
import { startOfDay, endOfDay } from "date-fns";
import { rrulestr } from "rrule";
import RegisterForm from "./register-form";

// Server Action: handles form submission
async function registerAttendance(formData: FormData) {
  "use server";
  const eventId = formData.get("eventId") as string;
  const presentIds = formData.getAll("present") as string[];

  // Parse lessonId and date from the eventId
  const [lessonIdStr, iso] = eventId.split("_");
  const lessonId = parseInt(lessonIdStr, 10);
  const date = new Date(iso);

  // 1) Remove any old attendance rows
  await prisma.attendance.deleteMany({
    where: { lessonId, date },
  });

  // 2) Load every student enrolled in this lesson
  const enrollments = await prisma.enrollment.findMany({
    where: { lessonId },
    select: { userId: true },
  });

  // 3) For each enrolled student, create a record
  for (const { userId } of enrollments) {
    // userId is a string in your schema
    const isPresent = presentIds.includes(userId);
    await prisma.attendance.create({
      data: {
        lessonId,
        userId,
        date,
        present: isPresent,
      },
    });
  }

  return { success: true, message: "Attendance registered successfully." };
}

// Page Component: fetch today's events and render form
export default async function Register() {
  const now = new Date();
  const windowStart = startOfDay(now);
  const windowEnd = endOfDay(now);

  const lessons = await prisma.lesson.findMany({
    include: {
      users: {
        include: {
          user: {
            select: { id: true, forename: true, surname: true, role: true },
          },
        },
      },
    },
  });

  const todaysEvents = lessons.flatMap((lesson) => {
    if (!lesson.rrule) return [];
    const rule = rrulestr(lesson.rrule, { dtstart: lesson.start });
    const occs = rule.between(windowStart, windowEnd, true);
    const durationMs = lesson.end.getTime() - lesson.start.getTime();

    return occs.map((startDate) => ({
      id: `${lesson.id}_${startDate.toISOString()}`,
      title: lesson.title,
      start: startDate,
      end: new Date(startDate.getTime() + durationMs),
      users: lesson.users.map((e) => ({
        id: e.user.id.toString(),
        forename: e.user.forename,
        surname: e.user.surname,
        role: e.user.role,
      })),
    }));
  });

  return (
    <RegisterForm
      events={todaysEvents}
      registerAttendance={registerAttendance}
    />
  );
}
