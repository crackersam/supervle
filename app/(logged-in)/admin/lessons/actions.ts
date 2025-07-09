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
export const enrolUser = async (formData: FormData) => {
  const lessonId = parseInt(formData.get("lessonId") as string, 10);
  const userId = formData.get("userId") as string;

  // Check if the user is already enrolled in the lesson
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: { lessonId, userId },
  });

  if (existingEnrollment) {
    return {
      success: false,
      message: `This user is already enrolled in lesson ${lessonId}`,
    };
  }

  // Enroll the user in the lesson
  await prisma.enrollment.create({
    data: { userId, lessonId },
  });

  revalidatePath("/admin/lessons");
  return {
    success: true,
    message: `User successfully enrolled in lesson ${lessonId}`,
  };
};
