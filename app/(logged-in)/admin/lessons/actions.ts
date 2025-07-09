"use server";

import { prisma } from "@/prisma-singleton";
import { revalidatePath } from "next/cache";

export const deleteLesson = async (lessonId: number) => {
  await prisma.enrollment.deleteMany({
    where: { lessonId },
  });
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath("/admin/lessons");
  console.log("Deleted lesson with ID:", lessonId);
};
