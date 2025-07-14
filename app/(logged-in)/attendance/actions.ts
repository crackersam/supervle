// app/attendance/actions.ts
"use server";

import { prisma } from "@/prisma-singleton";
import { rrulestr } from "rrule";

export type Option = { id: string; label: string };
export interface SessionRow {
  key: string;
  date: string;
  title: string;
  present: boolean;
}
export interface AttendancePayload {
  studentName: string;
  attendanceRate: number;
  presentCount: number;
  total: number;
  sessions: SessionRow[];
}

/**
 * Search students by forename or surname (min 3 chars).
 */
export async function searchStudents(search: string): Promise<Option[]> {
  if (search.length < 3) return [];
  const users = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: [
        { forename: { contains: search, mode: "insensitive" } },
        { surname: { contains: search, mode: "insensitive" } },
      ],
    },
    select: { id: true, forename: true, surname: true },
    take: 20,
  });
  return users.map((u) => ({ id: u.id, label: `${u.forename} ${u.surname}` }));
}

/**
 * Build attendance payload for the last 30 days for a given student ID.
 */
export async function getAttendanceData(
  userId: string
): Promise<AttendancePayload> {
  // now === tomorrow
  const now = new Date();
  now.setDate(now.getDate() + 1); // Move to next day
  const windowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { forename: true, surname: true },
  });
  const studentName = student
    ? `${student.forename} ${student.surname}`
    : "Unknown";

  // map of sessionKey -> present?
  const attendance = await prisma.attendance.findMany({
    where: { userId, date: { gte: windowStart, lte: now } },
    select: { lessonId: true, date: true, present: true },
  });
  const recordMap = new Map(
    attendance.map(
      (r) => [`${r.lessonId}_${r.date.toISOString()}`, r.present] as const
    )
  );

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { lesson: true },
  });

  const sessions: SessionRow[] = enrollments.flatMap((enr) => {
    const lesson = enr.lesson;
    if (!lesson.rrule) return [];

    const rule = rrulestr(lesson.rrule, { dtstart: lesson.start });
    return rule
      .between(windowStart, now, true)
      .map((date) => {
        const key = `${Number(lesson.id)}_${date.toISOString()}`;
        if (!recordMap.has(key as `${number}_${string}`)) return null;
        return {
          key,
          date: date.toISOString(),
          title: lesson.title,
          present: recordMap.get(key as `${number}_${string}`)!,
        } satisfies SessionRow;
      })
      .filter((row): row is SessionRow => row !== null);
  });

  sessions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const total = sessions.length;
  const presentCount = sessions.filter((s) => s.present).length;
  const attendanceRate = total ? Math.round((presentCount / total) * 100) : 0;

  return { studentName, attendanceRate, presentCount, total, sessions };
}
