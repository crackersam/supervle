import { rrulestr } from "rrule";
import { prisma } from "../../../prisma-singleton";
import CalendarClient, { StudentInfo } from "./calendar-client";
import { auth } from "@/auth";
import { Lesson } from "@prisma/client";

// Shared types (server-side)
interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface PerUserCalendar {
  title: string;
  events: CalendarEvent[];
}

export default async function CalendarPage() {
  const session = await auth();
  const currentUserId = session?.user?.id;
  if (!currentUserId) {
    return <div>Not signed in.</div>;
  }

  // Determine list of students
  let studentList: StudentInfo[];
  if (session.user?.role === "ADMIN") {
    studentList = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, forename: true, surname: true },
    });
  } else {
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        guardians: {
          include: {
            student: { select: { id: true, forename: true, surname: true } },
          },
        },
      },
    });

    if (!user) {
      return <div>User not found.</div>;
    }

    if (user.role === "GUARDIAN") {
      studentList = user.guardians.map((g) => g.student);
    } else {
      studentList = [
        {
          id: user.id,
          forename: user.forename,
          surname: user.surname,
        },
      ];
    }
  }

  // Prepare calendar map
  const calendarMap: Record<string, PerUserCalendar> = {};
  const windowStart = new Date();
  const windowEnd = new Date();
  windowEnd.setMonth(windowEnd.getMonth() + 3);

  const expandLessons = (lessons: Lesson[]): CalendarEvent[] =>
    lessons.flatMap((lesson) => {
      if (lesson.rrule) {
        const rule = rrulestr(lesson.rrule, { dtstart: lesson.start });
        return rule.between(windowStart, windowEnd, true).map((dt) => ({
          id: lesson.id.toString(),
          title: lesson.title,
          start: dt.toISOString(),
          end: new Date(
            dt.getTime() + (lesson.end.getTime() - lesson.start.getTime())
          ).toISOString(),
        }));
      }

      return [
        {
          id: lesson.id.toString(),
          title: lesson.title,
          start: lesson.start.toISOString(),
          end: lesson.end.toISOString(),
        },
      ];
    });

  for (const stu of studentList) {
    const lessons = await prisma.lesson.findMany({
      where: { users: { some: { userId: stu.id } } },
      orderBy: { start: "asc" },
    });

    console.log(`Lessons for student ${stu.id}:`, lessons);

    calendarMap[stu.id] = {
      title:
        session.user?.role === "ADMIN" || session.user?.role === "GUARDIAN"
          ? `${stu.forename} ${stu.surname}'s Lessons`
          : "My Lessons",
      events: expandLessons(lessons),
    };
  }

  return (
    <CalendarClient
      studentList={studentList}
      calendarMap={calendarMap}
      initialSelectedId={studentList[0]?.id ?? ""}
      session={session}
    />
  );
}
