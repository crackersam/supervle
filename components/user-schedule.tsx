// components/UserSchedule.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Calendars from "@/components/calendars";
import { rrulestr } from "rrule";
import type { UserWithLessons } from "./types";
import type { Lesson } from "@prisma/client";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

function expandLessons(lessons: Lesson[]): CalendarEvent[] {
  const windowStart = new Date();
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
    <div className="mb-4 border rounded p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {user.forename} {user.surname}
        </h2>
        <Button onClick={() => setOpen((prev) => !prev)}>
          {open ? "Hide Schedule" : "Show Schedule"}
        </Button>
      </div>

      {open && (
        <>
          <Calendars
            events={expandLessons(user.lessons.map((ev) => ev.lesson)).map(
              (e) => ({ ...e, id: Number(e.id) })
            )}
          />
        </>
      )}
    </div>
  );
}
