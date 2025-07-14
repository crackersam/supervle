"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Calendars from "@/components/calendars";
import { rrulestr } from "rrule";
import type { UserWithLessons } from "./types";
import type { Lesson } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

function expandLessons(lessons: Lesson[]): CalendarEvent[] {
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - 1);
  const windowEnd = new Date();
  windowEnd.setMonth(windowEnd.getMonth() + 3);

  return lessons.flatMap((lesson) => {
    if (lesson.rrule) {
      const rule = rrulestr(lesson.rrule, { dtstart: lesson.start });
      return rule.between(windowStart, windowEnd, true).map((dt) => ({
        id: lesson.id.toString(),
        title: lesson.title,
        start: new Date(dt),
        end: new Date(
          dt.getTime() + (lesson.end.getTime() - lesson.start.getTime())
        ),
      }));
    }
    return [
      {
        id: lesson.id.toString(),
        title: lesson.title,
        start: lesson.start,
        end: lesson.end,
      },
    ];
  });
}

interface Props {
  user: UserWithLessons;
}

export default function UserSchedule({ user }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="shadow-lg rounded-2xl border border-gray-200 mb-6 hover:shadow-xl transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
          {user.forename} {user.surname}&apos;s Schedule
        </CardTitle>
        <Button
          variant="outline"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border-indigo-300 hover:bg-indigo-50 transition-colors"
        >
          {open ? "Hide Schedule" : "Show Schedule"}
        </Button>
      </CardHeader>
      {open && (
        <CardContent>
          <Calendars
            events={expandLessons(user.lessons.map((ev) => ev.lesson)).map(
              (e) => ({ ...e, id: Number(e.id) })
            )}
          />
        </CardContent>
      )}
    </Card>
  );
}
