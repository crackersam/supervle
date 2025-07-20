// app/actions/createAnnouncement.ts
"use server";

import { createSafeActionClient } from "next-safe-action";
import { announcementSchema } from "@/schemas/announcement";
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

export const createAnnouncement = actionClient
  .inputSchema(announcementSchema)
  .action(
    async ({ parsedInput: { title, date, description }, ctx: { userId } }) => {
      await prisma.announcement.create({
        data: {
          title,
          date,
          description,
          createdBy: { connect: { id: userId } },
        },
      });

      revalidatePath("/announcements");
      return { success: true, message: "Announcement created successfully" };
    }
  );
