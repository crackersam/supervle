// app/homework/actions.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/prisma-singleton";

export async function getHomeworkForStudent(studentId: string) {
  const session = await auth();
  if (!session || !session.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;
  const role = session.user.role;
  if (role !== "GUARDIAN") throw new Error("Unauthorized");

  const relation = await prisma.studentGuardian.findUnique({
    where: {
      studentId_guardianId: {
        studentId,
        guardianId: userId,
      },
    },
  });
  if (!relation) throw new Error("Unauthorized");

  const homeworkItems = await prisma.homework.findMany({
    where: {
      lessonOccurrence: {
        lesson: {
          users: {
            some: { userId: studentId },
          },
        },
      },
    },
    include: {
      lessonOccurrence: {
        include: { lesson: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  return homeworkItems;
}
