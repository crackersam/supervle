// /mnt/data/actions.ts
"use server";

import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

// Fetch all lessons for the dropdown
export async function getLessons() {
  return prisma.lesson.findMany({
    select: { id: true, title: true },
  });
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

/**
 * Delete a file by its ID.
 * Only proceeds if the current session.role === 'teacher'.
 */
export async function deleteFile(fileId: number) {
  const session = await auth();
  // 1. Check session and role

  if (
    !session ||
    (session.user?.role !== "TEACHER" && session.user?.role !== "ADMIN")
  ) {
    throw new Error("Unauthorized");
  }

  // 2. Find the file record in the database
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: { filename: true },
  });
  if (!file) {
    throw new Error("File not found");
  }

  // 3. Delete the physical file from disk
  const filePath = path.join(process.cwd(), "public", "uploads", file.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // 4. Delete the DB record
  await prisma.file.delete({
    where: { id: fileId },
  });
}
