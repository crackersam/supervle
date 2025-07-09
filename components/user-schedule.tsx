// components/UserSchedule.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Calendars from "@/components/calendars";
import AddEventForm from "@/components/AddEventForm";
import { rrulestr } from "rrule";
import type { UserWithLessons } from "./types";
import type { Lesson } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { deleteLesson } from "@/app/(logged-in)/admin/schedule/actions";

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
}

export default function UserSchedule({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

          <ul className="list-disc pl-5 mt-2">
            {user.lessons.length > 0 ? (
              user.lessons.map((ev) => (
                <li key={ev.lessonId}>
                  {ev.lesson.title}
                  <form action={deleteLesson} className="inline ml-2">
                    <input type="hidden" name="lessonId" value={ev.lessonId} />
                    <input type="hidden" name="userId" value={user.id} />
                    <Button type="submit">Cancel</Button>
                  </form>
                </li>
              ))
            ) : (
              <li>No lessons scheduled</li>
            )}
          </ul>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div className="flex justify-center">
                <Button className=" w-52">Schedule lesson</Button>
              </div>
            </DialogTrigger>
            <DialogContent
              className="w-auto"
              aria-describedby="modal to schedule a lecture"
            >
              <DialogHeader>
                <DialogTitle>Schedule lesson</DialogTitle>
              </DialogHeader>

              <AddEventForm userId={user.id} />
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
