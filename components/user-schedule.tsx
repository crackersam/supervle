// components/UserSchedule.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Calendars from "@/components/calendars";
import { rrulestr } from "rrule";
import type { UserWithLessons } from "./types";
import type { Lesson } from "@prisma/client";
import { deleteEnrollment } from "@/app/(logged-in)/admin/schedule/actions";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "./ui/table";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
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
}

interface Props {
  user: UserWithLessons;
  role?: string;
}

export default function UserSchedule({ user, role }: Props) {
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
          {role === "ADMIN" && (
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableCell>Lesson</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.lessons.length > 0 ? (
                  user.lessons.map((ev) => (
                    <TableRow key={ev.lessonId}>
                      <TableCell>{ev.lesson.title}</TableCell>
                      <TableCell>
                        <form action={deleteEnrollment} className="inline ml-2">
                          <input
                            type="hidden"
                            name="lessonId"
                            value={ev.lessonId}
                          />
                          <input type="hidden" name="userId" value={user.id} />
                          <Button type="submit" variant={"destructive"}>
                            Unenrol
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>No lessons scheduled</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
