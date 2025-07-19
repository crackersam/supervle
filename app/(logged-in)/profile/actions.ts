// app/actions/uploadAvatar.ts (or similar server-side file)
"use server";

import { createSafeActionClient } from "next-safe-action";
import { avatarInputSchema } from "@/schemas/profile";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient().use(async ({ next }) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { userId } });
});

export const uploadAvatar = actionClient
  .inputSchema(avatarInputSchema)
  .action(async ({ parsedInput: { avatar }, ctx: { userId } }) => {
    // Fetch the current user's image
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { image: true },
    });

    // If there is a previous image, delete it from the file system
    if (user?.image) {
      const existingImagePath = path.join(process.cwd(), "public", user.image);
      await fs.unlink(existingImagePath).catch(() => {}); // Ignore if file doesn't exist
    }

    const uuid = crypto.randomUUID();
    const ext = path.extname(avatar.name);
    const fileName = `${uuid}${ext}`;
    const uploadDir = path.join(process.cwd(), "public/avatars");

    // Ensure the directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await avatar.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/avatars/${fileName}`;

    // Update the user's image field in the database
    await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });

    revalidatePath("/profile");
    return { success: true, imageUrl };
  });
