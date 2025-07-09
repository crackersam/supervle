"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/prisma-singleton";

export const deleteEnrollment = async (formData: FormData) => {
  const lessonId = parseInt(formData.get("lessonId") as string, 10);
  const userId = formData.get("userId") as string;
  await prisma.enrollment.deleteMany({
    where: { lessonId, userId },
  });

  // Revalidate the admin calendar page
  revalidatePath("/admin");
};
