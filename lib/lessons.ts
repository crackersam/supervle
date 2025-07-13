// lib/lessons.ts
import { RRule } from "rrule";
import { prisma } from "@/prisma-singleton";

export async function getOccurrences(
  lessonId: number,
  windowStart: Date,
  windowEnd: Date
) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) throw new Error("Lesson not found");

  // single event, no recurrence:
  if (!lesson.rrule) {
    return [{ start: lesson.start, end: lesson.end, lessonId }];
  }

  // parse and generate dates:
  const rule = RRule.fromString(lesson.rrule);
  const dates = rule.between(windowStart, windowEnd, true);

  const durationMs = lesson.end.getTime() - lesson.start.getTime();
  return dates.map((dt) => ({
    start: dt,
    end: new Date(dt.getTime() + durationMs),
    lessonId,
  }));
}
