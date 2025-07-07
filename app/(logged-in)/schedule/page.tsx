import { rrulestr } from "rrule";
import { prisma } from "../../../prisma-singleton";
import Calendars from "./calendars";
import React from "react";
import { auth } from "@/auth";
import { Lesson } from "@prisma/client";
import AddEventForm from "@/components/AddEventForm";
import { SessionProvider } from "next-auth/react";

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

  // 1) Load the user and, if they're a guardian, pull in the rows linking to their students
  const user = await prisma.user.findUnique({
    where: { id: currentUserId },
    include: {
      guardians: {
        include: {
          student: {
            select: {
              id: true,
              forename: true,
              surname: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return <div>User not found.</div>;
  }

  // 2) Date window to expand recurring events
  const windowStart = new Date();
  const windowEnd = new Date();
  windowEnd.setMonth(windowEnd.getMonth() + 3);

  // Helper to expand RRULE lessons into discrete events
  const expandLessons = (lessons: Lesson[]): CalendarEvent[] => {
    return lessons.flatMap((lesson) => {
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
  };

  // 3) Build a list: either the guardian's students or the user themself
  const studentList =
    user.role === "GUARDIAN"
      ? user.guardians.map((g) => g.student)
      : [
          {
            id: user.id,
            forename: user.forename,
            surname: user.surname,
          },
        ];

  // 4) Fetch lessons per student and build calendar entries
  const calendars: PerUserCalendar[] = [];
  for (const stu of studentList) {
    const lessons = await prisma.lesson.findMany({
      where: { users: { some: { userId: stu.id } } },
      orderBy: { start: "asc" },
    });
    calendars.push({
      title:
        user.role === "GUARDIAN"
          ? `${stu.forename} ${stu.surname}'s Lessons`
          : "My Lessons",
      events: expandLessons(lessons),
    });
  }

  // 5) Render form + calendars
  return (
    <div>
      {session && session.user?.role === "ADMIN" && (
        <SessionProvider session={session}>
          <AddEventForm />
        </SessionProvider>
      )}
      {calendars.map((cal) => (
        <div key={cal.title} className="mb-8">
          <h2 className="text-xl font-semibold mb-4">{cal.title}</h2>
          <Calendars
            events={cal.events.map((event) => ({
              ...event,
              id: Number(event.id),
            }))}
          />
        </div>
      ))}
    </div>
  );
}
