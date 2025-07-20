// app/actions/createAnnouncement.ts
"use server";

import { createSafeActionClient } from "next-safe-action";
import { announcementSchema } from "@/schemas/announcement";
import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const actionClient = createSafeActionClient().use(async ({ next }) => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return next({ ctx: { userId } });
});

const deleteSchema = z.object({
  id: z.string(),
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
export const deleteAnnouncement = actionClient
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput: { id }, ctx: { userId } }) => {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (announcement?.createdById !== userId) {
      throw new Error("Unauthorized to delete this announcement");
    }

    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath("/announcements");
    return { success: true, message: "Announcement deleted successfully" };
  });
export const getAnnouncements = async (start: string, end: string) => {
  return prisma.announcement.findMany({
    where: {
      date: {
        gte: new Date(start),
        lte: new Date(end),
      },
    },
    orderBy: { date: "desc" },
  });
};
