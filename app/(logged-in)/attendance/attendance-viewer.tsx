// components/AttendanceViewer.tsx
import React from "react";
import { prisma } from "@/prisma-singleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { format, subDays } from "date-fns";
import { rrulestr } from "rrule";

interface Props {
  userId: string;
}

export default async function AttendanceViewer({ userId }: Props) {
  const now = new Date();
  const windowStart = subDays(now, 30);

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: { forename: true, surname: true },
  });
  const studentName = student
    ? `${student.forename} ${student.surname}`
    : "Unknown";

  const attendanceRecords = await prisma.attendance.findMany({
    where: { userId, date: { gte: windowStart, lte: now } },
    select: { lessonId: true, date: true, present: true },
  });
  const recordMap = new Map<string, boolean>();
  attendanceRecords.forEach((rec) => {
    recordMap.set(`${rec.lessonId}_${rec.date.toISOString()}`, rec.present);
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { lesson: true },
  });

  const sessions = enrollments
    .flatMap((enr) => {
      const lesson = enr.lesson;
      if (!lesson.rrule) return [];
      const rule = rrulestr(lesson.rrule, { dtstart: lesson.start });
      const dates = rule.between(windowStart, now, true);
      return dates.map((date) => ({
        key: `${lesson.id}_${date.toISOString()}`,
        date,
        title: lesson.title,
        present: recordMap.get(`${lesson.id}_${date.toISOString()}`) ?? false,
      }));
    })
    .filter((sess) => recordMap.has(sess.key));

  sessions.sort((a, b) => b.date.getTime() - a.date.getTime());

  const total = sessions.length;
  const presentCount = sessions.filter((s) => s.present).length;
  const attendanceRate = total ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">
        Attendance for {studentName}
      </h2>
      <p className="mb-4">
        Rate: {attendanceRate}% ({presentCount} of {total})
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
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
