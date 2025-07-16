// app/(logged-in)/actions.ts
"use server";

import { prisma } from "@/prisma-singleton";

export async function getNonRecurringEvents(start: string, end: string) {
  const weekStart = new Date(start);
  const weekEnd = new Date(end);
  const events = await prisma.lesson.findMany({
    where: {
      rrule: null,
      start: { gte: weekStart, lte: weekEnd },
    },
    select: { id: true, title: true, start: true },
    orderBy: { start: "desc" },
    take: 3,
  });
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start.toISOString(),
  }));
}
