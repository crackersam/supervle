import { prisma } from "@/prisma-singleton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UploadForm from "./upload-form";

export default async function UploadHomeworkPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const teacherId = session.user.id;

  const occurrences = await prisma.lessonOccurrence.findMany({
    where: { lesson: { users: { some: { userId: teacherId } } } },
    include: { lesson: true },
    orderBy: { start: "asc" },
  });

  // Filter to weekdays only (Monday=1 to Friday=5)
  const weekdayOccurrences = occurrences.filter((o) => {
    const day = new Date(o.start).getDay();
    return day >= 1 && day <= 5;
  });

  return (
    <UploadForm
      occurrences={weekdayOccurrences.map((o) => ({
        id: o.id,
        lesson: { title: o.lesson.title },
        start: o.start.toISOString(),
      }))}
    />
  );
}
