"use server";

import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";

// Fetch lessons for the dropdown based on user role
export async function getLessons() {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }
  if (!session.user) {
    throw new Error("Unauthorized");
  }
  const { role, id: userId } = session.user;

  if (role === "ADMIN") {
    // Admins see all lessons
    return prisma.lesson.findMany({
      select: { id: true, title: true },
    });
  }

  if (role === "TEACHER") {
    // Teachers see lessons where they are enrolled (role-based association)
    return prisma.lesson.findMany({
      where: {
        users: { some: { userId: userId } },
      },
      select: { id: true, title: true },
    });
  }

  if (role === "STUDENT") {
    // Students see lessons they’re enrolled in
    return prisma.lesson.findMany({
      where: {
        users: { some: { userId: userId } },
      },
      select: { id: true, title: true },
    });
  }

  if (role === "GUARDIAN") {
    // Guardians see lessons of all their associated students
    return prisma.lesson.findMany({
      where: {
        users: {
          some: {
            user: {
              // Enrollment.user.students links student to guardian
              students: { some: { guardianId: userId } },
            },
          },
        },
      },
      select: { id: true, title: true },
    });
  }

  // Fallback: no lessons
  return [];
}

// Fetch occurrences for a given lesson
export async function getOccurrences(lessonId: number) {
  return prisma.lessonOccurrence.findMany({
    where: { lessonId },
    select: { id: true, start: true, end: true },
    orderBy: { start: "asc" },
  });
}

// Fetch files for a given occurrence
export async function getFiles(occurrenceId: number) {
  return prisma.file.findMany({
    where: { occurrenceId },
    select: { id: true, filename: true, createdAt: true },
  });
}

/**
 * Delete a file by its ID.
 * Only proceeds if the current session.role === 'TEACHER' or 'ADMIN'.
 */
export async function deleteFile(fileId: number) {
  const session = await auth();
  if (
    !session ||
    (session.user?.role !== "TEACHER" && session.user?.role !== "ADMIN")
  ) {
    throw new Error("Unauthorized");
  }

  // Find the file record
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: { filename: true },
  });
  if (!file) {
    throw new Error("File not found");
  }

  // Delete the physical file
  const filePath = path.join(process.cwd(), "public", "uploads", file.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  // Delete the DB record
  await prisma.file.delete({ where: { id: fileId } });
}

export async function getStudentsForGuardian(): Promise<
  { id: string; name: string }[]
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session?.user?.role !== "GUARDIAN")
    throw new Error("Unauthorized");

  const relations = await prisma.studentGuardian.findMany({
    where: { guardianId: userId },
    include: {
      student: { select: { id: true, forename: true, surname: true } },
    },
  });

  return relations.map((r) => ({
    id: r.student.id,
    name: `${r.student.forename} ${r.student.surname}`,
  }));
}

export async function getLessonsForStudent(
  studentId: string
): Promise<{ id: number; title: string }[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session?.user?.role !== "GUARDIAN")
    throw new Error("Unauthorized");

  // Check relation
  const relation = await prisma.studentGuardian.findUnique({
    where: { studentId_guardianId: { studentId, guardianId: userId } },
  });
  if (!relation) throw new Error("Unauthorized");

  const lessons = await prisma.lesson.findMany({
    where: { users: { some: { userId: studentId } } },
    select: { id: true, title: true },
  });

  return lessons;
}
