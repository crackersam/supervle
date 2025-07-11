// app/students/[userId]/attendance/page.tsx
import React from "react";
import { prisma } from "@/prisma-singleton";
import { format, subDays } from "date-fns";
import { rrulestr } from "rrule";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { auth } from "@/auth";

export default async function StudentAttendancePage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return <p>Not authenticated.</p>;

  // Fetch student info
  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { forename: true, surname: true, email: true },
  });
  if (!student) return <p>Student not found.</p>;

  const now = new Date();
  const windowStart = subDays(now, 30);

  // Fetch all attendance records in the window (for any user) to know which sessions were taken
  const attendanceAll = await prisma.attendance.findMany({
    where: { date: { gte: windowStart, lte: now } },
    select: { lessonId: true, date: true },
  });
  const takenSet = new Set(
    attendanceAll.map((rec) => `${rec.lessonId}_${rec.date.toISOString()}`)
  );

  // Fetch this user's attendance records for presence
  const userRecords = await prisma.attendance.findMany({
    where: { userId, date: { gte: windowStart, lte: now } },
    select: { lessonId: true, date: true, present: true },
  });
  const recordMap = new Map<string, boolean>();
  userRecords.forEach((rec) => {
    recordMap.set(`${rec.lessonId}_${rec.date.toISOString()}`, rec.present);
  });

  // Fetch enrolled lessons
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { lesson: true },
  });

  // Expand occurrences and filter to only sessions with attendance taken
  const sessions = enrollments.flatMap((enr) => {
    const lesson = enr.lesson;
    if (!lesson.rrule) return [];

    const rule = rrulestr(lesson.rrule, { dtstart: lesson.start });
    const dates = rule.between(windowStart, now, true);

    return dates
      .map((date) => ({
        lessonId: lesson.id,
        title: lesson.title,
        date,
        present: recordMap.get(`${lesson.id}_${date.toISOString()}`) ?? false,
        key: `${lesson.id}_${date.toISOString()}`,
      }))
      .filter((sess) => takenSet.has(sess.key));
  });

  // Sort sessions by date descending
  sessions.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Compute attendance rate
  const total = sessions.length;
  const presentCount = sessions.filter((s) => s.present).length;
  const attendanceRate = total ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Attendance (past 30 days) for {student.forename} {student.surname}
      </h1>
      <p className="mb-2">Email: {student.email}</p>
      <p className="mb-6">
        Attendance rate: <strong>{attendanceRate}%</strong> ({presentCount} of{" "}
        {total})
      </p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Lesson</TableHead>
            <TableHead>Present</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((sess) => (
            <TableRow key={sess.key}>
              <TableCell>{format(sess.date, "yyyy-MM-dd")}</TableCell>
              <TableCell>{format(sess.date, "HH:mm")}</TableCell>
              <TableCell>{sess.title}</TableCell>
              <TableCell className="text-center">
                {sess.present ? "✅" : "❌"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
