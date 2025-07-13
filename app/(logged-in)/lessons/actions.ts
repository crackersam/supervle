"use server";
import { prisma } from "@/prisma-singleton";

// Fetch all lessons for the dropdown
export async function getLessons() {
  return prisma.lesson.findMany({ select: { id: true, title: true } });
}

// Fetch occurrences for a given lesson
export async function getOccurrences(lessonId: number) {
  return prisma.lessonOccurrence.findMany({
    where: { lessonId },
    select: { id: true, start: true },
    orderBy: { start: "asc" },
  });
}

// Fetch files for a given occurrence
export async function getFiles(occurrenceId: number) {
  return prisma.file.findMany({
    where: { occurrenceId },
    select: { id: true, filename: true },
  });
}
