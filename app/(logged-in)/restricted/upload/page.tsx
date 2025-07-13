import { prisma } from "@/prisma-singleton";
import UploadUI from "./UploadUI";
import { RRule } from "rrule";
import { addMonths } from "date-fns";

export default async function UploadPage() {
  // 1. Sync occurrences for each lesson (next 6 months or single event)
  const lessonsRaw = await prisma.lesson.findMany({
    select: { id: true, start: true, end: true, rrule: true },
  });

  await Promise.all(
    lessonsRaw.map(async (lesson) => {
      const dates = lesson.rrule
        ? RRule.fromString(lesson.rrule).between(
            new Date(),
            addMonths(new Date(), 6),
            true
          )
        : [lesson.start];
      const durationMs = lesson.end.getTime() - lesson.start.getTime();
      await Promise.all(
        dates.map((dt) =>
          prisma.lessonOccurrence.upsert({
            where: { lessonId_start: { lessonId: lesson.id, start: dt } },
            create: {
              lessonId: lesson.id,
              start: dt,
              end: new Date(dt.getTime() + durationMs),
            },
            update: {},
          })
        )
      );
    })
  );

  // 2. Fetch lessons with their persisted occurrences
  const lessons = await prisma.lesson.findMany({
    select: {
      id: true,
      title: true,
      occurrences: {
        orderBy: { start: "asc" },
        select: { id: true, start: true, end: true },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Upload to a Lesson Occurrence</h1>
      <UploadUI lessons={lessons} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Upload to a Lesson Occurrence</h1>
      <UploadUI lessons={lessons} />
    </div>
  );
}
