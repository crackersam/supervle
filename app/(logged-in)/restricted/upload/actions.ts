"use server";

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/prisma-singleton";

type UploadResult = { filename: string };

export async function uploadFile(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file") as File | null;
  const occId = formData.get("occurrenceId");
  if (!file) throw new Error("No file provided.");
  if (typeof occId !== "string") throw new Error("Missing occurrenceId.");

  // Enforce size limit: 50 MB
  const MAX_SIZE = 50 * 1024 * 1024; // bytes
  if (file.size > MAX_SIZE) {
    throw new Error("File is too large. Maximum size is 50 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const filename = `${uuidv4()}${ext}`;

  const uploadDir = path.join(process.cwd(), "/public/uploads");
  await fs.promises.mkdir(uploadDir, { recursive: true });
  await fs.promises.writeFile(path.join(uploadDir, filename), buffer);

  await prisma.file.create({
    data: {
      occurrenceId: Number(occId),
      filename,
    },
  });

  return { filename };
}
