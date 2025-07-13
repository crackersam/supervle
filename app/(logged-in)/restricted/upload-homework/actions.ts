"use server";
import path from "path";
import { writeFile } from "fs/promises";
import { prisma } from "@/prisma-singleton";

export async function uploadHomework(formData: FormData) {
  try {
    const entry = formData.get("file");
    if (!entry || !(entry instanceof File)) {
      throw new Error("File is required");
    }
    const file = entry;
    const dueDate = formData.get("dueDate") as string;
    const lessonOccurrenceId = formData.get("lessonOccurrenceId") as string;

    if (!dueDate || !lessonOccurrenceId) {
      throw new Error("Due date and lesson occurrence are required");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name}`;
    const dest = path.join(process.cwd(), "public", "uploads", filename);
    await writeFile(dest, buffer);

    await prisma.homework.create({
      data: {
        filePath: `/uploads/${filename}`,
        dueDate: new Date(dueDate),
        lessonOccurrence: { connect: { id: parseInt(lessonOccurrenceId, 10) } },
      },
    });

    return {
      success: true,
      message: "Homework uploaded successfully.",
      filename,
    };
  } catch (error) {
    console.error("Error uploading homework:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
